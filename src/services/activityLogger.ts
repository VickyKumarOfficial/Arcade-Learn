/**
 * Activity Logger Utility
 * Centralized service for logging user activities to the backend
 * Used throughout the app to track student engagement
 */

import axios from 'axios';
import { BACKEND_URL } from '@/config/env';

export const ACTIVITY_TYPES = {
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
} as const;

type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

interface ActivityMetadata {
  [key: string]: any;
}

class ActivityLogger {
  /**
   * Log a single activity
   * @param userId - User UUID
   * @param activityType - Type of activity (use ACTIVITY_TYPES enum)
   * @param metadata - Additional details about the activity
   * @returns Promise<boolean> - Success status
   */
  async logActivity(
    userId: string,
    activityType: ActivityType,
    metadata: ActivityMetadata = {}
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.warn('Cannot log activity: userId is required');
        return false;
      }

      console.log(`📊 Logging activity: ${activityType} for user ${userId}`);

      const response = await axios.post(
        `${BACKEND_URL}/api/user/${userId}/activity/log`,
        {
          activityType,
          metadata,
          activityDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        }
      );

      if (response.data.success) {
        console.log(`✅ Activity logged successfully: ${activityType}`);
        return true;
      } else {
        console.error('Failed to log activity:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  /**
   * Log test completion
   * @param userId - User UUID
   * @param testName - Name of the test
   * @param score - Test score (optional)
   * @param category - Test category (optional)
   */
  async logTestCompleted(
    userId: string,
    testName: string,
    score?: number,
    category?: string
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.TEST_COMPLETED, {
      testName,
      score,
      category,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log roadmap completion
   * @param userId - User UUID
   * @param roadmapId - ID of the roadmap
   * @param roadmapTitle - Title of the roadmap
   * @param componentId - ID of the component (optional)
   */
  async logRoadmapCompleted(
    userId: string,
    roadmapId: string,
    roadmapTitle: string,
    componentId?: string
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.ROADMAP_COMPLETED, {
      roadmapId,
      roadmapTitle,
      componentId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log user login
   * @param userId - User UUID
   * @param loginMethod - Method used to login (email, google, etc.)
   */
  async logLogin(userId: string, loginMethod: string = 'email'): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.LOGIN, {
      loginMethod,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log achievement unlock
   * @param userId - User UUID
   * @param achievementId - ID of the achievement
   * @param achievementName - Name of the achievement
   */
  async logAchievementUnlocked(
    userId: string,
    achievementId: string,
    achievementName: string
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.ACHIEVEMENT_UNLOCKED, {
      achievementId,
      achievementName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log quiz attempt
   * @param userId - User UUID
   * @param quizId - ID of the quiz
   * @param score - Quiz score (optional)
   */
  async logQuizAttempted(
    userId: string,
    quizId: string,
    score?: number
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.QUIZ_ATTEMPTED, {
      quizId,
      score,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log resume update
   * @param userId - User UUID
   * @param fileName - Name of the uploaded file
   * @param fileSize - Size of the file in bytes
   */
  async logResumeUpdated(
    userId: string,
    fileName?: string,
    fileSize?: number
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.RESUME_UPDATED, {
      fileName,
      fileSize,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log roadmap start
   * @param userId - User UUID
   * @param roadmapId - ID of the roadmap
   * @param roadmapTitle - Title of the roadmap
   */
  async logRoadmapStarted(
    userId: string,
    roadmapId: string,
    roadmapTitle: string
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.ROADMAP_STARTED, {
      roadmapId,
      roadmapTitle,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log certificate earned
   * @param userId - User UUID
   * @param certificateId - ID of the certificate
   * @param certificateName - Name of the certificate
   */
  async logCertificateEarned(
    userId: string,
    certificateId: string,
    certificateName: string
  ): Promise<boolean> {
    return this.logActivity(userId, ACTIVITY_TYPES.CERTIFICATE_EARNED, {
      certificateId,
      certificateName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Bulk log multiple activities
   * @param userId - User UUID
   * @param activities - Array of activity objects
   */
  async bulkLogActivities(
    userId: string,
    activities: Array<{
      type: ActivityType;
      date?: string;
      metadata?: ActivityMetadata;
    }>
  ): Promise<boolean> {
    try {
      if (!userId || !activities || activities.length === 0) {
        console.warn('Cannot bulk log: userId and activities array required');
        return false;
      }

      console.log(`📊 Bulk logging ${activities.length} activities for user ${userId}`);

      const response = await axios.post(
        `${BACKEND_URL}/api/user/${userId}/activity/bulk`,
        { activities }
      );

      if (response.data.success) {
        console.log(`✅ Bulk logged ${response.data.successCount} activities`);
        return true;
      } else {
        console.error('Failed to bulk log activities:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('Error bulk logging activities:', error);
      return false;
    }
  }
}

// Export singleton instance
export const activityLogger = new ActivityLogger();
export default activityLogger;
