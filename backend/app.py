from datetime import datetime, timezone
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

@app.route('/api/authentication/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')

    if user_id is None:
        return jsonify({
            'error': 'Not logged in'
            }), 401
    
    user = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) RETURN user')[0]['user']

    return jsonify({
        '_id': user['_id'],
        'user_email': user['user_email'],
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'profile_picture': user['profile_picture'],
        'registration_date': user['registration_date']
    })

@app.route('/api/authentication/status', methods=['GET'])
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

@app.route('/api/authentication/login', methods=['POST'])
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

@app.route('/api/authentication/logout', methods=['POST'])
def logout():
    self_logout = request.json.get('self_logout', False)

    session['self_logout'] = self_logout
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

@app.route('/api/users', methods=['POST'])
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
            (material:MATERIAL {{ _id: '{uuid4()}', material_name: 'DEMO Materiál', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}", material_subject: "Jiné", material_grade: "Jiné" }}) -[:CREATED_BY]-> (new_user),
            (topic:TOPIC {{ _id: '{uuid4()}', topic_name: 'DEMO Téma', topic_content: '<p>Obsah DEMO tématu</p>', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:TOPIC_OF]-> (material)
            """)
        else:
            return {'message': 'Tento email je již registrován!', 'success': False, 'email_already_registered': True}, 400
    except Exception as e:
        return {'message': 'Registrace se nezdařila :(', 'success': False, 'email_already_registered': False, 'error': str(e)}, 500
    else:
        return {'message': 'Registrace proběhla úspěšně!', 'success': True, 'email_already_registered': False}, 200
    
@app.route('/api/users/<user_email>/forgotten-password', methods=['GET'])
def generate_new_password(user_email):
    try:
      characters = string.ascii_letters + string.digits
      new_password = ''.join(random.choice(characters) for _ in range(12))

      existing_user = neo4j.run_query(f'MATCH (user:USER {{user_email: "{user_email}"}}) RETURN user')

      if not len(existing_user):
        return jsonify({'console_message': 'User profile does not exist', 'response_message': 'Tento email není registrován!', 'result': False}), 400
      
      password_hash = Bcrypt().generate_password_hash(new_password).decode('utf-8')  # Hash the password
      neo4j.run_query(f'MATCH (user:USER {{user_email: "{user_email}"}}) SET user.user_password = "{password_hash}"')
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

@app.route('/api/users/<user_id>/friends/suggestions', methods=['GET'])
def get_friend_suggestions(user_id):
    try:
        primary_friend_suggestions_data = neo4j.run_query(f'''
            MATCH (subject:USER {{_id: '{user_id}'}}) -[:FRIEND_WITH]- (common_friends:USER) -[:FRIEND_WITH]- (recommended_to_subject:USER)
            WHERE NOT (recommended_to_subject) -[:FRIEND_WITH]- (subject)
            AND NOT (recommended_to_subject) -[:FRIEND_REQUEST]- (subject)
            AND NOT (subject) -[:DONT_SUGGEST]-> (recommended_to_subject)
            AND recommended_to_subject <> subject
            RETURN DISTINCT recommended_to_subject._id AS _id, recommended_to_subject.first_name AS first_name, recommended_to_subject.last_name AS last_name, COUNT(common_friends) as common_friends_count
            ORDER BY common_friends_count DESC
        ''')

        primary_friend_suggestions_ids = [data['_id'] for data in primary_friend_suggestions_data]

        secondary_friend_suggestions_data = neo4j.run_query(f'''
            MATCH (subject:USER {{_id: '{user_id}'}}), (recommended_to_subject:USER)
            WHERE NOT (recommended_to_subject) -[:FRIEND_WITH]- (subject)
            AND NOT (recommended_to_subject) -[:FRIEND_REQUEST]- (subject)
            AND NOT (subject) -[:DONT_SUGGEST]-> (recommended_to_subject)
            AND recommended_to_subject <> subject
            AND NOT recommended_to_subject._id IN {primary_friend_suggestions_ids}
            RETURN DISTINCT recommended_to_subject._id AS _id, recommended_to_subject.first_name AS first_name, recommended_to_subject.last_name AS last_name
        ''')

        friend_suggestions = []
        for friend_suggestion_data in primary_friend_suggestions_data:
            friend_suggestion = {
                '_id': friend_suggestion_data['_id'],
                'first_name': friend_suggestion_data['first_name'],
                'last_name': friend_suggestion_data['last_name']
            }
            friend_suggestions.append(friend_suggestion)

        for friend_suggestion_data in secondary_friend_suggestions_data:
            friend_suggestion = {
                '_id': friend_suggestion_data['_id'],
                'first_name': friend_suggestion_data['first_name'],
                'last_name': friend_suggestion_data['last_name']
            }
            friend_suggestions.append(friend_suggestion)
        return friend_suggestions
    except Exception as e:
        return str(e), 400
   
@app.route('/api/users/<user_id>/friends', methods=['GET'])
def get_friends(user_id):
    try:
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

@app.route('/api/users/<user_id>/friends/requests', methods=['GET'])
def get_friend_requests(user_id):
    try:
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

@app.route('/api/users/<user_id>/friends/my-requests', methods=['GET'])
def get_my_friend_requests(user_id):
    try:
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
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[request:FRIEND_REQUEST]- (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE request')
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
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[friendship:FRIEND_WITH]- (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE friendship')
        return {'msg': 'Friendship removed succesfuly'}
    except:
        return {'msg': 'Friendship could not be removed'}
    

# --------------------
# BLOG POSTS ENDPOINTS
# --------------------

@app.route('/api/blog-posts', methods=['POST'])
def new_blog_post(user_id):
    try:
        post_time = datetime.now(my_timezone).isoformat()
        post_title = request.form.get('post_title', None)
        post_description = request.form.get('post_description', None)
        post_image_name = ''

        if 'post_image' in request.files:
            post_image = request.files['post_image']
            post_image_name = f'{uuid4()}_{secure_filename(post_image.filename)}'
            post_image.save(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

        neo4j.run_query(f'''
            MATCH (author:USER {{_id: "{user_id}"}})
            CREATE (author) <-[:POSTED_BY]- (:BLOG_POST {{_id: "{uuid4()}", post_time: "{post_time}", post_title: "{post_title}", post_description: "{post_description}", post_image: "{post_image_name}"}})
            ''')
        return 'Post added successfuly', 200
    except:
        return 'Post could not be added', 400

@app.route('/api/blog-posts/<post_id>', methods=['PUT'])
def update_blog_post(post_id):
    try:
        post_title = request.form.get('post_title', None)
        post_description = request.form.get('post_description', None)
        post_image_name = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) RETURN post.post_image AS post_image_name')[0]['post_image_name']

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

@app.route('/api/blog-posts/<post_id>', methods=['DELETE'])
def delete_blog_post(post_id):
    try:
        post_image_name = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) RETURN post.post_image AS post_image_name')[0]['post_image_name']
        if post_image_name:
            os.remove(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

        neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) DETACH DELETE post')
        return 'Post successfuly deleted'
    except:
        return 'Post could not be deleted'

@app.route('/api/feed', methods=['GET'])
def get_posts():
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        blog_posts_data = neo4j.run_query('MATCH (post:BLOG_POST) -[:POSTED_BY]-> (author:USER) RETURN post, author._id AS author_id ORDER BY post.post_time DESC')
        materials_posts_data = neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}) -[:FRIEND_WITH]- (author:USER) <-[:CREATED_BY]- (material:MATERIAL)
            RETURN DISTINCT author._id AS author_id, material
            ''')
        
        posts = []
        for post_data in blog_posts_data:
            post = post_data['post']
            post['author_id'] = post_data['author_id']
            posts.append({
                    "post": post,
                    "type": "blog",
                    "date_created": post['post_time']
                })
            
        for post_data in materials_posts_data:
            post = post_data['material']
            post['author_id'] = post_data['author_id']
            posts.append({
                    "post": post,
                    "type": "material",
                    "date_created": post['date_created']
                })

        # Sort the posts by date_created
        posts.sort(key=lambda x: datetime.fromisoformat(x['date_created']).replace(tzinfo=pytz.timezone('CET')), reverse=True)

        return posts
    except Exception as e:
        return str(e), 400

@app.route('/api/blog-posts/my-posts', methods=['GET'])
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

@app.route('/api/blog-posts/<post_id>/likes', methods=['GET'])
def get_post_likes(post_id):
    try:
        post_liker_ids = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER) RETURN user._id AS user_id')
        return post_liker_ids
    except:
        return []

@app.route('/api/blog-posts/<post_id>/likes', methods=['POST'])
def toggle_post_like(post_id):
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401
        
        like_data = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER {{_id: "{user_id}"}}) RETURN user._id AS user_id')

        if len(like_data):
            neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[like:LIKES]- (user:USER {{_id: "{user_id}"}}) DELETE like')
            return 'Like removed successfuly', 200
        else:
            neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}), (user:USER {{_id: "{user_id}"}}) CREATE (user) -[:LIKES]-> (post)')
            return 'Like added successfuly', 200
    except:
        return 'Like could not be toggled', 400

@app.route('/api/images/<image_name>', methods=['GET'])
def get_post_image(image_name):
    try:
        return send_from_directory(app.config['POST_IMAGES_FOLDER'], image_name)
    except:
        return


# ------------------
# COMMENTS ENDPOINTS
# ------------------

@app.route('/api/blog-posts/<post_id>/comments', methods=['GET'])
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

@app.route('/api/blog-posts/<post_id>/comments', methods=['POST'])
def add_comment(post_id):
    try:
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

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) RETURN user')[0]['user']
        return user
    except:
        return 400
    
@app.route('/api/users/<id>/profile', methods=['GET'])
def get_user_profile(id):
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        user_data = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user')[0]['user']
        user_posts_data = neo4j.run_query(f'MATCH (post:BLOG_POST) -[:POSTED_BY]-> (user:USER {{_id: "{id}"}}) RETURN post, user._id AS author_id ORDER BY post.post_time DESC')
        user_materials_data = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) <-[:CREATED_BY]- (material:MATERIAL) RETURN material')

        friendStatus = neo4j.run_query(f'''MATCH (user:USER {{_id: "{user_id}"}}), (author:USER {{_id: "{id}"}})
                                       RETURN
                                       EXISTS((user) -[:FRIEND_WITH]- (author)) AS isFriend,
                                       EXISTS((user) -[:FRIEND_REQUEST]-> (author)) AS friendRequestAcceptor,
                                       EXISTS((author) -[:FRIEND_REQUEST]-> (user)) AS friendRequestRequestor
                                       ''')

        user_posts = []
        for post_data in user_posts_data:
            post = post_data['post']
            post['author_id'] = post_data['author_id']
            user_posts.append(post)

        user_materials = []
        for material_data in user_materials_data:
            material = material_data['material']
            material['author_id'] = id
            user_materials.append(material)

        user = {
            'user': user_data,
            'posts': user_posts,
            'isFriend': friendStatus[0]['isFriend'],
            'friendRequestAcceptor': friendStatus[0]['friendRequestAcceptor'],
            'friendRequestRequestor': friendStatus[0]['friendRequestRequestor']
        }

        if friendStatus[0]['isFriend']:
            user['materials'] = user_materials

        return user
    except Exception as e:
        return str(e), 400

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

@app.route('/api/users/<id>/profile-picture', methods=['POST'])
def upload_profile_picture(id):
    try:
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            filename = secure_filename(file.filename)
            if filename == '':
                return 'No selected file', 400
            
            old_profile_picture = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user.profile_picture AS profile_picture_name')[0]['profile_picture_name']
            if old_profile_picture != 'profile-picture-default.png' and old_profile_picture:
                os.remove(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], old_profile_picture))
            
            # append a random string to the filename to prevent overwriting
            filename = f'{uuid4()}_{filename}'

            file.save(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
            neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) SET user.profile_picture = "{filename}"')
            crop_image_to_square(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
            return 'File uploaded successfully', 200
        else:
            return 'No file part', 400
    except Exception as e:
        return str(e), 400

@app.route('/api/users/<id>/profile-picture', methods=['GET'])
def get_user_profile_picture(id):
    try:
        profile_picture = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user.profile_picture AS profile_picture_name')[0]['profile_picture_name']
        if profile_picture:
            return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], profile_picture)
        else:
            return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], 'profile-picture-default.png')
    except:
        return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], 'profile-picture-default.png')

@app.route('/api/users/<user_id>/password', methods=['POST'])
def change_password(user_id):
    try:
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
# MATERIALS ENDPOINTS
# ------------------

@app.route('/api/materials', methods=['GET'])
def get_materials():
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        materials_data = neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}) <-[:CREATED_BY]- (material:MATERIAL)
            RETURN material
            ''')
        materials = []
        for material_data in materials_data:
            material = material_data['material']
            materials.append(material)
        return materials
    except:
        return []

@app.route('/api/materials', methods=['POST'])
def post_material():
    try:
        material_name = request.json.get('material_name', 'Nepojmenovaný')
        material_subject = request.json.get('material_subject', 'Jiné')
        material_grade = request.json.get('material_grade', 'Jiné')
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}})
            CREATE (new_material:MATERIAL {{_id: '{uuid4()}', material_name: '{material_name}', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}", material_subject: "{material_subject}", material_grade: "{material_grade}" }}) -[:CREATED_BY]-> (user),
            (new_topic:TOPIC {{_id: '{uuid4()}', topic_name: 'DEMO téma', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:TOPIC_OF]-> (new_material)
            ''')
        return f'Material "{material_name}" added successfuly', 200
    except Exception as e:
        return 'Material could not be added:\n' + str(e), 400
    
@app.route('/api/materials/<material_id>', methods=['GET'])
def get_material(material_id):
    try:
        material = neo4j.run_query(f'''
            MATCH (material:MATERIAL {{_id: "{material_id}"}})
            RETURN material
            ''')[0]['material']
        return material
    except:
        return 400
    
@app.route('/api/materials', methods=['PUT'])
def put_material():
    try:
        material_id = request.json.get('material_id', None)
        material_name = request.json.get('material_name', 'Nepojmenováno')
        material_grade = request.json.get('material_grade', 'Jiné')
        material_subject = request.json.get('material_subject', 'Jiné')
        neo4j.run_query(f'''
            MATCH (material:MATERIAL {{_id: "{material_id}"}})
            SET material.material_name = "{material_name}",
            material.date_modified = "{datetime.now(my_timezone).isoformat()}",
            material.material_grade = "{material_grade}",
            material.material_subject = "{material_subject}"
            ''')
        return 'Material edited successfuly', 200
    except:
        return 'Material could not be edited', 400

@app.route('/api/materials/<material_id>', methods=['DELETE'])
def delete_material(material_id):
    try:
        neo4j.run_query(f'''
            MATCH (material:MATERIAL {{_id: "{material_id}"}}) <-[:TOPIC_OF]- (topic:TOPIC)
            DETACH DELETE material, topic
            ''')
        return 'Material deleted successfuly', 200
    except:
        return 'Material could not be deleted', 400
    
@app.route('/api/materials/<material_id>/preview', methods=['GET'])
def preview_material(material_id):
    user_id = session.get('user_id')

    if user_id is None:
        return jsonify({
            'error': 'Not logged in'
            }), 401

    try:
        material_preview_data = neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}), (author:USER) <-[:CREATED_BY]- (material:MATERIAL {{_id: "{material_id}"}}) <-[:TOPIC_OF]- (topic:TOPIC)
            RETURN material, COLLECT(topic) AS topics, author, EXISTS((user)-[:FRIEND_WITH]-(author)) AS isFriend
            ''')[0]
        
        # Remove the 'user_password' attribute from the author
        if 'user_password' in material_preview_data['author']:
            del material_preview_data['author']['user_password']

        if not material_preview_data['isFriend']:
            return {
                    "isFriend": False,
                    "validMaterialId": True,
                    "author": material_preview_data['author']
                }
        
        if material_preview_data['material'] is not None:
            material_preview_data['validMaterialId'] = True
        else:
            material_preview_data['validMaterialId'] = False

        return material_preview_data
    except:
        return {"validMaterialId": False}, 400
    
@app.route('/api/materials/<material_id>/follow', methods=['POST'])
def toggle_follow_material(material_id):
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        follow_data = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) -[:FOLLOWS]-> (material:MATERIAL {{_id: "{material_id}"}}) RETURN user._id AS user_id')

        if len(follow_data):
            neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) -[follow:FOLLOWS]-> (material:MATERIAL {{_id: "{material_id}"}}) DELETE follow')
            return {"followsMaterial": False}, 200
        else:
            neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}), (material:MATERIAL {{_id: "{material_id}"}}) CREATE (user) -[:FOLLOWS]-> (material)')
            return {"followsMaterial": True}, 200
    except:
        return 'Follow could not be toggled', 400
    
@app.route('/api/materials/<material_id>/follow', methods=['GET'])
def get_if_follows_material(material_id):
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        follow_data = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) -[:FOLLOWS]-> (material:MATERIAL {{_id: "{material_id}"}}) RETURN user._id AS user_id')

        if len(follow_data):
            return {"followsMaterial": True}
        else:
            return {"followsMaterial": False}
    except:
        return 'Could not get follow status', 400

@app.route('/api/materials/followed', methods=['GET'])
def get_followed_materials():
    try:
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        materials_data = neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}) -[:FOLLOWS]-> (material:MATERIAL) -[:CREATED_BY]-> (author:USER)
            WHERE (user) -[:FRIEND_WITH]- (author)
            RETURN material, author._id AS author_id
            ''')
        materials = []
        for material_data in materials_data:
            material = material_data['material']
            material['author_id'] = material_data['author_id']
            materials.append(material)
        return materials
    except:
        return 400


# ----------------
# TOPICS ENDPOINTS
# ----------------

@app.route('/api/materials/<material_id>/topics', methods=['GET'])
def get_material_topics(material_id):
    try:
        topics_data = neo4j.run_query(f'''
            MATCH (material:MATERIAL {{_id: "{material_id}"}}) <-[:TOPIC_OF]- (topic:TOPIC)
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
    
@app.route('/api/materials/<material_id>/topics', methods=['POST'])
def post_topic(material_id):
    try:
        topic_name = request.json.get('topic_name', None)
        user_id = session.get('user_id')

        if user_id is None:
            return jsonify({
                'error': 'Not logged in'
                }), 401

        neo4j.run_query(f'''
            MATCH (user:USER {{_id: "{user_id}"}}), (material:MATERIAL {{_id: "{material_id}"}})
            CREATE (new_topic:TOPIC {{_id: '{uuid4()}', topic_name: '{topic_name}', topic_content: '<p>DEMO obsah tématu {topic_name}</p>', date_created: "{datetime.now(my_timezone).isoformat()}", date_modified: "{datetime.now(my_timezone).isoformat()}" }}) -[:TOPIC_OF]-> (material)
            ''')
        return 'Topic added successfuly', 200
    except Exception as e:
        return f'Topic could not be added:\n{e}', 400
    
@app.route('/api/topics/<topic_id>', methods=['GET'])
def get_topic(topic_id):
    try:
        topic_data = neo4j.run_query(f'''
            MATCH (topic:TOPIC {{_id: "{topic_id}"}})
            RETURN topic
            ''')[0]['topic']
        return topic_data
    except:
        return {}
    
@app.route('/api/topics/<topic_id>', methods=['PUT'])
def put_topic(topic_id):
    try:
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
    
@app.route('/api/topics/<topic_id>', methods=['DELETE'])
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