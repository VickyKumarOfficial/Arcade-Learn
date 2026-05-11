import supabaseAdmin from '../lib/supabase.js';

class UserProgressService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  normalizeAdaptiveNodeType(value) {
    if (value === 'revision' || value === 'practice') {
      return value;
    }

    return 'core';
  }

  normalizeSkillLevel(value) {
    if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
      return value;
    }

    return null;
  }

  async ensureProfileExists(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'userId is required.' };
      }

      const { data: existingProfile, error: existingProfileError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfileError) {
        console.error('Error checking profile existence:', existingProfileError);
        return { success: false, error: existingProfileError.message };
      }

      if (existingProfile?.id) {
        return { success: true };
      }

      const { data: authUserData, error: authUserError } = await this.supabase.auth.admin.getUserById(userId);
      if (authUserError || !authUserData?.user) {
        console.error('Error fetching auth user for profile backfill:', authUserError);
        return { success: false, error: authUserError?.message || 'Auth user not found.' };
      }

      const authUser = authUserData.user;
      const metadata = authUser.user_metadata || {};

      const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
      const metadataFirstName = typeof metadata.first_name === 'string' ? metadata.first_name.trim() : '';
      const metadataLastName = typeof metadata.last_name === 'string' ? metadata.last_name.trim() : '';

      const fallbackNameParts = fullName ? fullName.split(/\s+/) : [];
      const firstName = metadataFirstName || fallbackNameParts[0] || 'User';
      const lastName = metadataLastName || (fallbackNameParts.length > 1 ? fallbackNameParts.slice(1).join(' ') : null);
      const email = authUser.email || `${userId}@placeholder.local`;

      const { error: insertProfileError } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null,
        });

      if (insertProfileError) {
        console.error('Error backfilling missing profile:', insertProfileError);
        return { success: false, error: insertProfileError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
      return { success: false, error: error.message };
    }
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

  async getRoadmapProgressDetails(userId, roadmapId) {
    try {
      if (!userId || !roadmapId) {
        return { success: false, error: 'userId and roadmapId are required.' };
      }

      const { data, error } = await this.supabase
        .from('user_roadmap_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('roadmap_id', roadmapId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching roadmap progress details:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getRoadmapProgressDetails:', error);
      return { success: false, error: error.message };
    }
  }

  async syncRoadmapProgressDetails(userId, payload) {
    try {
      const roadmapId = payload?.roadmapId;
      const entries = Array.isArray(payload?.entries) ? payload.entries : [];
      const credits = payload?.credits ?? null;

      if (!userId || !roadmapId) {
        return { success: false, error: 'userId and roadmapId are required.' };
      }

      const profileCheck = await this.ensureProfileExists(userId);
      if (!profileCheck.success) {
        return {
          success: false,
          error: profileCheck.error || 'Unable to ensure profile exists for this user.',
        };
      }

      const normalizedRows = entries
        .map((entry) => {
          const componentId = typeof entry?.componentId === 'string' ? entry.componentId.trim() : '';
          if (!componentId) {
            return null;
          }

          const completedAt = typeof entry?.completedAt === 'string' && entry.completedAt.trim().length > 0
            ? entry.completedAt
            : null;

          const timeSpentMinutesRaw = Number(entry?.timeSpentMinutes ?? 0);
          const timeSpentMinutes = Number.isFinite(timeSpentMinutesRaw)
            ? Math.max(0, Math.round(timeSpentMinutesRaw))
            : 0;

          return {
            user_id: userId,
            roadmap_id: roadmapId,
            component_id: componentId,
            completed_at: completedAt,
            time_spent_minutes: timeSpentMinutes,
            extra_node_added: this.normalizeAdaptiveNodeType(entry?.extraNodeAdded),
            current_level: this.normalizeSkillLevel(entry?.currentLevel),
            updated_at: new Date().toISOString(),
          };
        })
        .filter(Boolean);

      if (normalizedRows.length === 0) {
        return { success: true, data: { upserted: 0 } };
      }

      const { error } = await this.supabase
        .from('user_roadmap_progress')
        .upsert(normalizedRows, { onConflict: 'user_id,roadmap_id,component_id' });

      if (error) {
        console.error('Error syncing roadmap progress details:', error);
        return { success: false, error: error.message };
      }

      if (credits && Number.isFinite(Number(credits.earnedCredits))) {
        const earnedCredits = Math.max(0, Math.round(Number(credits.earnedCredits)));
        const totalCredits = Math.max(0, Math.round(Number(credits.totalCredits ?? 0)));

        const { error: creditsError } = await this.supabase
          .from('user_roadmap_credit_summary')
          .upsert(
            {
              user_id: userId,
              roadmap_id: roadmapId,
              earned_credits: earnedCredits,
              total_credits: totalCredits,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,roadmap_id' },
          );

        if (creditsError) {
          console.error('Error syncing roadmap credit summary:', creditsError);
          return { success: false, error: creditsError.message };
        }
      }

      return { success: true, data: { upserted: normalizedRows.length } };
    } catch (error) {
      console.error('Error in syncRoadmapProgressDetails:', error);
      return { success: false, error: error.message };
    }
  }
}

export const userProgressService = new UserProgressService();
export default UserProgressService;
