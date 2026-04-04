import { BACKEND_URL } from '@/config/env';
import { supabase } from '@/lib/supabase';

export interface RoadmapDoubtHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskRoadmapDoubtPayload {
  roadmapKey: string;
  roadmapTitle: string;
  question: string;
  activeTopic?: string | null;
  activeTopicDescription?: string | null;
  history?: RoadmapDoubtHistoryMessage[];
}

export interface AskRoadmapDoubtResponse {
  success: boolean;
  response?: string;
  provider?: 'openrouter' | 'groq';
  error?: string;
}

class RoadmapDoubtService {
  private async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('Unable to read auth session for roadmap doubt request:', error);
    }

    return headers;
  }

  async askDoubt(payload: AskRoadmapDoubtPayload): Promise<AskRoadmapDoubtResponse> {
    try {
      const headers = await this.buildHeaders();
      const response = await fetch(`${BACKEND_URL}/api/roadmap/doubt`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({
        success: false,
        error: 'Invalid server response.',
      }));

      if (!response.ok || !result?.success) {
        return {
          success: false,
          error: result?.error || `Request failed with status ${response.status}.`,
        };
      }

      return {
        success: true,
        response: result.response,
        provider: result.provider,
      };
    } catch (error: any) {
      console.error('Roadmap doubt request failed:', error);
      return {
        success: false,
        error: 'Unable to reach doubt-solving service right now. Please try again.',
      };
    }
  }
}

export const roadmapDoubtService = new RoadmapDoubtService();
