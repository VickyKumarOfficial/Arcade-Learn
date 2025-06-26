const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /api/jobs?skill=SkillName
router.get('/', async (req, res) => {
  try {
    const { skill } = req.query;
    let query = {};
    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }
    const jobs = await Job.find(query);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
