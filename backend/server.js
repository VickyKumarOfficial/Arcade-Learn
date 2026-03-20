import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { userProgressService } from './services/userProgressService.js';
import { subscriptionService } from './services/subscriptionService.js';
import { certificateService } from './services/certificateService.js';
import { analyticsService } from './services/analyticsService.js';
import { surveyService } from './services/surveyService.js';
import { emailService } from './services/emailService.js';
import { resumeService } from './services/resumeService.js';
import { jobRecommendationService } from './services/jobRecommendationService.js';
import { userActivityService } from './services/userActivityService.js';
import pdfService from './services/pdfService.js';
import { invokeMcpTool } from './mcpServer.js';
import { getRegisteredMcpTools } from './mcpServer.js';
import { aiOrchestratorService } from './services/aiOrchestratorService.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// Simplified CORS - allow all since frontend and backend are served from same domain
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MCP discovery endpoint for developer tooling and integration checks.
app.get('/mcp', (req, res) => {
  res.json({
    name: 'arcadelearn-mcp',
    version: '0.2.0-stop-f',
    tools: getRegisteredMcpTools(),
    timestamp: new Date().toISOString(),
  });
});

// Stop B: secure server-side quiz generation route (frontend cutover comes in next stop)
const quizRateLimitStore = new Map();
const QUIZ_MAX_PER_HOUR = 10;
const QUIZ_WINDOW_MS = 60 * 60 * 1000;

app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic, context = [], count = 4, userId } = req.body ?? {};

    if (typeof topic !== 'string' || topic.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'A valid topic is required.'
      });
    }

    if (!Array.isArray(context) || context.some((item) => typeof item !== 'string')) {
      return res.status(400).json({
        success: false,
        error: 'Context must be an array of strings.'
      });
    }

    const safeCount = Number.isInteger(count) ? Math.max(2, Math.min(10, count)) : 4;
    const rateLimitKey = userId || req.ip || 'anonymous';
    const now = Date.now();
    const rateState = quizRateLimitStore.get(rateLimitKey) || { count: 0, resetAt: now + QUIZ_WINDOW_MS };

    if (now > rateState.resetAt) {
      rateState.count = 0;
      rateState.resetAt = now + QUIZ_WINDOW_MS;
    }

    rateState.count += 1;
    quizRateLimitStore.set(rateLimitKey, rateState);

    if (rateState.count > QUIZ_MAX_PER_HOUR) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Try again later.'
      });
    }

    const result = await invokeMcpTool('generate_quiz', {
      topic: topic.trim(),
      context,
      count: safeCount
    });

    return res.json(result);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz.'
    });
  }
});

// Stop D: backend AI chat endpoint (frontend cutover comes later)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required.',
      });
    }

    const hasInvalidMessage = messages.some(
      (message) =>
        !message ||
        (message.role !== 'user' && message.role !== 'assistant' && message.role !== 'system') ||
        typeof message.content !== 'string' ||
        message.content.trim().length === 0 ||
        message.content.length > 6000
    );

    if (hasInvalidMessage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message payload.',
      });
    }

    const result = await aiOrchestratorService.getChatCompletion({ messages });
    if (!result.success) {
      const status = Number.isInteger(result.statusCode) ? result.statusCode : 500;
      return res.status(status).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process AI chat request.',
    });
  }
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

// Download Roadmap as PDF
app.get('/api/user/:userId/roadmap/download-pdf', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's recommendations
    const recommendationsResult = await surveyService.getUserRecommendations(userId);
    
    if (!recommendationsResult.success) {
      return res.status(400).json({ error: 'No recommendations found. Please generate roadmap first.' });
    }
    
    // Get user's survey data for personalization
    const surveyResult = await surveyService.getUserSurvey(userId);
    const surveyData = surveyResult.success ? surveyResult.data : {};
    
    // Prepare user data for PDF
    const userData = {
      name: surveyData.user_type || 'Learner',
      skillLevel: surveyData.skill_level,
      interests: surveyData.interests?.join(', ') || surveyData.interests,
      timeCommitment: surveyData.time_commitment_hours
    };
    
    // Generate PDF
    const pdfBuffer = await pdfService.generateRoadmapPDF(
      recommendationsResult.data,
      userData
    );
    
    // Set response headers for PDF download
    const filename = `ArcadeLearn_Roadmap_${userId.substring(0, 8)}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF: ' + error.message });
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

// Check if user has uploaded resume (for job recommendations)
app.get('/api/user/:userId/resume/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await resumeService.getUserResumeStatus(userId);

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

// ===== Job Recommendation Routes =====

// Get personalized job recommendations for user
app.get('/api/user/:userId/jobs/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await jobRecommendationService.getRecommendations(userId, limit);

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

// ============================================================================
// User Activity & Heatmap Routes
// ============================================================================

/**
 * POST /api/user/:userId/activity/log
 * Log a user activity
 */
app.post('/api/user/:userId/activity/log', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activityType, metadata, activityDate } = req.body;

    if (!activityType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Activity type is required' 
      });
    }

    const result = await userActivityService.logActivity(
      userId,
      activityType,
      metadata || {},
      activityDate
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/user/:userId/activity/heatmap
 * Get heatmap data for visualization
 */
app.get('/api/user/:userId/activity/heatmap', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, activityTypes } = req.query;

    // Parse activity types if provided as comma-separated string
    const types = activityTypes ? activityTypes.split(',') : null;

    const result = await userActivityService.getHeatmapData(
      userId,
      startDate,
      endDate,
      types
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      heatmapData: {}
    });
  }
});

/**
 * GET /api/user/:userId/activity/stats
 * Get activity statistics (streaks, totals, trends)
 */
app.get('/api/user/:userId/activity/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;

    const result = await userActivityService.getActivityStats(
      userId,
      year ? parseInt(year) : null
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stats: {
        totalActivities: 0,
        currentStreak: 0,
        longestStreak: 0,
        mostActiveMonth: 'N/A',
        mostActiveCount: 0,
        avgActivitiesPerWeek: 0
      }
    });
  }
});

/**
 * GET /api/user/:userId/activity/recent
 * Get recent activities
 */
app.get('/api/user/:userId/activity/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    const result = await userActivityService.getRecentActivities(
      userId,
      limit ? parseInt(limit) : 10
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      activities: []
    });
  }
});

/**
 * POST /api/user/:userId/activity/bulk
 * Bulk log multiple activities
 */
app.post('/api/user/:userId/activity/bulk', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activities } = req.body;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Activities array is required' 
      });
    }

    const result = await userActivityService.bulkLogActivities(userId, activities);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error bulk logging activities:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      successCount: 0
    });
  }
});

// ============================================================================
// SERVE STATIC FRONTEND FILES
// ============================================================================

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle client-side routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // 404 for API routes that don't exist
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 ArcadeLearn Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

export default app;
