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
  }
};