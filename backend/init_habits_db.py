import hashlib
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
    {"user_email": "sarah.johnson@example.com", "user_password": "sarah123", "first_name": "Sarah", "last_name": "Johnson", "profile_picture": "pp1.png"},
    {"user_email": "mike.brown@example.com", "user_password": "mikepass", "first_name": "Mike", "last_name": "Brown", "profile_picture": "pp6.png"},
    {"user_email": "lisa.white@example.com", "user_password": "lisawhite", "first_name": "Lisa", "last_name": "White", "profile_picture": "pp2.png"},
    {"user_email": "david.smith@example.com", "user_password": "david2023", "first_name": "David", "last_name": "Smith", "profile_picture": "pp3.png"},
    {"user_email": "admin@admin.com", "user_password": "admin", "first_name": "Admin", "last_name": "Staff", "profile_picture": "profile-picture-default.png"},
    {"user_email": "emily.jones@example.com", "user_password": "emilyj", "first_name": "Emily", "last_name": "Jones", "profile_picture": "pp9.png"},
    {"user_email": "john.doe@example.com", "user_password": "johndoe1", "first_name": "John", "last_name": "Doe", "profile_picture": "pp8.png"},
    {"user_email": "michael.lewis@example.com", "user_password": "michaelL123", "first_name": "Michael", "last_name": "Lewis", "profile_picture": "profile-picture-default.png"},
    {"user_email": "susan.green@example.com", "user_password": "susanG2023", "first_name": "Susan", "last_name": "Green", "profile_picture": "pp10.png"},
    {"user_email": "prezidentpavel@gmail.com", "user_password": "petrpavel", "first_name": "Petr", "last_name": "Pavel", "profile_picture": "pp12.jpeg"},
    {"user_email": "jane.wilson@example.com", "user_password": "janew2023", "first_name": "Jane", "last_name": "Wilson", "profile_picture": "pp7.png"},
    {"user_email": "robert.miller@example.com", "user_password": "robertm", "first_name": "Robert", "last_name": "Miller", "profile_picture": "pp11.png"},
    {"user_email": "karen.hall@example.com", "user_password": "karenH2023", "first_name": "Karen", "last_name": "Hall", "profile_picture": "profile-picture-default.png"},
    {"user_email": "laura.davis@example.com", "user_password": "laurad2023", "first_name": "Laura", "last_name": "Davis", "profile_picture": "pp5.png"},
    {"user_email": "james.harris@example.com", "user_password": "jamesh", "first_name": "James", "last_name": "Harris", "profile_picture": "profile-picture-default.png"},
    {"user_email": "patricia.clark@example.com", "user_password": "patriciaC", "first_name": "Patricia", "last_name": "Clark", "profile_picture": "pp4.png"}
]

posts = [
    {
        "user_id": 1,
        "post_time": datetime.now().isoformat(),
        "post_title": 'Základy fitness posiloven: budování síly a komunity',
        "post_description": 'Tento příspěvek se zabývá úlohou posiloven při podpoře fyzické kondice a sociálních vazeb. Nabízí postřehy o výběru správné posilovny, maximalizaci tréninku a výhodách skupinových lekcí. Součástí jsou osobní anekdoty a tipy pro začátečníky v posilovně, které kladou důraz na holistický přístup ke zdraví.',
        "post_image": 'gym.png'
    },
    {
        "user_id": 4,
        "post_time": datetime.now().isoformat(),
        "post_title": 'Běh pro zdraví: Osobní průvodce',
        "post_description": 'Tento příspěvek na blogu upozorňuje na výhody běhání a poskytuje tipy pro začátečníky ohledně výběru vybavení, tréninkových plánů a motivace. Mísí osobní příběhy s praktickými radami, zdůrazňuje přínos běhání pro duševní i fyzické zdraví a obsahuje inspirativní citáty sportovců.',
        "post_image": 'joggers.png'
    },
    {
        "user_id": 2,
        "post_time": datetime.now().isoformat(),
        "post_title": 'Znovuobjevení radosti ze čtení: Jednoduchý průvodce',
        "post_description": 'Tento blogový příspěvek se zabývá potěšením a přínosy čtení a nabízí tipy, jak najít ty správné knihy, vytvořit si čtenářský návyk a najít si čas na literaturu. Obsahuje osobní anekdoty, seznamy doporučené četby a postřehy o tom, jak čtení rozšiřuje znalosti a představivost.',
        "post_image": 'books.png'
    }
]

for user in users:
    cur.execute("INSERT INTO users (user_email, user_password, first_name, last_name, registration_date, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
                (user['user_email'], hashlib.sha256(user['user_password'].encode()).hexdigest(), user['first_name'], user['last_name'], datetime.now().isoformat(), user['profile_picture']))

for post in posts:
    cur.execute("INSERT INTO user_posts (user_id, post_time, post_title, post_description, post_image) VALUES (?, ?, ?, ?, ?)",
                (post['user_id'], post['post_time'], post['post_title'], post['post_description'], post['post_image']))

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
