import supabaseAdmin from '../lib/supabase.js';

class AnalyticsService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  // Get overall platform analytics
  async getPlatformAnalytics() {
    try {
      // Get user statistics
      const { data: users, error: usersError } = await this.supabase
        .from('profiles')
        .select('id, created_at');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return { success: false, error: usersError.message };
      }

      // Get progress statistics
      const { data: progress, error: progressError } = await this.supabase
        .from('user_game_data')
        .select('total_xp, level, total_components_completed, completed_roadmaps');

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        return { success: false, error: progressError.message };
      }

      // Calculate analytics
      const analytics = {
        total_users: users.length,
        active_learners: progress.filter(p => p.total_components_completed > 0).length,
        total_xp_earned: progress.reduce((sum, p) => sum + p.total_xp, 0),
        average_level: progress.length > 0 ? 
          progress.reduce((sum, p) => sum + p.level, 0) / progress.length : 0,
        total_components_completed: progress.reduce((sum, p) => sum + p.total_components_completed, 0),
        total_roadmaps_completed: progress.reduce((sum, p) => sum + p.completed_roadmaps.length, 0),
        user_registration_trend: this.calculateMonthlyTrend(users),
        engagement_metrics: {
          beginner_users: progress.filter(p => p.level <= 5).length,
          intermediate_users: progress.filter(p => p.level > 5 && p.level <= 15).length,
          advanced_users: progress.filter(p => p.level > 15).length
        }
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error in getPlatformAnalytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get learning analytics for specific time period
  async getLearningAnalytics(startDate, endDate) {
    try {
      const { data: learningData, error } = await this.supabase
        .from('user_roadmap_progress')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .gte('completed_at', startDate)
        .lte('completed_at', endDate);

      if (error) {
        console.error('Error fetching learning analytics:', error);
        return { success: false, error: error.message };
      }

      const analytics = {
        total_completions: learningData.length,
        unique_learners: new Set(learningData.map(d => d.user_id)).size,
        popular_roadmaps: this.calculatePopularRoadmaps(learningData),
        average_completion_time: this.calculateAverageCompletionTime(learningData),
        daily_activity: this.calculateDailyActivity(learningData)
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error in getLearningAnalytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user engagement analytics
  async getUserEngagementAnalytics() {
    try {
      const { data: gameData, error } = await this.supabase
        .from('user_game_data')
        .select('current_streak, longest_streak, last_active_date, total_components_completed');

      if (error) {
        console.error('Error fetching engagement data:', error);
        return { success: false, error: error.message };
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const analytics = {
        average_streak: gameData.length > 0 ? 
          gameData.reduce((sum, g) => sum + g.current_streak, 0) / gameData.length : 0,
        longest_streak_record: Math.max(...gameData.map(g => g.longest_streak), 0),
        active_this_week: gameData.filter(g => 
          new Date(g.last_active_date) >= weekAgo
        ).length,
        completion_distribution: {
          low: gameData.filter(g => g.total_components_completed < 5).length,
          medium: gameData.filter(g => g.total_components_completed >= 5 && g.total_components_completed < 20).length,
          high: gameData.filter(g => g.total_components_completed >= 20).length
        }
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error in getUserEngagementAnalytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  calculateMonthlyTrend(users) {
    const trend = {};
    users.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7);
      trend[month] = (trend[month] || 0) + 1;
    });
    return trend;
  }

  calculatePopularRoadmaps(learningData) {
    const roadmapCounts = {};
    learningData.forEach(data => {
      roadmapCounts[data.roadmap_id] = (roadmapCounts[data.roadmap_id] || 0) + 1;
    });
    return Object.entries(roadmapCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  calculateAverageCompletionTime(learningData) {
    const totalTime = learningData.reduce((sum, data) => sum + (data.time_spent_minutes || 0), 0);
    return learningData.length > 0 ? totalTime / learningData.length : 0;
  }

  calculateDailyActivity(learningData) {
    const dailyActivity = {};
    learningData.forEach(data => {
      if (data.completed_at) {
        const date = data.completed_at.split('T')[0];
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      }
    });
    return dailyActivity;
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
