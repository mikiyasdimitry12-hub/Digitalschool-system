const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  teacherID: { type: String, required: true },
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);