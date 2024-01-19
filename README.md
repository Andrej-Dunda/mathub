# SETUP INSTRUCTIONS
## Docker:
```
docker-compose up
```

### If you want VS Code to recognize used npm packages run:
```
cd frontend
npm i
```

### When installing new package on frontend:
```
docker-compose up -d —build
```

### Or after update of package.json directly in docker container run:
```
npm i
```

#### frontend
http://localhost:3000/

#### backend
http://localhost:5001/

#### neo4j browser
http://localhost:7474/
##### username: **neo4j**
##### password: **mathubdb**