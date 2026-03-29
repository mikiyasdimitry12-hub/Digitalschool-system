const mongoose = require('mongoose');

const SubmittedAssignmentSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  studentName: { type: String, required: true },
  teacherID: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  fileName: { type: String },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubmittedAssignment', SubmittedAssignmentSchema);