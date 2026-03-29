const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  grade: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  registeredDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);