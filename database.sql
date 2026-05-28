-- Database Schema for Takiang2.0
-- Generated based on ER_DIAGRAM.md

CREATE DATABASE IF NOT EXISTS A1_db;
USE A1_db;

-- 1. Master Data: Employee
CREATE TABLE IF NOT EXISTS employee (
  employee_id VARCHAR(50) PRIMARY KEY, -- เก็บในรูปแบบ EMPxxxxxx
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(50),
  age INT,
  birth_date DATE,
  citizen_id VARCHAR(20),
  phone_number VARCHAR(20),
  start_date DATE,
  resign_date DATE,
  years_of_service INT DEFAULT 0,
  bank_account VARCHAR(50),
  current_salary DECIMAL(15, 2) DEFAULT 0.00,
  department VARCHAR(100),
  position VARCHAR(100),
  profile_image TEXT, -- เก็บ URL รูปภาพจาก Cloudinary
  Google_drive TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Master Data: User Accounts
CREATE TABLE IF NOT EXISTS user_login_work (
    username VARCHAR(50) PRIMARY KEY,
    user_id INT,
    password VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    team VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Master Data: Customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    tax_id VARCHAR(50),
    billing_address TEXT,
    other_contact TEXT
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS projects (
    project_id VARCHAR(50) PRIMARY KEY, -- Format: TK001
    project_name VARCHAR(255) NOT NULL,
    customer_id INT,
    price DECIMAL(10, 2),
    responsible_team VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    due_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL
);

-- 5. Works (Tasks)
CREATE TABLE IF NOT EXISTS works (
    work_id VARCHAR(50) PRIMARY KEY, -- Format: Prefix+000 (e.g., GRA001)
    works_name VARCHAR(255) NOT NULL,
    work_type VARCHAR(100),
    project_id VARCHAR(50),
    price DECIMAL(10, 2),
    description TEXT,
    assigned_to VARCHAR(50), -- Refers to username
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES user_login_work(username) ON DELETE SET NULL
);

-- 6. Submitted Works
CREATE TABLE IF NOT EXISTS submitted_works (
    submitted_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    project_id VARCHAR(50),
    works_id VARCHAR(50),
    round_number INT DEFAULT 1,
    link TEXT,
    submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    reviewer_comment TEXT,
    FOREIGN KEY (username) REFERENCES user_login_work(username) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (works_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 7. Reviewed Works
CREATE TABLE IF NOT EXISTS reviewed_works (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    submitted_id INT,
    username VARCHAR(50),
    project_id VARCHAR(50),
    works_id VARCHAR(50),
    round_number INT DEFAULT 1,
    link TEXT,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    reviewer_comment TEXT,
    FOREIGN KEY (submitted_id) REFERENCES submitted_works(submitted_id) ON DELETE SET NULL,
    FOREIGN KEY (username) REFERENCES user_login_work(username) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (works_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 8. Exported Works (Archive)
CREATE TABLE IF NOT EXISTS exported_works (
    export_id INT AUTO_INCREMENT PRIMARY KEY,
    submitted_id INT,
    username VARCHAR(50),
    project_id VARCHAR(50),
    works_id VARCHAR(50),
    round_number INT DEFAULT 1,
    link TEXT,
    status VARCHAR(50) DEFAULT 'ผ่าน',
    reviewer_comment TEXT,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submitted_id) REFERENCES submitted_works(submitted_id) ON DELETE SET NULL
);

-- Optional: Insert initial Admin user if table is empty
-- INSERT INTO user_login_work (username, password, team) VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin');
