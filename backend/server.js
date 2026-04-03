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
import { roadmapJobMatchService } from './services/roadmapJobMatchService.js';
import { userActivityService } from './services/userActivityService.js';
import { scoreV2Service } from './services/scoreV2Service.js';
import { getScoreFeatureFlags } from './config/featureFlags.js';
import { supabaseAdmin } from './lib/supabase.js';
import pdfService from './services/pdfService.js';
import { invokeMcpTool } from './mcpServer.js';
import { getRegisteredMcpTools } from './mcpServer.js';
import { aiOrchestratorService } from './services/aiOrchestratorService.fallback.js';

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

function buildScoreV2FlagsPayload() {
  return getScoreFeatureFlags();
}

function requireScoreFlag(flagName) {
  const flags = getScoreFeatureFlags();
  if (!flags[flagName]) {
    return {
      allowed: false,
      response: {
        error: `Score V2 ${flagName} is disabled`,
        flags,
      },
    };
  }

  return {
    allowed: true,
    response: null,
  };
}

function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token.trim();
}

async function getAuthenticatedUserFromRequest(req) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return {
      success: false,
      statusCode: 401,
      error: 'Authorization token is required.',
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.id) {
    return {
      success: false,
      statusCode: 401,
      error: 'Invalid or expired authentication token.',
    };
  }

  return {
    success: true,
    user: data.user,
  };
}

function normalizeOptionalText(value, maxLength = 2000) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function normalizeFeedbackReasons(value, maxItems = 8, itemMaxLength = 120) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }

    const sanitized = item.replace(/\s+/g, ' ').trim().slice(0, itemMaxLength);
    if (!sanitized || seen.has(sanitized)) {
      continue;
    }

    seen.add(sanitized);
    normalized.push(sanitized);

    if (normalized.length >= maxItems) {
      break;
    }
  }

  return normalized;
}

function normalizeRoadmapRecommendations(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .slice(0, 5)
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (item && typeof item === 'object') {
        return item.title || item.name || item.roadmap_id || JSON.stringify(item);
      }

      return null;
    })
    .filter(Boolean);
}

async function buildSecureUserContext(userId) {
  const [progressResult, activityResult, roadmapResult] = await Promise.all([
    invokeMcpTool('get_user_progress', { userId }),
    invokeMcpTool('get_user_activity_stats', { userId, days: 30 }),
    invokeMcpTool('get_recommended_roadmaps', { userId, limit: 3 }),
  ]);

  const progress = progressResult?.success ? progressResult?.data?.progress : null;
  const achievements = progressResult?.success ? progressResult?.data?.achievements || [] : [];
  const stats = activityResult?.success ? activityResult?.data?.stats : null;
  const recommendations = roadmapResult?.success ? roadmapResult?.data?.recommendations || [] : [];
  const recommendationReason = roadmapResult?.success
    ? roadmapResult?.data?.recommendationReason || null
    : null;
  const recommendationConfidence = roadmapResult?.success
    ? roadmapResult?.data?.aiConfidenceScore ?? null
    : null;
  const recommendationGeneratedAt = roadmapResult?.success
    ? roadmapResult?.data?.generatedAt || null
    : null;
  const normalizedRecommendationReason =
    typeof recommendationReason === 'string'
      ? recommendationReason
      : (recommendationReason && typeof recommendationReason === 'object'
        ? (recommendationReason.summary ||
          (Array.isArray(recommendationReason.details)
            ? recommendationReason.details.slice(0, 2).join(' ')
            : null))
        : null);

  const hasTotalScore = Number.isFinite(Number(progress?.total_score));
  const hasTotalXP = Number.isFinite(Number(progress?.total_xp));
  const currentPoints = hasTotalScore
    ? Number(progress.total_score)
    : (hasTotalXP ? Number(progress.total_xp) : null);

  return {
    userId,
    points: {
      currentTotal: currentPoints,
      source: hasTotalScore ? 'score_v2_total_score' : (hasTotalXP ? 'legacy_total_xp' : 'unavailable'),
    },
    progress: progress
      ? {
          totalScore: progress.total_score ?? null,
          totalStars: progress.total_stars ?? null,
          totalXP: progress.total_xp ?? null,
          level: progress.level ?? null,
          currentStreak: progress.current_streak ?? null,
          longestStreak: progress.longest_streak ?? null,
          totalComponentsCompleted: progress.total_components_completed ?? null,
          completedRoadmaps: Array.isArray(progress.completed_roadmaps)
            ? progress.completed_roadmaps.slice(0, 20)
            : [],
        }
      : null,
    achievements: achievements
      .slice(0, 10)
      .map((item) => item?.achievement_id)
      .filter(Boolean),
    activity: stats
      ? {
          totalActivities: stats.totalActivities ?? null,
          activeDays: stats.activeDays ?? null,
          currentStreak: stats.currentStreak ?? null,
          longestStreak: stats.longestStreak ?? null,
        }
      : null,
    recommendedRoadmaps: normalizeRoadmapRecommendations(recommendations),
    roadmapRecommendationMeta: {
      reason: normalizedRecommendationReason,
      confidenceScore: recommendationConfidence,
      generatedAt: recommendationGeneratedAt,
    },
  };
}

