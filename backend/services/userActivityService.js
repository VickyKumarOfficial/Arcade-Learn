/**
 * User Activity Service
 * Handles activity logging and heatmap data for Arcade Learn
 * Integrates with user_activity_log table in Supabase
 */

import { supabase } from '../lib/supabase.js';

class UserActivityService {
  /**
   * Activity Types Enum
   */
  static ACTIVITY_TYPES = {
    TEST_COMPLETED: 'test_completed',
    ROADMAP_COMPLETED: 'roadmap_completed',
    LOGIN: 'login',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    QUIZ_ATTEMPTED: 'quiz_attempted',
    RESUME_UPDATED: 'resume_updated',
    JOB_APPLIED: 'job_applied',
    ROADMAP_STARTED: 'roadmap_started',
    PROFILE_UPDATED: 'profile_updated',
    CERTIFICATE_EARNED: 'certificate_earned'
  };

  /**
   * Log a user activity (increments count if activity exists for same date)
   * @param {string} userId - User UUID
   * @param {string} activityType - Type of activity (use ACTIVITY_TYPES enum)
   * @param {object} metadata - Additional activity details (optional)
   * @param {string} activityDate - Activity date in YYYY-MM-DD format (defaults to today)
   * @returns {Promise<object>} - Result with success status and activity ID
   */
  async logActivity(userId, activityType, metadata = {}, activityDate = null) {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!activityType) {
        throw new Error('Activity type is required');
      }

      // Validate activity type
      const validTypes = Object.values(UserActivityService.ACTIVITY_TYPES);
      if (!validTypes.includes(activityType)) {
        console.warn(`Invalid activity type: ${activityType}. Using as custom type.`);
      }

      // Use current date if not provided
      const logDate = activityDate || new Date().toISOString().split('T')[0];

      console.log(`📊 Logging activity: ${activityType} for user ${userId} on ${logDate}`);

      // Call the database function to log activity
      const { data, error } = await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_activity_date: logDate,
        p_metadata: metadata
      });

      if (error) {
        console.error('Error logging activity:', error);
        throw error;
      }

      console.log(`✅ Activity logged successfully. ID: ${data}`);

      return {
        success: true,
        activityId: data,
        message: 'Activity logged successfully'
      };
    } catch (error) {
      console.error('Error in logActivity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get heatmap data for a user (for visualization)
   * @param {string} userId - User UUID
   * @param {string} startDate - Start date (YYYY-MM-DD) - defaults to 1 year ago
   * @param {string} endDate - End date (YYYY-MM-DD) - defaults to today
   * @param {array} activityTypes - Filter by specific activity types (optional)
   * @returns {Promise<object>} - Heatmap data in format suitable for Heat.js
   */
  async getHeatmapData(userId, startDate = null, endDate = null, activityTypes = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Default to past year if not specified
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString().split('T')[0];

      console.log(`📊 Fetching heatmap data for user ${userId} from ${start} to ${end}`);

      // Call the database function to get heatmap data
      const { data, error } = await supabase.rpc('get_user_activity_heatmap', {
        p_user_id: userId,
        p_start_date: start,
        p_end_date: end,
        p_activity_types: activityTypes
      });

      if (error) {
        console.error('Error fetching heatmap data:', error);
        throw error;
      }

      // Transform data into Heat.js compatible format
      // Heat.js expects: { "2025-01-15": 5, "2025-01-16": 12, ... }
      const heatmapData = {};
      
      if (data && data.length > 0) {
        data.forEach(row => {
          heatmapData[row.activity_date] = row.total_count;
        });
      }

      console.log(`✅ Fetched ${Object.keys(heatmapData).length} days of activity data`);

      return {
        success: true,
        heatmapData,
        detailedData: data, // Include breakdown by activity type
        totalDays: Object.keys(heatmapData).length,
        dateRange: { start, end }
      };
    } catch (error) {
      console.error('Error in getHeatmapData:', error);
      return {
        success: false,
        error: error.message,
        heatmapData: {},
        detailedData: []
      };
    }
  }

  /**
   * Get activity statistics for a user (streaks, totals, trends)
   * @param {string} userId - User UUID
   * @param {number} year - Year to get stats for (defaults to current year)
   * @returns {Promise<object>} - Statistics object
   */
  async getActivityStats(userId, year = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const statsYear = year || new Date().getFullYear();

      console.log(`📊 Fetching activity stats for user ${userId} for year ${statsYear}`);

      // Call the database function to get statistics
      const { data, error } = await supabase.rpc('get_user_activity_stats', {
        p_user_id: userId,
        p_year: statsYear
      });

      if (error) {
        console.error('Error fetching activity stats:', error);
        throw error;
      }

      const stats = data && data.length > 0 ? data[0] : {
        total_activities: 0,
        current_streak: 0,
        longest_streak: 0,
        most_active_month: 'N/A',
        most_active_count: 0,
        avg_activities_per_week: 0
      };

      console.log(`✅ Stats fetched - Current streak: ${stats.current_streak} days`);

      return {
        success: true,
        stats: {
          totalActivities: stats.total_activities,
          currentStreak: stats.current_streak,
          longestStreak: stats.longest_streak,
          mostActiveMonth: stats.most_active_month.trim(),
          mostActiveCount: stats.most_active_count,
          avgActivitiesPerWeek: parseFloat(stats.avg_activities_per_week)
        },
        year: statsYear
      };
    } catch (error) {
      console.error('Error in getActivityStats:', error);
      return {
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
      };
    }
  }

  /**
   * Get recent activities for a user
   * @param {string} userId - User UUID
   * @param {number} limit - Number of recent activities to fetch
   * @returns {Promise<object>} - Recent activities
   */
  async getRecentActivities(userId, limit = 10) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        activities: data || []
      };
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return {
        success: false,
        error: error.message,
        activities: []
      };
    }
  }

  /**
   * Bulk log multiple activities at once
   * @param {string} userId - User UUID
   * @param {array} activities - Array of {type, date, metadata} objects
   * @returns {Promise<object>} - Result with success count
   */
  async bulkLogActivities(userId, activities) {
    try {
      if (!userId || !activities || activities.length === 0) {
        throw new Error('User ID and activities array are required');
      }

      console.log(`📊 Bulk logging ${activities.length} activities for user ${userId}`);

      let successCount = 0;
      const results = [];

      for (const activity of activities) {
        const result = await this.logActivity(
          userId,
          activity.type,
          activity.metadata || {},
          activity.date
        );
        
        if (result.success) {
          successCount++;
        }
        
        results.push(result);
      }

      console.log(`✅ Bulk logged ${successCount}/${activities.length} activities`);

      return {
        success: true,
        totalActivities: activities.length,
        successCount,
        results
      };
    } catch (error) {
      console.error('Error in bulkLogActivities:', error);
      return {
        success: false,
        error: error.message,
        successCount: 0
      };
    }
  }
}

// Export singleton instance
export const userActivityService = new UserActivityService();
export default userActivityService;
