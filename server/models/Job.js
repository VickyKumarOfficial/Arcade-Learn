const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  skills: [String],
  status: String, // e.g., 'Open', 'Closed', 'Interviewing'
  averageSalary: String,
  companies: [String],
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
