from dotenv import load_dotenv
import redis
from flask.sessions import SessionInterface, SessionMixin
from werkzeug.datastructures import CallbackDict
from uuid import uuid4
import json
from neo4j import GraphDatabase
from datetime import timedelta

load_dotenv()

class JSONSerializer:
    @staticmethod
    def dumps(value):
        return json.dumps(value).encode()

    @staticmethod
    def loads(value):
        return json.loads(value.decode())

class RedisSession(CallbackDict, SessionMixin):
    def __init__(self, initial=None, sid=None):
        CallbackDict.__init__(self, initial)
        self.sid = sid
        self.modified = False

class RedisSessionInterface(SessionInterface):
    serializer = JSONSerializer()
    session_class = RedisSession

    def __init__(self, redis):
        self.redis = redis

    def open_session(self, app, request):
        sid = request.cookies.get(app.session_cookie_name)
        if not sid:
            sid = str(uuid4())
        data = self.redis.get(sid)
        if data is not None:
            data = self.serializer.loads(data)
            return self.session_class(data, sid=sid)
        else:
            return self.session_class(sid=sid)

    def save_session(self, app, session, response):
        domain = self.get_cookie_domain(app)
        if not session:
            response.delete_cookie(app.session_cookie_name, domain=domain)
            return
        self.redis.set(session.sid, self.serializer.dumps(dict(session)))
        response.set_cookie(app.session_cookie_name, session.sid, expires=self.get_expiration_time(app, session), httponly=True, domain=domain)

class ApplicationConfig:
    SECRET_KEY = '2a0304fc-7233-11ee-b962-0242ac120002'
    SESSION_COOKIE_SAMESITE=None
    SESSION_COOKIE_SECURE=False

    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)
    SESSION_USE_SIGNer = True
    SESSION_REDIS = redis.from_url('redis://redis:6379')

    # Folder paths
    PROFILE_PICTURES_FOLDER = 'media/profile-pictures'
    POST_IMAGES_FOLDER = 'media/post-images'
    STATIC_FOLDER = 'media/static'

class Neo4jService:
    def __init__(self):
        self.driver = GraphDatabase.driver("bolt://neo4j:7687", auth=("neo4j", "mathubdb"))

    def close(self):
        self.driver.close()

    def run_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]
        
    def is_ready(self):
        try:
            with self.driver.session() as session:
                session.run("RETURN 1")
            return True
        except Exception:
            return False