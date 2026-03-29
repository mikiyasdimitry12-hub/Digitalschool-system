const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const RegistrationRequest = require('../models/RegistrationRequest');

const router = express.Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin._id, role: 'admin', username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token, user: { username: admin.username, role: 'admin' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const student = await Student.findOne({ id, isActive: true });
    
    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.status(401).json({ message: 'Invalid credentials or account not activated' });
    }
    
    const token = jwt.sign(
      { id: student._id, role: 'student', studentId: student.id, name: student.name, grade: student.grade },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token, user: { id: student.id, name: student.name, role: 'student', grade: student.grade } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher Login
router.post('/teacher/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const teacher = await Teacher.findOne({ id });
    
    if (!teacher || !(await teacher.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: teacher._id, role: 'teacher', teacherId: teacher.id, name: teacher.name, department: teacher.department },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token, user: { id: teacher.id, name: teacher.name, role: 'teacher', department: teacher.department } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Registration Request
router.post('/student/register', async (req, res) => {
  try {
    const { id, name, email, grade, password } = req.body;
    
    const existingRequest = await RegistrationRequest.findOne({ id });
    if (existingRequest) {
      return res.status(400).json({ message: 'Registration request already submitted' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const request = new RegistrationRequest({
      id, name, email, grade, password: hashedPassword
    });
    
    await request.save();
    res.json({ message: 'Registration request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create default admin if not exists
const createDefaultAdmin = async () => {
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    const admin = new Admin({ username: 'admin', password: 'admin123' });
    await admin.save();
    console.log('Default admin created: admin / admin123');
  }
};
createDefaultAdmin();

module.exports = router;