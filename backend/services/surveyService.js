import { supabaseAdmin } from '../lib/supabase.js';
import { mapOpenRouterError, openRouterProvider } from './openRouterProvider.js';

const OPENROUTER_SURVEY_MODEL =
  process.env.OPENROUTER_SURVEY_MODEL ||
  process.env.OPENROUTER_MODEL ||
  process.env.OPENROUTER_ROADMAP_MODEL ||
  'nvidia/nemotron-3-super-120b-a12b:free';
const OPENROUTER_SURVEY_MAX_TOKENS = Number.isFinite(Number(process.env.OPENROUTER_SURVEY_MAX_TOKENS))
  ? Math.max(512, Math.min(12000, Number(process.env.OPENROUTER_SURVEY_MAX_TOKENS)))
  : 8192;
const OPENROUTER_SURVEY_TEMPERATURE = Number.isFinite(Number(process.env.OPENROUTER_SURVEY_TEMPERATURE))
  ? Math.max(0, Math.min(1, Number(process.env.OPENROUTER_SURVEY_TEMPERATURE)))
  : 0.7;

function getSurveyModelVersion() {
  const rawValue =
    process.env.OPENROUTER_SURVEY_MODEL_VERSION ||
    process.env.OPENROUTER_MODEL_VERSION ||
    'openrouter-v1';

  const normalized = String(rawValue).trim();
  if (!normalized) {
    return 'openrouter-v1';
  }

  return normalized.slice(0, 20);
}

