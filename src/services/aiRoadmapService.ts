import { supabase } from '@/lib/supabase';

export interface AIRoadmapRequest {
  userId: string;
}

export interface AIRoadmapResponse {
  success: boolean;
  data?: {
    recommendations: any;
    savedRecommendation: any;
  };
  error?: string;
}

export interface UserRecommendation {
  id: string;
  user_id: string;
  recommended_roadmaps: any;
  recommendation_reason: any;
  ai_confidence_score: number;
  generated_at: string;
  ai_model_version: string;
  generation_method: string;
}

class AIRoadmapService {
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 
                      (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');

  /**
   * Generate AI roadmap recommendations for a user
   */
  async generateAIRoadmap(userId: string): Promise<AIRoadmapResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/api/user/${userId}/ai-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to generate AI roadmap'
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error generating AI roadmap:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get user's existing recommendations
   */
  async getUserRecommendations(userId: string): Promise<{ success: boolean; data?: UserRecommendation[]; error?: string }> {
    try {
      const response = await fetch(`${this.backendUrl}/api/user/${userId}/recommendations`);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch recommendations'
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get user's survey data directly from Supabase
   */
  async getUserSurveyData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_survey_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_latest', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user survey data:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data ? data.responses : null
      };
    } catch (error) {
      console.error('Error in getUserSurveyData:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user has completed the survey
   */
  async hasSurveyData(userId: string): Promise<boolean> {
    try {
      const result = await this.getUserSurveyData(userId);
      return result.success && result.data !== null;
    } catch (error) {
      console.error('Error checking survey data:', error);
      return false;
    }
  }

  /**
   * Format roadmap recommendations for display
   */
  formatRecommendations(recommendations: any): any {
    if (!recommendations || !recommendations.roadmaps) {
      return null;
    }

    return {
      roadmaps: recommendations.roadmaps.map((roadmap: any, index: number) => ({
        id: roadmap.roadmap_id,
        priority: roadmap.priority || index + 1,
        score: roadmap.score || 0,
        estimatedWeeks: roadmap.estimated_completion_weeks || 8,
        weeklyHours: roadmap.weekly_hours_needed || 5,
        reasoning: roadmap.reasoning || 'Recommended based on your profile'
      })),
      reasoning: {
        summary: recommendations.reasoning?.summary || 'Personalized recommendations generated',
        details: recommendations.reasoning?.details || [],
        learningApproach: recommendations.reasoning?.learning_approach || [],
        nextSteps: recommendations.reasoning?.next_steps || []
      },
      confidence: recommendations.confidence || 0.7
    };
  }
}

export const aiRoadmapService = new AIRoadmapService();
export default AIRoadmapService;