const express = require('express');
const { verifyToken, verifyStudent } = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const ExamSchedule = require('../models/ExamSchedule');
const Assignment = require('../models/Assignment');
const SubmittedAssignment = require('../models/SubmittedAssignment');
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.use(verifyToken, verifyStudent);

// Get student profile
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.user.studentId });
    res.json({ id: student.id, name: student.name, email: student.email, grade: student.grade });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    await Student.findOneAndUpdate(
      { id: req.user.studentId },
      { name, email }
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student results
router.get('/results', async (req, res) => {
  try {
    const marks = await Mark.find({ studentID: req.user.studentId }).sort({ date: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exam schedules
router.get('/exam-schedules', async (req, res) => {
  try {
    const exams = await ExamSchedule.find().sort({ date: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignments for student's grade (with search)
router.get('/assignments', async (req, res) => {
  try {
    const { search } = req.query;
    const student = await Student.findOne({ id: req.user.studentId });
    let query = { grade: student.grade };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    const assignments = await Assignment.find(query).sort({ date: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment
router.post('/submit-assignment', async (req, res) => {
  try {
    const { teacherID, subject, title, fileName, notes } = req.body;
    const submission = new SubmittedAssignment({
      studentID: req.user.studentId,
      studentName: req.user.name,
      teacherID,
      subject,
      title,
      fileName: fileName || 'No file',
      notes: notes || ''
    });
    
    await submission.save();
    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;