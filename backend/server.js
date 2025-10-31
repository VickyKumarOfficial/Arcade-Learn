import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userProgressService } from './services/userProgressService.js';
import { subscriptionService } from './services/subscriptionService.js';
import { certificateService } from './services/certificateService.js';
import { analyticsService } from './services/analyticsService.js';
import { surveyService } from './services/surveyService.js';
import { emailService } from './services/emailService.js';
import { resumeService } from './services/resumeService.js';

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
      // Check if user is new by checking when they were created
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      const isNewUser = userData?.user && new Date() - new Date(userData.user.created_at) < 24 * 60 * 60 * 1000; // New if created within 24 hours
      
      res.json({ 
        completed: result.completed,
        isNewUser: isNewUser || false
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Roadmap Generation Routes
app.post('/api/user/:userId/ai-roadmap', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await surveyService.generateAIRoadmap(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('AI roadmap generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await surveyService.getUserRecommendations(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact Form Routes
app.post('/api/contact/send-email', async (req, res) => {
  try {
    const { firstName, lastName, subject, phone, description, userEmail, toEmail } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !subject || !phone || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, subject, phone, description' 
      });
    }

    // Send contact email
    const emailResult = await emailService.sendContactEmail({
      firstName,
      lastName, 
      subject,
      phone,
      description,
      userEmail
    });

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: 'Failed to send contact email',
        details: emailResult.error 
      });
    }

    // Send auto-reply if user email is provided
    if (userEmail) {
      await emailService.sendAutoReply(userEmail, `${firstName} ${lastName}`);
    }

    res.json({ 
      success: true, 
      message: 'Contact email sent successfully',
      messageId: emailResult.messageId 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test email service endpoint
app.get('/api/contact/test', async (req, res) => {
  try {
    const result = await emailService.testConnection();
    res.json(result);
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

// ==================== Resume Routes ====================

// Save parsed resume (stores in Supabase + JSON file)
app.post('/api/user/:userId/resume', async (req, res) => {
  try {
    const { userId } = req.params;
    const { resumeData, fileName, fileSize, fileUrl } = req.body;
    
    const result = await resumeService.saveResume(
      userId,
      resumeData,
      fileName,
      fileSize,
      fileUrl
    );

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's active resume
app.get('/api/user/:userId/resume/active', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await resumeService.getActiveResume(userId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all resumes for a user
app.get('/api/user/:userId/resumes', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await resumeService.getAllResumes(userId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update resume
app.put('/api/user/:userId/resume/:resumeId', async (req, res) => {
  try {
    const { userId, resumeId } = req.params;
    const { resumeData } = req.body;
    
    const result = await resumeService.updateResume(resumeId, resumeData, userId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all resume JSONs (for AI batch processing - admin only)
app.get('/api/admin/resumes/all', async (req, res) => {
  try {
    const result = await resumeService.getAllResumeJSONs();

    if (result.success) {
      res.json({
        total: result.data.length,
        resumes: result.data
      });
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
