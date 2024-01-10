import hashlib
import sqlite3
from datetime import datetime, timedelta
import random

# Connect to the database
connection = sqlite3.connect('habits.db')

# Execute the schema script
with open('habits_db_schema.sql') as f:
    connection.executescript(f.read())

# # Create a cursor
cur = connection.cursor()


# Generating a random time within the last 5 days
def random_time():
    # Current time
    now = datetime.now()

    days_ago = random.randint(0, 5)
    random_time = now - timedelta(days=days_ago, 
                                hours=random.randint(0, 23),
                                minutes=random.randint(0, 59),
                                seconds=random.randint(0, 59))

    # Converting to ISO format
    return random_time.isoformat()

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
    {"user_email": "prezidentpavel@gmail.com", "user_password": "petrpavel", "first_name": "Petr", "last_name": "Pavel", "profile_picture": "pp12.jpg"},
    {"user_email": "jane.wilson@example.com", "user_password": "janew2023", "first_name": "Jane", "last_name": "Wilson", "profile_picture": "pp7.png"},
    {"user_email": "robert.miller@example.com", "user_password": "robertm", "first_name": "Robert", "last_name": "Miller", "profile_picture": "pp11.png"},
    {"user_email": "karen.hall@example.com", "user_password": "karenH2023", "first_name": "Karen", "last_name": "Hall", "profile_picture": "profile-picture-default.png"},
    {"user_email": "laura.davis@example.com", "user_password": "laurad2023", "first_name": "Laura", "last_name": "Davis", "profile_picture": "pp5.png"},
    {"user_email": "james.harris@example.com", "user_password": "jamesh", "first_name": "James", "last_name": "Harris", "profile_picture": "profile-picture-default.png"},
    {"user_email": "patricia.clark@example.com", "user_password": "patriciaC", "first_name": "Patricia", "last_name": "Clark", "profile_picture": "pp4.png"},
    {"user_email": "andrejdunda@gmail.com", "user_password": "andrej", "first_name": "Andrej", "last_name": "Dunda", "profile_picture": "andrej.jpg"}
]

posts = [
    {
        "user_id": 1,
        "post_time": random_time(),
        "post_title": 'Základy fitness posiloven: budování síly a komunity',
        "post_description": 'Tento příspěvek se zabývá úlohou posiloven při podpoře fyzické kondice a sociálních vazeb. Nabízí postřehy o výběru správné posilovny, maximalizaci tréninku a výhodách skupinových lekcí. Součástí jsou osobní anekdoty a tipy pro začátečníky v posilovně, které kladou důraz na holistický přístup ke zdraví.',
        "post_image": 'gym.png'
    },
    {
        "user_id": 4,
        "post_time": random_time(),
        "post_title": 'Běh pro zdraví: Osobní průvodce',
        "post_description": 'Tento příspěvek na blogu upozorňuje na výhody běhání a poskytuje tipy pro začátečníky ohledně výběru vybavení, tréninkových plánů a motivace. Mísí osobní příběhy s praktickými radami, zdůrazňuje přínos běhání pro duševní i fyzické zdraví a obsahuje inspirativní citáty sportovců.',
        "post_image": 'joggers.png'
    },
    {
        "user_id": 2,
        "post_time": random_time(),
        "post_title": 'Znovuobjevení radosti ze čtení: Jednoduchý průvodce',
        "post_description": 'Tento blogový příspěvek se zabývá potěšením a přínosy čtení a nabízí tipy, jak najít ty správné knihy, vytvořit si čtenářský návyk a najít si čas na literaturu. Obsahuje osobní anekdoty, seznamy doporučené četby a postřehy o tom, jak čtení rozšiřuje znalosti a představivost.',
        "post_image": 'books.png'
    }
]

