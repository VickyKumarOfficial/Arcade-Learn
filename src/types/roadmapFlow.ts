import type { Edge, Node } from 'reactflow';
import type { LucideIcon } from 'lucide-react';

export type RoadmapNodeData = {
  label: string;
  completed?: boolean;
  description?: string;
  optional?: boolean;
};

export interface RoadmapNodeResource {
  title: string;
  url: string;
}

export interface RoadmapNodeDetail {
  description: string;
  resources: RoadmapNodeResource[];
}

export interface RoadmapProject {
  id: string;
  title: string;
  description: string;
  skills: readonly string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyColor: string;
}

export interface RoadmapFaq {
  id: string;
  question: string;
  answer: string;
}

export interface CareerSupportFeature {
  id: string;
  title: string;
  highlights: readonly string[];
  action: string;
  icon: LucideIcon;
  accent: string;
  actionType?: 'navigate' | 'job-matches';
  actionTarget?: string;
}

export interface RoadmapFeatureModules {
  projects?: boolean;
  comments?: boolean;
  privacyWarning?: boolean;
  careerSupport?: boolean;
  jobMatches?: boolean;
  faq?: boolean;
  lockGate?: boolean;
}

export interface RoadmapUiText {
  projectSectionKicker?: string;
  projectSectionTitle?: string;
  projectSectionDescription?: string;
  faqKicker?: string;
  faqTitle?: string;
  faqDescription?: string;
  careerKicker?: string;
  careerTitle?: string;
  careerDescription?: string;
}

export interface RoadmapFlowConfig {
  roadmapKey: string;
  title: string;
  breadcrumbLabel: string;
  detailRoute: string;
  mentorRoute?: string;
  sectionCollapseEnabled?: boolean;
  defaultCollapsedSectionIds?: string[];
  flowNodes: Node<RoadmapNodeData>[];
  flowEdges: Edge[];
  mainNodeIds: string[];
  mainSectionIds: string[];
  nodeDetails?: Record<string, RoadmapNodeDetail>;
  projects: readonly RoadmapProject[];
  faqs: readonly RoadmapFaq[];
  careerSupportFeatures?: readonly CareerSupportFeature[];
  modules?: RoadmapFeatureModules;
  canvasWidth?: number;
  canvasHeight?: number;
  jobMatchesLimit?: number;
  uiText?: RoadmapUiText;
}
