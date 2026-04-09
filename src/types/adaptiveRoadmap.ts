export type FrontendSkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type FrontendModuleType = 'core' | 'revision' | 'practice';

export type FrontendModuleResourceType = 'article' | 'video' | 'interactive' | 'book';

export interface FrontendRoadmapModuleResource {
  title: string;
  url: string;
  type: FrontendModuleResourceType;
}

export interface FrontendRoadmapQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface FrontendRoadmapModule {
  module_id: string;
  roadmap_id: string;
  roadmap_key: string;
  concept_id: string;
  concept_label: string;
  node_ids: string[];
  type: FrontendModuleType;
  level: FrontendSkillLevel;
  title: string;
  objective: string;
  expected_time_minutes: number;
  topics: string[];
  resources: FrontendRoadmapModuleResource[];
  quiz: FrontendRoadmapQuizQuestion[];
}

export interface FrontendRoadmapModuleCatalog {
  schema_version: string;
  generated_at: string;
  roadmap_id: string;
  roadmap_key: string;
  roadmap_title: string;
  notes: string[];
  levels: Array<{ key: FrontendSkillLevel; code: string; label: string }>;
  module_types: FrontendModuleType[];
  module_count: number;
  modules: FrontendRoadmapModule[];
}

export interface FrontendQuizEvaluationResult {
  nodeId: string;
  topic: string;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
}

export interface FrontendRoadmapUserProgress {
  user_id: string;
  roadmap_key: string;
  selected_level: FrontendSkillLevel;
  effective_level: FrontendSkillLevel;
  completed_modules: string[];
  completed_node_ids: string[];
  current_module: string | null;
  scores: Record<string, number>;
  attempts: Record<string, number>;
  time_taken: Record<string, number>;
  recommended_module_type: Record<string, FrontendModuleType>;
  updated_at: string;
}
