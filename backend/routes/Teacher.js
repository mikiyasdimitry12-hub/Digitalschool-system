const express = require('express');
const { verifyToken, verifyTeacher } = require('../middleware/auth');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const SubmittedAssignment = require('../models/SubmittedAssignment');
const Mark = require('../models/Mark');
const Announcement = require('../models/Announcement');
const ExamSchedule = require('../models/ExamSchedule');

const router = express.Router();

router.use(verifyToken, verifyTeacher);

// Get teacher profile
router.get('/profile', async (req, res) => {
  try {
    res.json({ id: req.user.teacherId, name: req.user.name, department: req.user.department });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students (with search)
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment
router.post('/assignments', async (req, res) => {
  try {
    const { grade, subject, title, description } = req.body;
    const assignment = new Assignment({
      teacherID: req.user.teacherId,
      grade,
      subject,
      title,
      description
    });
    
    await assignment.save();
    
    const io = req.app.get('io');
    io.emit('new_assignment', assignment);
    
    res.json({ message: 'Assignment posted successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherID: req.user.teacherId }).sort({ date: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submitted assignments (with search)
router.get('/submitted-assignments', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { teacherID: req.user.teacherId };
    
    if (search) {
      query.$or = [
        { studentID: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    const submissions = await SubmittedAssignment.find(query).sort({ date: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Enter marks
router.post('/marks', async (req, res) => {
  try {
    const { studentID, subject, marks, examType } = req.body;
    const mark = new Mark({
      studentID,
      subject,
      marks,
      examType
    });
    
    await mark.save();
    res.json({ message: 'Marks entered successfully' });
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

module.exports = router;