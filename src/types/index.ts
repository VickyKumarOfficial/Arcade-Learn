
export interface RoadmapComponent {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  resources: Resource[];
  completed: boolean;
  xpReward: number;
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: 'complete_components' | 'complete_roadmap' | 'earn_xp' | 'streak_days' | 'complete_difficulty';
    value: number;
    roadmapId?: string;
    difficulty?: string;
  };
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserGameData {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  achievements: Achievement[];
  completedRoadmaps: string[];
  totalComponentsCompleted: number;
  completedComponents: string[]; // Track individual component IDs
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

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  course: string;
  achievement: string;
}
