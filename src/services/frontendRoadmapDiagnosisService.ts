import type { FrontendModuleType, FrontendSkillLevel } from '@/types/adaptiveRoadmap';

export type FrontendDiagnosisAction =
  | 'none'
  | 'add_revision_module'
  | 'add_practice_module'
  | 'reduce_load'
  | 'skip_basics';

export interface FrontendDiagnosisInput {
  scorePercentage: number;
  attempts: number;
  totalTimeSeconds: number;
  expectedTimeMinutes?: number;
  previousScorePercentage?: number;
  inactivityDays?: number;
  skippedContent?: boolean;
  failedAfterSkip?: boolean;
}

export interface FrontendDiagnosisResult {
  action: FrontendDiagnosisAction;
  recommendedModuleType: FrontendModuleType;
  levelDelta: -1 | 0 | 1;
  timeRatio: number;
  reason: string;
}

const FALLBACK_EXPECTED_MINUTES = 20;

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score);
}

function normalizeAttempts(attempts: number): number {
  if (!Number.isFinite(attempts) || attempts < 1) return 1;
  return Math.round(attempts);
}

function normalizeTimeRatio(input: FrontendDiagnosisInput): number {
  const attempts = normalizeAttempts(input.attempts);
  const totalSeconds = Number.isFinite(input.totalTimeSeconds) && input.totalTimeSeconds > 0
    ? input.totalTimeSeconds
    : 1;
  const expectedMinutes = Number.isFinite(input.expectedTimeMinutes) && input.expectedTimeMinutes && input.expectedTimeMinutes > 0
    ? input.expectedTimeMinutes
    : FALLBACK_EXPECTED_MINUTES;

  const avgAttemptSeconds = totalSeconds / attempts;
  const expectedSeconds = expectedMinutes * 60;

  if (!Number.isFinite(avgAttemptSeconds) || expectedSeconds <= 0) return 1;
  const ratio = avgAttemptSeconds / expectedSeconds;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

export function diagnoseFrontendLearningSignal(input: FrontendDiagnosisInput): FrontendDiagnosisResult {
  const score = clampScore(input.scorePercentage);
  const attempts = normalizeAttempts(input.attempts);
  const timeRatio = normalizeTimeRatio(input);
  const previousScore = input.previousScorePercentage;

  if (input.skippedContent && input.failedAfterSkip) {
    return {
      action: 'add_revision_module',
      recommendedModuleType: 'revision',
      levelDelta: 0,
      timeRatio,
      reason: 'Overconfidence pattern detected after skipped content and failed attempt.',
    };
  }

  if (Number.isFinite(input.inactivityDays) && (input.inactivityDays ?? 0) >= 14) {
    return {
      action: 'add_revision_module',
      recommendedModuleType: 'revision',
      levelDelta: 0,
      timeRatio,
      reason: 'Extended inactivity detected; route learner through revision module.',
    };
  }

  if (score < 50) {
    const shouldLowerLevel = score < 40 && attempts >= 2;

    return {
      action: 'add_revision_module',
      recommendedModuleType: 'revision',
      levelDelta: shouldLowerLevel ? -1 : 0,
      timeRatio,
      reason: 'Low score indicates concept clarity gap; route learner through revision module.',
    };
  }

  if (score >= 50 && score <= 70) {
    return {
      action: 'add_practice_module',
      recommendedModuleType: 'practice',
      levelDelta: 0,
      timeRatio,
      reason: 'Mid-range score pattern suggests practice reinforcement.',
    };
  }

  if (score >= 70 && timeRatio > 1.5) {
    return {
      action: 'reduce_load',
      recommendedModuleType: 'core',
      levelDelta: 0,
      timeRatio,
      reason: 'High time ratio despite good score; reduce load and keep core flow.',
    };
  }

  if (score >= 85 && timeRatio < 0.7 && attempts >= 2) {
    return {
      action: 'skip_basics',
      recommendedModuleType: 'core',
      levelDelta: 1,
      timeRatio,
      reason: 'Fast high-performance pattern detected; learner can skip basics.',
    };
  }

  if (
    attempts >= 3
    && Number.isFinite(previousScore)
    && Math.abs(score - Number(previousScore)) >= 30
  ) {
    return {
      action: 'add_practice_module',
      recommendedModuleType: 'practice',
      levelDelta: 0,
      timeRatio,
      reason: 'Inconsistent score spread indicates unstable understanding; add practice.',
    };
  }

  return {
    action: 'none',
    recommendedModuleType: 'core',
    levelDelta: 0,
    timeRatio,
    reason: 'No adaptation trigger; continue default core flow.',
  };
}

export function shiftSkillLevel(level: FrontendSkillLevel, delta: -1 | 0 | 1): FrontendSkillLevel {
  if (delta === 0) return level;

  const levelOrder: FrontendSkillLevel[] = ['beginner', 'intermediate', 'advanced'];
  const index = levelOrder.indexOf(level);
  if (index < 0) return level;

  const nextIndex = Math.max(0, Math.min(levelOrder.length - 1, index + delta));
  return levelOrder[nextIndex];
}
