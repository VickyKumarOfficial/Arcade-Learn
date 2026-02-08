// Coding Practice Type Definitions

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type SupportedLanguage = 'javascript' | 'python';

export type ProblemCategory = 
  | 'Arrays'
  | 'Strings'
  | 'Stack'
  | 'Queue'
  | 'HashMap'
  | 'LinkedList'
  | 'Tree'
  | 'Graph'
  | 'Sorting'
  | 'Searching'
  | 'DynamicProgramming'
  | 'Recursion'
  | 'Math'
  | 'Logic';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
}

export interface Hint {
  id: number;
  text: string;
  xpCost: number;
}

// Language-specific code for a problem
export interface LanguageCode {
  javascript: {
    starterCode: string;
    functionName: string;
  };
  python: {
    starterCode: string;
    functionName: string;
  };
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  functionSignature: string; // For display (language agnostic)
  starterCode: string; // Default JS starter code (for backward compat)
  languageCode?: LanguageCode; // Multi-language support
  testCases: TestCase[];
  hints: Hint[];
  tags: ProblemCategory[];
  relatedRoadmapIds?: string[];
  timeLimit: number; // in milliseconds
  memoryLimit?: number; // in MB (if applicable)
  supportedLanguages?: SupportedLanguage[]; // Which languages are supported
}

export interface ExecutionResult {
  success: boolean;
  passed: boolean;
  output: string;
  expectedOutput: string;
  error?: string;
  executionTime: number; // in milliseconds
  testCaseId: string;
  consoleOutput?: string[]; // captured console.log outputs
  warnings?: string[]; // security or performance warnings
}

export interface SubmissionResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ExecutionResult[];
  overallPassed: boolean;
  totalExecutionTime: number;
}

export interface Submission {
  id: string;
  odingProblemId: string;
  odingUserId: string;
  code: string;
  language: SupportedLanguage;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error' | 'timeout';
  result?: SubmissionResult;
  xpEarned: number;
  hintsUsed: number;
  attemptNumber: number;
  submittedAt: Date;
  executionTime?: number;
}

export interface UserProblemProgress {
  odingProblemId: string;
  odingUserId: string;
  solved: boolean;
  attempts: number;
  bestSubmissionId?: string;
  hintsViewed: number[];
  firstSolvedAt?: Date;
  lastAttemptAt: Date;
  totalXpEarned: number;
}

export interface CodingStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalAttempts: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  totalXpFromCoding: number;
  averageExecutionTime: number;
  favoriteCategory?: ProblemCategory;
}

// XP Calculation Types
export interface XPMultipliers {
  firstAttempt: number;      // 2x
  noHints: number;           // 1.5x
  optimalSolution: number;   // 1.3x
  speedBonus: number;        // 1.2x (< 30 min)
}

export interface XPPenalties {
  hintUsed: number;          // -5 XP per hint
  extraAttempt: number;      // -2 XP per extra attempt
}

export const BASE_XP: Record<Difficulty, number> = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

export const XP_MULTIPLIERS: XPMultipliers = {
  firstAttempt: 2,
  noHints: 1.5,
  optimalSolution: 1.3,
  speedBonus: 1.2,
};

export const XP_PENALTIES: XPPenalties = {
  hintUsed: 5,
  extraAttempt: 2,
};

// Code Execution Types
export interface CodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkerMessage {
  type: 'execute' | 'terminate';
  code?: string;
  testCase?: TestCase;
  timeLimit?: number;
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'timeout';
  result?: ExecutionResult;
  error?: string;
}

// Filter/Sort Types for Problem List
export interface ProblemFilters {
  difficulty?: Difficulty[];
  categories?: ProblemCategory[];
  status?: 'all' | 'solved' | 'unsolved' | 'attempted';
  search?: string;
}

export type ProblemSortBy = 'title' | 'difficulty' | 'acceptance' | 'recent';
export type SortOrder = 'asc' | 'desc';

export interface ProblemListOptions {
  filters: ProblemFilters;
  sortBy: ProblemSortBy;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}
