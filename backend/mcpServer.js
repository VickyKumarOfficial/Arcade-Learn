import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import Groq from 'groq-sdk';
import { userProgressService } from './services/userProgressService.js';
import { userActivityService } from './services/userActivityService.js';
import { certificateService } from './services/certificateService.js';
import { jobRecommendationService } from './services/jobRecommendationService.js';
import supabaseAdmin from './lib/supabase.js';
import { surveyService } from './services/surveyService.js';
import { analyticsService } from './services/analyticsService.js';

export const mcpServer = new McpServer({
  name: 'arcadelearn-mcp',
  version: '0.2.0-stop-b'
});

const quizCache = new Map();
const toolHandlers = new Map();

function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the backend.');
  }
  return new Groq({ apiKey });
}

function buildQuizPrompt(topic, context, count) {
  const safeContext = Array.isArray(context) && context.length > 0
    ? context.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : 'No extra context provided.';

  return `You are a quiz generator for a developer learning platform.

Topic: "${topic}"

The learner is expected to understand these concepts:
${safeContext}

Generate exactly ${count} multiple-choice questions.

Rules:
- Questions must be directly related to the topic and context
- Each question has exactly 4 options
- Only one option is correct
- Include short explanation (1-2 sentences)
- Return ONLY raw JSON with no markdown

Return ONLY a valid JSON array in this exact shape:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0,
    "explanation": "string"
  }
]`;
}

function normalizeQuestions(parsed) {
  if (!Array.isArray(parsed)) {
    throw new Error('Quiz payload is not an array.');
  }

  return parsed.map((item, index) => {
    if (
      typeof item?.question !== 'string' ||
      !Array.isArray(item?.options) ||
      item.options.length !== 4 ||
      typeof item?.correctIndex !== 'number' ||
      item.correctIndex < 0 ||
      item.correctIndex > 3 ||
      typeof item?.explanation !== 'string'
    ) {
      throw new Error(`Invalid question shape at index ${index}.`);
    }

    return {
      question: item.question,
      options: item.options,
      correctIndex: item.correctIndex,
      explanation: item.explanation
    };
  });
}

async function generateQuizHandler({ topic, context = [], count = 4 }) {
  const cacheKey = JSON.stringify({ topic, context, count });
  const cached = quizCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { success: true, questions: cached.questions, cached: true };
  }

  const groq = createGroqClient();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_completion_tokens: 1600,
    top_p: 1,
    stream: false,
    messages: [
      {
        role: 'system',
        content: 'You are a JSON-only quiz generator. Return valid JSON only.'
      },
      {
        role: 'user',
        content: buildQuizPrompt(topic, context, count)
      }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('Empty response from quiz provider.');
  }

  const jsonString = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(jsonString);
  const questions = normalizeQuestions(parsed);

  quizCache.set(cacheKey, {
    questions,
    expiresAt: Date.now() + 60 * 60 * 1000
  });

  return { success: true, questions, cached: false };
}

function registerTool(name, description, schema, handler) {
  toolHandlers.set(name, handler);

  // Keep MCP registry in sync for when HTTP MCP endpoint is enabled later.
  try {
    mcpServer.tool(name, description, schema, async (args) => {
      const result = await handler(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }]
      };
    });
  } catch (error) {
    console.warn(`[mcpServer] Tool registration warning for ${name}:`, error.message);
  }
}

registerTool(
  'get_user_progress',
  'Get user progress summary including XP, level, streak and achievements',
  {
    userId: z.string().uuid()
  },
  async ({ userId }) => {
    const result = await userProgressService.getUserProgress(userId);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to fetch user progress.' };
    }

    const progress = result.data?.progress || null;
    return {
      success: true,
      data: {
        progress,
        achievements: result.data?.achievements || []
      }
    };
  }
);

registerTool(
  'get_user_activity_stats',
  'Get user activity statistics and heatmap data for recent days',
  {
    userId: z.string().uuid(),
    days: z.number().int().min(1).max(365).optional().default(30)
  },
  async ({ userId, days = 30 }) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const [statsResult, heatmapResult] = await Promise.all([
      userActivityService.getActivityStats(userId),
      userActivityService.getHeatmapData(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
    ]);

    if (!statsResult.success && !heatmapResult.success) {
      return {
        success: false,
        error: heatmapResult.error || statsResult.error || 'Failed to fetch activity data.'
      };
    }

    return {
      success: true,
      data: {
        stats: statsResult.stats || null,
        heatmapData: heatmapResult.heatmapData || {},
        totalDays: heatmapResult.totalDays || 0,
        dateRange: heatmapResult.dateRange || null
      }
    };
  }
);

registerTool(
  'get_user_certificates',
  'Get all certificates earned by a user',
  {
    userId: z.string().uuid()
  },
  async ({ userId }) => {
    const result = await certificateService.getUserCertificates(userId);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to fetch user certificates.' };
    }

    return {
      success: true,
      data: result.data || []
    };
  }
);

registerTool(
  'get_job_recommendations',
  'Get personalized job recommendations for a user based on resume skills',
  {
    userId: z.string().uuid(),
    limit: z.number().int().min(1).max(50).optional().default(10)
  },
  async ({ userId, limit = 10 }) => {
    const result = await jobRecommendationService.getRecommendations(userId, limit);
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch job recommendations.'
      };
    }

    return {
      success: true,
      data: result.data || { recommendations: [] }
    };
  }
);

