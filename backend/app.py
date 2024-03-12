from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, session
from flask_bcrypt import Bcrypt
from flask_session import Session
from config import ApplicationConfig, RedisSessionInterface, Neo4jService
import random
import string
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
from PIL import Image
import pytz
from uuid import uuid4
from init_db import init_db

# initialize the database if it is empty
init_db()

app = Flask(__name__)
CORS(app, origins='http://frontend:3000', supports_credentials=True)
app.config.from_object(ApplicationConfig)
app.session_interface = RedisSessionInterface(app.config['SESSION_REDIS'])

bcrypt = Bcrypt(app)
server_session = Session(app)

# Create an instance of Neo4j
neo4j = Neo4jService()

my_timezone = pytz.timezone('Europe/Prague')

# ---------------------
# LOGIN PAGES ENDPOINTS
# ---------------------

@app.route('/api/@me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')

    if user_id is None:
        return jsonify({
            'error': 'Not logged in'
            }), 401
    
    user = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) RETURN user')[0]['user']

    return jsonify({
        '_id': user['_id'],
        'email': user['user_email'],
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'profile_picture': user['profile_picture'],
        'registration_date': user['registration_date']
    })

@app.route('/api/auth-status', methods=['GET'])
def auth_status():
    try:
        if 'user_id' in session:
            return {'isLoggedIn': True}, 200
        else:
            if 'self_logout' in session and session['self_logout']:
                session['self_logout'] = False
                return {'isLoggedIn': False, 'reason': 'User self logged out'}, 200
            else:
                return {'isLoggedIn': False, 'reason': 'Session expired'}, 200
    except Exception as e:
        return {'error': str(e)}, 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        email = request.json['email']
        password = request.json['password']

        user_data = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')

        if not len(user_data):
            return jsonify({'error': 'Unauthorized'}), 401
        
        user = user_data[0]['user']

        if not Bcrypt().check_password_hash(user['user_password'], password):
            return jsonify({'error': 'Unauthorized'}), 401

        session['user_id'] = user['_id']

        response = {
            "_id": user['_id'],
            "email": email,
            "first_name": user['first_name'],
            "last_name": user['last_name'],
            "profile_picture": user['profile_picture'],
            "registration_date": user['registration_date']
        }
        return response, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/api/logout', methods=['POST'])
def logout():
    self_logout = request.json.get('self_logout', False)

    session['self_logout'] = self_logout
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

@app.route('/api/registration', methods=['POST'])
def register_new_user():
    try:
        email = request.json.get("email", None)
        password = request.json.get("password", None)
        first_name = request.json.get("first_name", None)
        last_name = request.json.get("last_name", None)

        user_already_exists = len(neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user'))

        if not user_already_exists:
            neo4j.run_query(f"""
            CREATE (new_user:USER {{
                _id: '{uuid4()}',
                user_email: '{email}',
                user_password: '{Bcrypt().generate_password_hash(password).decode('utf-8')}',
                first_name: '{first_name}',
                last_name: '{last_name}',
                profile_picture: 'profile-picture-default.png',
                registration_date: '{datetime.now(my_timezone).isoformat()}'
            }}),
            (subject:SUBJECT {{ _id: '{uuid4()}', subject_name: 'DEMO Předmět', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:CREATED_BY]-> (new_user),
            (topic:TOPIC {{ _id: '{uuid4()}', topic_name: 'DEMO Materiál', topic_content: 'Obsah DEMO materiálu', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:TOPIC_OF]-> (subject)
            """)
        else:
            return {'message': 'Tento email je již registrován!', 'success': False, 'email_already_registered': True}, 400
    except Exception as e:
        return {'message': 'Registrace se nezdařila :(', 'success': False, 'email_already_registered': False, 'error': str(e)}, 500
    else:
        return {'message': 'Registrace proběhla úspěšně!', 'success': True, 'email_already_registered': False}, 200
    
@app.route('/api/forgotten-password', methods=['POST'])
def generate_new_password():
    try:
      email = request.json.get("email", None)

      characters = string.ascii_letters + string.digits
      new_password = ''.join(random.choice(characters) for _ in range(12))

      existing_user = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')

      if not len(existing_user):
        return jsonify({'console_message': 'User profile does not exist', 'response_message': 'Tento email není registrován!', 'result': False}), 400
      
      password_hash = Bcrypt().generate_password_hash(new_password).decode('utf-8')  # Hash the password
      neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) SET user.user_password = "{password_hash}"')
    except:
      return jsonify({'console_message': 'Failed to reset password', 'response_message': 'Heslo nemohlo být resetováno :(', 'result': False}), 500
    else:
      return jsonify({
         'console_message': 'Password reset successfully',
         'new_password': new_password,
         'response_message': 'Heslo úspěšně resetováno!',
         'result': True
         }), 200
    

