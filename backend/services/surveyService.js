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
        .from('user_survey')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user survey:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data || null 
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
      const surveyRecord = {
        user_id: userId,
        user_type: surveyData.userType,
        skill_level: surveyData.skillLevel,
        tech_interest: surveyData.techInterest,
        goal: surveyData.goal,
        time_commitment: surveyData.timeCommitment,
        learning_style: surveyData.learningStyle,
        wants_recommendations: surveyData.wantsRecommendations,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to upsert (insert or update if exists)
      const { data, error } = await supabase
        .from('user_survey')
        .upsert(surveyRecord, {
          onConflict: 'user_id'
        })
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
        .from('user_survey')
        .select('id, completed_at')
        .eq('user_id', userId)
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
        .from('user_survey')
        .select(`
          user_type,
          skill_level,
          tech_interest,
          goal,
          time_commitment,
          learning_style,
          wants_recommendations,
          completed_at
        `);

      if (error) {
        console.error('Error fetching survey analytics:', error);
        return { success: false, error: error.message };
      }

      // Process analytics data
      const analytics = {
        totalResponses: data.length,
        userTypes: this._groupBy(data, 'user_type'),
        skillLevels: this._groupBy(data, 'skill_level'),
        techInterests: this._groupBy(data, 'tech_interest'),
        goals: this._groupBy(data, 'goal'),
        timeCommitments: this._groupBy(data, 'time_commitment'),
        learningStyles: this._groupBy(data, 'learning_style'),
        wantsRecommendations: this._groupBy(data, 'wants_recommendations')
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
  }
};