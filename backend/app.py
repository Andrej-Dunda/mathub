from datetime import datetime, timedelta, timezone
import json
from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, JWTManager
import hashlib
import random
import string
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
from PIL import Image
from neo4j import GraphDatabase
from uuid import uuid4

app = Flask(__name__)

CORS(app)

app.config["JWT_SECRET_KEY"] = "2a0304fc-7233-11ee-b962-0242ac120002"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config['PROFILE_PICTURES_FOLDER'] = 'media/profile-pictures'
app.config['POST_IMAGES_FOLDER'] = 'media/post-images'
app.config['STATIC_FOLDER'] = 'media/static'
jwt = JWTManager(app)

class Neo4jService:
    def __init__(self):
        self.driver = GraphDatabase.driver("bolt://neo4j:7687", auth=("neo4j", "mathubdb"))

    def close(self):
        self.driver.close()

    def run_query(self, query):
        with self.driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]
        
# Create an instance of Neo4j
neo4j = Neo4jService()

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=1))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response


# ---------------------
# LOGIN PAGES ENDPOINTS
# ---------------------

@app.route('/login', methods=["POST"])
def create_token():
    response_msg = "Chybný email nebo heslo!"

    email = request.json.get("email", None)
    password = request.json.get("password", None)

    user_data = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')[0]['user']

    if user_data:
        stored_password_hash = user_data['user_password']
        input_password_hash = hashlib.sha256(password.encode()).hexdigest()
        if stored_password_hash == input_password_hash:
            access_token = create_access_token(identity=email)

            user_id = user_data['_id']
            first_name = user_data['first_name']
            last_name = user_data['last_name']
            profile_picture = user_data['profile_picture']
            registration_date = user_data['registration_date']

            response = {
                "access_token": access_token,
                "user_id": user_id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "profile_picture": profile_picture,
                "registration_date": registration_date
               }
            return response
        else:
            response_msg = f"Chybné heslo!\nZadané heslo: {input_password_hash}\nHeslo v databázi: {stored_password_hash}"    
    else:
        response_msg = f"Uživatel '{email}' neexistuje!"
    
    return jsonify({"message": response_msg}), 401

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

def create_user_node(user_email, user_password, first_name, last_name, profile_picture = 'profile-picture-default.png'):
  query = f"""
  CREATE (:USER {{
    _id: '{uuid4()}',
    user_email: '{user_email}',
    user_password: '{hashlib.sha256(user_password.encode()).hexdigest()}',
    first_name: '{first_name}',
    last_name: '{last_name}',
    profile_picture: '{profile_picture}',
    registration_date: '{datetime.now().isoformat()}'
  }})
  """
  neo4j.run_query(query)

@app.route('/registration', methods=['POST'])
def register_new_user():
    try:
        email = request.json.get("email", None)
        password = request.json.get("password", None)
        first_name = request.json.get("first_name", None)
        last_name = request.json.get("last_name", None)

        existing_user = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')

        if not len(existing_user):
            create_user_node(email, password, first_name, last_name)
        else:
            return {'message': 'Tento email je již registrován!', 'success': False, 'email_already_registered': True}
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
        return jsonify({'console_message': 'User profile does not exist!', 'response_message': 'Tento profil neexistuje!', 'result': False})
      
      password_hash = hashlib.sha256(new_password.encode()).hexdigest()  # Hash the password
      neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) SET user.user_password = "{password_hash}"')
    except:
      return jsonify({'console_message': 'Failed to reset password', 'response_message': 'Heslo nemohlo být resetováno', 'result': False})
    else:
      return jsonify({
         'console_message': 'Password reset successfully',
         'new_password': new_password,
         'response_message': 'Heslo úspěšně resetováno!',
         'result': True
         })
    

# -----------------
# FRIENDS ENDPOINTS
# -----------------

@app.route('/get-friend-suggestions', methods=['POST'])
def get_friend_suggestions():
    user_id = request.json.get('user_id', None)
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    friends_id = cur.execute("SELECT second_friend_id FROM friendships WHERE first_friend_id = ?", (user_id,)).fetchall()
    acceptor_id = cur.execute("SELECT acceptor_id FROM friend_requests WHERE requestor_id = ?", (user_id,)).fetchall()
    requestors_id = cur.execute("SELECT requestor_id FROM friend_requests WHERE acceptor_id = ?", (user_id,)).fetchall()
    excluded_suggestions_id = cur.execute("SELECT acceptor_id FROM excluded_suggestions WHERE requestor_id = ?", (user_id,)).fetchall()
    excluded_id_tuples = friends_id + acceptor_id + requestors_id + excluded_suggestions_id
    excluded_ids = (user_id,)
    for id_tuple in excluded_id_tuples:
       excluded_ids = excluded_ids + (id_tuple[0],)
    placeholders = ', '.join('?' for _ in excluded_ids)
    res = cur.execute(f'SELECT id, first_name, last_name FROM users WHERE id NOT IN ({placeholders})', (excluded_ids)).fetchall()
    conn.commit()
    conn.close()
    return res
   
