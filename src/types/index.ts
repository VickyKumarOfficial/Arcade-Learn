
export interface RoadmapComponent {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  resources: Resource[];
  completed: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'documentation' | 'course';
  url: string;
  duration?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  components: RoadmapComponent[];
  completedComponents: number;
  icon: string;
  color: string;
}

export interface CareerOption {
  id: string;
  title: string;
  description: string;
  averageSalary: string;
  requiredSkills: string[];
  roadmapIds: string[];
  companies: string[];
}

export interface UserProgress {
  roadmapId: string;
  completedComponents: string[];
  lastUpdated: Date;
}