export const surveyService = {
  /**
   * Get survey data for a user
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async getUserSurvey(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_survey_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_latest', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user survey:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data ? data.responses : null // Return the JSONB responses
      };
    } catch (error) {
      console.error('Error in getUserSurvey:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save or update survey data for a user
   * @param {string} userId - User ID
   * @param {Object} surveyData - Survey answers
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async saveSurvey(userId, surveyData) {
    try {
      // Process survey data to extract key values for filtering
      const skillLevelMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      const timeCommitmentMap = { 
        '<5 hours': 3, 
        '5–10 hours': 7, 
        '10+ hours': 15
      };

      // Create preference tags from survey responses
      const preferenceTags = [];
      if (surveyData.techInterest) {
        const interests = Array.isArray(surveyData.techInterest) ? surveyData.techInterest : [surveyData.techInterest];
        preferenceTags.push(...interests.map(interest => `tech:${interest.toLowerCase()}`));
      }
      if (surveyData.goal) {
        const goals = Array.isArray(surveyData.goal) ? surveyData.goal : [surveyData.goal];
        preferenceTags.push(...goals.map(goal => `goal:${goal.toLowerCase()}`));
      }
      if (surveyData.learningStyle) {
        const styles = Array.isArray(surveyData.learningStyle) ? surveyData.learningStyle : [surveyData.learningStyle];
        preferenceTags.push(...styles.map(style => `style:${style.toLowerCase()}`));
      }

      const surveyRecord = {
        user_id: userId,
        survey_version: 'v1.0',
        responses: surveyData, // Store all responses as JSONB
        user_profile: {
          userType: surveyData.userType,
          skillLevel: surveyData.skillLevel,
          techInterest: surveyData.techInterest,
          goal: surveyData.goal,
          timeCommitment: surveyData.timeCommitment,
          learningStyle: surveyData.learningStyle,
          wantsRecommendations: surveyData.wantsRecommendations
        },
        preference_tags: preferenceTags,
        skill_level_numeric: skillLevelMap[surveyData.skillLevel] || 1,
        time_commitment_hours: timeCommitmentMap[surveyData.timeCommitment] || 5,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_latest: true
      };

      // First, mark any existing responses as not latest
      await supabaseAdmin
        .from('user_survey_responses')
        .update({ is_latest: false })
        .eq('user_id', userId);

      // Insert new response
      const { data, error } = await supabaseAdmin
        .from('user_survey_responses')
        .insert(surveyRecord)
        .select()
        .single();

      if (error) {
        console.error('Error saving survey:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error in saveSurvey:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user has completed survey
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, completed?: boolean, error?: string}>}
   */
  async isSurveyCompleted(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_survey_responses')
        .select('id, completed_at')
        .eq('user_id', userId)
        .eq('is_latest', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking survey completion:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        completed: !!data && !!data.completed_at 
      };
    } catch (error) {
      console.error('Error in isSurveyCompleted:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get survey analytics (for admin/analytics)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async getSurveyAnalytics() {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_survey_responses')
        .select(`
          responses,
          user_profile,
          preference_tags,
          skill_level_numeric,
          time_commitment_hours,
          completed_at
        `)
        .eq('is_latest', true);

      if (error) {
        console.error('Error fetching survey analytics:', error);
        return { success: false, error: error.message };
      }

      // Process analytics data from JSONB responses
      const analytics = {
        totalResponses: data.length,
        userTypes: this._groupByJsonField(data, 'userType'),
        skillLevels: this._groupByJsonField(data, 'skillLevel'),
        techInterests: this._groupByJsonField(data, 'techInterest'),
        goals: this._groupByJsonField(data, 'goal'),
        timeCommitments: this._groupByJsonField(data, 'timeCommitment'),
        learningStyles: this._groupByJsonField(data, 'learningStyle'),
        wantsRecommendations: this._groupByJsonField(data, 'wantsRecommendations'),
        skillLevelDistribution: this._groupBy(data, 'skill_level_numeric'),
        timeCommitmentDistribution: this._groupBy(data, 'time_commitment_hours')
      };

      return { 
        success: true, 
        data: analytics 
      };
    } catch (error) {
      console.error('Error in getSurveyAnalytics:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Helper function to group survey responses by field
   * @private
   */
  _groupBy(array, field) {
    return array.reduce((acc, item) => {
      const key = item[field] || 'Not specified';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * Helper function to group survey responses by JSONB field
   * @private
   */
  _groupByJsonField(array, field) {
    return array.reduce((acc, item) => {
      const value = item.responses && item.responses[field];
      if (!value) {
        acc['Not specified'] = (acc['Not specified'] || 0) + 1;
        return acc;
      }
      
      // Handle arrays (multiple selections)
      if (Array.isArray(value)) {
        value.forEach(v => {
          acc[v] = (acc[v] || 0) + 1;
        });
      } else {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
  },

  /**
   * Generate AI-powered roadmap recommendations based on user survey
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async generateAIRoadmap(userId) {
    try {
      // First, get user's survey data
      const surveyResult = await this.getUserSurvey(userId);
      if (!surveyResult.success || !surveyResult.data) {
        return { 
          success: false, 
          error: 'User must complete survey first to generate AI recommendations' 
        };
      }

      const surveyData = surveyResult.data;
      
      // Build comprehensive AI prompt based on survey responses
      const prompt = this._buildAIRoadmapPrompt(surveyData);
      
      // Generate recommendations using shared OpenRouter provider
      console.log('🤖 Generating AI roadmap with OpenRouter...');
      const aiRecommendations = await this._generateAIRecommendations(prompt, surveyData);
      
      if (!aiRecommendations) {
        return {
          success: false,
          error: 'Failed to generate AI recommendations. Please try again.'
        };
      }
      
      // Save recommendation to database
      const { data: recommendation, error: saveError } = await supabaseAdmin
        .from('user_recommendations')
        .insert({
          user_id: userId,
          recommended_roadmaps: aiRecommendations.roadmaps,
          recommendation_reason: aiRecommendations.reasoning,
          ai_confidence_score: aiRecommendations.confidence,
          ai_model_version: getSurveyModelVersion(),
          generation_method: 'ai_generated'
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving AI recommendation:', saveError);
        return { success: false, error: saveError.message };
      }

      return {
        success: true,
        data: {
          recommendations: aiRecommendations,
          savedRecommendation: recommendation
        }
      };

    } catch (error) {
      console.error('Error in generateAIRoadmap:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's existing recommendations
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async getUserRecommendations(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching user recommendations:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('Error in getUserRecommendations:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Build AI prompt for roadmap generation with resources
   * @private
   */
  _buildAIRoadmapPrompt(surveyData) {
    const interests = Array.isArray(surveyData.techInterest) ? surveyData.techInterest.join(', ') : surveyData.techInterest;
    const goals = Array.isArray(surveyData.goal) ? surveyData.goal.join(', ') : surveyData.goal;
    const learningStyles = Array.isArray(surveyData.learningStyle) ? surveyData.learningStyle.join(', ') : surveyData.learningStyle;

    return `You are an expert career advisor and learning path curator. Generate a personalized learning roadmap with curated resources.

USER PROFILE:
- User Type: ${surveyData.userType}
- Current Skill Level: ${surveyData.skillLevel}
- Tech Interests: ${interests}
- Career Goals: ${goals}
- Time Commitment: ${surveyData.timeCommitment}
- Learning Styles: ${learningStyles}
- Wants Recommendations: ${surveyData.wantsRecommendations}

TASK:
Generate 3-4 personalized learning roadmaps with curated resources. For each roadmap, provide:

1. Roadmap ID (use kebab-case like: frontend-react, python-data-science, etc.)
2. Priority (1 = highest, 2 = medium, 3 = lower)
3. Match Score (0.0 to 1.0 - how well it fits the user's profile)
4. Estimated Completion Weeks (realistic timeline)
5. Weekly Hours Needed (based on their time commitment)
6. Reasoning (why this roadmap is recommended for this user)
7. 5-7 REAL Learning Resources with:
   - id: unique identifier (kebab-case)
   - title: Resource name
   - type: One of [Video, Course, Documentation, Book, Practice, Interactive, Tutorial]
   - url: Real, working URL (verify these are actual resources)
   - duration: Time to complete (e.g., "12 hours", "3 weeks", "Self-paced")
   - cost: "Free" or "Paid"
   - description: Brief explanation of what makes this resource valuable

IMPORTANT GUIDELINES:
- Prioritize FREE resources over paid ones
- Include diverse resource types (videos, courses, docs, practice platforms, books)
- Match resources to their skill level (Beginner/Intermediate/Advanced)
- Prioritize resource types based on their learning style preference
- Only suggest REAL, VERIFIED resources that actually exist (e.g., official docs, popular courses, well-known platforms)
- For videos, prefer YouTube channels like freeCodeCamp, Traversy Media, etc.
- For courses, use Udemy, Coursera, edX, Scrimba, etc.
- For practice, use platforms like Kaggle, Frontend Mentor, LeetCode, etc.
- For docs, use official documentation sites

RESPONSE FORMAT (JSON):
{
  "roadmaps": [
    {
      "roadmap_id": "frontend-react",
      "priority": 1,
      "score": 0.92,
      "estimated_completion_weeks": 12,
      "weekly_hours_needed": 7,
      "reasoning": "Perfect match for Web Development interest at Beginner level with focus on building practical projects",
      "resources": [
        {
          "id": "react-official-docs",
          "title": "Official React Documentation",
          "type": "Documentation",
          "url": "https://react.dev",
          "duration": "Self-paced",
          "cost": "Free",
          "description": "The official React documentation is the best starting point with interactive examples and comprehensive guides"
        },
        {
          "id": "react-freecodecamp-video",
          "title": "React Course - freeCodeCamp",
          "type": "Video",
          "url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
          "duration": "12 hours",
          "cost": "Free",
          "description": "Comprehensive React tutorial covering everything from basics to advanced concepts"
        }
      ]
    }
  ],
  "reasoning": {
    "summary": "Personalized recommendations for ${surveyData.userType} interested in ${interests}",
    "details": [
      "Primary recommendation based on your ${interests} interest",
      "Adjusted for ${surveyData.skillLevel} skill level",
      "Designed for ${surveyData.timeCommitment} weekly commitment"
    ],
    "learning_approach": [
      "Start with video tutorials for visual learning",
      "Build practical projects alongside theory"
    ],
    "next_steps": [
      "Review the recommended roadmaps below",
      "Start with the highest priority roadmap",
      "Set up a consistent learning schedule"
    ]
  },
  "confidence": 0.85
}

Generate the response as valid JSON only. No additional text or markdown.`;
  },

  /**
   * Generate AI recommendations using shared OpenRouter provider
   * @private
   */
  async _generateAIRecommendations(prompt, surveyData) {
    try {
      console.log('🤖 Calling OpenRouter AI API...');
      console.log('📋 Prompt length:', prompt.length, 'characters');

      const completion = await openRouterProvider.chatCompletion({
        model: OPENROUTER_SURVEY_MODEL,
        maxTokens: OPENROUTER_SURVEY_MAX_TOKENS,
        temperature: OPENROUTER_SURVEY_TEMPERATURE,
        messages: [
          {
            role: 'system',
            content:
              'You are a strict JSON generator for personalized learning roadmap recommendations. Return valid JSON only with no markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      let text = completion.text;

      console.log('✅ OpenRouter AI response received successfully');
      console.log('📄 Response length:', text.length, 'characters');
      console.log('📄 First 200 chars:', text.substring(0, 200));
      
      // Clean up the response (remove markdown code blocks if present)
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('🧹 Cleaned response, first 200 chars:', text.substring(0, 200));
      
      // Parse JSON response
      let aiRecommendations;
      try {
        aiRecommendations = JSON.parse(text);
        console.log('✅ Successfully parsed JSON response');
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('❌ Failed to parse text (first 500 chars):', text.substring(0, 500));
        return this._generateFallbackRecommendations(surveyData);
      }
      
      // Validate response structure
      if (!aiRecommendations.roadmaps || !Array.isArray(aiRecommendations.roadmaps)) {
        console.error('❌ Invalid AI response structure - missing or invalid roadmaps array');
        console.error('❌ Response has keys:', Object.keys(aiRecommendations));
        return this._generateFallbackRecommendations(surveyData);
      }
      
      if (aiRecommendations.roadmaps.length === 0) {
        console.error('❌ AI returned empty roadmaps array');
        return this._generateFallbackRecommendations(surveyData);
      }
      
      console.log(`✅ Generated ${aiRecommendations.roadmaps.length} roadmaps with AI`);
      
      // Validate each roadmap has resources
      aiRecommendations.roadmaps.forEach((roadmap, index) => {
        const resourceCount = roadmap.resources ? roadmap.resources.length : 0;
        console.log(`  ✓ Roadmap ${index + 1}: ${roadmap.roadmap_id} - ${resourceCount} resources`);
        
        if (resourceCount === 0) {
          console.warn(`  ⚠️  Warning: Roadmap ${roadmap.roadmap_id} has no resources!`);
        }
      });
      
      return aiRecommendations;
      
    } catch (error) {
      const mapped = mapOpenRouterError(error);
      console.error('❌ OpenRouter error in _generateAIRecommendations:', mapped.statusCode, mapped.error);
      console.error('❌ Raw error:', error?.message || error);
      
      return this._generateFallbackRecommendations(surveyData);
    }
  },

  /**
   * Generate fallback recommendations (minimal error response when AI fails)
   * @private
   */
  _generateFallbackRecommendations(surveyData) {
    const interests = Array.isArray(surveyData.techInterest) ? surveyData.techInterest : [surveyData.techInterest];
    const primaryInterest = interests[0];
    
    console.error('⚠️  Fallback triggered - AI generation failed');
    
    // Return minimal error response - NO dummy data
    return {
      roadmaps: [],
      reasoning: {
        summary: `Unable to generate AI recommendations at this time`,
        details: [
          'AI service is temporarily unavailable',
          'Please check your OPENROUTER_API_KEY configuration',
          'Try again in a few moments'
        ],
        learning_approach: [
          'AI-powered personalized recommendations will be available once the service is restored'
        ],
        next_steps: [
          'Click "Generate AI Roadmap" button again to retry',
          'Ensure your internet connection is stable',
          'Contact support if the issue persists'
        ]
      },
      confidence: 0.0,
      error: true
    };
  },

  /**
   * Get learning approach recommendations (removed - AI generates this)
   * @private
   */
  _getLearningApproach(surveyData) {
    const styles = Array.isArray(surveyData.learningStyle) ? surveyData.learningStyle : [surveyData.learningStyle];
    let approach = [];

    if (styles.includes('Videos')) {
      approach.push('Start with video tutorials for visual learning');
    }
    if (styles.includes('Projects')) {
      approach.push('Build practical projects alongside theory');
    }
    if (styles.includes('Interactive tutorials')) {
      approach.push('Use interactive coding platforms and exercises');
    }
    if (styles.includes('Reading')) {
      approach.push('Supplement with comprehensive documentation and guides');
    }

    return approach.length > 0 ? approach : ['Balanced mix of theory and practice'];
  },

  /**
   * Get next steps recommendations (removed - AI generates this)
   * @private
   */
  _getNextSteps(surveyData) {
    const steps = [
      'Review the recommended roadmaps below',
      'Start with the highest priority roadmap',
      'Set up a consistent learning schedule'
    ];

    if (surveyData.skillLevel === 'Beginner') {
      steps.push('Focus on building strong fundamentals first');
    }

    if (surveyData.timeCommitment === '<5 hours') {
      steps.push('Break learning into small, manageable daily sessions');
    }

    steps.push('Track your progress and adjust as needed');
    return steps;
  }
};