import { supabase } from '@/lib/supabase';
import { UserGameData, Achievement } from '@/types';
import { defaultAchievements } from '@/lib/gamification';

export interface SupabaseUserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_components_completed: number;
  completed_components: string[];
  completed_roadmaps: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  created_at: string;
}

class UserProgressService {
  // Fetch user progress from Supabase
  async getUserProgress(userId: string): Promise<UserGameData | null> {
    try {
      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching user progress:', progressError);
        return null;
      }

      // Fetch user achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsError) {
        console.error('Error fetching user achievements:', achievementsError);
        return null;
      }

      // If no progress exists, create initial progress
      if (!progress) {
        return await this.createInitialProgress(userId);
      }

      // Map achievements
      const allAchievements = defaultAchievements.map(achievement => {
        const unlockedAchievement = achievements?.find(a => a.achievement_id === achievement.id);
        return {
          ...achievement,
          unlocked: !!unlockedAchievement,
          unlockedAt: unlockedAchievement ? new Date(unlockedAchievement.unlocked_at) : undefined,
        };
      });

      return {
        totalRating: progress.total_xp || 0, // Map total_xp to totalRating
        totalStars: Math.floor((progress.total_xp || 0) / 100), // Calculate stars from rating
        averageScore: 0, // This needs to be calculated from test results
        completedTests: 0, // This needs to be calculated from test results
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        lastActiveDate: new Date(progress.last_active_date),
        badges: [], // Map achievements to badges if needed
        completedRoadmaps: progress.completed_roadmaps,
        totalComponentsCompleted: progress.total_components_completed,
        completedComponents: progress.completed_components,
        testResults: [], // This needs to be fetched separately
      };
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      return null;
    }
  }

  // Create initial progress for new user
  async createInitialProgress(userId: string): Promise<UserGameData> {
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

      const { data: progress, error } = await supabase
        .from('user_progress')
        .insert([initialData])
        .select()
        .single();

      if (error) {
        console.error('Error creating initial progress:', error);
        throw error;
      }

      return {
        totalRating: 0,
        totalStars: 0,
        averageScore: 0,
        completedTests: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
        badges: [], // Instead of achievements
        completedRoadmaps: [],
        totalComponentsCompleted: 0,
        completedComponents: [],
        testResults: [],
      };
    } catch (error) {
      console.error('Error in createInitialProgress:', error);
      throw error;
    }
  }

  // Save user progress to Supabase
  async saveUserProgress(userId: string, userData: UserGameData): Promise<boolean> {
    try {
      // Update user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          total_xp: userData.totalRating, // Map totalRating to total_xp
          level: Math.floor(userData.totalRating / 100) + 1, // Calculate level from rating
          current_streak: userData.currentStreak,
          longest_streak: userData.longestStreak,
          last_active_date: userData.lastActiveDate.toISOString(),
          total_components_completed: userData.totalComponentsCompleted,
          completed_components: userData.completedComponents,
          completed_roadmaps: userData.completedRoadmaps,
        });

      if (progressError) {
        console.error('Error saving user progress:', progressError);
        return false;
      }

      // Save badges (if we have a badges table in the future)
      // For now, we'll skip this since badges are derived from achievements
      
      return true;
    } catch (error) {
      console.error('Error in saveUserProgress:', error);
      return false;
    }
  }

  // Sync local data with Supabase (useful for initial sync or conflict resolution)
  async syncUserProgress(userId: string, localData: UserGameData): Promise<UserGameData> {
    try {
      const remoteData = await this.getUserProgress(userId);
      
      if (!remoteData) {
        // No remote data, save local data
        await this.saveUserProgress(userId, localData);
        return localData;
      }

      // Simple conflict resolution: use the data with higher rating
      if (localData.totalRating >= remoteData.totalRating) {
        await this.saveUserProgress(userId, localData);
        return localData;
      } else {
        return remoteData;
      }
    } catch (error) {
      console.error('Error in syncUserProgress:', error);
      return localData; // Fallback to local data
    }
  }

  // Check user's subscription status
  async getUserSubscription(userId: string) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return subscription;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  // Update user subscription
  async updateSubscription(userId: string, subscriptionData: {
    plan_type: string;
    status: string;
    current_period_start?: string;
    current_period_end?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          ...subscriptionData,
        });

      if (error) {
        console.error('Error updating subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return false;
    }
  }
}

export const userProgressService = new UserProgressService();
