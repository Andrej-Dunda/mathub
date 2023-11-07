from datetime import datetime, timedelta, timezone
import json
from flask import Flask, request, jsonify
import sqlite3
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
import hashlib

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
            response = {"access_token":access_token}
            return response
    
    return {"msg": "Wrong email or password"}, 401

    

@app.route('/profile')
@jwt_required()
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

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

@app.route('/register-new-user', methods=['POST'])
def register_new_user():
    [email, password] = request.get_json()
    # Process and save the data as needed
    conn = sqlite3.connect("habits.db")
    cur = conn.cursor()
    password_hash = hashlib.sha256(password.encode()).hexdigest()  # Hash the password
    cur.execute('INSERT INTO users (user_email, user_password) VALUES (?, ?)', (email, password_hash))
    conn.commit()
    conn.close()
    print(email)
    print(password)
    return jsonify({'message': 'Data received successfully'})

# Function to authenticate a user
def authenticate_user(email, password):
    conn = sqlite3.connect('habits.db')
    cur = conn.cursor()
    cur.execute('SELECT user_password FROM users WHERE user_name = ?', (email,))
    user_data = cur.fetchone()
    conn.close()
    
    if user_data:
        stored_password_hash = user_data[0]
        input_password_hash = hashlib.sha256(password.encode()).hexdigest()
        if stored_password_hash == input_password_hash:
            return True
    return False

if __name__ == "__main__":
    app.run(debug=True)