function buildUserGroundingMessage(context) {
  const pointsText = context?.points?.currentTotal ?? 'unavailable';
  const pointsSourceText = context?.points?.source || 'unavailable';
  const starsText = context?.progress?.totalStars ?? 'unavailable';
  const totalXPText = context?.progress?.totalXP ?? 'unavailable';
  const levelText = context?.progress?.level ?? 'unavailable';
  const streakText = context?.progress?.currentStreak ?? 'unavailable';
  const componentsText = context?.progress?.totalComponentsCompleted ?? 'unavailable';
  const achievementsText = Array.isArray(context?.achievements) && context.achievements.length > 0
    ? context.achievements.join(', ')
    : 'none yet';
  const recommendedRoadmapsText = Array.isArray(context?.recommendedRoadmaps) && context.recommendedRoadmaps.length > 0
    ? context.recommendedRoadmaps.join(', ')
    : 'not available';
  const recommendationReasonText = context?.roadmapRecommendationMeta?.reason || 'not available';
  const recommendationConfidenceText = context?.roadmapRecommendationMeta?.confidenceScore ?? 'not available';
  const recommendationGeneratedAtText = context?.roadmapRecommendationMeta?.generatedAt || 'not available';

  return `You are assisting the currently authenticated ArcadeLearn user.
Use ONLY this backend-verified user context when answering questions about progress, XP, streaks, achievements, and roadmap next steps.
If a requested value is missing, clearly say data is unavailable instead of guessing.
Do not mention internal tool names, internal IDs, JSON keys, or raw JSON unless the user explicitly asks.

Authoritative user context:
- Current points (use this for "points" or "score" questions): ${pointsText}
- Points source: ${pointsSourceText}
- Total stars: ${starsText}
- Legacy total XP: ${totalXPText}
- Level: ${levelText}
- Current streak: ${streakText}
- Completed components: ${componentsText}
- Achievements: ${achievementsText}
- Recommended roadmaps: ${recommendedRoadmapsText}
- Recommendation reason: ${recommendationReasonText}
- Recommendation confidence score: ${recommendationConfidenceText}
- Recommendation generated at: ${recommendationGeneratedAtText}

Response behavior requirements:
- If the user asks "how many points" or similar, answer from Current points.
- If the user asks about stars, answer from Total stars.
- If the user asks why roadmaps were recommended, explain using recommendation reason and confidence score.
- If recommendation reason is unavailable, say the recommendations are fetched from latest saved AI recommendation results and criteria detail is unavailable.`;
}

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
        (message.role !== 'user' && message.role !== 'assistant') ||
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

    const authResult = await getAuthenticatedUserFromRequest(req);
    if (!authResult.success) {
      return res.status(authResult.statusCode).json({
        success: false,
        error: authResult.error,
      });
    }

    let secureUserContext = { userId: authResult.user.id, contextStatus: 'unavailable' };
    try {
      secureUserContext = await buildSecureUserContext(authResult.user.id);
    } catch (contextError) {
      console.warn('Failed to load secure MCP context for chat:', contextError?.message || contextError);
    }

    const groundedMessages = [
      {
        role: 'system',
        content: buildUserGroundingMessage(secureUserContext),
      },
      ...messages,
    ];

    const result = await aiOrchestratorService.getChatCompletion({ messages: groundedMessages });
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

