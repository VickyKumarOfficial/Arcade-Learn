import { useState, useCallback, useMemo } from 'react';
import { 
  Problem, 
  SubmissionResult, 
  CodingStats, 
  ProblemFilters,
  Difficulty 
} from '@/types/codingPractice';
import { codingProblems, getProblemById } from '@/data/codingProblems';
import { runAllTestCases, extractFunctionName } from '@/services/codeExecutionService';

interface UseCodingPracticeReturn {
  // Problem state
  currentProblem: Problem | null;
  setCurrentProblem: (problem: Problem | null) => void;
  selectProblemById: (id: string) => void;
  
  // Code state
  code: string;
  setCode: (code: string) => void;
  resetCode: () => void;
  
  // Execution state
  isRunning: boolean;
  submissionResult: SubmissionResult | null;
  runTests: (runHidden?: boolean) => Promise<void>;
  submitSolution: () => Promise<void>;
  
  // Hints state
  viewedHints: number[];
  viewHint: (hintId: number) => void;
  getHintXPCost: () => number;
  
  // Problem list
  problems: Problem[];
  filteredProblems: Problem[];
  filters: ProblemFilters;
  setFilters: (filters: ProblemFilters) => void;
  
  // Stats (mock for now, will be from backend)
  stats: CodingStats;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

const defaultStats: CodingStats = {
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  totalAttempts: 0,
  successRate: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalXpFromCoding: 0,
  averageExecutionTime: 0,
};

export const useCodingPractice = (): UseCodingPracticeReturn => {
  // Problem state
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  
  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  
  // Hints state
  const [viewedHints, setViewedHints] = useState<number[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState<ProblemFilters>({});
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Stats (will be fetched from backend in future)
  const [stats] = useState<CodingStats>(defaultStats);

  // Select problem by ID
  const selectProblemById = useCallback((id: string) => {
    const problem = getProblemById(id);
    if (problem) {
      setCurrentProblem(problem);
      setCode(problem.starterCode);
      setViewedHints([]);
      setSubmissionResult(null);
      setError(null);
    } else {
      setError(`Problem with ID "${id}" not found`);
    }
  }, []);

  // Reset code to starter code
  const resetCode = useCallback(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode);
      setSubmissionResult(null);
    }
  }, [currentProblem]);

  // Run tests (sample tests only)
  const runTests = useCallback(async (runHidden: boolean = false) => {
    if (!currentProblem) {
      setError('No problem selected');
      return;
    }

    setIsRunning(true);
    setError(null);
    setSubmissionResult(null);

    try {
      // Extract function name from the problem signature
      const signatureMatch = currentProblem.functionSignature.match(/function\s+(\w+)/);
      const functionName = signatureMatch ? signatureMatch[1] : extractFunctionName(code);

      if (!functionName) {
        setError('Could not determine function name');
        setIsRunning(false);
        return;
      }

      const result = await runAllTestCases(
        code,
        functionName,
        currentProblem.testCases,
        currentProblem.timeLimit,
        runHidden
      );

      setSubmissionResult(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while running tests');
    } finally {
      setIsRunning(false);
    }
  }, [currentProblem, code]);

  // Submit solution (runs all tests including hidden)
  const submitSolution = useCallback(async () => {
    await runTests(true);
    // TODO: Save submission to backend
    // TODO: Award XP if passed
  }, [runTests]);

  // View a hint
  const viewHint = useCallback((hintId: number) => {
    if (!viewedHints.includes(hintId)) {
      setViewedHints(prev => [...prev, hintId]);
    }
  }, [viewedHints]);

  // Calculate total XP cost of viewed hints
  const getHintXPCost = useCallback(() => {
    if (!currentProblem) return 0;
    return currentProblem.hints
      .filter(hint => viewedHints.includes(hint.id))
      .reduce((total, hint) => total + hint.xpCost, 0);
  }, [currentProblem, viewedHints]);

  // Filtered problems based on filters
  const filteredProblems = useMemo(() => {
    return codingProblems.filter(problem => {
      // Filter by difficulty
      if (filters.difficulty && filters.difficulty.length > 0) {
        if (!filters.difficulty.includes(problem.difficulty)) {
          return false;
        }
      }

      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        if (!problem.tags.some(tag => filters.categories!.includes(tag))) {
          return false;
        }
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!problem.title.toLowerCase().includes(searchLower) &&
            !problem.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // TODO: Filter by status (solved/unsolved) when backend is connected

      return true;
    });
  }, [filters]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Problem state
    currentProblem,
    setCurrentProblem,
    selectProblemById,
    
    // Code state
    code,
    setCode,
    resetCode,
    
    // Execution state
    isRunning,
    submissionResult,
    runTests,
    submitSolution,
    
    // Hints state
    viewedHints,
    viewHint,
    getHintXPCost,
    
    // Problem list
    problems: codingProblems,
    filteredProblems,
    filters,
    setFilters,
    
    // Stats
    stats,
    
    // Error state
    error,
    clearError,
  };
};

export default useCodingPractice;