comments = [
    {
        "post_id": 1,
        "commenter_id": 4,
        "comment": "Skvělá inspirace, díky!",
        "comment_time": random_time()
    },
    {
        "post_id": 1,
        "commenter_id": 5,
        "comment": "Myslím si, že každá slušná posilovna by nikdy nic takového neudělala! Za minulého režimu to bylo jednoduché, žádné rádoby fit boostery ani jiné steroidy jsme nebrali! To se věci ještě dělaly pořádně, ale to vy nemůžete pochopit. Dávám palec dolů!",
        "comment_time": random_time()
    },
    {
        "post_id": 1,
        "commenter_id": 5,
        "comment": "Tento článek přišel v pravou chvíli! Právě jsem se rozhodl/a začít chodit do posilovny a hledám všechny možné informace. Máte nějaké konkrétní rady, které by mohly pomoci úplnému nováčkovi?",
        "comment_time": random_time()
    },
    {
        "post_id": 1,
        "commenter_id": 7,
        "comment": "Skvělé postřehy! Souhlasím, že výběr správné posilovny je klíčový. Chodím cvičit už léta a změna posilovny mě naprosto nabila novou energií. Jaké funkční cviky byste doporučili pro maximalizaci tréninku?",
        "comment_time": random_time()
    },
    {
        "post_id": 1,
        "commenter_id": 6,
        "comment": "Jako instruktor fitness tříd musím říct, že skupinové lekce skutečně mohou zázraky nejen pro fyzickou kondici, ale i pro sociální vazby mezi účastníky. Je úžasné vidět, jak společné cvičení posiluje týmového ducha!",
        "comment_time": random_time()
    },
    {
        "post_id": 1,
        "commenter_id": 9,
        "comment": "Miluji váš holistický přístup ke zdraví! Je důležité si uvědomit, že posilování těla není jen o svalové síle, ale také o duševním a emocionálním blahobytu. Máte nějaké tipy na relaxační techniky po náročném tréninku?",
        "comment_time": random_time()
    },
    {
        "post_id": 2,
        "commenter_id": 6,
        "comment": "Nevíte někdo, kde sehnat levné ale kvalitní běžecké boty?",
        "comment_time": random_time()
    },
    {
        "post_id": 3,
        "commenter_id": 7,
        "comment": "V pubertě jsem skoro nečetla a teď toho lituju, jsem ráda, že jsem se konečně vrátila ke čtení.",
        "comment_time": random_time()
    }
]

for user in users:
    cur.execute("INSERT INTO users (user_email, user_password, first_name, last_name, registration_date, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
                (user['user_email'], hashlib.sha256(user['user_password'].encode()).hexdigest(), user['first_name'], user['last_name'], random_time(), user['profile_picture']))

for post in posts:
    cur.execute("INSERT INTO user_posts (user_id, post_time, post_title, post_description, post_image) VALUES (?, ?, ?, ?, ?)",
                (post['user_id'], post['post_time'], post['post_title'], post['post_description'], post['post_image']))
    
for comment in comments:
    cur.execute('INSERT INTO post_comments (post_id, commenter_id, comment, comment_time) VALUES (?, ?, ?, ?)',
                (comment['post_id'], comment['commenter_id'], comment['comment'], comment['comment_time']))

cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (17, 2))
cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (17, 4))
cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (17, 5))
cur.execute('INSERT INTO friendships (first_friend_id, second_friend_id) VALUES (?, ?)', (17, 9))

cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (17, 3))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (17, 6))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (17, 7))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (17, 10))

cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (8, 17))
cur.execute('INSERT INTO friend_requests (requestor_id, acceptor_id) VALUES (?, ?)', (11, 17))

for i in range(15):
    cur.execute('INSERT INTO post_likes (post_id, liker_id) VALUES (?, ?)', (1, i))
cur.execute('INSERT INTO post_likes (post_id, liker_id) VALUES (?, ?)', (1, 17))

for i in range(10):
    cur.execute('INSERT INTO post_likes (post_id, liker_id) VALUES (?, ?)', (2, i))

for i in range(7):
    cur.execute('INSERT INTO post_likes (post_id, liker_id) VALUES (?, ?)', (3, i))

# # Commit the changes and close the connection
connection.commit()
connection.close()
