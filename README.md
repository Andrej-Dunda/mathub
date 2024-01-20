# MatHub
### Zadání: Sociální síť pro studenty gymnázia

### Tech Stack
- Kontejnerová platforma Docker
- Frontend: React Typescript
- Backend: Flask a Redis server pro relační přihlašovací systém
- Databáze: Neo4j

## Cíle
Cílem je vytvořit full-stack webovou aplikaci, která bude splňovat následující funkcionality:
- Registrace uživatelského účtu a přihlašování pomocí něj (možnost změny hesla, profilového obrázku a smazání účtu)
- Systém pro studenty sloužící k přehlednému zpracování svých materiálů k maturitě (nebo jiným účelům)
- Možnost vytvořené materiály sdílet s ostatními uživateli
- Možnost čerpat z materiálů sdílených ostatními uživateli
- Možnost sledovat ostatní uživatele ("přidat si je do přátel") a spravovat tato "přátelství"

## Co umí DEMO aplikace nyní?
Aktuálně aplikace podporuje:
- Přihlašovací a registrační systém pomocí relací na straně serveru
- Vytváření blogových příspěvků a zobrazování příspěvků ostatních uživatelů (tato funkcionalita bude nejspíš odebrána, pokud pro ni nenajdu nějaké smysluplné využití)
- Správa "přátelství" s ostatními uživateli (žádosti o přátelství, přijímání příchozích žádostí, odebírání přátel atd.)
- Měnění uživatelského hesla a profilového obrázku účtu
- Vytváření a procházení Předmětů, kde Předmět je složka obsahující Materiály daného předmětu. Každý materiál je pak aktuálně pouze jednoduchým textovým souborem, který lze upravovat, ukládát a mazat.

# SETUP INSTRUCTIONS
## Docker:
```
docker-compose up --build
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