# -----------------
# FRIENDS ENDPOINTS
# -----------------

@app.route('/api/get-friend-suggestions', methods=['POST'])
def get_friend_suggestions():
    try:
        user_id = request.json.get('user_id', None)
        friend_suggestions_data = neo4j.run_query(f'''
            MATCH (subject:USER {{_id: '{user_id}'}}) -[:FRIEND_WITH]-> (common_friends:USER) -[:FRIEND_WITH]-> (recommended_to_subject:USER)

            WHERE NOT (recommended_to_subject) -[:FRIEND_WITH]- (subject)
            AND NOT (recommended_to_subject) -[:FRIEND_REQUEST]- (subject)
            AND NOT (subject) -[:DONT_SUGGEST]-> (recommended_to_subject)
            AND recommended_to_subject <> subject

            RETURN recommended_to_subject._id AS _id, recommended_to_subject.first_name AS first_name, recommended_to_subject.last_name AS last_name, COUNT(common_friends) as common_friends_count
            ORDER BY common_friends_count DESC
            ''')
        friend_suggestions = []
        for friend_suggestion_data in friend_suggestions_data:
            friend_suggestion = {
                '_id': friend_suggestion_data['_id'],
                'first_name': friend_suggestion_data['first_name'],
                'last_name': friend_suggestion_data['last_name']
            }
            friend_suggestions.append(friend_suggestion)
        return friend_suggestions
    except:
        return []
   
@app.route('/api/get-friends', methods=['POST'])
def get_friends():
    try:
        user_id = request.json.get('user_id', None)
        friends_data = neo4j.run_query(f'''
            MATCH (user:USER {{_id: '{user_id}'}}) -[:FRIEND_WITH]-> (friend:USER)
            RETURN friend._id AS _id, friend.first_name AS first_name, friend.last_name AS last_name
            ''')
        friends = []
        for friend_data in friends_data:
            friend = {
                '_id': friend_data['_id'],
                'first_name': friend_data['first_name'],
                'last_name': friend_data['last_name']
            }
            friends.append(friend)
        return friends
    except:
        return []

@app.route('/api/get-friend-requests', methods=['POST'])
def get_friend_requests():
    try:
        user_id = request.json.get('user_id', None)
        requestors_data = neo4j.run_query(f'''
            MATCH (requestor:USER) -[:FRIEND_REQUEST]-> (acceptor:USER {{_id: '{user_id}'}})
            RETURN requestor._id AS _id, requestor.first_name AS first_name, requestor.last_name AS last_name
            ''')
        requestors = []
        for requestor_data in requestors_data:
            requestor = {
                '_id': requestor_data['_id'],
                'first_name': requestor_data['first_name'],
                'last_name': requestor_data['last_name']
            }
            requestors.append(requestor)
        return requestors
    except:
        return []

