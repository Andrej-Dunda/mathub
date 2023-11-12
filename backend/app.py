from datetime import datetime, timedelta, timezone
import json
from flask import Flask, request, jsonify
import sqlite3
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
import hashlib
import random
import string

app = Flask(__name__)

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
            cur.execute('SELECT id FROM users WHERE user_email = ?', (email,))
            user_id = cur.fetchone()[0]
            conn.close()

            response = {
                "access_token": access_token,
                "user_id": user_id,
                "email": email,
                "password": password
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
      # Process and save the data as needed
      conn = sqlite3.connect("habits.db")
      cur = conn.cursor()
      password_hash = hashlib.sha256(password.encode()).hexdigest()  # Hash the password

      # Check if the user_name already exists in the table
      cur.execute("SELECT user_email FROM users WHERE user_email = ?", (email,))
      existing_user = cur.fetchone()

      if existing_user is None:
        cur.execute('INSERT INTO users (user_email, user_password) VALUES (?, ?)', (email, password_hash))
      else:
         return jsonify({'message': 'Uživatelské jméno již existuje!'})
      conn.commit()
      conn.close()
      print(email)
      print(password)
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
      print(email)
      print(new_password)
    except:
      return jsonify({'console_message': 'Failed to reset password', 'response_message': 'Heslo nemohlo být resetováno', 'result': False})
    else:
      return jsonify({
         'console_message': 'Password reset successfully',
         'new_password': new_password,
         'response_message': 'Heslo úspěšně resetováno!',
         'result': True
         })

@app.route('/user-habits', methods=['GET'])
def get_user_habits():
   user_id = request.json.get('id', None)

   conn = sqlite3.connect("habits.db")
   cur = conn.cursor()
   cur.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
   habits = cur.fetchall()

   return jsonify({'habits': habits})
    
if __name__ == "__main__":
    app.run(debug=True)