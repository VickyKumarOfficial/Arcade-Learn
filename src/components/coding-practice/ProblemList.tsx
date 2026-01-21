import React from 'react';
import { Problem, Difficulty, ProblemCategory, ProblemFilters } from '@/types/codingPractice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter,
  CheckCircle2,
  Circle,
  ChevronRight
} from 'lucide-react';

interface ProblemListProps {
  problems: Problem[];
  selectedProblemId: string | null;
  onSelectProblem: (problemId: string) => void;
  filters: ProblemFilters;
  onFiltersChange: (filters: ProblemFilters) => void;
  // solvedProblems will come from backend later
  solvedProblems?: string[];
}

const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'Hard':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const CATEGORIES: ProblemCategory[] = [
  'Arrays',
  'Strings',
  'Stack',
  'Queue',
  'HashMap',
  'LinkedList',
  'Tree',
  'Graph',
  'Sorting',
  'Searching',
  'DynamicProgramming',
  'Recursion',
  'Math',
  'Logic',
];

export const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  filters,
  onFiltersChange,
  solvedProblems = [],
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleDifficultyChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, difficulty: undefined });
    } else {
      onFiltersChange({ ...filters, difficulty: [value as Difficulty] });
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, categories: undefined });
    } else {
      onFiltersChange({ ...filters, categories: [value as ProblemCategory] });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.difficulty?.[0] || 'all'}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.categories?.[0] || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Problem Stats */}
      <div className="px-4 py-2 border-b bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Showing {problems.length} problem{problems.length !== 1 ? 's' : ''}
          {solvedProblems.length > 0 && (
            <span> • {solvedProblems.length} solved</span>
          )}
        </p>
      </div>

      {/* Problem List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {problems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No problems found</p>
              <p className="text-xs">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-1">
              {problems.map((problem) => {
                const isSolved = solvedProblems.includes(problem.id);
                const isSelected = selectedProblemId === problem.id;

                return (
                  <button
                    key={problem.id}
                    onClick={() => onSelectProblem(problem.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Solved indicator */}
                      <div className="flex-shrink-0">
                        {isSolved ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Problem info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {problem.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${getDifficultyColor(problem.difficulty)}`}
                          >
                            {problem.difficulty}
                          </Badge>
                          {problem.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag} 
                              className="text-[10px] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProblemList;
