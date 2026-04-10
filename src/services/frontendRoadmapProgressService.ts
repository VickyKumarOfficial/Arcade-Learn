import type {
  FrontendModuleType,
  FrontendQuizEvaluationResult,
  FrontendRoadmapUserProgress,
  FrontendSkillLevel,
} from '@/types/adaptiveRoadmap';
import {
  diagnoseFrontendLearningSignal,
  shiftSkillLevel,
} from '@/services/frontendRoadmapDiagnosisService';

const STORAGE_PREFIX = 'arcadelearn_frontend_roadmap_progress_v1';
const DEFAULT_MODULE_TYPE: FrontendModuleType = 'core';

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function normalizeDurationSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.round(value);
}

function ensureSkillLevel(
  value: unknown,
  fallbackLevel: FrontendSkillLevel,
): FrontendSkillLevel {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  return fallbackLevel;
}

function ensureModuleType(value: unknown): FrontendModuleType {
  if (value === 'core' || value === 'revision' || value === 'practice') {
    return value;
  }

  return DEFAULT_MODULE_TYPE;
}

function uniqueStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const values = value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  return Array.from(new Set(values));
}

function numericRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {};

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => Number.isFinite(v))
    .map(([k, v]) => [k, Number(v)] as const);

  return Object.fromEntries(entries);
}

function moduleTypeRecord(value: unknown): Record<string, FrontendModuleType> {
  if (!value || typeof value !== 'object') return {};

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => Boolean(key?.trim()))
    .map(([key, moduleType]) => [key, ensureModuleType(moduleType)] as const);

  return Object.fromEntries(entries);
}

function getStorageKey(userId: string, roadmapKey: string): string {
  return `${STORAGE_PREFIX}_${userId}_${roadmapKey}`;
}

interface FrontendProgressIdentity {
  userId: string;
  roadmapKey: string;
}

interface FrontendProgressLoadParams extends FrontendProgressIdentity {
  selectedLevel: FrontendSkillLevel;
}

interface FrontendQuizAttemptParams {
  conceptId: string;
  result: FrontendQuizEvaluationResult;
  expectedTimeMinutes?: number;
}

interface FrontendCompletionParams {
  nodeId: string;
  conceptId: string;
  markModuleCompleted?: boolean;
}

class FrontendRoadmapProgressService {
  createDefaultProgress(params: FrontendProgressLoadParams): FrontendRoadmapUserProgress {
    const { userId, roadmapKey, selectedLevel } = params;

    return {
      user_id: userId,
      roadmap_key: roadmapKey,
      selected_level: selectedLevel,
      effective_level: selectedLevel,
      completed_modules: [],
      completed_node_ids: [],
      current_module: null,
      scores: {},
      attempts: {},
      time_taken: {},
      recommended_module_type: {},
      updated_at: new Date().toISOString(),
    };
  }