@app.route('/get-friends', methods=['POST'])
# @jwt_required()
def get_friends():
    user_id = request.json.get('user_id', None)
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    friends_id = cur.execute("SELECT second_friend_id FROM friendships WHERE first_friend_id = ?", (user_id,)).fetchall()
    friends = []
    for friend_id in friends_id:
       friends.append(cur.execute("SELECT id, first_name, last_name FROM users WHERE id = ?", (friend_id[0],)).fetchone())
    conn.commit()
    conn.close()
    return friends

@app.route('/get-friend-requests', methods=['POST'])
# @jwt_required()
def get_friend_requests():
    user_id = request.json.get('user_id', None)
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    requestors_id = cur.execute("SELECT requestor_id FROM friend_requests WHERE acceptor_id = ?", (user_id,)).fetchall()
    requestors = []
    for requestor_id in requestors_id:
       requestors.append(cur.execute("SELECT id, first_name, last_name FROM users WHERE id = ?", (requestor_id[0],)).fetchone())
    conn.commit()
    conn.close()
    return requestors

@app.route('/get-my-friend-requests', methods=['POST'])
# @jwt_required()
def get_my_friend_requests():
    user_id = request.json.get('user_id', None)
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    acceptor_id = cur.execute("SELECT acceptor_id FROM friend_requests WHERE requestor_id = ?", (user_id,)).fetchall()
    acceptors = []
    for acceptor_id in acceptor_id:
       acceptors.append(cur.execute("SELECT id, first_name, last_name FROM users WHERE id = ?", (acceptor_id[0],)).fetchone())
    conn.commit()
    conn.close()
    return acceptors

@app.route('/accept-friend-request', methods=['POST'])
def accept_friend_request():
    acceptor_id = request.json.get('acceptor_id', None)
    requestor_id = request.json.get('requestor_id', None)
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    delete_friend_request(requestor_id, acceptor_id)
    cur.execute("INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)", (acceptor_id, requestor_id))
    cur.execute("INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)", (requestor_id, acceptor_id))
    conn.commit()
    conn.close()
    return {'msg': 'Friendship accepted succesfuly!'}

@app.route('/remove-friend-request', methods=['POST'])
def remove_friend_request():
    acceptor_id = request.json.get('acceptor_id', None)
    requestor_id = request.json.get('requestor_id', None)
    delete_friend_request(requestor_id, acceptor_id)
    return {'msg': 'Friendship request removed succesfuly!'}

@app.route('/add-friend-request', methods=['POST'])
def add_friend_request():
    acceptor_id = request.json.get('acceptor_id', None)
    requestor_id = request.json.get('requestor_id', None)
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (requestor_id, acceptor_id))
    conn.commit()
    conn.close()
    return {'msg': 'Friendship requested succesfuly!'}

@app.route('/remove-friend-suggestion', methods=['POST'])
def remove_friend_suggestion():
    acceptor_id = request.json.get('acceptor_id', None)
    requestor_id = request.json.get('requestor_id', None)
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('INSERT INTO excluded_suggestions (acceptor_id, requestor_id) VALUES (?, ?)', (acceptor_id, requestor_id))
    conn.commit()
    conn.close()
    return {'msg': 'Suggestion removed succesfuly!'}

@app.route('/remove-friend', methods=['POST'])
def remove_friend():
    requestor_id = request.json.get('requestor_id', None)
    acceptor_id = request.json.get('acceptor_id', None)
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('DELETE FROM friendships WHERE first_friend_id = ? AND second_friend_id = ?', (requestor_id, acceptor_id))
    cur.execute('DELETE FROM friendships WHERE first_friend_id = ? AND second_friend_id = ?', (acceptor_id, requestor_id))
    conn.commit()
    conn.close()
    return {'msg': 'Friendship removed succesfuly!'}

def delete_friend_request(requestor_id, acceptor_id):
   conn = sqlite3.connect("habits.db")
   cur = conn.cursor()
   cur.execute('DELETE FROM friend_requests WHERE requestor_id = ? AND acceptor_id = ?', (requestor_id, acceptor_id))
   cur.execute('DELETE FROM friend_requests WHERE requestor_id = ? AND acceptor_id = ?', (acceptor_id, requestor_id))
   conn.commit()
   conn.close()


# --------------------
# BLOG POSTS ENDPOINTS
# --------------------

