import { supabase } from '../lib/supabase.js';

export const surveyService = {
  /**
   * Get survey data for a user
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async getUserSurvey(userId) {
    try {
      const { data, error } = await supabase
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
      await supabase
        .from('user_survey_responses')
        .update({ is_latest: false })
        .eq('user_id', userId);

      // Insert new response
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      
      // For now, we'll create a mock AI response since this is backend
      // In production, you'd call an AI service here
      const aiRecommendations = await this._generateMockAIRecommendations(surveyData);
      
      // Save recommendation to database
      const { data: recommendation, error: saveError } = await supabase
        .from('user_recommendations')
        .insert({
          user_id: userId,
          recommended_roadmaps: aiRecommendations.roadmaps,
          recommendation_reason: aiRecommendations.reasoning,
          ai_confidence_score: aiRecommendations.confidence,
          ai_model_version: 'v1.0',
          generation_method: 'rule_based'
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
      const { data, error } = await supabase
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
   * Build AI prompt for roadmap generation
   * @private
   */
  _buildAIRoadmapPrompt(surveyData) {
    const interests = Array.isArray(surveyData.techInterest) ? surveyData.techInterest.join(', ') : surveyData.techInterest;
    const goals = Array.isArray(surveyData.goal) ? surveyData.goal.join(', ') : surveyData.goal;
    const learningStyles = Array.isArray(surveyData.learningStyle) ? surveyData.learningStyle.join(', ') : surveyData.learningStyle;

    return `Generate a personalized learning roadmap for a user with the following profile:

User Type: ${surveyData.userType}
Current Skill Level: ${surveyData.skillLevel}
Tech Interests: ${interests}
Goals: ${goals}
Time Commitment: ${surveyData.timeCommitment}
Learning Styles: ${learningStyles}
Wants Recommendations: ${surveyData.wantsRecommendations}

Based on this information, recommend:
1. 3-5 specific learning roadmaps that match their interests and goals
2. The recommended order of learning
3. Time estimates for each roadmap component
4. Specific resources and learning materials
5. Reasoning for why these recommendations fit their profile

Focus on practical, achievable paths that align with their available time and learning preferences.`;
  },

  /**
   * Generate mock AI recommendations (replace with actual AI service call)
   * @private
   */
  async _generateMockAIRecommendations(surveyData) {
    // This is a sophisticated rule-based recommendation system
    // In production, replace with actual AI service call
    
    const roadmapMappings = {
      'Web Development': ['frontend-react', 'fullstack-mern', 'javascript-fundamentals'],
      'Data Science': ['python-data-science', 'machine-learning-basics', 'data-analysis'],
      'Mobile Apps': ['react-native', 'flutter-development', 'ios-swift'],
      'DevOps': ['docker-kubernetes', 'aws-fundamentals', 'ci-cd-pipeline'],
      'AI/ML': ['machine-learning-basics', 'deep-learning', 'python-ai'],
      'Cybersecurity': ['security-fundamentals', 'ethical-hacking', 'network-security'],
      'Game Development': ['unity-game-dev', 'unreal-engine', 'game-design'],
      'Not sure yet': ['programming-fundamentals', 'web-development-intro', 'career-exploration']
    };

    const skillLevelAdjustments = {
      'Beginner': { prefix: 'intro-to-', estimateMultiplier: 1.5 },
      'Intermediate': { prefix: '', estimateMultiplier: 1.0 },
      'Advanced': { prefix: 'advanced-', estimateMultiplier: 0.8 }
    };

    const timeCommitmentFactors = {
      '<5 hours': { weeklyHours: 3, totalWeeks: 16 },
      '5–10 hours': { weeklyHours: 7, totalWeeks: 12 },
      '10+ hours': { weeklyHours: 15, totalWeeks: 8 }
    };

    let recommendedRoadmaps = [];
    let reasoning = [];

    // Primary recommendations based on tech interests
    const interests = Array.isArray(surveyData.techInterest) ? surveyData.techInterest : [surveyData.techInterest];
    const primaryInterest = interests[0];
    
    if (roadmapMappings[primaryInterest]) {
      const mappedRoadmaps = roadmapMappings[primaryInterest];
      const adjustment = skillLevelAdjustments[surveyData.skillLevel] || skillLevelAdjustments['Beginner'];
      const timeFactors = timeCommitmentFactors[surveyData.timeCommitment] || timeCommitmentFactors['5–10 hours'];

      mappedRoadmaps.slice(0, 3).forEach((roadmapId, index) => {
        const estimatedWeeks = Math.ceil(timeFactors.totalWeeks * adjustment.estimateMultiplier);
        recommendedRoadmaps.push({
          roadmap_id: roadmapId,
          score: 0.9 - (index * 0.1),
          priority: index + 1,
          estimated_completion_weeks: estimatedWeeks,
          weekly_hours_needed: timeFactors.weeklyHours,
          reasoning: `Perfect match for ${primaryInterest} interest at ${surveyData.skillLevel} level`
        });
      });

      reasoning.push(`Primary recommendation based on your ${primaryInterest} interest`);
      reasoning.push(`Adjusted for ${surveyData.skillLevel} skill level`);
      reasoning.push(`Designed for ${surveyData.timeCommitment} weekly commitment`);
    }

    // Secondary recommendations based on goals
    const goals = Array.isArray(surveyData.goal) ? surveyData.goal : [surveyData.goal];
    if (goals.includes('Get a job') || goals.includes('Switch careers')) {
      reasoning.push('Prioritized job-market relevant skills for career transition');
    }

    // Confidence calculation
    let confidence = 0.7;
    if (surveyData.wantsRecommendations === 'Yes') confidence += 0.1;
    if (interests.length <= 2) confidence += 0.1; // More focused interests = higher confidence
    if (surveyData.skillLevel !== 'Beginner') confidence += 0.1;

    return {
      roadmaps: recommendedRoadmaps,
      reasoning: {
        summary: `Personalized recommendations for ${surveyData.userType} interested in ${interests.join(', ')}`,
        details: reasoning,
        learning_approach: this._getLearningApproach(surveyData),
        next_steps: this._getNextSteps(surveyData)
      },
      confidence: Math.min(confidence, 1.0)
    };
  },

  /**
   * Get learning approach recommendations
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
   * Get next steps recommendations
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