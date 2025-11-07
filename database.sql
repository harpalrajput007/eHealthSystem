-- Create database
CREATE DATABASE IF NOT EXISTS ehealth_db;
USE ehealth_db;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table associated with users
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    next_appointment_date DATE NULL,
    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, password) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO reports (user_id, name, doctor_name, description, appointment_date, next_appointment_date, note) VALUES 
(1, 'Blood Test Report', 'Dr. Smith', 'Regular blood work checkup', '2024-01-15', '2024-04-15', 'Follow up in 3 months');