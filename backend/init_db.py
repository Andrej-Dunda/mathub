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
    (michael:USER {{_id: '{uuid4()}', user_email: 'michael.lewis@example.com', user_password: '{hash_password('michaelL123')}', first_name: 'Michal', last_name: 'Mareček', profile_picture: '', registration_date: '{random_time()}'}}),
    (susan:USER {{_id: '{uuid4()}', user_email: 'susan.green@example.com', user_password: '{hash_password('susanG2023')}', first_name: 'Zuzana', last_name: 'Borovičková', profile_picture: 'pp10.png', registration_date: '{random_time()}'}}),
    (petr:USER {{_id: '{uuid4()}', user_email: 'prezidentpavel@gmail.com', user_password: '{hash_password('petrpavel')}', first_name: 'Petr', last_name: 'Pavel', profile_picture: 'pp12.jpg', registration_date: '{random_time()}'}}),
    (jane:USER {{_id: '{uuid4()}', user_email: 'jane.wilson@example.com', user_password: '{hash_password('janew2023')}', first_name: 'Jana', last_name: 'Kamenická', profile_picture: 'pp7.png', registration_date: '{random_time()}'}}),
    (robert:USER {{_id: '{uuid4()}', user_email: 'robert.miller@example.com', user_password: '{hash_password('robertm')}', first_name: 'Robert', last_name: 'Věrný', profile_picture: 'pp11.png', registration_date: '{random_time()}'}}),
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
    (post1:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Jak Zvládat Stres Před Důležitými Testy: Tipy a Triky', post_description: 'Ahoj všichni! Vzhledem k tomu, že se blíží termíny důležitých testů a zkoušek, chtěl bych se s vámi podělit o několik tipů, jak zvládat stres a zůstat klidný při jejich přípravě. První věc, kterou dělám, je vytvořit si plán učení s dostatkem času na opakování materiálu. Dále se snažím udržovat zdravý životní styl s pravidelným cvičením a dostatkem spánku. A nakonec si vždycky najdu čas na odpočinek a relaxaci, abych udržel svou mentální pohodu. Jaké jsou vaše tipy na zvládání stresu před důležitými testy? Podělte se o ně v komentářích! 😊📚💪', post_image: 'student.jpeg' }}) -[:POSTED_BY]-> (mike),
    (post2:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Nový trend ve studiu: Metoda pomalého čtení', post_description: 'Dobrý den! Nedávno jsem objevil metodu pomalého čtení a musím říct, že je to úžasný způsob, jak lépe porozumět textu a zapamatovat si ho. Místo rychlého listování se zaměřte na každé slovo a dejte si na čas. Zkuste to taky a uvidíte, jaké to má účinky! 📖✨', post_image: '' }}) -[:POSTED_BY]-> (sarah),
    (post3:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Znovuobjevení radosti ze čtení: Jednoduchý průvodce', post_description: 'Tento blogový příspěvek se zabývá potěšením a přínosy čtení a nabízí tipy, jak najít ty správné knihy, vytvořit si čtenářský návyk a najít si čas na literaturu. Obsahuje osobní anekdoty, seznamy doporučené četby a postřehy o tom, jak čtení rozšiřuje znalosti a představivost.', post_image: 'books.png' }}) -[:POSTED_BY]-> (admin),
    (post4:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Nová mobilní aplikace pro efektivní učení', post_description: 'Ahoj kamarádi! Nedávno jsem objevil novou mobilní aplikaci, která mi pomáhá s učením a organizací mého času. Má funkce jako interaktivní učební materiály, plánovač úkolů a dokonce i techniky pro zvládání stresu před zkouškami. Je to opravdu super nástroj pro každého studenta! 📱📚', post_image: 'app.png' }}) -[:POSTED_BY]-> (admin),
    (post5:BLOG_POST {{ _id: '{uuid4()}', post_time: "{random_time()}", post_title: 'Technologické novinky ve výuce: Virtuální realita ve školách', post_description: 'Ahoj všichni! Dnes jsem se dočetl o novém trendu ve vzdělávání - použití virtuální reality ve školách. Myslím si, že je to skvělá příležitost pro interaktivní a poutavou výuku. Když si představím, že bych mohl prozkoumávat historické události nebo matematické koncepty v 3D prostoru, jsem nadšený! Co si myslíte vy? 🌐📚', post_image: 'vr.jpeg' }}) -[:POSTED_BY]-> (robert)

    // Comments
    CREATE
    (post1) <-[:COMMENT_OF]- (comment11:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Skvělá inspirace, díky!' }}) -[:COMMENTED_BY]-> (sarah),
    (post1) <-[:COMMENT_OF]- (comment12:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Skvělý příspěvek! Já osobně si rád udělám malou procházku nebo si poslechnu uklidňující hudbu, když se cítím před testem nervózně. Každý máme své triky, co nám pomáhají udržet klid. Díky za sdílení!' }}) -[:COMMENTED_BY]-> (admin),
    (post1) <-[:COMMENT_OF]- (comment13:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Tohle je právě to, co potřebuju! Mám před zkouškami vždycky hrozný stres a občas i panické ataky. Doufám, že mi tyhle tipy pomůžou to zvládnout lépe tentokrát. Díky!' }}) -[:COMMENTED_BY]-> (jane),
    (post1) <-[:COMMENT_OF]- (comment14:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Nevím, proč jsem se nepoučil z minulých zkoušek a pořád odkládám učení na poslední chvíli... Ale tyhle tipy zní opravdu užitečně! Budu se je snažit tentokrát dodržet. Díky za inspiraci!' }}) -[:COMMENTED_BY]-> (david),
    (post1) <-[:COMMENT_OF]- (comment15:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Taky si myslím, že plánování je klíčové. Mám vždycky seznam věcí, které musím prozkoumat, a rozdělím si je do menších úkolů na každý den. To mi pomáhá udržet se v obraze a neztrácet se v množství materiálu. Díky za sdílení tipů!' }}) -[:COMMENTED_BY]-> (emma),
    (post1) <-[:COMMENT_OF]- (comment16:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Moc hezký příspěvek! Já si vždycky připravím nějaké motivující odměny pro sebe, které mi pomáhají udržet se v pozitivním stavu mysli během učení. Třeba si slibuju, že si po zkoušce dopřeju svůj oblíbený zákusek, a to mi dává tu potřebnou motivaci. Ale určitě vyzkoušám i tvé tipy! 😊🍰' }}) -[:COMMENTED_BY]-> (john),
    
    (post2) <-[:COMMENT_OF]- (comment21:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Tuhle metodu jsem taky nedávno objevil a musím říct, že mi to hodně pomáhá! Je to trochu zvláštní pocit zpomalit, ale ten hloubkový porozumění za to stojí. Určitě doporučuji vyzkoušet! 📚👍' }}) -[:COMMENTED_BY]-> (emma),
    (post2) <-[:COMMENT_OF]- (comment22:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Zní to zajímavě, ale nevím, jestli bych měl na to trpělivost. Možná by mi to ale pomohlo s tou koncentrací... Budu muset vyzkoušet a uvidíme! 😅' }}) -[:COMMENTED_BY]-> (admin),
    (post2) <-[:COMMENT_OF]- (comment23:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Nikdy jsem o této metodě neslyšel, ale zní to jako dobrý tip! Určitě to zkusím při příštím učení. Díky za sdílení!' }}) -[:COMMENTED_BY]-> (john),
    
    (post3) <-[:COMMENT_OF]- (comment31:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'V pubertě jsem skoro nečetla a teď toho lituju, jsem ráda, že jsem se konečně vrátila ke čtení.' }}) -[:COMMENTED_BY]-> (lisa),

    (post4) <-[:COMMENT_OF]- (comment41:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'To zní jako užitečná aplikace! Mám problém se ztrácením času a neorganizovaností, takže si to určitě vyzkouším. Díky za tip! 😊👍' }}) -[:COMMENTED_BY]-> (david),
    (post4) <-[:COMMENT_OF]- (comment42:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Mám taky tuto aplikaci a musím říct, že mi hodně pomohla s učením. Je skvělé mít všechno na jednom místě a mít přehled o tom, co musím udělat. Doporučuji!' }}) -[:COMMENTED_BY]-> (emma),
    (post4) <-[:COMMENT_OF]- (comment43:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Jsem tak rád, že jsi to sdílel! Hledám něco, co mi pomůže s organizací mého učení. Stáhnu si to hned! 🤓' }}) -[:COMMENTED_BY]-> (michael),
    (post4) <-[:COMMENT_OF]- (comment44:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Bohužel nemám žádný dostupný telefon, ale zní to jako skvělá aplikace pro ty, kdo mají. Možná budu muset požádat rodiče o upgrade! 😅' }}) -[:COMMENTED_BY]-> (james),
    
    (post5) <-[:COMMENT_OF]- (comment51:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'To zní úžasně! Opravdu by mě zajímalo, jak by se toto technologické řešení integrovalo do běžné výuky. Určitě by to mohlo udělat hodiny zajímavějšími a interaktivnějšími! 🤩' }}) -[:COMMENTED_BY]-> (patricia),
    (post5) <-[:COMMENT_OF]- (comment52:POST_COMMENT {{ _id: '{uuid4()}', comment_time: "{random_time()}", comment: 'Myslím si, že by to mohlo být super pro vizualizaci složitých konceptů. Některé věci jsou těžké pochopit jenom ze slov, ale když si to můžu vidět přímo před sebou, je to úplně jiný zážitek! 👀' }}) -[:COMMENTED_BY]-> (laura)
    
    // Likes
    CREATE
    (admin) -[:LIKES]-> (post1),
    (admin) -[:LIKES]-> (post3),
    (admin) -[:LIKES]-> (post4),

    (sarah) -[:LIKES]-> (post2),
    (sarah) -[:LIKES]-> (post5),

    (mike) -[:LIKES]-> (post1),
    (mike) -[:LIKES]-> (post2),
    (mike) -[:LIKES]-> (post3),

    (lisa) -[:LIKES]-> (post1),
    (lisa) -[:LIKES]-> (post2),
    (lisa) -[:LIKES]-> (post4),

    (david) -[:LIKES]-> (post2),
    (david) -[:LIKES]-> (post3),
    (david) -[:LIKES]-> (post5),

    (boris) -[:LIKES]-> (post3),

    (emma) -[:LIKES]-> (post1),
    (emma) -[:LIKES]-> (post2),

    (john) -[:LIKES]-> (post1),
    (john) -[:LIKES]-> (post2),

    (michael) -[:LIKES]-> (post2),

    (susan) -[:LIKES]-> (post2),

    (petr) -[:LIKES]-> (post2),
    (petr) -[:LIKES]-> (post4),
    (petr) -[:LIKES]-> (post5),

    (jane) -[:LIKES]-> (post2),

    (robert) -[:LIKES]-> (post2),
    (robert) -[:LIKES]-> (post3),

    (karla) -[:LIKES]-> (post1),
    (karla) -[:LIKES]-> (post3),

    (laura) -[:LIKES]-> (post2),
    (laura) -[:LIKES]-> (post4),

    (james) -[:LIKES]-> (post1),
    (james) -[:LIKES]-> (post3),

    (patricia) -[:LIKES]-> (post3),
    (patricia) -[:LIKES]-> (post4),
    (patricia) -[:LIKES]-> (post5)

    // Materials
    CREATE
    (material1:MATERIAL {{ _id: '{uuid4()}', material_name: 'DEMO Ekonomie', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Ekonomie", material_grade: "4. ročník SŠ" }}) -[:CREATED_BY]-> (admin),
    (material2:MATERIAL {{ _id: '{uuid4()}', material_name: 'DEMO Matematika', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Matematika", material_grade: "3. ročník SŠ" }}) -[:CREATED_BY]-> (admin),
    (material3:MATERIAL {{ _id: '{uuid4()}', material_name: 'DEMO Informatika', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Informatika", material_grade: "9. ročník ZŠ" }}) -[:CREATED_BY]-> (admin),
    (material4:MATERIAL {{ _id: '{uuid4()}', material_name: 'Chemie k maturitě', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Chemie", material_grade: "4. ročník SŠ" }}) -[:CREATED_BY]-> (sarah),
    (material5:MATERIAL {{ _id: '{uuid4()}', material_name: 'Světová literatura 19. století', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Český jazyk", material_grade: "3. ročník SŠ" }}) -[:CREATED_BY]-> (sarah),
    (material6:MATERIAL {{ _id: '{uuid4()}', material_name: 'Maturita Questions', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Anglický jazyk", material_grade: "4. ročník SŠ" }}) -[:CREATED_BY]-> (mike),
    (material7:MATERIAL {{ _id: '{uuid4()}', material_name: 'Příprava na sloh z NJ', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Německý jazyk", material_grade: "4. ročník SŠ" }}) -[:CREATED_BY]-> (mike),
    (material8:MATERIAL {{ _id: '{uuid4()}', material_name: 'Cvičné testy k přijímačkám', date_created: "{random_time()}", date_modified: "{random_time()}", material_subject: "Matematika", material_grade: "4. ročník SŠ" }}) -[:CREATED_BY]-> (petr)

    // Topics
    CREATE
    (topic11:TOPIC {{ _id: '{uuid4()}', topic_name: '1. Základní ekonomické pojmy', topic_content: '<p>DEMO obsah tématu 1. Základní ekonomické pojmy</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material1),
    (topic12:TOPIC {{ _id: '{uuid4()}', topic_name: '2. Výroba, výrobní proces', topic_content: '<p>DEMO obsah tématu 2. Výroba, výrobní proces</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material1),
    (topic13:TOPIC {{ _id: '{uuid4()}', topic_name: '3. Trh a jeho charakteristika', topic_content: '<p>DEMO obsah tématu 3. Trh a jeho charakteristika</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material1),
    (topic14:TOPIC {{ _id: '{uuid4()}', topic_name: '4. Mzda a její formy', topic_content: '<p>DEMO obsah tématu 4. Mzda a její formy</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material1),
    (topic15:TOPIC {{ _id: '{uuid4()}', topic_name: '5. Charakteristika podnikání', topic_content: '<p>DEMO obsah tématu 5. Charakteristika podnikání</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material1),

    (topic21:TOPIC {{ _id: '{uuid4()}', topic_name: 'Algebra DEMO', topic_content: '<p>DEMO obsah tématu Algebra DEMO</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material2),

    (topic31:TOPIC {{ _id: '{uuid4()}', topic_name: 'Neo4j DEMO', topic_content: '<p>DEMO obsah tématu Neo4j DEMO</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material3),

    (topic41:TOPIC {{ _id: '{uuid4()}', topic_name: '1. Stavba atomu, atomové jádro, stavba elektronového obalu', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material4),
    (topic42:TOPIC {{ _id: '{uuid4()}', topic_name: '2. Periodická soustava prvků', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material4),
    (topic44:TOPIC {{ _id: '{uuid4()}', topic_name: '3. Chemická vazba', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material4),
    (topic45:TOPIC {{ _id: '{uuid4()}', topic_name: '4. Chemický děj a jeho zákonitosti (chemické reakce)', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material4),
    (topic46:TOPIC {{ _id: '{uuid4()}', topic_name: '5. Termochemie a chemická kinetika', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material4),

    (topic51:TOPIC {{ _id: '{uuid4()}', topic_name: 'Charles Dickens', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material5),
    (topic52:TOPIC {{ _id: '{uuid4()}', topic_name: 'Charlotte Brönteová', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material5),

    (topic61:TOPIC {{ _id: '{uuid4()}', topic_name: '1. The United Kingdom', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material6),
    (topic62:TOPIC {{ _id: '{uuid4()}', topic_name: '2. The United States of America', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material6),
    (topic63:TOPIC {{ _id: '{uuid4()}', topic_name: '3. Holidays and celebrations', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material6),
    (topic64:TOPIC {{ _id: '{uuid4()}', topic_name: '4. Clothes and fashion', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material6),
    (topic65:TOPIC {{ _id: '{uuid4()}', topic_name: '5. Food', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material6),

    (topic71:TOPIC {{ _id: '{uuid4()}', topic_name: 'Zásady psaní slohu z NJ', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material7),

    (topic81:TOPIC {{ _id: '{uuid4()}', topic_name: 'Cvičný test ČVUT', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material8),
    (topic82:TOPIC {{ _id: '{uuid4()}', topic_name: 'Odpovědi na cvičný test ČVUT', topic_content: '<p>DEMO obsah tématu</p>', date_created: "{random_time()}", date_modified: "{random_time()}" }}) -[:TOPIC_OF]-> (material8)

    // Materials Following
    CREATE
    (admin) -[:FOLLOWS]-> (material4),
    (admin) -[:FOLLOWS]-> (material5),
    (admin) -[:FOLLOWS]-> (material6)
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