@app.route('/new-blog-post', methods=['POST'])
def new_blog_post():
    user_id = request.form.get('user_id', None)
    post_time = datetime.now().isoformat()
    post_title = request.form.get('post_title', None)
    post_description = request.form.get('post_description', None)
    post_image_name = None

    if 'post_image' in request.files:
        post_image = request.files['post_image']
        post_image_name = secure_filename(post_image.filename)
        post_image.save(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()

    cur.execute('INSERT INTO user_posts (user_id, post_time, post_title, post_description, post_image) VALUES (?, ?, ?, ?, ?)',
                (user_id, post_time, post_title, post_description, post_image_name))

    conn.commit()
    conn.close()
    return 'Post added successfuly!', 200

@app.route('/update-blog-post', methods=['POST'])
def update_blog_post():
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()

    post_id = request.form.get('post_id', None)
    post_title = request.form.get('post_title', None)
    post_description = request.form.get('post_description', None)
    post_image_name = cur.execute('SELECT post_image FROM user_posts WHERE id = ?', (post_id,)).fetchone()[0]

    if 'post_image' in request.files:
        post_image = request.files['post_image']
        post_image_name = secure_filename(post_image.filename)
        post_image.save(os.path.join(app.config['POST_IMAGES_FOLDER'], post_image_name))

    cur.execute('UPDATE user_posts SET post_title = ?, post_description = ?, post_image = ? WHERE id = ?',
                (post_title, post_description, post_image_name, post_id))

    conn.commit()
    conn.close()
    return 'Post edited successfuly!', 200

@app.route('/delete-blog-post/<post_id>', methods=['POST'])
def delete_blog_post(post_id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('DELETE FROM user_posts WHERE id = ?', (post_id,))
    conn.commit()
    conn.close()
    return 'Post successfuly deleted'

@app.route('/post/<id>')
def get_post(id):
    post_data = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{id}"}}) RETURN post LIMIT 1')[0]['post']
    return post_data

@app.route('/posts')
def get_posts():
    posts_data = neo4j.run_query('MATCH (post:BLOG_POST) -[:POSTED_BY]-> (author:USER) RETURN post, author._id AS author_id ORDER BY post.post_time DESC')
    posts = []
    for post_data in posts_data:
        post = post_data['post']
        post['author_id'] = post_data['author_id']
        posts.append(post)
    return posts

@app.route('/get-my-posts/<user_id>')
def get_my_posts(user_id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    posts_data = cur.execute('SELECT * FROM user_posts WHERE user_id = ? ORDER BY id DESC', (user_id,)).fetchall()
    conn.close()
    return posts_data

@app.route('/post-likes/<post_id>')
def get_post_likes(post_id):
    post_liker_ids = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER) RETURN user._id AS user_id')
    return post_liker_ids

@app.route('/toggle-post-like', methods=['POST'])
def toggle_post_like():
    post_id = request.json.get('post_id', None)
    user_id = request.json.get('user_id', None)
    like_data = neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER {{_id: "{user_id}"}}) RETURN user._id AS user_id')

    if len(like_data):
        neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[like:LIKES]- (user:USER {{_id: "{user_id}"}}) DELETE like')
        return
    else:
        neo4j.run_query(f'MATCH (post:BLOG_POST {{_id: "{post_id}"}}) <-[:LIKES]- (user:USER {{_id: "{user_id}"}})')
        return

@app.route('/post-image/<filename>')
def get_post_image(filename):
    try:
        return send_from_directory(app.config['POST_IMAGES_FOLDER'], filename)
    except:
        return


# ------------------
# COMMENTS ENDPOINTS
# ------------------

@app.route('/comments/<post_id>')
def get_comments(post_id):
    comments_data = neo4j.run_query(f'MATCH (comment_author:USER) <-[:COMMENTED_BY]- (comment:POST_COMMENT) -[:BELONGS_TO]-> (:BLOG_POST {{_id: "{post_id}"}}) RETURN comment, comment_author._id AS author_id ORDER BY comment.comment_time DESC')
    comments = []
    for comment_data in comments_data:
        comment = comment_data['comment']
        comment['author_id'] = comment_data['author_id']
        comments.append(comment)
    return comments

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
    user = neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) RETURN user')[0]['user']
    return user

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
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
        neo4j.run_query(f'MATCH (user:USER {{_id: "{id}"}}) SET user.profile_picture = "{filename}"')
        crop_image_to_square(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
        return 'File uploaded successfully', 200
    else:
        return 'No file part', 400

@app.route('/profile-picture/<id>')
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
        hashed_old_password = hashlib.sha256(old_password.encode()).hexdigest()
        new_password = request.json.get('new_password', None)
        hashed_new_password = hashlib.sha256(new_password.encode()).hexdigest()
        
        fetched_old_password = neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) RETURN user.user_password AS old_password')[0]['old_password']
        if fetched_old_password == hashed_old_password:
            neo4j.run_query(f'MATCH (user:USER {{_id: "{user_id}"}}) SET user.user_password = "{hashed_new_password}"')
            return {'success': True}
        else:
            return {'success': False}
    except:
        return {'success': False}


# ---------------
# OTHER ENDPOINTS
# ---------------

# write neo4j query to get a post
@app.route('/neo4j', methods=['GET'])
def get_neo4j():
    result = neo4j.run_query(f'MATCH (user:USER {{user_email: "andrejdunda@gmail.com"}}) RETURN user')[0]['user']
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5001", debug=True)