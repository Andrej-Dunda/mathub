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

# # Commit the changes and close the connection
connection.commit()
connection.close()
