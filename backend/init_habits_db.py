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

# for i in range(40):
cur.execute("INSERT INTO users (user_name, user_password) VALUES ('andrej_dunda', 'andrej1234')")
cur.execute("INSERT INTO users (user_name, user_password) VALUES ('tomas_svoboda', 'tomas5678')")

# # Commit the changes and close the connection
connection.commit()
connection.close()
