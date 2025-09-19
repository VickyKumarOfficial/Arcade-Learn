import { supabase } from '@/lib/supabase';
import { UserGameData, RatingBadge } from '@/types';
import { initializeUserGameData, calculateModuleScore, calculateStarsFromScore } from '@/lib/gamification';

export interface SupabaseUserProgress {
  id: string;
  user_id: string;
  total_rating: number;
  total_stars: number;
  total_score: number; // Changed from average_score
  completed_tests: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_components_completed: number;
  completed_components: string[];
  completed_roadmaps: string[];
  test_results: any[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
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

      // Fetch user badges
      const { data: badges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (badgesError) {
        console.error('Error fetching user badges:', badgesError);
        return null;
      }

      // If no progress exists, create initial progress
      if (!progress) {
        return await this.createInitialProgress(userId);
      }

      // For now, use empty badges array since we don't have default badges defined
      const userBadges: RatingBadge[] = [];

      return {
        totalRating: progress.total_rating || 0,
        totalStars: progress.total_stars || 0,
        totalScore: progress.total_score || 0,
        completedTests: progress.completed_tests || 0,
        currentStreak: progress.current_streak || 0,
        longestStreak: progress.longest_streak || 0,
        lastActiveDate: new Date(progress.last_active_date),
        totalComponentsCompleted: progress.total_components_completed || 0,
        completedComponents: progress.completed_components || [],
        completedRoadmaps: progress.completed_roadmaps || [],
        badges: userBadges,
        testResults: progress.test_results || [],
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
        total_rating: 0,
        total_stars: 0,
        total_score: 0,
        completed_tests: 0,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: new Date().toISOString(),
        total_components_completed: 0,
        completed_components: [],
        completed_roadmaps: [],
        test_results: [],
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

      return initializeUserGameData();
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
          total_rating: userData.totalRating,
          total_stars: userData.totalStars,
          total_score: userData.totalScore,
          completed_tests: userData.completedTests,
          current_streak: userData.currentStreak,
          longest_streak: userData.longestStreak,
          last_active_date: userData.lastActiveDate.toISOString(),
          total_components_completed: userData.totalComponentsCompleted,
          completed_components: userData.completedComponents,
          completed_roadmaps: userData.completedRoadmaps,
          test_results: userData.testResults,
        });

      if (progressError) {
        console.error('Error saving user progress:', progressError);
        return false;
      }

      // Save unlocked badges
      const unlockedBadges = userData.badges.filter(b => b.unlocked);
      if (unlockedBadges.length > 0) {
        const badgesToInsert = unlockedBadges.map(badge => ({
          user_id: userId,
          badge_id: badge.id,
          unlocked_at: badge.unlockedAt?.toISOString() || new Date().toISOString(),
        }));

        const { error: badgesError } = await supabase
          .from('user_badges')
          .upsert(badgesToInsert, {
            onConflict: 'user_id,badge_id',
          });

        if (badgesError) {
          console.error('Error saving badges:', badgesError);
          // Don't return false here, progress was saved successfully
        }
      }

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

      // Simple conflict resolution: use the data with higher total rating
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

  // Handle test completion with new scoring system
  async completeTest(userId: string, componentId: string, testScore: number): Promise<UserGameData | null> {
    try {
      const userData = await this.getUserProgress(userId);
      if (!userData) return null;

      // Calculate module score using new system
      const moduleScore = calculateModuleScore(testScore);
      
      // Only proceed if test passed (score >= 80%)
      if (testScore >= 80) {
        // Add to total score
        userData.totalScore += moduleScore;
        
        // Update stars based on new total score
        userData.totalStars = calculateStarsFromScore(userData.totalScore);
        
        // Update other stats
        userData.completedTests += 1;
        
        // Add test result
        userData.testResults.push({
          testId: `${componentId}_test`,
          componentId,
          roadmapId: 'unknown', // This should be passed as parameter in real implementation
          score: testScore,
          rating: testScore * 2,
          stars: Math.floor(testScore / 50), // Legacy star calculation
          moduleScore,
          passed: testScore >= 80,
          attemptCount: 1,
          completedAt: new Date(),
          answers: [] // This should be passed as parameter in real implementation
        });

        // Update last active date
        userData.lastActiveDate = new Date();

        // Save updated progress
        await this.saveUserProgress(userId, userData);
      }

      return userData;
    } catch (error) {
      console.error('Error in completeTest:', error);
      return null;
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