  loadProgress(params: FrontendProgressLoadParams): FrontendRoadmapUserProgress {
    const fallback = this.createDefaultProgress(params);

    if (typeof window === 'undefined') {
      return fallback;
    }

    try {
      const raw = window.localStorage.getItem(getStorageKey(params.userId, params.roadmapKey));
      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw) as Partial<FrontendRoadmapUserProgress>;

      const sanitized: FrontendRoadmapUserProgress = {
        user_id: typeof parsed.user_id === 'string' && parsed.user_id ? parsed.user_id : params.userId,
        roadmap_key:
          typeof parsed.roadmap_key === 'string' && parsed.roadmap_key
            ? parsed.roadmap_key
            : params.roadmapKey,
        selected_level: ensureSkillLevel(parsed.selected_level, params.selectedLevel),
        effective_level: ensureSkillLevel(parsed.effective_level, params.selectedLevel),
        completed_modules: uniqueStringList(parsed.completed_modules),
        completed_node_ids: uniqueStringList(parsed.completed_node_ids),
        current_module:
          typeof parsed.current_module === 'string' && parsed.current_module.trim().length > 0
            ? parsed.current_module
            : null,
        scores: numericRecord(parsed.scores),
        attempts: numericRecord(parsed.attempts),
        time_taken: numericRecord(parsed.time_taken),
        recommended_module_type: moduleTypeRecord(parsed.recommended_module_type),
        updated_at:
          typeof parsed.updated_at === 'string' && parsed.updated_at.trim().length > 0
            ? parsed.updated_at
            : new Date().toISOString(),
      };

      return sanitized;
    } catch (error) {
      console.error('[frontendRoadmapProgressService] Failed to load progress:', error);
      return fallback;
    }
  }

  saveProgress(progress: FrontendRoadmapUserProgress): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(
        getStorageKey(progress.user_id, progress.roadmap_key),
        JSON.stringify(progress),
      );
    } catch (error) {
      console.error('[frontendRoadmapProgressService] Failed to save progress:', error);
    }
  }

  updateSelectedLevel(
    progress: FrontendRoadmapUserProgress,
    selectedLevel: FrontendSkillLevel,
  ): FrontendRoadmapUserProgress {
    const hasAttempts = Object.keys(progress.attempts).length > 0;

    return {
      ...progress,
      selected_level: selectedLevel,
      effective_level: hasAttempts ? progress.effective_level : selectedLevel,
      updated_at: new Date().toISOString(),
    };
  }

  recordQuizAttempt(
    progress: FrontendRoadmapUserProgress,
    params: FrontendQuizAttemptParams,
  ): FrontendRoadmapUserProgress {
    const { conceptId, result, expectedTimeMinutes } = params;
    const safeConceptId = conceptId.trim();

    if (!safeConceptId) return progress;

    const nextAttempts = (progress.attempts[safeConceptId] ?? 0) + 1;
    const nextScore = clampPercentage(result.scorePercentage);
    const previousScore = progress.scores[safeConceptId];
    const nextTimeTaken =
      (progress.time_taken[safeConceptId] ?? 0) + normalizeDurationSeconds(result.durationSeconds);

    const diagnosis = diagnoseFrontendLearningSignal({
      scorePercentage: nextScore,
      attempts: nextAttempts,
      totalTimeSeconds: nextTimeTaken,
      expectedTimeMinutes,
      previousScorePercentage: previousScore,
    });

    const nextEffectiveLevel = shiftSkillLevel(progress.effective_level, diagnosis.levelDelta);
    const recommendedModuleType: FrontendModuleType = diagnosis.recommendedModuleType ?? DEFAULT_MODULE_TYPE;

    return {
      ...progress,
      effective_level: nextEffectiveLevel,
      scores: {
        ...progress.scores,
        [safeConceptId]: nextScore,
      },
      attempts: {
        ...progress.attempts,
        [safeConceptId]: nextAttempts,
      },
      time_taken: {
        ...progress.time_taken,
        [safeConceptId]: nextTimeTaken,
      },
      recommended_module_type: {
        ...progress.recommended_module_type,
        [safeConceptId]: recommendedModuleType,
      },
      current_module: safeConceptId,
      updated_at: new Date().toISOString(),
    };
  }

  markNodeCompleted(
    progress: FrontendRoadmapUserProgress,
    params: FrontendCompletionParams,
  ): FrontendRoadmapUserProgress {
    const nodeId = params.nodeId.trim();
    const conceptId = params.conceptId.trim();

    if (!nodeId || !conceptId) {
      return progress;
    }

    const completedModules = params.markModuleCompleted
      ? Array.from(new Set([...progress.completed_modules, conceptId]))
      : progress.completed_modules;

    return {
      ...progress,
      completed_node_ids: Array.from(new Set([...progress.completed_node_ids, nodeId])),
      completed_modules: completedModules,
      current_module: conceptId,
      updated_at: new Date().toISOString(),
    };
  }

  getRecommendedModuleType(
    progress: FrontendRoadmapUserProgress | null,
    conceptId: string,
  ): FrontendModuleType {
    if (!progress) return DEFAULT_MODULE_TYPE;

    const safeConceptId = conceptId.trim();
    if (!safeConceptId) return DEFAULT_MODULE_TYPE;

    return progress.recommended_module_type[safeConceptId] ?? DEFAULT_MODULE_TYPE;
  }
}

export const frontendRoadmapProgressService = new FrontendRoadmapProgressService();
