# Maturitní práce MatHub
### Zadání: Sociální síť pro studenty gymnázia

### Tech Stack
- Kontejnerová platforma Docker
- Frontend: React Typescript
- Backend: Flask API a Redis server pro relační přihlašovací systém
- Databáze: Neo4j

## Co aplikace umí?
Aktuálně aplikace podporuje:
- Přihlašovací a registrační systém pomocí relací na straně serveru
- Vytváření blogových příspěvků a zobrazování příspěvků ostatních uživatelů (tato funkcionalita bude nejspíš odebrána, pokud pro ni nenajdu nějaké smysluplné využití)
- Správa "přátelství" s ostatními uživateli (žádosti o přátelství, přijímání příchozích žádostí, odebírání přátel atd.)
- Měnění uživatelského hesla a profilového obrázku účtu
- Vytváření a procházení Předmětů, kde Předmět je složka obsahující Témata daného předmětu. Každý materiál lze otevřít v textovém editoru, který lze upravovat, ukládát a mazat.
- Vytvořené materiály jsou sdílené spřáteleným účtům na domovské obrazovce a mohou být ostatními uživateli sledovány, což jim je přidá do přehledu vlastních materiálů.

# INSTRUKCE KE SPUŠTĚNÍ
**Instalační proces vyžaduje připojení k internetu!**

1. Otevřete si na počítači Terminál (na Windows Příkazový řádek, na MacOS Terminál), v terminálu otevřete složku, do které si přejete aplikaci vložit:
```
cd cesta/do/požadované/složky
```

2. Po otevření požadované složky naklonujte git repozitář aplikace zadáním tohoto příkazu do terminálu:
```
git clone https://github.com/Andrej-Dunda/mathub mathub
```

3. Po naklonování repozitáře v terminálu spusťte kompilační proces Dockeru:
```
docker compose up
```
- Tato operace trvá mezi několika desítkami vteřin až po několik minut v závislosti na rychlosti vašeho internetu a výkonu vašeho počítače.

4. Po automatickém spuštění Docker prostředí můžete aplikaci otevřít v libovolném prohlížeči na adrese _localhost:3000_.

5. Zobrazí se přihlašovací formulář. Do systému se přihlašte přes DEMO účet (kvůli zobrazení DEMO dat):
- email: admin@admin.com
- heslo: admin

6. Aplikaci ukončíte stisknutím zkratky CTRL+C v terminálu, kde je spuštěno prostředí Dockeru.


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
