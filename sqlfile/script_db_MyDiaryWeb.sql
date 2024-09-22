CREATE DATABASE mydiaryweb;

USE mydiaryweb;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calendario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    task_title VARCHAR(255),
    task_description TEXT,
    task_date DATE,
    task_time TIME,
    all_day BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE diario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    diary_date DATE,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE habitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    habit VARCHAR(255),
    date DATE,
    completed BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE objetivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    objetivo VARCHAR(255),
    deadline DATE,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    task VARCHAR(255),
    completed BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