@app.route('/api/get-my-friend-requests', methods=['POST'])
def get_my_friend_requests():
    try:
        user_id = request.json.get('user_id', None)
        acceptors_data = neo4j.run_query(f'''
            MATCH (requestor:USER {{_id: '{user_id}'}}) -[:FRIEND_REQUEST]-> (acceptor:USER)
            RETURN acceptor._id AS _id, acceptor.first_name AS first_name, acceptor.last_name AS last_name
            ''')
        acceptors = []
        for acceptor_data in acceptors_data:
            acceptor = {
                '_id': acceptor_data['_id'],
                'first_name': acceptor_data['first_name'],
                'last_name': acceptor_data['last_name']
            }
            acceptors.append(acceptor)
        return acceptors
    except:
        return []

@app.route('/api/accept-friend-request', methods=['POST'])
def accept_friend_request():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[request:FRIEND_REQUEST]-> (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE request')
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}), (acceptor:USER {{_id: "{acceptor_id}"}}) CREATE (requestor) -[:FRIEND_WITH]-> (acceptor), (acceptor) -[:FRIEND_WITH]-> (requestor)')
        return {'msg': 'Friendship accepted succesfuly'}
    except:
        return {'msg': 'Friendship could not be accepted'}

@app.route('/api/remove-friend-request', methods=['POST'])
def remove_friend_request():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[request:FRIEND_REQUEST]-> (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE request')
        return {'msg': 'Friendship request removed succesfuly'}
    except:
        return {'msg': 'Friendship request could not be removed'}

@app.route('/api/add-friend-request', methods=['POST'])
def add_friend_request():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}), (acceptor:USER {{_id: "{acceptor_id}"}}) CREATE (requestor) -[:FRIEND_REQUEST]-> (acceptor)')
        return {'msg': 'Friendship requested succesfuly'}
    except:
        return {'msg': 'Friendship request could not be sent'}

@app.route('/api/remove-friend-suggestion', methods=['POST'])
def remove_friend_suggestion():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}), (acceptor:USER {{_id: "{acceptor_id}"}}) CREATE (requestor) -[:DONT_SUGGEST]-> (acceptor)')
        return {'msg': 'Suggestion removed succesfuly'}
    except:
        return {'msg': 'Suggestion could not be removed'}

@app.route('/api/remove-friend', methods=['POST'])
def remove_friend():
    try:
        requestor_id = request.json.get('requestor_id', None)
        acceptor_id = request.json.get('acceptor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[friendship:FRIEND_WITH]-> (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE friendship')
        return {'msg': 'Friendship removed succesfuly'}
    except:
        return {'msg': 'Friendship could not be removed'}
    

# --------------------
# BLOG POSTS ENDPOINTS
# --------------------

