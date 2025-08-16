import supabaseAdmin from '../lib/supabase.js';

class UserProgressService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  // Fetch user progress from Supabase
  async getUserProgress(userId) {
    try {
      // Fetch user progress
      const { data: progress, error: progressError } = await this.supabase
        .from('user_game_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching user progress:', progressError);
        return { success: false, error: progressError.message };
      }

      // Fetch user achievements
      const { data: achievements, error: achievementsError } = await this.supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsError) {
        console.error('Error fetching user achievements:', achievementsError);
        return { success: false, error: achievementsError.message };
      }

      // If no progress exists, create initial progress
      if (!progress) {
        return await this.createInitialProgress(userId);
      }

      return {
        success: true,
        data: {
          progress: progress,
          achievements: achievements || []
        }
      };
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      return { success: false, error: error.message };
    }
  }

  // Create initial progress for new user
  async createInitialProgress(userId) {
    try {
      const initialData = {
        user_id: userId,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: new Date().toISOString(),
        total_components_completed: 0,
        completed_components: [],
        completed_roadmaps: [],
      };

      const { data: progress, error } = await this.supabase
        .from('user_game_data')
        .insert([initialData])
        .select()
        .single();

      if (error) {
        console.error('Error creating initial progress:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          progress: progress,
          achievements: []
        }
      };
    } catch (error) {
      console.error('Error in createInitialProgress:', error);
      return { success: false, error: error.message };
    }
  }

  // Save user progress to Supabase
  async saveUserProgress(userId, userData) {
    try {
      // Update user progress
      const { error: progressError } = await this.supabase
        .from('user_game_data')
        .upsert({
          user_id: userId,
          total_xp: userData.totalXP,
          level: userData.level,
          current_streak: userData.currentStreak,
          longest_streak: userData.longestStreak,
          last_active_date: userData.lastActiveDate,
          total_components_completed: userData.totalComponentsCompleted,
          completed_components: userData.completedComponents,
          completed_roadmaps: userData.completedRoadmaps,
          updated_at: new Date().toISOString()
        });

      if (progressError) {
        console.error('Error saving user progress:', progressError);
        return { success: false, error: progressError.message };
      }

      // Save unlocked achievements
      const unlockedAchievements = userData.achievements?.filter(a => a.unlocked) || [];
      if (unlockedAchievements.length > 0) {
        const achievementsToInsert = unlockedAchievements.map(achievement => ({
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: achievement.unlockedAt || new Date().toISOString(),
        }));

        const { error: achievementsError } = await this.supabase
          .from('user_achievements')
          .upsert(achievementsToInsert, {
            onConflict: 'user_id,achievement_id',
          });

        if (achievementsError) {
          console.error('Error saving achievements:', achievementsError);
          // Don't return false here, progress was saved successfully
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveUserProgress:', error);
      return { success: false, error: error.message };
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from('user_game_data')
        .select(`
          user_id,
          total_xp,
          level,
          current_streak,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync user progress between devices
  async syncUserProgress(userId, localData) {
    try {
      const remoteResult = await this.getUserProgress(userId);
      
      if (!remoteResult.success) {
        return remoteResult;
      }

      const remoteData = remoteResult.data.progress;

      if (!remoteData) {
        // No remote data, save local data
        return await this.saveUserProgress(userId, localData);
      }

      // Simple conflict resolution: use the data with higher XP
      if (localData.totalXP >= remoteData.total_xp) {
        await this.saveUserProgress(userId, localData);
        return { success: true, data: localData };
      } else {
        return { success: true, data: remoteData };
      }
    } catch (error) {
      console.error('Error in syncUserProgress:', error);
      return { success: false, error: error.message };
    }
  }
}

export const userProgressService = new UserProgressService();
export default UserProgressService;
