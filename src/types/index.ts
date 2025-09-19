
export interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string | boolean;
  explanation?: string;
  points: number;
}

// Test System Types

export interface ComponentTest {
  id: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  timeLimit: number; // minutes
  passingScore: number; // 80
  maxAttempts: number; // 3
}

export interface TestResult {
  testId: string;
  componentId: string;
  roadmapId: string;
  score: number; // 0-100
  rating: number; // score * 2 (0-200)
  stars: number; // rating / 100 (0-2 stars max)
  moduleScore: number; // NEW: calculated score for module (0.5-10 based on 80-100%)
  passed: boolean; // score >= 80
  attemptCount: number;
  completedAt: Date;
  answers: { questionId: string; answer: string | number | boolean; correct: boolean }[];
}

export interface RoadmapComponent {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  resources: Resource[];
  completed: boolean;
  // Test-related properties
  testId?: string;
  testResult?: TestResult;
  isLocked: boolean;
  prerequisiteIds: string[]; // Component IDs that must be completed first
  // Strong lock system properties
  lockReason?: string; // Reason why component is locked
  requiredScore?: number; // Required score to unlock next component
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
  tags: string[]; // Tags for career recommendation matching
}

// Rating Badge System (replacing Achievement system)
export interface RatingBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'stars' | 'perfect' | 'streak' | 'milestone';
  condition: {
    type: 'total_stars' | 'perfect_scores' | 'consecutive_passes' | 'roadmap_complete';
    value: number;
    roadmapId?: string;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: 'complete_components' | 'complete_roadmap' | 'earn_rating' | 'streak_days' | 'complete_difficulty';
    value: number;
    roadmapId?: string;
    difficulty?: string;
  };
  ratingReward: number; // Rating points reward instead of XP
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface SurveyAnswers {
  userType: string | string[];
  skillLevel: string | string[];
  techInterest: string | string[];
  goal: string | string[];
  timeCommitment: string | string[];
  learningStyle: string | string[];
  wantsRecommendations: string | string[];
}

export interface SurveyQuestion {
  id: keyof SurveyAnswers;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
  maxSelections?: number;
}

export interface SurveyState {
  isCompleted: boolean;
  currentQuestionIndex: number;
  answers: Partial<SurveyAnswers>;
  isVisible: boolean;
}

// Updated User Data (Rating System)
export interface UserGameData {
  totalRating: number; // Sum of all component ratings
  totalStars: number; // Based on totalScore thresholds
  totalScore: number; // Overall score from completed modules (replaces averageScore)
  completedTests: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  badges: RatingBadge[]; // Instead of achievements
  completedRoadmaps: string[];
  totalComponentsCompleted: number;
  completedComponents: string[]; // Track individual component IDs
  testResults: TestResult[]; // Store all test results
}

export interface CareerOption {
  id: string;
  title: string;
  description: string;
  averageSalary: string;
  requiredSkills: string[];
  roadmapIds: string[];
  companies: string[];
  tags: string[]; // Tags for career recommendation matching
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
