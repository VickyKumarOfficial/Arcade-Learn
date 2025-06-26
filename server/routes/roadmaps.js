const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/roadmaps
router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .populate('currentRoadmaps completedRoadmaps enrolledJobs');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update current roadmap
router.post('/progress/current', auth, async (req, res) => {
  try {
    const { roadmapId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { currentRoadmaps: roadmapId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST mark roadmap as completed
router.post('/progress/complete', auth, async (req, res) => {
  try {
    const { roadmapId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      {
        $pull: { currentRoadmaps: roadmapId },
        $addToSet: { completedRoadmaps: roadmapId },
      },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST enroll in job
router.post('/enroll-job', auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { enrolledJobs: jobId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
