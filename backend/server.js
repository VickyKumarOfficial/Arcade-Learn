import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userProgressService } from './services/userProgressService.js';
import { subscriptionService } from './services/subscriptionService.js';
import { certificateService } from './services/certificateService.js';
import { analyticsService } from './services/analyticsService.js';
import { surveyService } from './services/surveyService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Test database connection on startup
import { testConnection } from './lib/db.js';
testConnection().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User Progress Routes
app.get('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userProgressService.getUserProgress(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    const result = await userProgressService.saveUserProgress(userId, userData);
    
    if (result.success) {
      res.json({ message: 'Progress saved successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/sync', async (req, res) => {
  try {
    const { userId } = req.params;
    const localData = req.body;
    const result = await userProgressService.syncUserProgress(userId, localData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leaderboard Routes
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await userProgressService.getLeaderboard(limit);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscription Routes
app.get('/api/user/:userId/subscription', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await subscriptionService.getUserSubscription(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/subscription', async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriptionData = req.body;
    const result = await subscriptionService.updateSubscription(userId, subscriptionData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/access/:feature', async (req, res) => {
  try {
    const { userId, feature } = req.params;
    const result = await subscriptionService.checkPremiumAccess(userId, feature);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Certificate Routes
app.post('/api/user/:userId/certificate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { roadmapId, roadmapTitle } = req.body;
    const result = await certificateService.generateCertificate(userId, roadmapId, roadmapTitle);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/certificates', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await certificateService.getUserCertificates(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/certificate/verify/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;
    const result = await certificateService.verifyCertificate(verificationCode);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Survey Routes
app.get('/api/user/:userId/survey', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await surveyService.getUserSurvey(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/survey', async (req, res) => {
  try {
    const { userId } = req.params;
    const surveyData = req.body;
    const result = await surveyService.saveSurvey(userId, surveyData);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/survey/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await surveyService.isSurveyCompleted(userId);
    
    if (result.success) {
      res.json({ completed: result.completed });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Routes (Admin only - add auth middleware in production)
app.get('/api/admin/analytics/platform', async (req, res) => {
  try {
    const result = await analyticsService.getPlatformAnalytics();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/analytics/learning', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await analyticsService.getLearningAnalytics(startDate, endDate);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/analytics/engagement', async (req, res) => {
  try {
    const result = await analyticsService.getUserEngagementAnalytics();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/analytics/subscriptions', async (req, res) => {
  try {
    const result = await subscriptionService.getSubscriptionAnalytics();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/analytics/certificates', async (req, res) => {
  try {
    const result = await certificateService.getCertificateAnalytics();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 ArcadeLearn Backend Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