registerTool(
  'search_jobs',
  'Search jobs by skills with optional location and type filters',
  {
    skills: z.array(z.string().min(1)).min(1),
    location: z.string().optional(),
    type: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional().default(10)
  },
  async ({ skills, location, type, limit = 10 }) => {
    const fetchLimit = Math.max(limit * 5, 50);
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(fetchLimit);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to search jobs.'
      };
    }

    const normalizedSkills = skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
    const normalizedLocation = location?.trim().toLowerCase();
    const normalizedType = type?.trim().toLowerCase();

    const filtered = (jobs || [])
      .filter((job) => {
        if (normalizedLocation && !(job.location || '').toLowerCase().includes(normalizedLocation)) {
          return false;
        }

        if (normalizedType && !(job.type || '').toLowerCase().includes(normalizedType)) {
          return false;
        }

        return true;
      })
      .map((job) => {
        const haystack = `${job.title || ''} ${job.description || ''} ${job.department || ''}`.toLowerCase();
        const matchedSkills = normalizedSkills.filter((skill) => haystack.includes(skill));
        const score = normalizedSkills.length > 0
          ? Math.round((matchedSkills.length / normalizedSkills.length) * 100)
          : 0;

        return {
          ...job,
          skill_match_score: score,
          matched_skills: matchedSkills
        };
      })
      .filter((job) => job.skill_match_score > 0)
      .sort((a, b) => b.skill_match_score - a.skill_match_score)
      .slice(0, limit);

    return {
      success: true,
      data: {
        jobs: filtered,
        totalMatches: filtered.length
      }
    };
  }
);

registerTool(
  'get_user_resume_skills',
  'Get extracted skills and work experience from the user\'s active resume',
  {
    userId: z.string().uuid()
  },
  async ({ userId }) => {
    const { data, error } = await supabaseAdmin
      .from('parsed_resumes')
      .select('resume_data')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data?.resume_data) {
      return {
        success: false,
        error: 'No active resume found for this user.'
      };
    }

    const resumeData = data.resume_data;
    const featuredSkills = Array.isArray(resumeData?.skills?.featuredSkills)
      ? resumeData.skills.featuredSkills.filter((item) => typeof item === 'string')
      : [];
    const skillDescriptions = Array.isArray(resumeData?.skills?.descriptions)
      ? resumeData.skills.descriptions.filter((item) => typeof item === 'string')
      : [];
    const workExperiences = Array.isArray(resumeData?.workExperiences)
      ? resumeData.workExperiences
      : [];

    return {
      success: true,
      data: {
        skills: featuredSkills,
        skillDescriptions,
        workExperiences
      }
    };
  }
);

registerTool(
  'get_recommended_roadmaps',
  'Get AI-generated roadmap recommendations for a user',
  {
    userId: z.string().uuid(),
    limit: z.number().int().min(1).max(10).optional().default(3)
  },
  async ({ userId, limit = 3 }) => {
    const result = await surveyService.getUserRecommendations(userId);
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch user roadmap recommendations.'
      };
    }

    const rows = Array.isArray(result.data) ? result.data : [];
    const latest = rows[0] || null;
    const roadmaps = Array.isArray(latest?.recommended_roadmaps)
      ? latest.recommended_roadmaps.slice(0, limit)
      : [];

    return {
      success: true,
      data: {
        recommendations: roadmaps,
        recommendationReason: latest?.recommendation_reason || null,
        aiConfidenceScore: latest?.ai_confidence_score || null,
        generatedAt: latest?.generated_at || null
      }
    };
  }
);

registerTool(
  'get_all_roadmaps',
  'Get all available roadmap records',
  {},
  async () => {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch roadmaps table.'
      };
    }

    return {
      success: true,
      data: data || []
    };
  }
);

registerTool(
  'get_roadmap_info',
  'Get details for one roadmap by id',
  {
    roadmapId: z.string().min(1)
  },
  async ({ roadmapId }) => {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .or(`id.eq.${roadmapId},roadmap_id.eq.${roadmapId}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch roadmap information.'
      };
    }

    if (!data) {
      return {
        success: false,
        error: `Roadmap not found: ${roadmapId}`
      };
    }

    return {
      success: true,
      data
    };
  }
);

registerTool(
  'get_platform_analytics',
  'Get platform-level analytics summary (admin use)',
  {
    adminKey: z.string().optional()
  },
  async () => {
    const result = await analyticsService.getPlatformAnalytics();
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch platform analytics.'
      };
    }

    return {
      success: true,
      data: result.data || {}
    };
  }
);

registerTool(
  'get_learning_analytics',
  'Get learning analytics for a date range (admin use)',
  {
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    adminKey: z.string().optional()
  },
  async ({ startDate, endDate }) => {
    const end = endDate || new Date().toISOString().split('T')[0];
    const startDateObj = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const start = Number.isNaN(startDateObj.getTime())
      ? new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
      : startDateObj.toISOString().split('T')[0];

    const result = await analyticsService.getLearningAnalytics(start, end);
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch learning analytics.'
      };
    }

    return {
      success: true,
      data: {
        ...result.data,
        dateRange: { start, end }
      }
    };
  }
);

registerTool(
  'generate_quiz',
  'Generate a multiple-choice quiz for a given topic with optional context',
  {
    topic: z.string().min(2),
    context: z.array(z.string()).optional().default([]),
    count: z.number().int().min(2).max(10).optional().default(4)
  },
  generateQuizHandler
);

export async function invokeMcpTool(name, args) {
  const handler = toolHandlers.get(name);
  if (!handler) {
    throw new Error(`MCP tool not registered: ${name}`);
  }
  return handler(args);
}

export function getRegisteredMcpTools() {
  return Array.from(toolHandlers.keys());
}

export default mcpServer;
