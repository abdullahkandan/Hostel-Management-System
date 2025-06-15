CREATE DATABASE IF NOT EXISTS hostel_management;
USE hostel_management;

-- Table for student registrations
CREATE TABLE registrations (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rollNo VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    roomPreference VARCHAR(50),
    allocatedRoom VARCHAR(50),
    registrationDate DATETIME NOT NULL
);

-- Table for payments
CREATE TABLE payments (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rollNo VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paymentDate DATE NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    transactionCode VARCHAR(100) NOT NULL,
    submissionDate DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (rollNo) REFERENCES registrations(rollNo)
);

-- Table for room occupancy
CREATE TABLE rooms (
    roomNumber VARCHAR(50) PRIMARY KEY,
    capacity INT NOT NULL,
    occupied INT NOT NULL,
    students TEXT
);

-- Table for feedback
CREATE TABLE feedback (
    id BIGINT PRIMARY KEY,
    feedback TEXT NOT NULL,
    rating INT NOT NULL,
    isAnonymous BOOLEAN NOT NULL,
    name VARCHAR(255),
    rollNo VARCHAR(50),
    submissionDate DATETIME NOT NULL,
    FOREIGN KEY (rollNo) REFERENCES registrations(rollNo)
);

-- Insert initial room data
INSERT INTO rooms (roomNumber, capacity, occupied, students) VALUES
('A101', 2, 2, ''),
('A102', 2, 1, ''),
('A103', 2, 0, ''),
('B201', 3, 3, ''),
('B202', 3, 2, ''),
('B203', 3, 1, ''),
('C301', 4, 4, ''),
('C302', 4, 3, ''),
('C303', 4, 0, '');