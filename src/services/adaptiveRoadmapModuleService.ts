import { ALL_NODE_DETAILS, SECTION_NODE_MAP } from '@/data/allNodeDetails';
import { frontendRoadmapModuleService } from '@/services/frontendRoadmapModuleService';
import type {
  AdaptiveModuleType,
  AdaptiveRoadmapModule,
  AdaptiveSkillLevel,
} from '@/types/adaptiveRoadmap';

interface GetModuleForNodeParams {
  roadmapKey: string;
  nodeId: string;
  level: AdaptiveSkillLevel;
  type?: AdaptiveModuleType;
}

export interface AdaptiveRoadmapModuleProvider {
  getModuleById(moduleId: string | null | undefined): AdaptiveRoadmapModule | null;
  getModuleForNode(params: GetModuleForNodeParams): AdaptiveRoadmapModule | null;
}

const SYNTH_PREFIX = 'synth-adaptive';
const providerRegistry = new Map<string, AdaptiveRoadmapModuleProvider>();
const synthesizedModulesById = new Map<string, AdaptiveRoadmapModule>();

function toConceptId(nodeId: string): string {
  return SECTION_NODE_MAP[nodeId] ?? nodeId;
}

function getExpectedTimeMinutes(moduleType: AdaptiveModuleType): number {
  if (moduleType === 'revision') return 25;
  if (moduleType === 'practice') return 30;
  return 40;
}

function getObjective(type: AdaptiveModuleType, conceptLabel: string): string {
  if (type === 'revision') {
    return `Rebuild fundamentals and clarity in ${conceptLabel} before advancing to the next topic.`;
  }

  if (type === 'practice') {
    return `Strengthen applied problem-solving in ${conceptLabel} with focused reinforcement tasks.`;
  }

  return `Build complete conceptual and practical mastery in ${conceptLabel}.`;
}

function getModuleId(
  roadmapKey: string,
  conceptId: string,
  level: AdaptiveSkillLevel,
  type: AdaptiveModuleType,
): string {
  return `${SYNTH_PREFIX}::${roadmapKey}::${conceptId}::${level}::${type}`;
}

function buildSynthesizedModule(
  roadmapKey: string,
  conceptId: string,
  level: AdaptiveSkillLevel,
  type: AdaptiveModuleType,
): AdaptiveRoadmapModule {
  const sectionData = ALL_NODE_DETAILS[conceptId];
  const conceptLabel = sectionData?.section.label ?? conceptId.toUpperCase();

  const topics = sectionData
    ? Array.from(new Set(sectionData.subNodes.flatMap((subNode) => subNode.whatYoullLearn || [])))
      .map((topic) => topic.trim())
      .filter(Boolean)
      .slice(0, 16)
    : [`Core understanding of ${conceptLabel}`];

  const resources = sectionData
    ? Array.from(
      new Map(
        sectionData.subNodes
          .flatMap((subNode) => subNode.resources || [])
          .filter((resource) => resource?.url && resource?.title)
          .map((resource) => [resource.url, resource]),
      ).values(),
    )
    : [];

  const nodeIds = sectionData
    ? [conceptId, ...sectionData.subNodes.map((subNode) => subNode.id)]
    : [conceptId];

  return {
    module_id: getModuleId(roadmapKey, conceptId, level, type),
    roadmap_id: `${roadmapKey}-auto`,
    roadmap_key: roadmapKey,
    concept_id: conceptId,
    concept_label: conceptLabel,
    node_ids: nodeIds,
    type,
    level,
    title: `${conceptLabel} ${type === 'core' ? 'Core' : type === 'revision' ? 'Revision' : 'Practice'} (${level})`,
    objective: getObjective(type, conceptLabel),
    expected_time_minutes: getExpectedTimeMinutes(type),
    topics,
    resources,
    quiz: [],
  };
}

const synthesizedModuleProvider: AdaptiveRoadmapModuleProvider = {
  getModuleById(moduleId) {
    if (!moduleId) return null;
    return synthesizedModulesById.get(moduleId) ?? null;
  },

  getModuleForNode(params) {
    const conceptId = toConceptId(params.nodeId);
    const moduleType = params.type ?? 'core';
    const moduleId = getModuleId(params.roadmapKey, conceptId, params.level, moduleType);
    const existing = synthesizedModulesById.get(moduleId);
    if (existing) {
      return existing;
    }

    const synthesized = buildSynthesizedModule(params.roadmapKey, conceptId, params.level, moduleType);
    synthesizedModulesById.set(moduleId, synthesized);
    return synthesized;
  },
};

const frontendCatalogProvider: AdaptiveRoadmapModuleProvider = {
  getModuleById(moduleId) {
    return frontendRoadmapModuleService.getModuleById(moduleId);
  },

  getModuleForNode(params) {
    if (params.roadmapKey !== 'frontend') {
      return null;
    }

    return frontendRoadmapModuleService.getModuleForNode({
      nodeId: params.nodeId,
      level: params.level,
      type: params.type,
    });
  },
};

providerRegistry.set('frontend', frontendCatalogProvider);
providerRegistry.set('frontend-catalog', frontendCatalogProvider);

export function registerAdaptiveRoadmapModuleProvider(
  key: string,
  provider: AdaptiveRoadmapModuleProvider,
): void {
  const normalized = key.trim();
  if (!normalized) {
    return;
  }

  providerRegistry.set(normalized, provider);
}

export function resolveAdaptiveRoadmapModuleProvider(params: {
  roadmapKey: string;
  providerKey?: string;
}): AdaptiveRoadmapModuleProvider {
  const explicitKey = params.providerKey?.trim();
  if (explicitKey) {
    return providerRegistry.get(explicitKey) ?? synthesizedModuleProvider;
  }

  return providerRegistry.get(params.roadmapKey) ?? synthesizedModuleProvider;
}

export const adaptiveRoadmapModuleService = {
  registerProvider: registerAdaptiveRoadmapModuleProvider,
  resolveProvider: resolveAdaptiveRoadmapModuleProvider,
};