@app.route('/api/post-blog-post', methods=['POST'])
def new_blog_post():
    try:
        user_id = request.form.get('user_id', None)
        post_time = datetime.now(my_timezone).isoformat()
        post_title = request.form.get('post_title', None)
        post_description = request.form.get('post_description', None)
        post_image_name = ''

        if 'post_image' in request.files:
            post_image = request.files['post_image']
            post_image_name = secure_filename(post_image.filename)
            post_image.save(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

        neo4j.run_query(f'''
            MATCH (author:USER {{_id: "{user_id}"}})
            CREATE (author) <-[:POSTED_BY]- (:BLOG_POST {{_id: "{uuid4()}", post_time: "{post_time}", post_title: "{post_title}", post_description: "{post_description}", post_image: "{post_image_name}"}})
            ''')
        return 'Post added successfuly', 200
    except:
        return 'Post could not be added', 400

@app.route('/api/put-blog-post', methods=['PUT'])
def update_blog_post():
    try:
        post_id = request.form.get('post_id', None)
        post_title = request.form.get('post_title', None)
        post_description = request.form.get('post_description', None)
        post_image_name = None

        if 'post_image' in request.files:
            post_image = request.files['post_image']
            post_image_name = secure_filename(post_image.filename)
            post_image.save(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

        neo4j.run_query(f'''
            MATCH (post:BLOG_POST {{_id: "{post_id}"}})
            SET post.post_title = "{post_title}", post.post_description = "{post_description}", post.post_image = "{post_image_name}"
            ''')
                        
        return 'Post edited successfuly', 200
    except:
        return 'Post could not be edited', 400

@app.route('/api/delete-blog-post/<post_id>', methods=['DELETE'])
def delete_blog_post(post_id):
    try:
        post_image_name = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) RETURN post.post_image AS post_image_name')[0]['post_image_name']
        if post_image_name:
            os.remove(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

        neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) DETACH DELETE post')
        return 'Post successfuly deleted'
    except:
        return 'Post could not be deleted'

@app.route('/api/post/<id>', methods=['GET'])
def get_post(id):
    try:
        post_data = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{id}"}}) RETURN post LIMIT 1')[0]['post']
        return post_data
    except:
        return {}

@app.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        posts_data = neo4j.run_query('MATCH (post:BLOG_POST) -[:POSTED_BY]-> (author:USER) RETURN post, author._id AS author_id ORDER BY post.post_time DESC')
        posts = []
        for post_data in posts_data:
            post = post_data['post']
            post['author_id'] = post_data['author_id']
            posts.append(post)
        return posts
    except:
        return []

@app.route('/api/get-my-posts/', methods=['GET'])
def get_my_posts():
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401
        
        posts_data = neo4j.run_query(f'MATCH (post:BLOG_POST) -[:POSTED_BY]-> (author:USER {{_id: "{user_id}"}}) RETURN post, author._id as author_id ORDER BY post.post_time DESC')
        posts = []
        for post_data in posts_data:
            post = post_data['post']
            post['author_id'] = post_data['author_id']
            posts.append(post)
        return posts
    except:
        return []

@app.route('/api/post-likes/<post_id>', methods=['GET'])
def get_post_likes(post_id):
    try:
        post_liker_ids = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER) RETURN user._id AS user_id')
        return post_liker_ids
    except:
        return []

@app.route('/api/toggle-post-like', methods=['POST'])
def toggle_post_like():
    try:
        post_id = request.json.get('post_id', None)
        user_id = request.json.get('user_id', None)
        like_data = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER {{_id: "{user_id}"}}) RETURN user._id AS user_id')

        if len(like_data):
            neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[like:LIKES]- (user:USER {{_id: "{user_id}"}}) DELETE like')
            return 'Like removed successfuly', 200
        else:
            neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}), (user:USER {{_id: "{user_id}"}}) CREATE (user) -[:LIKES]-> (post)')
            return 'Like added successfuly', 200
    except:
        return 'Like could not be toggled', 400

@app.route('/post-image/<filename>', methods=['GET'])
def get_post_image(filename):
    try:
        return send_from_directory(app.config['POST_IMAGES_FOLDER'], filename)
    except:
        return


# ------------------
# COMMENTS ENDPOINTS
# ------------------

@app.route('/api/comments/<post_id>', methods=['GET'])
def get_comments(post_id):
    try:
        comments_data = neo4j.run_query(f'MATCH (comment_author:USER) <-[:COMMENTED_BY]- (comment:POST_COMMENT) -[:COMMENT_OF]-> (:BLOG_POST {{_id: "{post_id}"}}) RETURN comment, comment_author._id AS author_id ORDER BY comment.comment_time DESC')
        comments = []
        for comment_data in comments_data:
            comment = comment_data['comment']
            comment['author_id'] = comment_data['author_id']
            comments.append(comment)
        return comments
    except:
        return []

