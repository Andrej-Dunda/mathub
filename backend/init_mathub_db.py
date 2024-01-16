from neo4j import GraphDatabase
import hashlib
from datetime import datetime, timedelta
import random
from uuid import uuid4

class Neo4jService:
    def __init__(self):
        self.driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "mathubdb"))

    def close(self):
        self.driver.close()

    def run_query(self, query):
        with self.driver.session() as session:
            return session.run(query)
        
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

users_query = f'''
    CREATE
    (sarah:USER {{_id: '{uuid4()}', user_email: 'sarah.johnson@example.com', user_password: '{hashlib.sha256('sarah123'.encode()).hexdigest()}', first_name: 'Sára', last_name: 'Johnsonová', profile_picture: 'pp1.png', registration_date: '{random_time()}'}}),
    (mike:USER {{_id: '{uuid4()}', user_email: 'mike.brown@example.com', user_password: '{hashlib.sha256('mikepass'.encode()).hexdigest()}', first_name: 'Michal', last_name: 'Hnědý', profile_picture: 'pp6.png', registration_date: '{random_time()}'}}),
    (lisa:USER {{_id: '{uuid4()}', user_email: 'lisa.white@example.com', user_password: '{hashlib.sha256('lisawhite'.encode()).hexdigest()}', first_name: 'Eliška', last_name: 'Bílá', profile_picture: 'pp2.png', registration_date: '{random_time()}'}}),
    (david:USER {{_id: '{uuid4()}', user_email: 'david.smith@example.com', user_password: '{hashlib.sha256('david2023'.encode()).hexdigest()}', first_name: 'David', last_name: 'Kovář', profile_picture: 'pp3.png', registration_date: '{random_time()}'}}),
    (boris:USER {{_id: '{uuid4()}', user_email: 'boris@admin.com', user_password: '{hashlib.sha256('admin'.encode()).hexdigest()}', first_name: 'Boris', last_name: 'Spaskij', profile_picture: '', registration_date: '{random_time()}'}}),
    (emma:USER {{_id: '{uuid4()}', user_email: 'emily.jones@example.com', user_password: '{hashlib.sha256('emilyj'.encode()).hexdigest()}', first_name: 'Emma', last_name: 'Zahálková', profile_picture: 'pp9.png', registration_date: '{random_time()}'}}),
    (john:USER {{_id: '{uuid4()}', user_email: 'john.doe@example.com', user_password: '{hashlib.sha256('johndoe1'.encode()).hexdigest()}', first_name: 'Jan', last_name: 'Lucemburský', profile_picture: 'pp8.png', registration_date: '{random_time()}'}}),
    (michael:USER {{_id: '{uuid4()}', user_email: 'michael.lewis@example.com', user_password: '{hashlib.sha256('michaelL123'.encode()).hexdigest()}', first_name: 'Michael', last_name: 'Broadhead', profile_picture: '', registration_date: '{random_time()}'}}),
    (susan:USER {{_id: '{uuid4()}', user_email: 'susan.green@example.com', user_password: '{hashlib.sha256('susanG2023'.encode()).hexdigest()}', first_name: 'Zuzana', last_name: 'Čaputová', profile_picture: 'pp10.png', registration_date: '{random_time()}'}}),
    (petr:USER {{_id: '{uuid4()}', user_email: 'prezidentpavel@gmail.com', user_password: '{hashlib.sha256('petrpavel'.encode()).hexdigest()}', first_name: 'Petr', last_name: 'Pavel', profile_picture: 'pp12.jpg', registration_date: '{random_time()}'}}),
    (jane:USER {{_id: '{uuid4()}', user_email: 'jane.wilson@example.com', user_password: '{hashlib.sha256('janew2023'.encode()).hexdigest()}', first_name: 'Jana', last_name: 'Kamenická', profile_picture: 'pp7.png', registration_date: '{random_time()}'}}),
    (robert:USER {{_id: '{uuid4()}', user_email: 'robert.miller@example.com', user_password: '{hashlib.sha256('robertm'.encode()).hexdigest()}', first_name: 'Robert', last_name: 'Green', profile_picture: 'pp11.png', registration_date: '{random_time()}'}}),
    (karla:USER {{_id: '{uuid4()}', user_email: 'karla.hall@example.com', user_password: '{hashlib.sha256('karlaH2023'.encode()).hexdigest()}', first_name: 'Karla', last_name: 'Krásnolásková', profile_picture: '', registration_date: '{random_time()}'}}),
    (laura:USER {{_id: '{uuid4()}', user_email: 'laura.davis@example.com', user_password: '{hashlib.sha256('laurad2023'.encode()).hexdigest()}', first_name: 'Laura', last_name: 'Habenichtová', profile_picture: 'pp5.png', registration_date: '{random_time()}'}}),
    (james:USER {{_id: '{uuid4()}', user_email: 'james.harris@example.com', user_password: '{hashlib.sha256('jamesh'.encode()).hexdigest()}', first_name: 'Stanislav', last_name: 'Špaček', profile_picture: '', registration_date: '{random_time()}'}}),
    (patricia:USER {{_id: '{uuid4()}', user_email: 'patricia.clark@example.com', user_password: '{hashlib.sha256('patriciaC'.encode()).hexdigest()}', first_name: 'Patricie', last_name: 'Ševčíková', profile_picture: 'pp4.png', registration_date: '{random_time()}'}}),
    (andrej:USER {{_id: '{uuid4()}', user_email: 'andrejdunda@gmail.com', user_password: '{hashlib.sha256('andrej'.encode()).hexdigest()}', first_name: 'Andrej', last_name: 'Dunda', profile_picture: 'andrej.jpg', registration_date: '{random_time()}'}})

    FOREACH (user in [sarah, mike, petr, michael, jane, lisa] | CREATE (andrej) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (andrej))
    FOREACH (user in [mike, michael, lisa, sarah] | CREATE (patricia) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (patricia))
    FOREACH (user in [robert, karla] | CREATE (emma) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (emma))
    FOREACH (user in [susan, mike, john] | CREATE (petr) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (petr))
    FOREACH (user in [laura, jane, david] | CREATE (robert) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (robert))
    FOREACH (user in [lisa] | CREATE (laura) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (laura))
    FOREACH (user in [mike, susan, sarah, petr] | CREATE (karla) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (karla))
    FOREACH (user in [laura, patricia] | CREATE (james) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (james))
    FOREACH (user in [patricia, john] | CREATE (boris) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (boris))
    FOREACH (user in [david, boris, john] | CREATE (lisa) -[:FRIEND_WITH]-> (user), (user) -[:FRIEND_WITH]-> (lisa))

    FOREACH (user in [patricia, robert] | CREATE (andrej) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [karla] | CREATE (patricia) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [laura] | CREATE (emma) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [boris, jane, sarah] | CREATE (petr) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [mike, susan] | CREATE (robert) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [david, karla, patricia] | CREATE (laura) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [robert, lisa] | CREATE (karla) -[:FRIEND_REQUEST]-> (user))
    FOREACH (user in [john, michael, sarah] | CREATE (james) -[:FRIEND_REQUEST]-> (user))
    '''

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

neo4j.run_query(users_query)

# for post in posts:
  
# for comment in comments:

# for i in range(15):
  
# for i in range(10):
  
# for i in range(7):
  