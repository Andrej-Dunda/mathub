import sqlite3
from datetime import datetime
# import os

# Connect to the database
connection = sqlite3.connect('habits.db')

# Execute the schema script
with open('habits_db_schema.sql') as f:
    connection.executescript(f.read())

# # Create a cursor
cur = connection.cursor()

users = [
    {"user_email": "sarah.johnson@example.com", "user_password": "sarah123", "first_name": "Sarah", "last_name": "Johnson"},
    {"user_email": "mike.brown@example.com", "user_password": "mikepass", "first_name": "Mike", "last_name": "Brown"},
    {"user_email": "lisa.white@example.com", "user_password": "lisawhite", "first_name": "Lisa", "last_name": "White"},
    {"user_email": "david.smith@example.com", "user_password": "david2023", "first_name": "David", "last_name": "Smith"},
    {"user_email": "emily.jones@example.com", "user_password": "emilyj", "first_name": "Emily", "last_name": "Jones"},
    {"user_email": "john.doe@example.com", "user_password": "johndoe1", "first_name": "John", "last_name": "Doe"},
    {"user_email": "susan.green@example.com", "user_password": "susanG2023", "first_name": "Susan", "last_name": "Green"},
    {"user_email": "alex.taylor@example.com", "user_password": "alexTpass", "first_name": "Alex", "last_name": "Taylor"},
    {"user_email": "jane.wilson@example.com", "user_password": "janew2023", "first_name": "Jane", "last_name": "Wilson"},
    {"user_email": "robert.miller@example.com", "user_password": "robertm", "first_name": "Robert", "last_name": "Miller"},
    {"user_email": "laura.davis@example.com", "user_password": "laurad2023", "first_name": "Laura", "last_name": "Davis"},
    {"user_email": "james.harris@example.com", "user_password": "jamesh", "first_name": "James", "last_name": "Harris"},
    {"user_email": "patricia.clark@example.com", "user_password": "patriciaC", "first_name": "Patricia", "last_name": "Clark"},
    {"user_email": "michael.lewis@example.com", "user_password": "michaelL123", "first_name": "Michael", "last_name": "Lewis"},
    {"user_email": "karen.hall@example.com", "user_password": "karenH2023", "first_name": "Karen", "last_name": "Hall"},
    {"user_email": "admin@admin.com", "user_password": "admin", "first_name": "Admin", "last_name": "Staff"}
]

for user in users:
    cur.execute("INSERT INTO users (user_email, user_password, first_name, last_name, registration_date) VALUES (?, ?, ?, ?, ?)",
                (user['user_email'], user['user_password'], user['first_name'], user['last_name'], datetime.now().isoformat()))

cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (1, 2))
cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (1, 4))
cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (1, 5))
cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (1, 9))

cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (1, 3))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (1, 6))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (1, 7))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (1, 10))

cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (8, 1))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (11, 1))

# # Commit the changes and close the connection
connection.commit()
connection.close()
