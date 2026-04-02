export type NodeDepth = 'module' | 'submodule';

export interface ScoreAttemptWriteRequest {
  attemptId: string;
  userId: string;
  roadmapId: string;
  moduleId: string;
  nodeId: string;
  nodeDepth: NodeDepth;
  quizScore: number;
  submittedAt: string;
  scoringVersion?: string;
  metadata?: Record<string, unknown>;
}

export interface ModuleCompletionBonusRequest {
  userId: string;
  roadmapId: string;
  moduleId: string;
  completedAt: string;
  scoringVersion?: string;
}

export interface RoadmapScoreSummary {
  roadmapId: string;
  totalScore: number;
  totalStars: number;
  rank: number | null;
  updatedAt: string;
}

export interface UserScoreSummary {
  userId: string;
  totalScore: number;
  totalStars: number;
  totalSubmodulePoints: number;
  totalModuleBonusPoints: number;
  updatedAt: string;
  scoringVersion: string;
  globalRank: number | null;
  roadmapSummaries: RoadmapScoreSummary[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalScore: number;
  totalStars: number;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  version: 'v2';
}

export const SCORE_V2_CONSTANTS = {
  PASS_SCORE_MIN: 80,
  SUBMODULE_MAX_POINTS: 2,
  MODULE_COMPLETION_BONUS: 1,
  STAR_THRESHOLDS: [100, 250, 450, 750],
} as const;

export function calculateSubmodulePoints(quizScore: number): number {
  if (quizScore < SCORE_V2_CONSTANTS.PASS_SCORE_MIN) {
    return 0;
  }

  const scaled = ((quizScore - SCORE_V2_CONSTANTS.PASS_SCORE_MIN) / 20) * SCORE_V2_CONSTANTS.SUBMODULE_MAX_POINTS;
  return Math.round(scaled * 100) / 100;
}

export function calculateStarsFromTotalScore(totalScore: number): number {
  if (totalScore >= SCORE_V2_CONSTANTS.STAR_THRESHOLDS[3]) return 4;
  if (totalScore >= SCORE_V2_CONSTANTS.STAR_THRESHOLDS[2]) return 3;
  if (totalScore >= SCORE_V2_CONSTANTS.STAR_THRESHOLDS[1]) return 2;
  if (totalScore >= SCORE_V2_CONSTANTS.STAR_THRESHOLDS[0]) return 1;
  return 0;
}
