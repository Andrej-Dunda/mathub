DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS succes_rates;
DROP TABLE IF EXISTS user_habits;
DROP TABLE IF EXISTS user_groups;
DROP TABLE IF EXISTS user_posts;
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS group_memberships;
DROP TABLE IF EXISTS friend_requests;
DROP TABLE IF EXISTS excluded_suggestions;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS post_comments;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT,
  user_password TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT DEFAULT 'profile-picture-default.png',
  registration_date TEXT);

CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_name TEXT,
  habit_type TEXT,
  habit_description TEXT);

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

CREATE TABLE user_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT,
  specialization TEXT);

CREATE TABLE user_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  post_time TEXT,
  post_title TEXT,
  post_description TEXT,
  post_image TEXT);

CREATE TABLE post_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  liker_id INTEGER);

CREATE TABLE post_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  commenter_id INTEGER,
  comment TEXT,
  comment_time TEXT);

CREATE TABLE friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_friend_id INTEGER,
  second_friend_id INTEGER);

CREATE TABLE group_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  user_id INTEGER);

CREATE TABLE friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestor_id INTEGER,
  acceptor_id INTEGER);

CREATE TABLE excluded_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestor_id INTEGER,
  acceptor_id INTEGER);