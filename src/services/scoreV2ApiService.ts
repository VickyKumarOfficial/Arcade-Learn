import { BACKEND_URL } from '@/config/env';
import { scoreFeatureFlags } from '@/config/featureFlags';
import {
  LeaderboardEntry,
  ModuleCompletionBonusRequest,
  ScoreAttemptWriteRequest,
  UserScoreSummary,
} from '@/types/scoreContract';

interface ScoreSummaryEnvelope {
  success: boolean;
  data?: UserScoreSummary;
  error?: string;
}

interface ScoreAttemptEnvelope {
  success: boolean;
  data?: {
    deduplicated: boolean;
    awardedPoints?: number;
  };
  error?: string;
}

interface LeaderboardEnvelope {
  success: boolean;
  data?: LeaderboardEntry[];
  error?: string;
}

function hashTo32Hex(value: string): string {
  const seeds = [2166136261, 2166136261 ^ 0x9e3779b9, 2166136261 ^ 0x85ebca6b, 2166136261 ^ 0xc2b2ae35];
  const output: string[] = [];

  for (const seed of seeds) {
    let hash = seed >>> 0;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    output.push(hash.toString(16).padStart(8, '0'));
  }

  return output.join('').slice(0, 32);
}

function hexToUuid(hex32: string): string {
  const normalized = hex32.toLowerCase();
  const withVersion = `${normalized.slice(0, 12)}4${normalized.slice(13)}`;
  const variantNibble = (parseInt(withVersion[16], 16) & 0x3) | 0x8;
  const withVariant = `${withVersion.slice(0, 16)}${variantNibble.toString(16)}${withVersion.slice(17)}`;

  return `${withVariant.slice(0, 8)}-${withVariant.slice(8, 12)}-${withVariant.slice(12, 16)}-${withVariant.slice(16, 20)}-${withVariant.slice(20, 32)}`;
}

class ScoreV2ApiService {
  createAttemptId(params: {
    userId: string;
    roadmapId: string;
    moduleId: string;
    nodeId: string;
    attemptCount: number;
    completedAtIso: string;
  }): string {
    const fingerprint = [
      params.userId,
      params.roadmapId,
      params.moduleId,
      params.nodeId,
      String(params.attemptCount),
      params.completedAtIso,
    ].join('|');

    return hexToUuid(hashTo32Hex(fingerprint));
  }

  async getUserScoreSummary(userId: string): Promise<UserScoreSummary | null> {
    if (!scoreFeatureFlags.scoreV2ReadEnabled || !userId) {
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/user/${userId}/score-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as ScoreSummaryEnvelope;
      if (!payload.success || !payload.data) {
        return null;
      }

      return payload.data;
    } catch (error) {
      console.error('Failed to fetch Score V2 summary:', error);
      return null;
    }
  }

  async submitAttempt(userId: string, payload: ScoreAttemptWriteRequest): Promise<ScoreAttemptEnvelope | null> {
    if (!scoreFeatureFlags.scoreV2WriteEnabled || !userId) {
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/user/${userId}/score/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as ScoreAttemptEnvelope;
      return body;
    } catch (error) {
      console.error('Failed to submit Score V2 attempt:', error);
      return null;
    }
  }

  async awardModuleBonus(userId: string, payload: ModuleCompletionBonusRequest): Promise<ScoreAttemptEnvelope | null> {
    if (!scoreFeatureFlags.scoreV2WriteEnabled || !userId) {
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/user/${userId}/score/module-bonus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as ScoreAttemptEnvelope;
      return body;
    } catch (error) {
      console.error('Failed to submit Score V2 module bonus:', error);
      return null;
    }
  }

  async getGlobalLeaderboard(limit = 20): Promise<LeaderboardEntry[] | null> {
    if (!scoreFeatureFlags.scoreV2LeaderboardEnabled) {
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/leaderboard?limit=${Math.max(1, limit)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as LeaderboardEnvelope;
      if (!payload.success || !payload.data) {
        return null;
      }

      return payload.data;
    } catch (error) {
      console.error('Failed to fetch Score V2 leaderboard:', error);
      return null;
    }
  }
}

export const scoreV2ApiService = new ScoreV2ApiService();
