const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  difficulty: String,
  estimatedDuration: String,
  components: [
    {
      title: String,
      description: String,
      estimatedHours: Number,
      resources: [String],
      completed: Boolean,
    }
  ],
  icon: String,
  color: String,
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', RoadmapSchema);
