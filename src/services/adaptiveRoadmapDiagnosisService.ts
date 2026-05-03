import type { AdaptiveModuleType, AdaptiveSkillLevel } from '@/types/adaptiveRoadmap';

export type AdaptiveDiagnosisAction =
  | 'none'
  | 'add_revision_module'
  | 'add_practice_module'
  | 'reduce_load'
  | 'skip_basics';

export interface AdaptiveDiagnosisInput {
  scorePercentage: number;
  attempts: number;
  totalTimeSeconds: number;
  expectedTimeMinutes?: number;
  previousScorePercentage?: number;
  inactivityDays?: number;
  skippedContent?: boolean;
  failedAfterSkip?: boolean;
}

export interface AdaptiveDiagnosisPolicy {
  fallbackExpectedMinutes: number;
  inactivityDaysThreshold: number;
  conceptGapScoreThreshold: number;
  conceptGapHardScoreThreshold: number;
  conceptGapAttemptsForDowngrade: number;
  practiceMinScore: number;
  practiceMaxScore: number;
  slowLearnerMinScore: number;
  slowLearnerTimeRatio: number;
  fastLearnerScoreThreshold: number;
  fastLearnerTimeRatio: number;
  fastTrackScoreThreshold: number;
  fastTrackAttemptCount: number;
  fastTrackMaxTimeRatio: number;
  inconsistentAttemptThreshold: number;
  inconsistentScoreDeltaThreshold: number;
}

export interface AdaptiveDiagnosisResult {
  action: AdaptiveDiagnosisAction;
  recommendedModuleType: AdaptiveModuleType;
  levelDelta: -1 | 0 | 1;
  timeRatio: number;
  reason: string;
}

const DEFAULT_DIAGNOSIS_POLICY: AdaptiveDiagnosisPolicy = {
  fallbackExpectedMinutes: 20,
  inactivityDaysThreshold: 14,
  conceptGapScoreThreshold: 50,
  conceptGapHardScoreThreshold: 40,
  conceptGapAttemptsForDowngrade: 2,
  practiceMinScore: 50,
  practiceMaxScore: 70,
  slowLearnerMinScore: 70,
  slowLearnerTimeRatio: 1.5,
  fastLearnerScoreThreshold: 85,
  fastLearnerTimeRatio: 0.7,
  fastTrackScoreThreshold: 80,
  fastTrackAttemptCount: 1,
  fastTrackMaxTimeRatio: 1,
  inconsistentAttemptThreshold: 3,
  inconsistentScoreDeltaThreshold: 30,
};

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

function normalizeTimeRatio(input: AdaptiveDiagnosisInput, policy: AdaptiveDiagnosisPolicy): number {
  const attempts = normalizeAttempts(input.attempts);
  const totalSeconds = Number.isFinite(input.totalTimeSeconds) && input.totalTimeSeconds > 0
    ? input.totalTimeSeconds
    : 1;
  const expectedMinutes = Number.isFinite(input.expectedTimeMinutes)
    && input.expectedTimeMinutes
    && input.expectedTimeMinutes > 0
    ? input.expectedTimeMinutes
    : policy.fallbackExpectedMinutes;

  const avgAttemptSeconds = totalSeconds / attempts;
  const expectedSeconds = expectedMinutes * 60;

  if (!Number.isFinite(avgAttemptSeconds) || expectedSeconds <= 0) return 1;
  const ratio = avgAttemptSeconds / expectedSeconds;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

export function diagnoseAdaptiveLearningSignal(
  input: AdaptiveDiagnosisInput,
  policyOverrides?: Partial<AdaptiveDiagnosisPolicy>,
): AdaptiveDiagnosisResult {
  const policy: AdaptiveDiagnosisPolicy = {
    ...DEFAULT_DIAGNOSIS_POLICY,
    ...policyOverrides,
  };

  const score = clampScore(input.scorePercentage);
  const attempts = normalizeAttempts(input.attempts);
  const timeRatio = normalizeTimeRatio(input, policy);
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

  if (Number.isFinite(input.inactivityDays) && (input.inactivityDays ?? 0) >= policy.inactivityDaysThreshold) {
    return {
      action: 'add_revision_module',
      recommendedModuleType: 'revision',
      levelDelta: 0,
      timeRatio,
      reason: 'Extended inactivity detected; route learner through revision module.',
    };
  }

  if (score < policy.conceptGapScoreThreshold) {
    const shouldLowerLevel = score < policy.conceptGapHardScoreThreshold
      && attempts >= policy.conceptGapAttemptsForDowngrade;

    return {
      action: 'add_revision_module',
      recommendedModuleType: 'revision',
      levelDelta: shouldLowerLevel ? -1 : 0,
      timeRatio,
      reason: 'Low score indicates concept clarity gap; route learner through revision module.',
    };
  }

  if (score >= policy.practiceMinScore && score <= policy.practiceMaxScore) {
    return {
      action: 'add_practice_module',
      recommendedModuleType: 'practice',
      levelDelta: 0,
      timeRatio,
      reason: 'Mid-range score pattern suggests practice reinforcement.',
    };
  }

  if (score >= policy.slowLearnerMinScore && timeRatio > policy.slowLearnerTimeRatio) {
    return {
      action: 'reduce_load',
      recommendedModuleType: 'core',
      levelDelta: 0,
      timeRatio,
      reason: 'High time ratio despite good score; reduce load and keep core flow.',
    };
  }

  const isFastLearner = score >= policy.fastLearnerScoreThreshold && timeRatio < policy.fastLearnerTimeRatio;
  const isFastTrack = score >= policy.fastTrackScoreThreshold
    && attempts === policy.fastTrackAttemptCount
    && timeRatio <= policy.fastTrackMaxTimeRatio;

  if (isFastLearner || isFastTrack) {
    return {
      action: 'skip_basics',
      recommendedModuleType: 'core',
      levelDelta: 1,
      timeRatio,
      reason: 'Fast high-performance pattern detected; learner can skip basics.',
    };
  }

  if (
    attempts >= policy.inconsistentAttemptThreshold
    && Number.isFinite(previousScore)
    && Math.abs(score - Number(previousScore)) >= policy.inconsistentScoreDeltaThreshold
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

export function shiftAdaptiveSkillLevel(level: AdaptiveSkillLevel, delta: -1 | 0 | 1): AdaptiveSkillLevel {
  if (delta === 0) return level;

  const levelOrder: AdaptiveSkillLevel[] = ['beginner', 'intermediate', 'advanced'];
  const index = levelOrder.indexOf(level);
  if (index < 0) return level;

  const nextIndex = Math.max(0, Math.min(levelOrder.length - 1, index + delta));
  return levelOrder[nextIndex];
}

export function getDefaultAdaptiveDiagnosisPolicy(): AdaptiveDiagnosisPolicy {
  return { ...DEFAULT_DIAGNOSIS_POLICY };
}
