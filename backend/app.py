from datetime import datetime, timedelta, timezone
import json
from flask import Flask, request, jsonify, send_from_directory
import sqlite3
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
import hashlib
import random
import string
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# LOGIN LOGOUT

app.config["JWT_SECRET_KEY"] = "2a0304fc-7233-11ee-b962-0242ac120002"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
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
    
@app.route('/login', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('SELECT user_password FROM users WHERE user_email = ?', (email,))
    user_data = cur.fetchone()
    conn.close()
    
    if user_data:
        stored_password_hash = user_data[0]
        input_password_hash = hashlib.sha256(password.encode()).hexdigest()
        if stored_password_hash == input_password_hash:
            access_token = create_access_token(identity=email)

            conn = sqlite3.connect('habits.db')
            cur = conn.cursor()
            cur.execute('SELECT id, first_name, last_name, profile_picture, registration_date FROM users WHERE user_email = ?', (email,))
            user_id = cur.fetchone()[0]
            first_name = cur.fetchone()[1]
            last_name = cur.fetchone()[2]
            profile_picture = cur.fetchone()[3]
            registration_date = cur.fetchone()[4]
            conn.close()

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
    
    return jsonify({"message": "Chybný email nebo heslo!"}), 401

@app.route('/profile', methods=['GET'])
@jwt_required()
def my_profile():
    
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('SELECT * FROM users WHERE id = ?', (id,))
    user_data = cur.fetchone()
    # response_body = {
    #     "id": user_data[0],
    #     "email": user_data[1],
    #     "password": user_data[2]
    # }

    # return response_body
    return jsonify({'user_data': user_data})

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response



# ENDPOINTS

@app.route("/users")
def users_table():
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    res = cur.execute("SELECT * FROM users").fetchall()
    return res

@app.route('/registration', methods=['POST'])
def register_new_user():
    try:
      email = request.json.get("email", None)
      password = request.json.get("password", None)
      first_name = request.json.get("first_name", None)
      last_name = request.json.get("last_name", None)
      # Process and save the data as needed
      conn = sqlite3.connect("habits.db")
      cur = conn.cursor()
      password_hash = hashlib.sha256(password.encode()).hexdigest()  # Hash the password

      # Check if the user_name already exists in the table
      cur.execute("SELECT user_email FROM users WHERE user_email = ?", (email,))
      existing_user = cur.fetchone()

      if existing_user is None:
        cur.execute('INSERT INTO users (user_email, user_password, first_name, last_name) VALUES (?, ?, ?, ?)', (email, password_hash, first_name, last_name))
      else:
         return jsonify({'message': 'Uživatelské jméno již existuje!'})
      conn.commit()
      conn.close()
    except:
      return jsonify({'message': 'Registrace se nezdařila :('})
    else:
      return jsonify({'message': 'Registrace proběhla úspěšně.'})
    
@app.route('/forgotten-password', methods=['POST'])
def generate_new_password():
    try:
      email = request.json.get("email", None)

      characters = string.ascii_letters + string.digits
      new_password = ''.join(random.choice(characters) for _ in range(12))

      # Process and save the data as needed
      conn = sqlite3.connect("habits.db")
      cur = conn.cursor()

      # Check if the user_name already exists in the table
      cur.execute("SELECT user_email FROM users WHERE user_email = ?", (email,))
      existing_user = cur.fetchone()

      if existing_user is None:
        return jsonify({'console_message': 'User profile does not exist!', 'response_message': 'Tento profil neexistuje!', 'result': False})
      
      password_hash = hashlib.sha256(new_password.encode()).hexdigest()  # Hash the password
      cur.execute("UPDATE users SET user_password = ? WHERE user_email = ?", (password_hash, email))
      conn.commit()
      conn.close()
    except:
      return jsonify({'console_message': 'Failed to reset password', 'response_message': 'Heslo nemohlo být resetováno', 'result': False})
    else:
      return jsonify({
         'console_message': 'Password reset successfully',
         'new_password': new_password,
         'response_message': 'Heslo úspěšně resetováno!',
         'result': True
         })
    
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


app.config['UPLOAD_FOLDER'] = 'uploads/'

@app.route('/upload-profile-picture', methods=['POST'])
def upload_profile_picture():
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return 'File uploaded successfully', 200
    else:
        return 'No file part', 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    return filename

if __name__ == "__main__":
    app.run(debug=True)