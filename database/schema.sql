-- This defines the overall defination of datbase scheme which stores data in MySQL Database Software.

-- To create the database.
CREATE DATABASE IF NOT EXISTS recipes_db3;
USE recipes_db3;    -- The database which is used to store the data.

-- The entire scheme is for overall existed tables.

-- This is the tabale defenition to store the all registered users.
CREATE TABLE users
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- This is the tabale defenition to store the all different categories of recipes.
CREATE TABLE categories 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- This is the tabale defenition to store the all different cuisines of different recipes.
CREATE TABLE cuisines 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- This is the tabale defenition to store the different recipes.
CREATE TABLE recipes 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  servings INT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  author_id INT,
  category_id INT,
  cuisine_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (cuisine_id) REFERENCES cuisines(id)
);

-- This is the tabale defenition to store the different ingredients.
CREATE TABLE ingredients 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL
);

-- This is the tabale defenition to store the different ingredients used in recipes.
CREATE TABLE recipe_ingredients 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT,
  ingredient_id INT,
  quantity VARCHAR(50),
  unit VARCHAR(50),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- This is the tabale defenition which defines the several instructions in order to prepare recipes.
CREATE TABLE instructions 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT,
  step_number INT,
  description TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- This is the tabale defenition to store the different tags.
CREATE TABLE tags 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- This is the tabale defenition to store the different tagged recipes.
CREATE TABLE recipe_tags 
(
  recipe_id INT,
  tag_id INT,
  PRIMARY KEY (recipe_id, tag_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- This is the tabale defenition to store the reviews of the recipes.
CREATE TABLE reviews
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT,
  user_id INT,
  rating TINYINT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

