const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  currentRoadmaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' }],
  completedRoadmaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' }],
  enrolledJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
