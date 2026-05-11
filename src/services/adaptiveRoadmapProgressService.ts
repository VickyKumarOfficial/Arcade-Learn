import type {
  AdaptiveModuleType,
  AdaptiveQuizEvaluationResult,
  AdaptiveRoadmapUserProgress,
  AdaptiveSkillLevel,
} from '@/types/adaptiveRoadmap';
import { BACKEND_URL } from '@/config/env';
import {
  diagnoseAdaptiveLearningSignal,
  shiftAdaptiveSkillLevel,
  type AdaptiveDiagnosisPolicy,
} from '@/services/adaptiveRoadmapDiagnosisService';

const STORAGE_PREFIX = 'arcadelearn_roadmap_progress_v2';
const LEGACY_FRONTEND_STORAGE_PREFIX = 'arcadelearn_frontend_roadmap_progress_v1';
const DEFAULT_MODULE_TYPE: AdaptiveModuleType = 'core';
const ADAPTIVE_NODE_PREFIX = 'adaptive-node-';
const ROADMAP_LEVEL_META_COMPONENT_ID = '__roadmap_level__';

interface RoadmapProgressRow {
  component_id: string;
  completed_at: string | null;
  time_spent_minutes: number | null;
  extra_node_added: string | null;
  current_level: string | null;
  updated_at: string | null;
}

interface RoadmapProgressGetResponse {
  success: boolean;
  roadmapId?: string;
  rows?: RoadmapProgressRow[];
  error?: string;
}

interface RoadmapProgressSyncEntry {
  componentId: string;
  completedAt: string | null;
  timeSpentMinutes: number;
  extraNodeAdded: AdaptiveModuleType;
  currentLevel: AdaptiveSkillLevel;
}

interface RoadmapCreditsSummary {
  earnedCredits: number;
  totalCredits: number;
}

let hasWarnedRoadmapProgressNetwork = false;

function logRoadmapProgressNetworkWarning(context: string, error: unknown) {
  if (hasWarnedRoadmapProgressNetwork) return;

  hasWarnedRoadmapProgressNetwork = true;
  console.warn(
    `[adaptiveRoadmapProgressService] ${context}. Backend may be unavailable at ${BACKEND_URL || '(same-domain)'}.`,
    error,
  );
}

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
  fallbackLevel: AdaptiveSkillLevel,
): AdaptiveSkillLevel {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  return fallbackLevel;
}

function parseSkillLevel(value: unknown): AdaptiveSkillLevel | null {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  return null;
}

function ensureModuleType(value: unknown): AdaptiveModuleType {
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

function moduleTypeRecord(value: unknown): Record<string, AdaptiveModuleType> {
  if (!value || typeof value !== 'object') return {};

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => Boolean(key?.trim()))
    .map(([key, moduleType]) => [key, ensureModuleType(moduleType)] as const);

  return Object.fromEntries(entries);
}

function getStorageKey(userId: string, roadmapKey: string): string {
  return `${STORAGE_PREFIX}_${userId}_${roadmapKey}`;
}

function getLegacyFrontendStorageKey(userId: string, roadmapKey: string): string {
  return `${LEGACY_FRONTEND_STORAGE_PREFIX}_${userId}_${roadmapKey}`;
}

interface AdaptiveProgressIdentity {
  userId: string;
  roadmapKey: string;
}

interface AdaptiveProgressLoadParams extends AdaptiveProgressIdentity {
  selectedLevel: AdaptiveSkillLevel;
}

interface AdaptiveQuizAttemptParams {
  conceptId: string;
  result: AdaptiveQuizEvaluationResult;
  expectedTimeMinutes?: number;
  diagnosisPolicyOverrides?: Partial<AdaptiveDiagnosisPolicy>;
}

interface AdaptiveCompletionParams {
  nodeId: string;
  conceptId: string;
  markModuleCompleted?: boolean;
}

class AdaptiveRoadmapProgressService {
  shouldUseRemoteSync(userId: string): boolean {
    return Boolean(userId && userId !== 'anonymous');
  }

  hasStoredProgress(params: AdaptiveProgressIdentity): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const storageKey = getStorageKey(params.userId, params.roadmapKey);
      if (window.localStorage.getItem(storageKey) !== null) {
        return true;
      }

