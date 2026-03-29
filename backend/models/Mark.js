const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  examType: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mark', MarkSchema);