@app.route('/api/add-comment', methods=['POST'])
def add_comment():
    try:
        post_id = request.json.get('post_id', None)
        commenter_id = request.json.get('commenter_id', None)
        comment = request.json.get('comment', None)
        comment_time = datetime.now(my_timezone).isoformat()
        neo4j.run_query(f'''
            MATCH (author:USER {{_id: "{commenter_id}"}}), (post:BLOG_POST {{_id: "{post_id}"}})
            CREATE (author) <-[:COMMENTED_BY]- (:POST_COMMENT {{_id: "{uuid4()}", comment: "{comment}", comment_time: "{comment_time}"}}) -[:COMMENT_OF]-> (post)
            ''')
        return 'Comment added successfuly', 200
    except:
        return 'Comment could not be added', 400


# ----------------------
# USER ACCOUNT ENDPOINTS
# ----------------------

@app.route('/api/user/<id>', methods=['GET'])
def get_user(id):
    try:
        user = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user')[0]['user']
        return user
    except:
        return {}

def crop_image_to_square(image_path):
    with Image.open(image_path) as img:
        width, height = img.size
        new_size = min(width, height)

        left = (width - new_size) / 2
        top = (height - new_size) / 2
        right = (width + new_size) / 2
        bottom = (height + new_size) / 2

        img = img.crop((left, top, right, bottom))
        img.save(image_path)  # Overwrite the original image or save as a new file

@app.route('/api/upload-profile-picture/<id>', methods=['POST'])
def upload_profile_picture(id):
    try:
        old_profile_picture = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user.profile_picture AS profile_picture_name')[0]['profile_picture_name']
        if old_profile_picture != 'profile-picture-default.png':
            os.remove(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], old_profile_picture))

        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
            neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) SET user.profile_picture = "{filename}"')
            crop_image_to_square(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
            return 'File uploaded successfully', 200
        else:
            return 'No file part', 400
    except:
        return 'File could not be uploaded', 400

@app.route('/api/profile-picture/<id>', methods=['GET'])
def get_user_profile_picture(id):
    try:
        profile_picture = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user.profile_picture AS profile_picture_name')[0]['profile_picture_name']
        if profile_picture:
            return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], profile_picture)
        else:
            return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], 'profile-picture-default.png')
    except:
        return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], 'profile-picture-default.png')

@app.route('/api/change-password', methods=['POST'])
def change_password():
    try:
        user_id = request.json.get('user_id', None)
        old_password = request.json.get('old_password', None)
        hashed_old_password = Bcrypt().generate_password_hash(old_password).decode('utf-8')
        new_password = request.json.get('new_password', None)
        hashed_new_password = Bcrypt().generate_password_hash(new_password).decode('utf-8')
        
        fetched_old_password = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) RETURN user.user_password AS old_password')[0]['old_password']
        if not Bcrypt().check_password_hash(fetched_old_password, hashed_old_password):
            neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) SET user.user_password = "{hashed_new_password}"')
            return {'success': True}
        else:
            return {'success': False}
    except:
        return {'success': False}


# ------------------   
# SUBJECTS ENDPOINTS
# ------------------

@app.route('/api/get-subjects', methods=['GET'])
def get_subjects():
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        subjects_data = neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}) <-[:CREATED_BY]- (subject:SUBJECT)
            RETURN subject
            ''')
        subjects = []
        for subject_data in subjects_data:
            subject = subject_data['subject']
            subjects.append(subject)
        return subjects
    except:
        return []

@app.route('/api/post-subject', methods=['POST'])
def post_subject():
    try:
        subject_name = request.json.get('subject_name', 'NoName Předmět')
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}})
            CREATE (new_subject:SUBJECT {{_id: '{uuid4()}', subject_name: '{subject_name}', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:CREATED_BY]-> (user),
            (new_topic:TOPIC {{_id: '{uuid4()}', topic_name: 'DEMO', topic_content: 'DEMO obsah materiálu', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:TOPIC_OF]-> (new_subject)
            ''')
        return f'Subject "{subject_name}" added successfuly', 200
    except Exception as e:
        return 'Subject could not be added:\n' + str(e), 400
    