      const legacyStorageKey = getLegacyFrontendStorageKey(params.userId, params.roadmapKey);
      return window.localStorage.getItem(legacyStorageKey) !== null;
    } catch {
      return false;
    }
  }

  createDefaultProgress(params: AdaptiveProgressLoadParams): AdaptiveRoadmapUserProgress {
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

  loadProgress(params: AdaptiveProgressLoadParams): AdaptiveRoadmapUserProgress {
    const fallback = this.createDefaultProgress(params);

    if (typeof window === 'undefined') {
      return fallback;
    }

    try {
      const storageKey = getStorageKey(params.userId, params.roadmapKey);
      const legacyStorageKey = getLegacyFrontendStorageKey(params.userId, params.roadmapKey);
      const raw = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);

      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw) as Partial<AdaptiveRoadmapUserProgress>;

      const sanitized: AdaptiveRoadmapUserProgress = {
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
      console.error('[adaptiveRoadmapProgressService] Failed to load progress:', error);
      return fallback;
    }
  }

  mergeProgress(
    localProgress: AdaptiveRoadmapUserProgress,
    remoteProgress: AdaptiveRoadmapUserProgress,
  ): AdaptiveRoadmapUserProgress {
    const updatedAt =
      new Date(remoteProgress.updated_at).getTime() >= new Date(localProgress.updated_at).getTime()
        ? remoteProgress.updated_at
        : localProgress.updated_at;

    return {
      ...localProgress,
      completed_node_ids: Array.from(
        new Set([...localProgress.completed_node_ids, ...remoteProgress.completed_node_ids]),
      ),
      completed_modules: Array.from(
        new Set([...localProgress.completed_modules, ...remoteProgress.completed_modules]),
      ),
      recommended_module_type: {
        ...localProgress.recommended_module_type,
        ...remoteProgress.recommended_module_type,
      },
      effective_level: remoteProgress.effective_level ?? localProgress.effective_level,
      updated_at: updatedAt,
    };
  }

  async loadProgressFromBackend(
    params: AdaptiveProgressLoadParams,
  ): Promise<AdaptiveRoadmapUserProgress | null> {
    if (!this.shouldUseRemoteSync(params.userId)) {
      return null;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/${params.userId}/roadmap-progress/${encodeURIComponent(params.roadmapKey)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as RoadmapProgressGetResponse;
      if (!payload.success || !Array.isArray(payload.rows)) {
        return null;
      }

      if (payload.rows.length === 0) {
        return null;
      }

      const fallback = this.createDefaultProgress(params);
      const completedNodeIds = new Set<string>();
      const recommendedModuleType: Record<string, AdaptiveModuleType> = {};
      let remoteEffectiveLevel: AdaptiveSkillLevel | null = null;

      for (const row of payload.rows) {
        const componentId = typeof row.component_id === 'string' ? row.component_id.trim() : '';
        if (!componentId) {
          continue;
        }

        const levelFromRow = parseSkillLevel(row.current_level);
        if (!remoteEffectiveLevel && levelFromRow) {
          remoteEffectiveLevel = levelFromRow;
        }

        if (componentId === ROADMAP_LEVEL_META_COMPONENT_ID) {
          continue;
        }

        if (row.completed_at) {
          completedNodeIds.add(componentId);
        }

        if (componentId.startsWith(ADAPTIVE_NODE_PREFIX)) {
          const conceptId = componentId.slice(ADAPTIVE_NODE_PREFIX.length).trim();
          const moduleType = ensureModuleType(row.extra_node_added);
          if (conceptId && moduleType !== 'core') {
            recommendedModuleType[conceptId] = moduleType;
          }
        }

      }

      return {
        ...fallback,
        selected_level: params.selectedLevel,
        effective_level: remoteEffectiveLevel ?? params.selectedLevel,
        completed_node_ids: Array.from(completedNodeIds),
        recommended_module_type: recommendedModuleType,
        updated_at: payload.rows[0]?.updated_at ?? new Date().toISOString(),
      };
    } catch (error) {
      logRoadmapProgressNetworkWarning('Unable to fetch roadmap progress details', error);
      return null;
    }
  }

  buildRemoteSyncEntries(progress: AdaptiveRoadmapUserProgress): RoadmapProgressSyncEntry[] {
    const entriesByComponentId = new Map<string, RoadmapProgressSyncEntry>();
    const completedNodeIds = new Set(progress.completed_node_ids);

    const upsertEntry = (
      componentId: string,
      extraNodeAdded: AdaptiveModuleType,
      completedAt: string | null,
      conceptIdForTime?: string,
    ) => {
      const safeComponentId = componentId.trim();
      if (!safeComponentId) return;

      const conceptSeconds = conceptIdForTime
        ? (progress.time_taken[conceptIdForTime] ?? 0)
        : 0;

      const timeSpentMinutes = Math.max(
        0,
        Math.round(conceptSeconds / 60),
      );

      const previous = entriesByComponentId.get(safeComponentId);

      entriesByComponentId.set(safeComponentId, {
        componentId: safeComponentId,
        completedAt: completedAt ?? previous?.completedAt ?? null,
        timeSpentMinutes: Math.max(timeSpentMinutes, previous?.timeSpentMinutes ?? 0),
        extraNodeAdded,
        currentLevel: progress.effective_level,
      });
    };

    // Always write one metadata row so initial selected level is persisted
    // before any node completion, and overwritten as the effective level changes.
    upsertEntry(ROADMAP_LEVEL_META_COMPONENT_ID, 'core', null);

    for (const completedNodeId of completedNodeIds) {
      const isAdaptiveNode = completedNodeId.startsWith(ADAPTIVE_NODE_PREFIX);
      const conceptId = isAdaptiveNode
        ? completedNodeId.slice(ADAPTIVE_NODE_PREFIX.length)
        : completedNodeId;
      const adaptiveType = isAdaptiveNode
        ? ensureModuleType(progress.recommended_module_type[conceptId])
        : 'core';

      upsertEntry(completedNodeId, adaptiveType, progress.updated_at, conceptId);
    }

    for (const [conceptId, moduleType] of Object.entries(progress.recommended_module_type)) {
      const normalizedType = ensureModuleType(moduleType);
      if (normalizedType === 'core') {
        continue;
      }

      const adaptiveNodeId = `${ADAPTIVE_NODE_PREFIX}${conceptId}`;
      upsertEntry(
        adaptiveNodeId,
        normalizedType,
        completedNodeIds.has(adaptiveNodeId) ? progress.updated_at : null,
        conceptId,
      );
    }

    return Array.from(entriesByComponentId.values());
  }

  async syncProgressToBackend(
    progress: AdaptiveRoadmapUserProgress,
    creditsSummary?: RoadmapCreditsSummary,
  ): Promise<boolean> {
    if (!this.shouldUseRemoteSync(progress.user_id)) {
      return false;
    }

    try {
      const entries = this.buildRemoteSyncEntries(progress);

      const response = await fetch(`${BACKEND_URL}/api/user/${progress.user_id}/roadmap-progress/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId: progress.roadmap_key,
          entries,
          credits: creditsSummary,
        }),
      });

      if (!response.ok) {
        const payload = await response.text();
        console.warn('[adaptiveRoadmapProgressService] Roadmap progress sync failed:', payload);
        return false;
      }

      return true;
    } catch (error) {
      logRoadmapProgressNetworkWarning('Unable to sync roadmap progress details', error);
      return false;
    }
  }

  saveProgress(progress: AdaptiveRoadmapUserProgress): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(
        getStorageKey(progress.user_id, progress.roadmap_key),
        JSON.stringify(progress),
      );
    } catch (error) {
      console.error('[adaptiveRoadmapProgressService] Failed to save progress:', error);
    }
  }

  updateSelectedLevel(
    progress: AdaptiveRoadmapUserProgress,
    selectedLevel: AdaptiveSkillLevel,
  ): AdaptiveRoadmapUserProgress {
    const hasAttempts = Object.keys(progress.attempts).length > 0;

    return {
      ...progress,
      selected_level: selectedLevel,
      effective_level: hasAttempts ? progress.effective_level : selectedLevel,
      updated_at: new Date().toISOString(),
    };
  }

  recordQuizAttempt(
    progress: AdaptiveRoadmapUserProgress,
    params: AdaptiveQuizAttemptParams,
  ): AdaptiveRoadmapUserProgress {
    const { conceptId, result, expectedTimeMinutes, diagnosisPolicyOverrides } = params;
    const safeConceptId = conceptId.trim();

    if (!safeConceptId) return progress;

    const nextAttempts = (progress.attempts[safeConceptId] ?? 0) + 1;
    const nextScore = clampPercentage(result.scorePercentage);
    const previousScore = progress.scores[safeConceptId];
    const nextTimeTaken =
      (progress.time_taken[safeConceptId] ?? 0) + normalizeDurationSeconds(result.durationSeconds);

    const diagnosis = diagnoseAdaptiveLearningSignal({
      scorePercentage: nextScore,
      attempts: nextAttempts,
      totalTimeSeconds: nextTimeTaken,
      expectedTimeMinutes,
      previousScorePercentage: previousScore,
    }, diagnosisPolicyOverrides);

    const shouldFastTrackToAdvanced =
      progress.effective_level === 'beginner'
      && diagnosis.action === 'skip_basics'
      && nextScore >= 80
      && nextAttempts === 1;

    const nextEffectiveLevel = shouldFastTrackToAdvanced
      ? 'advanced'
      : shiftAdaptiveSkillLevel(progress.effective_level, diagnosis.levelDelta);
    const recommendedModuleType: AdaptiveModuleType = diagnosis.recommendedModuleType ?? DEFAULT_MODULE_TYPE;

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
    progress: AdaptiveRoadmapUserProgress,
    params: AdaptiveCompletionParams,
  ): AdaptiveRoadmapUserProgress {
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
    progress: AdaptiveRoadmapUserProgress | null,
    conceptId: string,
  ): AdaptiveModuleType {
    if (!progress) return DEFAULT_MODULE_TYPE;

    const safeConceptId = conceptId.trim();
    if (!safeConceptId) return DEFAULT_MODULE_TYPE;

    return progress.recommended_module_type[safeConceptId] ?? DEFAULT_MODULE_TYPE;
  }
}

export const adaptiveRoadmapProgressService = new AdaptiveRoadmapProgressService();
