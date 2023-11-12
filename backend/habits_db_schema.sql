-- DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS succes_rates;
DROP TABLE IF EXISTS user_habits;
DROP TABLE IF EXISTS user_groups;
DROP TABLE IF EXISTS user_posts;
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS group_memberships;
DROP TABLE IF EXISTS friend_requests;

-- CREATE TABLE users (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   user_email TEXT,
--   user_password TEXT,
--   first_name TEXT,
--   last_name TEXT);

-- INSERT INTO users (user_name, user_password) VALUES ('andrej_dunda', 'andrej1234')
-- INSERT INTO users (user_name, user_password) VALUES ('tomas_svoboda', 'tomas5678')

CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_name TEXT,
  habit_type TEXT,
  habit_description TEXT);
  
-- INSERT INTO habits (habit_name, habit_type, habit_description) VALUES ('Reading', 'mental', 'regular reading')
-- INSERT INTO habits (habit_name, habit_type, habit_description) VALUES ('Running', 'cardio', 'regualry running some track')

CREATE TABLE succes_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_habit_id INTEGER,
  log_date TEXT,
  log_time TEXT,
  succes_rate TEXT,
  notes TEXT);

CREATE TABLE user_habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  habit_id INTEGER,
  habit_frequency TEXT);
  
-- INSERT INTO user_habits (user_id, habit_id, habit_frequency) VALUES (1, 2, 'daily')

CREATE TABLE user_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT,
  specialization TEXT);
  
-- INSERT INTO user_groups (group_name, specialization) VALUES ('Ultimate Joggers', 'running')

CREATE TABLE user_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  post_time TEXT,
  post_title TEXT,
  post_description TEXT,
  post_image TEXT,
  habit_id INTEGER,
  group_id INTEGER);
  
-- INSERT INTO user_posts (user_id, post_time, post_title, post_description, post_image, habit_id, group_id)
-- VALUES (1, '03-10-2023 08:44:13', 'Autumn Race', 'Yearly race that takes in autumn', 'race_2022.jpg', 2, 1)

CREATE TABLE friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_friend_id INTEGER,
  second_friend_id INTEGER);
  
-- INSERT INTO followers (follower_id, user_id) VALUES (1, 2)

CREATE TABLE group_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  user_id INTEGER);
  
-- INSERT INTO group_memberships (group_id, user_id) VALUES (1, 1)

CREATE TABLE friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestor_id INTEGER,
  acceptor_id INTEGER);