const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const RegistrationRequest = require('../models/RegistrationRequest');
const Announcement = require('../models/Announcement');
const ExamSchedule = require('../models/ExamSchedule');
const Assignment = require('../models/Assignment');
const Mark = require('../models/Mark');
const SubmittedAssignment = require('../models/SubmittedAssignment');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyToken, verifyAdmin);

// Get all students (with search)
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { id: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const students = await Student.find(query).sort({ registeredDate: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  try {
    await Student.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teachers (with search)
router.get('/teachers', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { id: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const teachers = await Teacher.find(query).sort({ registeredDate: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete teacher
router.delete('/teachers/:id', async (req, res) => {
  try {
    await Teacher.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending registration requests
router.get('/requests/pending', async (req, res) => {
  try {
    const requests = await RegistrationRequest.find({ status: 'pending' }).sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve registration request
router.post('/requests/approve/:id', async (req, res) => {
  try {
    const request = await RegistrationRequest.findOne({ id: req.params.id });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const student = new Student({
      id: request.id,
      name: request.name,
      email: request.email,
      grade: request.grade,
      password: request.password,
      isActive: true
    });
    
    await student.save();
    request.status = 'approved';
    await request.save();
    
    res.json({ message: 'Student approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject registration request
router.delete('/requests/reject/:id', async (req, res) => {
  try {
    await RegistrationRequest.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register student directly
router.post('/students', async (req, res) => {
  try {
    const { id, name, email, grade, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const student = new Student({
      id, name, email, grade, password: hashedPassword, isActive: true
    });
    
    await student.save();
    res.json({ message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register teacher directly
router.post('/teachers', async (req, res) => {
  try {
    const { id, name, email, department, password } = req.body;
    const teacher = new Teacher({
      id, name, email, department, password
    });
    
    await teacher.save();
    res.json({ message: 'Teacher registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create announcement
router.post('/announcements', async (req, res) => {
  try {
    const { text } = req.body;
    const announcement = new Announcement({ text });
    await announcement.save();
    
    const io = req.app.get('io');
    io.emit('new_announcement', announcement);
    
    res.json({ message: 'Announcement posted', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create exam schedule
router.post('/exam-schedules', async (req, res) => {
  try {
    const { name, date, subject, time } = req.body;
    const exam = new ExamSchedule({ name, date, subject, time });
    await exam.save();
    
    const io = req.app.get('io');
    io.emit('new_exam_schedule', exam);
    
    res.json({ message: 'Exam schedule added', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all exam schedules
router.get('/exam-schedules', async (req, res) => {
  try {
    const exams = await ExamSchedule.find().sort({ date: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;