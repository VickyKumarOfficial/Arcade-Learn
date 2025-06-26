require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const roadmapRoutes = require('./routes/roadmaps');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/roadmaps', roadmapRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
