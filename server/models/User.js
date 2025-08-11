const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  phone: { type: String, unique: true, sparse: true },
  name: { type: String }, // for backward compatibility
  currentRoadmaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' }],
  completedRoadmaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' }],
  enrolledJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
