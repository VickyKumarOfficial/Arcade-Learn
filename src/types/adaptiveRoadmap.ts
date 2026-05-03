export type AdaptiveSkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type AdaptiveModuleType = 'core' | 'revision' | 'practice';

export type AdaptiveModuleResourceType = 'article' | 'video' | 'interactive' | 'book';

export interface AdaptiveRoadmapModuleResource {
  title: string;
  url: string;
  type: AdaptiveModuleResourceType;
}

export interface AdaptiveRoadmapQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface AdaptiveRoadmapModule {
  module_id: string;
  roadmap_id: string;
  roadmap_key: string;
  concept_id: string;
  concept_label: string;
  node_ids: string[];
  type: AdaptiveModuleType;
  level: AdaptiveSkillLevel;
  title: string;
  objective: string;
  expected_time_minutes: number;
  topics: string[];
  resources: AdaptiveRoadmapModuleResource[];
  quiz: AdaptiveRoadmapQuizQuestion[];
}

export interface AdaptiveRoadmapModuleCatalog {
  schema_version: string;
  generated_at: string;
  roadmap_id: string;
  roadmap_key: string;
  roadmap_title: string;
  notes: string[];
  levels: Array<{ key: AdaptiveSkillLevel; code: string; label: string }>;
  module_types: AdaptiveModuleType[];
  module_count: number;
  modules: AdaptiveRoadmapModule[];
}

export interface AdaptiveQuizEvaluationResult {
  nodeId: string;
  topic: string;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
}

export interface AdaptiveRoadmapUserProgress {
  user_id: string;
  roadmap_key: string;
  selected_level: AdaptiveSkillLevel;
  effective_level: AdaptiveSkillLevel;
  completed_modules: string[];
  completed_node_ids: string[];
  current_module: string | null;
  scores: Record<string, number>;
  attempts: Record<string, number>;
  time_taken: Record<string, number>;
  recommended_module_type: Record<string, AdaptiveModuleType>;
  updated_at: string;
}

// Compatibility aliases used by legacy frontend-specific imports.
export type FrontendSkillLevel = AdaptiveSkillLevel;
export type FrontendModuleType = AdaptiveModuleType;
export type FrontendModuleResourceType = AdaptiveModuleResourceType;
export type FrontendRoadmapModuleResource = AdaptiveRoadmapModuleResource;
export type FrontendRoadmapQuizQuestion = AdaptiveRoadmapQuizQuestion;
export type FrontendRoadmapModule = AdaptiveRoadmapModule;
export type FrontendRoadmapModuleCatalog = AdaptiveRoadmapModuleCatalog;
export type FrontendQuizEvaluationResult = AdaptiveQuizEvaluationResult;
export type FrontendRoadmapUserProgress = AdaptiveRoadmapUserProgress;
