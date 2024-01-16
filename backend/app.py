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
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    user_data = neo4j.run_query(f'MATCH (user:USER {{user_email: "andrejdunda@gmail.com"}}) RETURN user')[0]['user']

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
    
    print("Something went wrong")
    return jsonify({"message": "Chybný email nebo heslo!"}), 401

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
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()  # Hash the password

        existing_user = neo4j.run_query(f'MATCH (user:USER {{user_email: "{email}"}}) RETURN user')

        if not len(existing_user):
            create_user_node(email, password_hash, first_name, last_name)
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

@app.route("/users")
def users_table():
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    res = cur.execute("SELECT * FROM users").fetchall()
    return res

@app.route('/get-friend-suggestions', methods=['POST'])
# @jwt_required()
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
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    post_data = cur.execute('SELECT * FROM user_posts WHERE id = ?', (id,)).fetchone()
    conn.close()
    return post_data

@app.route('/posts')
def get_posts():
    print('posts')
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    posts_data = cur.execute('SELECT * FROM user_posts ORDER BY id DESC').fetchall()
    conn.close()
    return posts_data

@app.route('/get-my-posts/<user_id>')
def get_my_posts(user_id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    posts_data = cur.execute('SELECT * FROM user_posts WHERE user_id = ? ORDER BY id DESC', (user_id,)).fetchall()
    conn.close()
    return posts_data

@app.route('/post-likes/<post_id>')
def get_post_likes(post_id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    post_liker_ids = cur.execute('SELECT liker_id FROM post_likes WHERE post_id = ?', (post_id,)).fetchall()
    conn.close()
    return post_liker_ids

@app.route('/toggle-post-like', methods=['POST'])
def toggle_post_like():
    post_id = request.json.get('post_id', None)
    user_id = request.json.get('user_id', None)
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    like_data = cur.execute('SELECT * FROM post_likes WHERE post_id = ? AND liker_id = ?', (post_id, user_id)).fetchone()

    print(like_data)
    if like_data != None:
        cur.execute('DELETE FROM post_likes WHERE post_id = ? AND liker_id = ?', (post_id, user_id))
        conn.commit()
        conn.close()
        return 'unliked'
    else:
        cur.execute('INSERT INTO post_likes (post_id, liker_id) VALUES (?, ?)', (post_id, user_id))
        conn.commit()
        conn.close()
        return 'liked'

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
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    comments = cur.execute('SELECT commenter_id, comment, comment_time FROM post_comments WHERE post_id = ? ORDER BY id DESC', (post_id,)).fetchall()
    conn.close()
    return comments

@app.route('/add-comment', methods=['POST'])
def add_comment():
    post_id = request.json.get('post_id', None)
    commenter_id = request.json.get('commenter_id', None)
    comment = request.json.get('comment', None)
    comment_time = datetime.now().isoformat()
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('INSERT INTO post_comments (post_id, commenter_id, comment, comment_time) VALUES (?, ?, ?, ?)',
                (post_id, commenter_id, comment, comment_time))
    conn.commit()
    conn.close()
    return 'Comment added successfuly!'


# ----------------------
# USER ACCOUNT ENDPOINTS
# ----------------------

@app.route('/user/<id>', methods=['GET'])
def get_user(id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    user = cur.execute('SELECT id, user_email, first_name, last_name, profile_picture, registration_date FROM users WHERE id = ?', (id,)).fetchone()
    return {"user": user}

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
        conn = sqlite3.connect('habits.db')
        cur = conn.cursor()
        cur.execute('UPDATE users SET profile_picture = ? WHERE id = ?', (filename, id))
        conn.commit()
        conn.close()
        crop_image_to_square(os.path.join(app.config['PROFILE_PICTURES_FOLDER'], filename))
        return 'File uploaded successfully', 200
    else:
        return 'No file part', 400

@app.route('/user-profile-picture/<user_id>')
def get_profile_picture(user_id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    try:
        profile_picture = cur.execute('SELECT profile_picture FROM users WHERE id = ?', (user_id,)).fetchone()[0]
    except:
        profile_picture = 'profile-picture-defualt.png'
    return profile_picture

@app.route('/profile-picture/<id>')
def get_user_profile_picture(id):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    try:
        profile_picture = cur.execute('SELECT profile_picture FROM users WHERE id = ?', (id,)).fetchone()[0]
        return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], profile_picture)
    except:
        return send_from_directory(app.config['PROFILE_PICTURES_FOLDER'], 'profile-picture-default.png')
    finally:
        conn.close()

@app.route('/change-password', methods=['POST'])
def change_password():
    try:
        user_id = request.json.get('user_id', None)
        old_password = request.json.get('old_password', None)
        hashed_old_password = hashlib.sha256(old_password.encode()).hexdigest()
        new_password = request.json.get('new_password', None)
        hashed_new_password = hashlib.sha256(new_password.encode()).hexdigest()
        
        conn = sqlite3.connect('habits.db')
        cur = conn.cursor()
        
        fetched_old_password = cur.execute('SELECT user_password FROM users WHERE id = ?', (user_id,)).fetchone()[0]
        if fetched_old_password == hashed_old_password:
            cur.execute('UPDATE users SET user_password = ? WHERE id = ?', (hashed_new_password, user_id))
            conn.commit()
            conn.close()
            return {'success': True}
        else:
            conn.close()
            return {'success': False}
    except sqlite3.Error as e:
        return {'msg': f'Databázová chyba: {str(e)}', 'success': False}
    finally:
        conn.close()


# ---------------
# OTHER ENDPOINTS
# ---------------

# write neo4j query to get a post
@app.route('/neo4j', methods=['GET'])
def get_neo4j():
    result = neo4j.run_query("MATCH (post:BLOG_POST) RETURN post")
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5001", debug=True)