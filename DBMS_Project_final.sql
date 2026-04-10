-- ============================================================
-- DBMS PROJECT : University Campus Placement & Internship Portal
-- Platform : MySQL Workbench
-- This script creates the database, tables, inserts sample data
-- and demonstrates SQL operations required in the assignment.
-- ============================================================


-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================

CREATE DATABASE CampusPlacementPortal;
USE CampusPlacementPortal;


-- ============================================================
-- 2. CREATE TABLE : STUDENTS
-- Stores student academic profile and skills
-- ============================================================

CREATE TABLE Students(
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    branch VARCHAR(50) NOT NULL,
    cgpa DECIMAL(3,2) CHECK (cgpa BETWEEN 0 AND 10),
    graduation_year INT NOT NULL,
    skills VARCHAR(200),
    resume_link VARCHAR(200)
);


-- ============================================================
-- 3. CREATE TABLE : COMPANIES
-- Stores recruiter/company information
-- ============================================================

CREATE TABLE Companies(
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(50),
    location VARCHAR(100),
    hr_email VARCHAR(100) UNIQUE
);


-- ============================================================
-- 4. CREATE TABLE : JOB_POSTINGS
-- Contains job roles and eligibility criteria
-- ============================================================

CREATE TABLE Job_Postings(
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    role VARCHAR(100) NOT NULL,
    package_lpa DECIMAL(4,2),
    min_cgpa DECIMAL(3,2) CHECK (min_cgpa BETWEEN 0 AND 10),
    job_type VARCHAR(50),
    
    FOREIGN KEY (company_id)
    REFERENCES Companies(company_id)
);



-- ============================================================
-- 5. CREATE TABLE : APPLICATIONS
-- Tracks which student applied to which job
-- ============================================================

CREATE TABLE Applications(
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    job_id INT,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_date DATE,

    FOREIGN KEY (student_id)
    REFERENCES Students(student_id),

    FOREIGN KEY (job_id)
    REFERENCES Job_Postings(job_id)
);


-- ============================================================
-- 6. CREATE TABLE : INTERVIEWS
-- Stores interview schedules and results
-- ============================================================

CREATE TABLE Interviews(
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    interview_date DATE,
    interview_mode VARCHAR(50),
    result VARCHAR(50),

    FOREIGN KEY (application_id)
    REFERENCES Applications(application_id)
);



-- ============================================================
-- 7. INSERT SAMPLE DATA
-- ============================================================


-- STUDENT DATA

INSERT INTO Students(name,email,branch,cgpa,graduation_year,skills,resume_link) VALUES
('Rahul Sharma','rahul@gmail.com','CSE',8.5,2025,'Python, SQL','resume1.pdf'),
('Priya Mehta','priya@gmail.com','IT',9.1,2025,'Java, DBMS','resume2.pdf'),
('Aman Gupta','aman@gmail.com','CSE',7.8,2025,'C++, DSA','resume3.pdf'),
('Sneha Verma','sneha@gmail.com','ECE',8.9,2025,'Python, ML','resume4.pdf'),
('Karan Patel','karan@gmail.com','IT',7.5,2025,'Web Development','resume5.pdf'),
('Anjali Singh','anjali@gmail.com','CSE',9.3,2025,'AI, Python','resume6.pdf'),
('Rohit Das','rohit@gmail.com','ME',6.8,2025,'AutoCAD','resume7.pdf'),
('Neha Kapoor','neha@gmail.com','CSE',8.2,2025,'JavaScript','resume8.pdf'),
('Aditya Jain','aditya@gmail.com','IT',7.9,2025,'SQL, Python','resume9.pdf'),
('Pooja Nair','pooja@gmail.com','ECE',8.7,2025,'Embedded Systems','resume10.pdf');



-- COMPANY DATA

