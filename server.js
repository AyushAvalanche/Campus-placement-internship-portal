const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CampusPlacementPortal'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL Database');
});

// GET All Students
app.get('/api/students', (req, res) => {
    db.query('SELECT * FROM Students ORDER BY student_id', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add Student
app.post('/api/students', (req, res) => {
    const { name, email, branch, cgpa, graduation_year, skills, resume_link } = req.body;
    const sql = 'INSERT INTO Students (name, email, branch, cgpa, graduation_year, skills, resume_link) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, branch, cgpa, graduation_year, skills, resume_link], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student added', id: result.insertId });
    });
});

// Delete Student
app.delete('/api/students/:id', (req, res) => {
    db.query('DELETE FROM Students WHERE student_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student deleted' });
    });
});

// GET All Companies
app.get('/api/companies', (req, res) => {
    db.query('SELECT * FROM Companies ORDER BY company_id', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add Company
app.post('/api/companies', (req, res) => {
    const { company_name, industry, location, hr_email } = req.body;
    const sql = 'INSERT INTO Companies (company_name, industry, location, hr_email) VALUES (?, ?, ?, ?)';
    db.query(sql, [company_name, industry, location, hr_email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Company added', id: result.insertId });
    });
});

// Delete Company
app.delete('/api/companies/:id', (req, res) => {
    db.query('DELETE FROM Companies WHERE company_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Company deleted' });
    });
});

// GET All Jobs
app.get('/api/jobs', (req, res) => {
    const sql = `SELECT j.*, c.company_name FROM Job_Postings j 
                 LEFT JOIN Companies c ON j.company_id = c.company_id 
                 ORDER BY j.job_id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add Job
app.post('/api/jobs', (req, res) => {
    const { company_id, role, package_lpa, min_cgpa, job_type } = req.body;
    const sql = 'INSERT INTO Job_Postings (company_id, role, package_lpa, min_cgpa, job_type) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [company_id, role, package_lpa, min_cgpa, job_type], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Job added', id: result.insertId });
    });
});

// Delete Job
app.delete('/api/jobs/:id', (req, res) => {
    db.query('DELETE FROM Job_Postings WHERE job_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Job deleted' });
    });
});

// GET All Applications
app.get('/api/applications', (req, res) => {
    const sql = `SELECT a.*, s.name as student_name, c.company_name, j.role 
                 FROM Applications a
                 LEFT JOIN Students s ON a.student_id = s.student_id
                 LEFT JOIN Job_Postings j ON a.job_id = j.job_id
                 LEFT JOIN Companies c ON j.company_id = c.company_id
                 ORDER BY a.application_id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add Application
app.post('/api/applications', (req, res) => {
    const { student_id, job_id, status, applied_date } = req.body;
    const sql = 'INSERT INTO Applications (student_id, job_id, status, applied_date) VALUES (?, ?, ?, ?)';
    db.query(sql, [student_id, job_id, status, applied_date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Application added', id: result.insertId });
    });
});

// Delete Application
app.delete('/api/applications/:id', (req, res) => {
    db.query('DELETE FROM Applications WHERE application_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Application deleted' });
    });
});

// GET Interviews
app.get('/api/interviews', (req, res) => {
    const sql = `SELECT i.*, s.name as student_name, c.company_name, j.role 
                 FROM Interviews i
                 JOIN Applications a ON i.application_id = a.application_id
                 LEFT JOIN Students s ON a.student_id = s.student_id
                 LEFT JOIN Job_Postings j ON a.job_id = j.job_id
                 LEFT JOIN Companies c ON j.company_id = c.company_id
                 ORDER BY i.interview_id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET Dashboard Stats
app.get('/api/stats', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM Students) as total_students,
            (SELECT COUNT(*) FROM Companies) as total_companies,
            (SELECT COUNT(*) FROM Job_Postings) as total_jobs,
            (SELECT COUNT(*) FROM Applications) as total_applications,
            (SELECT AVG(cgpa) FROM Students) as avg_cgpa,
            (SELECT MAX(package_lpa) FROM Job_Postings) as max_package
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// GET Eligible Students for Job
app.get('/api/jobs/:id/eligible', (req, res) => {
    const sql = `SELECT * FROM Students WHERE cgpa >= (
        SELECT min_cgpa FROM Job_Postings WHERE job_id = ?
    ) ORDER BY cgpa DESC`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
