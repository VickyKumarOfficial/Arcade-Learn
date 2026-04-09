import frontendModulesCatalogJson from '@/data/modules/frontend-roadmap-modules.json';
import { SECTION_NODE_MAP } from '@/data/allNodeDetails';
import type {
  FrontendRoadmapModule,
  FrontendRoadmapModuleCatalog,
  FrontendModuleType,
  FrontendSkillLevel,
} from '@/types/adaptiveRoadmap';

const frontendCatalog = frontendModulesCatalogJson as FrontendRoadmapModuleCatalog;

const modulesById = new Map<string, FrontendRoadmapModule>();
const modulesByConceptLevelType = new Map<string, FrontendRoadmapModule>();

for (const module of frontendCatalog.modules) {
  modulesById.set(module.module_id, module);
  modulesByConceptLevelType.set(`${module.concept_id}::${module.level}::${module.type}`, module);
}

function toConceptId(nodeId: string): string {
  return SECTION_NODE_MAP[nodeId] ?? nodeId;
}

function makeConceptLevelTypeKey(
  conceptId: string,
  level: FrontendSkillLevel,
  type: FrontendModuleType,
): string {
  return `${conceptId}::${level}::${type}`;
}

class FrontendRoadmapModuleService {
  getCatalog(): FrontendRoadmapModuleCatalog {
    return frontendCatalog;
  }

  getModuleById(moduleId: string | null | undefined): FrontendRoadmapModule | null {
    if (!moduleId) return null;
    return modulesById.get(moduleId) ?? null;
  }

  getModuleForConcept(params: {
    conceptId: string;
    level: FrontendSkillLevel;
    type?: FrontendModuleType;
  }): FrontendRoadmapModule | null {
    const { conceptId, level, type = 'core' } = params;
    return modulesByConceptLevelType.get(makeConceptLevelTypeKey(conceptId, level, type)) ?? null;
  }

  getModuleForNode(params: {
    nodeId: string;
    level: FrontendSkillLevel;
    type?: FrontendModuleType;
  }): FrontendRoadmapModule | null {
    const conceptId = toConceptId(params.nodeId);
    return this.getModuleForConcept({ conceptId, level: params.level, type: params.type ?? 'core' });
  }
}

export const frontendRoadmapModuleService = new FrontendRoadmapModuleService();
