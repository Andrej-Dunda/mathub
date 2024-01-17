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
from uuid import uuid4

app = Flask(__name__)
CORS(app, origins='http://frontend:3000', supports_credentials=True)
app.config.from_object(ApplicationConfig)
app.session_interface = RedisSessionInterface(app.config['SESSION_REDIS'])

bcrypt = Bcrypt(app)
server_session = Session(app)

# Create an instance of Neo4j
neo4j = Neo4jService()


# ---------------------
# LOGIN PAGES ENDPOINTS
# ---------------------

@app.route('/@me', methods=['GET'])
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

@app.route('/auth-status', methods=['GET'])
def auth_status():
    try:
        if 'user_id' in session:
            return {'isLoggedIn': True}, 200
        else:
            return {'isLoggedIn': False}, 200
    except Exception as e:
        print({'error': str(e)})
        return {'error': str(e)}, 400

@app.route('/login', methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']

    user_data = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')[0]['user']

    if not user_data:
        return jsonify({'error': 'Unauthorized'}), 401

    if not Bcrypt().check_password_hash(user_data['user_password'], password):
        return jsonify({'error': 'Unauthorized'}), 401

    session['user_id'] = user_data['_id']
    print("Session user_id:", session['user_id'])

    response = {
        "_id": user_data['_id'],
        "email": email,
        "first_name": user_data['first_name'],
        "last_name": user_data['last_name'],
        "profile_picture": user_data['profile_picture'],
        "registration_date": user_data['registration_date']
    }
    return response, 200

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

def create_user_node(user_email, user_password, first_name, last_name, profile_picture = 'profile-picture-default.png'):
    try:
        query = f"""
        CREATE (:USER {{
            _id: '{uuid4()}',
            user_email: '{user_email}',
            user_password: '{Bcrypt().generate_password_hash(user_password).decode('utf-8')}',
            first_name: '{first_name}',
            last_name: '{last_name}',
            profile_picture: '{profile_picture}',
            registration_date: '{datetime.now().isoformat()}'
        }})
        """
        neo4j.run_query(query)
    except:
        return {'message': 'Registrace se nezdařila :(', 'success': False}

@app.route('/registration', methods=['POST'])
def register_new_user():
    try:
        email = request.json.get("email", None)
        password = request.json.get("password", None)
        first_name = request.json.get("first_name", None)
        last_name = request.json.get("last_name", None)

        user_already_exists = len(neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user'))

        if not user_already_exists:
            create_user_node(email, password, first_name, last_name)
        else:
            return {'message': 'Tento email je již registrován', 'success': False, 'email_already_registered': True}
    except:
        return {'message': 'Registrace se nezdařila :(', 'success': False, 'email_already_registered': False}
    else:
        return {'message': 'Registrace proběhla úspěšně.', 'success': True, 'email_already_registered': False}
    
@app.route('/forgotten-password', methods=['POST'])
def generate_new_password():
    try:
      email = request.json.get("email", None)

      characters = string.ascii_letters + string.digits
      new_password = ''.join(random.choice(characters) for _ in range(12))

      existing_user = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')[0]

      if existing_user is None:
        return jsonify({'console_message': 'User profile does not exist', 'response_message': 'Tento profil neexistuje', 'result': False})
      
      password_hash = Bcrypt().generate_password_hash(new_password).decode('utf-8')  # Hash the password
      neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) SET user.user_password = "{password_hash}"')
    except:
      return jsonify({'console_message': 'Failed to reset password', 'response_message': 'Heslo nemohlo být resetováno', 'result': False})
    else:
      return jsonify({
         'console_message': 'Password reset successfully',
         'new_password': new_password,
         'response_message': 'Heslo úspěšně resetováno',
         'result': True
         })
    

# -----------------
# FRIENDS ENDPOINTS
# -----------------

@app.route('/get-friend-suggestions', methods=['POST'])
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
   
@app.route('/get-friends', methods=['POST'])
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

@app.route('/get-friend-requests', methods=['POST'])
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

@app.route('/get-my-friend-requests', methods=['POST'])
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

@app.route('/accept-friend-request', methods=['POST'])
def accept_friend_request():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[request:FRIEND_REQUEST]-> (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE request')
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}), (acceptor:USER {{_id: "{acceptor_id}"}}) CREATE (requestor) -[:FRIEND_WITH]-> (acceptor), (acceptor) -[:FRIEND_WITH]-> (requestor)')
        return {'msg': 'Friendship accepted succesfuly'}
    except:
        return {'msg': 'Friendship could not be accepted'}

@app.route('/remove-friend-request', methods=['POST'])
def remove_friend_request():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}) -[request:FRIEND_REQUEST]-> (acceptor:USER {{_id: "{acceptor_id}"}}) DELETE request')
        return {'msg': 'Friendship request removed succesfuly'}
    except:
        return {'msg': 'Friendship request could not be removed'}