INSERT INTO Companies(company_name,industry,location,hr_email) VALUES
('TCS','IT Services','Mumbai','hr@tcs.com'),
('Infosys','IT Services','Bangalore','hr@infosys.com'),
('Google','Technology','Hyderabad','hr@google.com'),
('Amazon','E-Commerce','Bangalore','hr@amazon.com'),
('Wipro','IT Services','Pune','hr@wipro.com');



-- JOB POSTINGS

INSERT INTO Job_Postings(company_id,role,package_lpa,min_cgpa,job_type) VALUES
(1,'Software Engineer',7.5,7.0,'Full-Time'),
(2,'System Engineer',6.5,6.5,'Full-Time'),
(3,'Data Analyst',12.0,8.0,'Full-Time'),
(4,'Cloud Engineer',14.0,8.5,'Full-Time'),
(5,'Web Developer',5.5,6.0,'Internship');



-- APPLICATIONS

INSERT INTO Applications(student_id,job_id,status,applied_date) VALUES
(1,1,'Applied','2025-01-10'),
(2,3,'Shortlisted','2025-01-11'),
(3,2,'Applied','2025-01-12'),
(4,4,'Interviewed','2025-01-15'),
(5,5,'Applied','2025-01-16'),
(6,3,'Shortlisted','2025-01-18'),
(7,1,'Rejected','2025-01-19'),
(8,2,'Interviewed','2025-01-20'),
(9,4,'Applied','2025-01-21'),
(10,5,'Offered','2025-01-22');



-- INTERVIEW DATA

INSERT INTO Interviews(application_id,interview_date,interview_mode,result) VALUES
(2,'2025-02-01','Online','Selected'),
(4,'2025-02-03','Offline','Selected'),
(8,'2025-02-05','Online','Rejected'),
(10,'2025-02-06','Offline','Selected');



-- ============================================================
-- 8. BASIC SQL OPERATIONS
-- ============================================================


-- SELECT QUERY
SELECT * FROM Students;


-- INSERT QUERY
INSERT INTO Students(name,email,branch,cgpa,graduation_year)
VALUES ('Vikas Kumar','vikas@gmail.com','CSE',8.1,2025);


-- UPDATE QUERY
UPDATE Students
SET cgpa = 8.8
WHERE student_id = 1;


-- DELETE QUERY(error)
DELETE FROM Students
WHERE student_id = 7;



-- ============================================================
-- 9. JOINS
-- Shows which student applied to which company
-- ============================================================

SELECT s.name, c.company_name, j.role
FROM Students s
JOIN Applications a ON s.student_id = a.student_id
JOIN Job_Postings j ON a.job_id = j.job_id
JOIN Companies c ON j.company_id = c.company_id;





-- Average CGPA of students
SELECT AVG(cgpa) AS Average_CGPA
FROM Students;

-- Total number of students
SELECT COUNT(*) AS Total_Students
FROM Students;

-- Maximum salary package offered
SELECT MAX(package_lpa) AS Highest_Package
FROM Job_Postings;



-- ============================================================
-- 11. GROUP BY
-- ============================================================

SELECT branch, COUNT(student_id) AS Total_Students
FROM Students
GROUP BY branch;



-- ============================================================
-- 12. HAVING
-- ============================================================

SELECT branch, COUNT(student_id) AS Total_Students
FROM Students
GROUP BY branch
HAVING COUNT(student_id) > 2;



-- ============================================================
-- 13. SUBQUERY
-- Students having CGPA higher than average
-- ============================================================

SELECT name
FROM Students
WHERE cgpa > (
    SELECT AVG(cgpa)
    FROM Students
);



-- ============================================================
-- 14. NESTED QUERY
-- Students eligible for Google job postings
-- ============================================================

SELECT name
FROM Students
WHERE cgpa >= (
    SELECT min_cgpa
    FROM Job_Postings
    WHERE company_id = (
        SELECT company_id
        FROM Companies
        WHERE company_name = 'Google'
    )
);



-- ============================================================
-- END OF PROJECT SCRIPT
-- ============================================================