app.post('/api/ai/feedback', async (req, res) => {
  try {
    const {
      feedbackScope,
      chatId,
      messageId,
      feedbackValue,
      reason,
      reasons,
      details,
      rating,
    } = req.body ?? {};

    const normalizedScope = typeof feedbackScope === 'string' ? feedbackScope.trim().toLowerCase() : null;
    const normalizedChatId = typeof chatId === 'string' && chatId.trim().length > 0 ? chatId.trim() : null;
    const normalizedMessageId = typeof messageId === 'string' && messageId.trim().length > 0 ? messageId.trim() : null;
    const normalizedFeedbackValue = typeof feedbackValue === 'string' ? feedbackValue.trim().toLowerCase() : null;
    const normalizedReason = normalizeOptionalText(reason, 240);
    const normalizedReasons = normalizeFeedbackReasons(reasons, 8, 120);
    const normalizedDetails = normalizeOptionalText(details, 4000);
    const normalizedRating = Number.isInteger(Number(rating)) ? Number(rating) : null;

    if (normalizedScope !== 'message' && normalizedScope !== 'overall') {
      return res.status(400).json({
        success: false,
        error: 'feedbackScope must be either "message" or "overall".',
      });
    }

    const authResult = await getAuthenticatedUserFromRequest(req);
    if (!authResult.success) {
      return res.status(authResult.statusCode).json({
        success: false,
        error: authResult.error,
      });
    }

    const userId = authResult.user.id;

    if (normalizedScope === 'message') {
      if (!normalizedMessageId) {
        return res.status(400).json({
          success: false,
          error: 'messageId is required for message feedback.',
        });
      }

      if (normalizedFeedbackValue !== 'like' && normalizedFeedbackValue !== 'dislike') {
        return res.status(400).json({
          success: false,
          error: 'feedbackValue must be "like" or "dislike" for message feedback.',
        });
      }

      const { data: messageRow, error: messageError } = await supabaseAdmin
        .from('ai_messages')
        .select('id, chat_id, type, content')
        .eq('id', normalizedMessageId)
        .maybeSingle();

      if (messageError) {
        console.error('Failed to load AI message for feedback:', messageError);
        return res.status(500).json({
          success: false,
          error: 'Failed to validate message feedback target.',
        });
      }

      if (!messageRow) {
        return res.status(404).json({
          success: false,
          error: 'Target message not found.',
        });
      }

      if (messageRow.type !== 'ai') {
        return res.status(400).json({
          success: false,
          error: 'Feedback is only supported for AI responses.',
        });
      }

      const { data: chatRow, error: chatError } = await supabaseAdmin
        .from('ai_chats')
        .select('id, user_id')
        .eq('id', messageRow.chat_id)
        .maybeSingle();

      if (chatError) {
        console.error('Failed to load AI chat for message feedback:', chatError);
        return res.status(500).json({
          success: false,
          error: 'Failed to validate message ownership.',
        });
      }

      if (!chatRow || chatRow.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this message.',
        });
      }

      if (normalizedChatId && normalizedChatId !== messageRow.chat_id) {
        return res.status(400).json({
          success: false,
          error: 'chatId does not match the provided messageId.',
        });
      }

      const feedbackRow = {
        user_id: userId,
        feedback_scope: 'message',
        chat_id: messageRow.chat_id,
        message_id: messageRow.id,
        feedback_value: normalizedFeedbackValue,
        reason: normalizedReason,
        reasons: normalizedReasons.length > 0 ? normalizedReasons : null,
        details: normalizedDetails,
        llm_response: typeof messageRow.content === 'string'
          ? messageRow.content.slice(0, 12000)
          : null,
        rating: null,
        updated_at: new Date().toISOString(),
      };

      const { data: savedFeedback, error: saveError } = await supabaseAdmin
        .from('ai_feedback')
        .upsert(feedbackRow, {
          onConflict: 'user_id,message_id,feedback_scope',
        })
        .select('id')
        .single();

      if (saveError) {
        console.error('Failed to save message feedback:', saveError);
        return res.status(500).json({
          success: false,
          error: 'Failed to save message feedback.',
        });
      }

      return res.json({
        success: true,
        feedbackId: savedFeedback.id,
      });
    }

    if (normalizedRating === null || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'rating must be an integer between 1 and 5 for overall feedback.',
      });
    }

    if (normalizedMessageId) {
      return res.status(400).json({
        success: false,
        error: 'messageId is not allowed for overall feedback.',
      });
    }

    if (normalizedFeedbackValue) {
      return res.status(400).json({
        success: false,
        error: 'feedbackValue is only allowed for message feedback.',
      });
    }

    if (normalizedChatId) {
      const { data: chatRow, error: chatError } = await supabaseAdmin
        .from('ai_chats')
        .select('id, user_id')
        .eq('id', normalizedChatId)
        .maybeSingle();

      if (chatError) {
        console.error('Failed to validate chat for overall feedback:', chatError);
        return res.status(500).json({
          success: false,
          error: 'Failed to validate chat ownership.',
        });
      }

      if (!chatRow || chatRow.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this chat.',
        });
      }
    }

    const feedbackRow = {
      user_id: userId,
      feedback_scope: 'overall',
      chat_id: normalizedChatId,
      message_id: null,
      feedback_value: null,
      reason: normalizedReason || normalizedReasons[0] || null,
      reasons: normalizedReasons.length > 0 ? normalizedReasons : null,
      details: normalizedDetails,
      llm_response: null,
      rating: normalizedRating,
    };

    const { data: savedFeedback, error: saveError } = await supabaseAdmin
      .from('ai_feedback')
      .insert(feedbackRow)
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to save overall feedback:', saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save overall feedback.',
      });
    }

    return res.json({
      success: true,
      feedbackId: savedFeedback.id,
    });
  } catch (error) {
    console.error('AI feedback error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit feedback.',
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

// Score V2 Routes (feature-flagged)
app.post('/api/v2/user/:userId/score/attempt', async (req, res) => {
  const gate = requireScoreFlag('scoreV2WriteEnabled');
  if (!gate.allowed) {
    return res.status(503).json(gate.response);
  }

  try {
    const { userId } = req.params;
    const {
      attemptId,
      roadmapId,
      moduleId,
      nodeId,
      nodeDepth,
      quizScore,
      metadata,
      submittedAt,
      scoringVersion,
    } = req.body ?? {};

    if (!attemptId || !roadmapId || !moduleId || !nodeId || !nodeDepth || typeof quizScore !== 'number') {
      return res.status(400).json({
        error: 'Missing required fields: attemptId, roadmapId, moduleId, nodeId, nodeDepth, quizScore',
      });
    }

    const result = await scoreV2Service.submitAttempt(userId, {
      attemptId,
      roadmapId,
      moduleId,
      nodeId,
      nodeDepth,
      quizScore,
      metadata,
      submittedAt: submittedAt || new Date().toISOString(),
      scoringVersion,
    });

    return res.json({
      success: true,
      data: result,
      flags: buildScoreV2FlagsPayload(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/v2/user/:userId/score/module-bonus', async (req, res) => {
  const gate = requireScoreFlag('scoreV2WriteEnabled');
  if (!gate.allowed) {
    return res.status(503).json(gate.response);
  }

  try {
    const { userId } = req.params;
    const { roadmapId, moduleId, completedAt, scoringVersion } = req.body ?? {};

    if (!roadmapId || !moduleId) {
      return res.status(400).json({
        error: 'Missing required fields: roadmapId, moduleId',
      });
    }

    const result = await scoreV2Service.awardModuleBonus(userId, {
      roadmapId,
      moduleId,
      completedAt: completedAt || new Date().toISOString(),
      scoringVersion,
    });

    return res.json({
      success: true,
      data: result,
      flags: buildScoreV2FlagsPayload(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/v2/user/:userId/score-summary', async (req, res) => {
  const gate = requireScoreFlag('scoreV2ReadEnabled');
  if (!gate.allowed) {
    return res.status(503).json(gate.response);
  }

  try {
    const { userId } = req.params;
    const summary = await scoreV2Service.getUserSummary(userId);

    return res.json({
      success: true,
      data: summary,
      flags: buildScoreV2FlagsPayload(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/v2/leaderboard', async (req, res) => {
  const gate = requireScoreFlag('scoreV2LeaderboardEnabled');
  if (!gate.allowed) {
    return res.status(503).json(gate.response);
  }

  try {
    const limit = parseInt(req.query.limit) || 100;
    const leaderboard = await scoreV2Service.getGlobalLeaderboard(limit);

    return res.json({
      success: true,
      data: leaderboard,
      flags: buildScoreV2FlagsPayload(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
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

// Get roadmap keyword based job matches (no resume required)
app.get('/api/jobs/roadmap-matches', async (req, res) => {
  try {
    const roadmap = typeof req.query.roadmap === 'string' ? req.query.roadmap : 'frontend';
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await roadmapJobMatchService.getRoadmapMatches(roadmap, limit);

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
  const isMalformedJson =
    err instanceof SyntaxError &&
    err.status === 400 &&
    Object.prototype.hasOwnProperty.call(err, 'body');

  if (isMalformedJson) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  if (status >= 500) {
    console.error(err?.stack || err);
    return res.status(500).json({ error: 'Something went wrong!' });
  }

  return res.status(status).json({ error: err?.message || 'Request failed.' });
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
