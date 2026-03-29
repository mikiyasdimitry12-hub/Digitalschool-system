const mongoose = require('mongoose');

const ExamScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  subject: { type: String },
  time: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamSchedule', ExamScheduleSchema);