@app.route('/add-friend-request', methods=['POST'])
def add_friend_request():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}), (acceptor:USER {{_id: "{acceptor_id}"}}) CREATE (requestor) -[:FRIEND_REQUEST]-> (acceptor)')
        return {'msg': 'Friendship requested succesfuly'}
    except:
        return {'msg': 'Friendship request could not be sent'}

@app.route('/remove-friend-suggestion', methods=['POST'])
def remove_friend_suggestion():
    try:
        acceptor_id = request.json.get('acceptor_id', None)
        requestor_id = request.json.get('requestor_id', None)
        neo4j.run_query(f'MATCH (requestor:USER {{_id: "{requestor_id}"}}), (acceptor:USER {{_id: "{acceptor_id}"}}) CREATE (requestor) -[:DONT_SUGGEST]-> (acceptor)')
        return {'msg': 'Suggestion removed succesfuly'}
    except:
        return {'msg': 'Suggestion could not be removed'}

@app.route('/remove-friend', methods=['POST'])
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

@app.route('/new-blog-post', methods=['POST'])
def new_blog_post():
    try:
        user_id = request.form.get('user_id', None)
        post_time = datetime.now().isoformat()
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

@app.route('/update-blog-post', methods=['POST'])
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

@app.route('/delete-blog-post/<post_id>', methods=['POST'])
def delete_blog_post(post_id):
    try:
        post_image_name = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) RETURN post.post_image AS post_image_name')[0]['post_image_name']
        if post_image_name:
            os.remove(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

        neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) DETACH DELETE post')
        return 'Post successfuly deleted'
    except:
        return 'Post could not be deleted'

@app.route('/post/<id>', methods=['GET'])
def get_post(id):
    try:
        post_data = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{id}"}}) RETURN post LIMIT 1')[0]['post']
        return post_data
    except:
        return {}

@app.route('/posts', methods=['GET'])
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

@app.route('/get-my-posts/<user_id>', methods=['GET'])
def get_my_posts(user_id):
    try:
        posts_data = neo4j.run_query(f'MATCH (post:BLOG_POST) -[:POSTED_BY]-> (author:USER {{_id: "{user_id}"}}) RETURN post, author._id as author_id ORDER BY post.post_time DESC')
        posts = []
        for post_data in posts_data:
            post = post_data['post']
            post['author_id'] = post_data['author_id']
            posts.append(post)
        return posts
    except:
        return []

@app.route('/post-likes/<post_id>', methods=['GET'])
def get_post_likes(post_id):
    try:
        post_liker_ids = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER) RETURN user._id AS user_id')
        return post_liker_ids
    except:
        return []

@app.route('/toggle-post-like', methods=['POST'])
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

@app.route('/comments/<post_id>', methods=['GET'])
def get_comments(post_id):
    try:
        comments_data = neo4j.run_query(f'MATCH (comment_author:USER) <-[:COMMENTED_BY]- (comment:POST_COMMENT) -[:BELONGS_TO]-> (:BLOG_POST {{_id: "{post_id}"}}) RETURN comment, comment_author._id AS author_id ORDER BY comment.comment_time DESC')
        comments = []
        for comment_data in comments_data:
            comment = comment_data['comment']
            comment['author_id'] = comment_data['author_id']
            comments.append(comment)
        return comments
    except:
        return []

@app.route('/add-comment', methods=['POST'])
def add_comment():
    try:
        post_id = request.json.get('post_id', None)
        commenter_id = request.json.get('commenter_id', None)
        comment = request.json.get('comment', None)
        comment_time = datetime.now().isoformat()
        neo4j.run_query(f'''
            MATCH (author:USER {{_id: "{commenter_id}"}}), (post:BLOG_POST {{_id: "{post_id}"}})
            CREATE (author) <-[:COMMENTED_BY]- (:POST_COMMENT {{_id: "{uuid4()}", comment: "{comment}", comment_time: "{comment_time}"}}) -[:BELONGS_TO]-> (post)
            ''')
        return 'Comment added successfuly', 200
    except:
        return 'Comment could not be added', 400


# ----------------------
# USER ACCOUNT ENDPOINTS
# ----------------------

@app.route('/user/<id>', methods=['GET'])
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

@app.route('/upload-profile-picture/<id>', methods=['POST'])
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

@app.route('/profile-picture/<id>', methods=['GET'])
def get_user_profile_picture(id):
    try:
        profile_picture = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user.profile_picture AS profile_picture_name')[0]['profile_picture_name']
        return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], profile_picture)
    except:
        return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], 'profile-picture-default.png')

@app.route('/change-password', methods=['POST'])
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5001", debug=True)