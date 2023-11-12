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
