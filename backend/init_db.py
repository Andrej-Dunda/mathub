from neo4j import GraphDatabase
from datetime import datetime, timedelta
import random
from uuid import uuid4
from flask_bcrypt import Bcrypt
import time
import os

class Neo4jService:
    def __init__(self):
        self.driver = GraphDatabase.driver("bolt://neo4j:7687", auth=("neo4j", "mathubdb"))

    def close(self):
        self.driver.close()

    def run_query(self, query):
        with self.driver.session() as session:
            result = session.run(query)
            return list(result)
    
    def is_ready(self):
        try:
            with self.driver.session() as session:
                session.run("RETURN 1")
            return True
        except Exception:
            return False
        
# Create an instance of Neo4j
neo4j = Neo4jService()

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

def hash_password(password):
    return Bcrypt().generate_password_hash(password).decode('utf-8')

# Clear the console
def clear_console():
    command = 'clear' if os.name == 'posix' else 'cls'
    os.system(command)

init_db_query = f'''
    // Users
    CREATE
    (sarah:USER {{_id: '{uuid4()}', user_email: 'sarah.johnson@example.com', user_password: '{hash_password('sarah123')}', first_name: 'Sára', last_name: 'Johnsonová', profile_picture: 'pp1.png', registration_date: '{random_time()}'}}),
    (mike:USER {{_id: '{uuid4()}', user_email: 'mike.brown@example.com', user_password: '{hash_password('mikepass')}', first_name: 'Michal', last_name: 'Hnědý', profile_picture: 'pp6.png', registration_date: '{random_time()}'}}),
    (lisa:USER {{_id: '{uuid4()}', user_email: 'lisa.white@example.com', user_password: '{hash_password('lisawhite')}', first_name: 'Eliška', last_name: 'Bílá', profile_picture: 'pp2.png', registration_date: '{random_time()}'}}),
    (david:USER {{_id: '{uuid4()}', user_email: 'david.smith@example.com', user_password: '{hash_password('david2023')}', first_name: 'David', last_name: 'Kovář', profile_picture: 'pp3.png', registration_date: '{random_time()}'}}),
    (boris:USER {{_id: '{uuid4()}', user_email: 'boris@admin.com', user_password: '{hash_password('admin')}', first_name: 'Boris', last_name: 'Spaskij', profile_picture: '', registration_date: '{random_time()}'}}),
    (emma:USER {{_id: '{uuid4()}', user_email: 'emily.jones@example.com', user_password: '{hash_password('emilyj')}', first_name: 'Emma', last_name: 'Zahálková', profile_picture: 'pp9.png', registration_date: '{random_time()}'}}),
    (john:USER {{_id: '{uuid4()}', user_email: 'john.doe@example.com', user_password: '{hash_password('johndoe1')}', first_name: 'Jan', last_name: 'Lucemburský', profile_picture: 'pp8.png', registration_date: '{random_time()}'}}),
    (michael:USER {{_id: '{uuid4()}', user_email: 'michael.lewis@example.com', user_password: '{hash_password('michaelL123')}', first_name: 'Michael', last_name: 'Broadhead', profile_picture: '', registration_date: '{random_time()}'}}),
    (susan:USER {{_id: '{uuid4()}', user_email: 'susan.green@example.com', user_password: '{hash_password('susanG2023')}', first_name: 'Zuzana', last_name: 'Čaputová', profile_picture: 'pp10.png', registration_date: '{random_time()}'}}),
    (petr:USER {{_id: '{uuid4()}', user_email: 'prezidentpavel@gmail.com', user_password: '{hash_password('petrpavel')}', first_name: 'Petr', last_name: 'Pavel', profile_picture: 'pp12.jpg', registration_date: '{random_time()}'}}),
    (jane:USER {{_id: '{uuid4()}', user_email: 'jane.wilson@example.com', user_password: '{hash_password('janew2023')}', first_name: 'Jana', last_name: 'Kamenická', profile_picture: 'pp7.png', registration_date: '{random_time()}'}}),
    (robert:USER {{_id: '{uuid4()}', user_email: 'robert.miller@example.com', user_password: '{hash_password('robertm')}', first_name: 'Robert', last_name: 'Green', profile_picture: 'pp11.png', registration_date: '{random_time()}'}}),
    (karla:USER {{_id: '{uuid4()}', user_email: 'karla.hall@example.com', user_password: '{hash_password('karlaH2023')}', first_name: 'Karla', last_name: 'Krásnolásková', profile_picture: '', registration_date: '{random_time()}'}}),
    (laura:USER {{_id: '{uuid4()}', user_email: 'laura.davis@example.com', user_password: '{hash_password('laurad2023')}', first_name: 'Laura', last_name: 'Habenichtová', profile_picture: 'pp5.png', registration_date: '{random_time()}'}}),
    (james:USER {{_id: '{uuid4()}', user_email: 'james.harris@example.com', user_password: '{hash_password('jamesh')}', first_name: 'Stanislav', last_name: 'Špaček', profile_picture: '', registration_date: '{random_time()}'}}),
    (patricia:USER {{_id: '{uuid4()}', user_email: 'patricia.clark@example.com', user_password: '{hash_password('patriciaC')}', first_name: 'Patricie', last_name: 'Ševčíková', profile_picture: 'pp4.png', registration_date: '{random_time()}'}}),
    (admin:USER {{_id: '{uuid4()}', user_email: 'admin@admin.com', user_password: '{hash_password('admin')}', first_name: 'Admin', last_name: 'Staff', profile_picture: '', registration_date: '{random_time()}'}})

    // Friendships
    FOREACH (user in [sarah, mike, petr, michael, jane, lisa] | CREATE (admin) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (admin))
    FOREACH (user in [mike, michael, lisa, sarah] | CREATE (patricia) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (patricia))
    FOREACH (user in [robert, karla] | CREATE (emma) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (emma))
    FOREACH (user in [susan, mike, john] | CREATE (petr) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (petr))
    FOREACH (user in [laura, jane, david] | CREATE (robert) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (robert))
    FOREACH (user in [lisa] | CREATE (laura) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (laura))
    FOREACH (user in [mike, susan, sarah, petr] | CREATE (karla) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (karla))
    FOREACH (user in [laura, patricia] | CREATE (james) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (james))
    FOREACH (user in [patricia, john] | CREATE (boris) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (boris))
    FOREACH (user in [david, boris, john] | CREATE (lisa) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (lisa))

    // Friend requests
    FOREACH (user in [patricia, robert] | CREATE (admin) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [karla] | CREATE (patricia) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [laura] | CREATE (emma) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [boris, jane, sarah] | CREATE (petr) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [mike, susan] | CREATE (robert) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [david, karla, patricia] | CREATE (laura) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [robert, lisa] | CREATE (karla) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [john, michael, sarah, admin] | CREATE (james) -[:FRIEND_REQUEST]-> (user))
    
    // Posts
    CREATE
    (post1:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Základy fitness posiloven: budování síly a komunity', post_description: 'Tento příspěvek se zabývá úlohou posiloven při podpoře fyzické kondice a sociálních vazeb. Nabízí postřehy o výběru správné posilovny, maximalizaci tréninku a výhodách skupinových lekcí. Součástí jsou osobní anekdoty a tipy pro začátečníky v posilovně, které kladou důraz na holistický přístup ke zdraví.', post_image: 'gym.png' }}) -[:POSTED_BY]-> (sarah),
    (post2:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Běh pro zdraví: Osobní průvodce', post_description: 'Tento příspěvek na blogu upozorňuje na výhody běhání a poskytuje tipy pro začátečníky ohledně výběru vybavení, tréninkových plánů a motivace. Mísí osobní příběhy s praktickými radami, zdůrazňuje přínos běhání pro duševní i fyzické zdraví a obsahuje inspirativní citáty sportovců.', post_image: 'joggers.png' }}) -[:POSTED_BY]-> (mike),
    (post3:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Znovuobjevení radosti ze čtení: Jednoduchý průvodce', post_description: 'Tento blogový příspěvek se zabývá potěšením a přínosy čtení a nabízí tipy, jak najít ty správné knihy, vytvořit si čtenářský návyk a najít si čas na literaturu. Obsahuje osobní anekdoty, seznamy doporučené četby a postřehy o tom, jak čtení rozšiřuje znalosti a představivost.', post_image: 'books.png' }}) -[:POSTED_BY]-> (admin)

    // Comments
    CREATE
    (post1) <-[:COMMENT_OF]- (comment1:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Skvělá inspirace, díky!' }}) -[:COMMENTED_BY]-> (sarah),
    (post1) <-[:COMMENT_OF]- (comment2:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Myslím si, že každá slušná posilovna by nikdy nic takového neudělala! Za minulého režimu to bylo jednoduché, žádné rádoby fit boostery ani jiné steroidy jsme nebrali! To se věci ještě dělaly pořádně, ale to vy nemůžete pochopit. Dávám palec dolů!' }}) -[:COMMENTED_BY]-> (admin),
    (post1) <-[:COMMENT_OF]- (comment3:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Tento článek přišel v pravou chvíli! Právě jsem se rozhodl/a začít chodit do posilovny a hledám všechny možné informace. Máte nějaké konkrétní rady, které by mohly pomoci úplnému nováčkovi?' }}) -[:COMMENTED_BY]-> (jane),
    (post1) <-[:COMMENT_OF]- (comment4:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Skvělé postřehy! Souhlasím, že výběr správné posilovny je klíčový. Chodím cvičit už léta a změna posilovny mě naprosto nabila novou energií. Jaké funkční cviky byste doporučili pro maximalizaci tréninku?' }}) -[:COMMENTED_BY]-> (david),
    (post1) <-[:COMMENT_OF]- (comment5:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Jako instruktor fitness tříd musím říct, že skupinové lekce skutečně mohou zázraky nejen pro fyzickou kondici, ale i pro sociální vazby mezi účastníky. Je úžasné vidět, jak společné cvičení posiluje týmového ducha!' }}) -[:COMMENTED_BY]-> (emma),
    (post1) <-[:COMMENT_OF]- (comment6:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Miluji váš holistický přístup ke zdraví! Je důležité si uvědomit, že posilování těla není jen o svalové síle, ale také o duševním a emocionálním blahobytu. Máte nějaké tipy na relaxační techniky po náročném tréninku?' }}) -[:COMMENTED_BY]-> (john),
    (post2) <-[:COMMENT_OF]- (comment7:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Nevíte někdo, kde sehnat levné ale kvalitní běžecké boty?' }}) -[:COMMENTED_BY]-> (emma),
    (post3) <-[:COMMENT_OF]- (comment8:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'V pubertě jsem skoro nečetla a teď toho lituju, jsem ráda, že jsem se konečně vrátila ke čtení.' }}) -[:COMMENTED_BY]-> (john)
    
    // Likes
    CREATE
    (admin) -[:LIKES]-> (post1),
    (sarah) -[:LIKES]-> (post2),
    (mike) -[:LIKES]-> (post1),
    (mike) -[:LIKES]-> (post2),
    (mike) -[:LIKES]-> (post3),
    (lisa) -[:LIKES]-> (post1),
    (lisa) -[:LIKES]-> (post2),
    (david) -[:LIKES]-> (post2),
    (david) -[:LIKES]-> (post3),
    (emma) -[:LIKES]-> (post1),
    (emma) -[:LIKES]-> (post2),
    (john) -[:LIKES]-> (post1),
    (john) -[:LIKES]-> (post2),
    (robert) -[:LIKES]-> (post2),
    (robert) -[:LIKES]-> (post3),
    (karla) -[:LIKES]-> (post1),
    (karla) -[:LIKES]-> (post3)

    // Subjects
    CREATE
    (subject1:SUBJECT {{ _id: '{uuid4()}', subject_name: 'DEMO Ekonomie', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:CREATED_BY]-> (admin),
    (subject2:SUBJECT {{ _id: '{uuid4()}', subject_name: 'DEMO Matematika', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:CREATED_BY]-> (admin),
    (subject3:SUBJECT {{ _id: '{uuid4()}', subject_name: 'DEMO Informatika', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:CREATED_BY]-> (admin)

    // Topics
    CREATE
    (topic1:TOPIC {{ _id: '{uuid4()}', topic_name: '1. Základní ekonomické pojmy', topic_content: 'DEMO obsah materiálu 1. Základní ekonomické pojmy', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject1),
    (topic2:TOPIC {{ _id: '{uuid4()}', topic_name: '2. Výroba, výrobní proces', topic_content: 'DEMO obsah materiálu 2. Výroba, výrobní proces', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject1),
    (topic3:TOPIC {{ _id: '{uuid4()}', topic_name: '3. Trh a jeho charakteristika', topic_content: 'DEMO obsah materiálu 3. Trh a jeho charakteristika', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject1),
    (topic4:TOPIC {{ _id: '{uuid4()}', topic_name: '4. Mzda a její formy', topic_content: 'DEMO obsah materiálu 4. Mzda a její formy', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject1),
    (topic5:TOPIC {{ _id: '{uuid4()}', topic_name: '5. Charakteristika podnikání', topic_content: 'DEMO obsah materiálu 5. Charakteristika podnikání', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject1),
    (topic6:TOPIC {{ _id: '{uuid4()}', topic_name: 'Algebra DEMO', topic_content: 'DEMO obsah materiálu Algebra DEMO', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject2),
    (topic7:TOPIC {{ _id: '{uuid4()}', topic_name: 'Neo4j DEMO', topic_content: 'DEMO obsah materiálu Neo4j DEMO', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (subject3)
    '''

def init_db():
    time_waited = 0

    # run the query when neo4j image container is ready and healthy and the neo4j database is empty
    while not neo4j.is_ready():
        clear_console()
        time_waited += 1
        print(f"Waiting for Neo4j to start... ({time_waited}s)")
        time.sleep(1)
        pass

    db_data = neo4j.run_query("MATCH (n) RETURN n")
    if len(list(db_data)) == 0:
        neo4j.run_query(init_db_query)
        print("Database initialized")
    else:
        print("Database already initialized")