@app.route('/api/get-subject/<subject_id>', methods=['GET'])
def get_subject(subject_id):
    try:
        subject = neo4j.run_query(f'''
            MATCH (subject:SUBJECT {{_id: "{subject_id}"}})
            RETURN subject
            ''')[0]['subject']
        return subject
    except:
        return {}
    
@app.route('/api/put-subject', methods=['PUT'])
def put_subject():
    try:
        subject_id = request.json.get('subject_id', None)
        subject_name = request.json.get('subject_name', None)
        neo4j.run_query(f'''
            MATCH (subject:SUBJECT {{_id: "{subject_id}"}})
            SET subject.subject_name = "{subject_name}",
            subject.date_modified = "{datetime.now(my_timezone).isoformat()}"
            ''')
        return 'Subject edited successfuly', 200
    except:
        return 'Subject could not be edited', 400

@app.route('/api/delete-subject/<subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    try:
        neo4j.run_query(f'''
            MATCH (subject:SUBJECT {{_id: "{subject_id}"}}) <-[:TOPIC_OF]- (topic:TOPIC)
            DETACH DELETE subject, topic
            ''')
        return 'Subject deleted successfuly', 200
    except:
        return 'Subject could not be deleted', 400


# ----------------
# TOPICS ENDPOINTS
# ----------------

@app.route('/api/get-subject-topics/<subject_id>', methods=['GET'])
def get_subject_topics(subject_id):
    try:
        topics_data = neo4j.run_query(f'''
            MATCH (subject:SUBJECT {{_id: "{subject_id}"}}) <-[:TOPIC_OF]- (topic:TOPIC)
            RETURN topic
            ORDER BY topic.topic_name
            ''')
        topics = []
        for topic_data in topics_data:
            topic = topic_data['topic']
            topics.append(topic)
        return topics
    except:
        return []
    
@app.route('/api/post-topic', methods=['POST'])
def post_topic():
    try:
        topic_name = request.json.get('topic_name', None)
        subject_id = request.json.get('subject_id', None)
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}), (subject:SUBJECT {{_id: "{subject_id}"}})
            CREATE (new_topic:TOPIC {{_id: '{uuid4()}', topic_name: '{topic_name}', topic_content: 'DEMO obsah materiálu {topic_name}', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:TOPIC_OF]-> (subject),
            (new_topic) -[:CREATED_BY]-> (user)
            ''')
        return 'Topic added successfuly', 200
    except:
        return 'Topic could not be added', 400
    
@app.route('/api/get-topic/<topic_id>', methods=['GET'])
def get_topic(topic_id):
    try:
        topic_data = neo4j.run_query(f'''
            MATCH (topic:TOPIC {{_id: "{topic_id}"}})
            RETURN topic
            ''')[0]['topic']
        return topic_data
    except:
        return {}
    
@app.route('/api/put-topic', methods=['PUT'])
def put_topic():
    try:
        topic_id = request.json.get('topic_id', None)
        topic_name = request.json.get('topic_name', None)
        topic_content = request.json.get('topic_content', None)

        neo4j.run_query('''
            MATCH (topic:TOPIC {_id: $topic_id})
            SET topic.topic_name = $topic_name,
            topic.topic_content = $topic_content,
            topic.date_modified = $date_modified
            ''', {
                'topic_id': topic_id,
                'topic_name': topic_name,
                'topic_content': topic_content,
                'date_modified': datetime.now(my_timezone).isoformat()
            })
        return 'Topic edited successfully', 200
    except Exception as e:
        return str(e), 400
    
@app.route('/api/delete-topic/<topic_id>', methods=['DELETE'])
def delete_topic(topic_id):
    try:
        neo4j.run_query(f'''
            MATCH (topic:TOPIC {{_id: "{topic_id}"}})
            DETACH DELETE topic
            ''')
        return 'Topic deleted successfuly', 200
    except:
        return 'Topic could not be deleted', 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5001", debug=True)