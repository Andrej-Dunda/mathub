** Locally: **
frontend
npm i
npm start

backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py

** Through Docker: **
docker-compose up --build

After docker is composed
python3 backend/init_db.py

** When installing new package on frontend: **
docker-compose up -d —build
Or after update of package.json directly in docker container run:
npm i

** frontend **
http://localhost:3000/

** backend **
http://localhost:5001/

** neo4j browser **
http://localhost:7474/
username: neo4j
password: mathubdb