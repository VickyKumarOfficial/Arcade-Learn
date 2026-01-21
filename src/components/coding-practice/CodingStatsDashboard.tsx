import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Flame, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Code2,
  Zap,
  Award
} from 'lucide-react';
import { CodingStats, ProblemCategory } from '@/types/codingPractice';

interface CodingStatsDashboardProps {
  stats: CodingStats;
  recentActivity?: {
    date: string;
    problemsSolved: number;
    xpEarned: number;
  }[];
  className?: string;
}

// Default stats for new users
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

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  Arrays: '📊',
  Strings: '📝',
  Stack: '📚',
  Queue: '🚶',
  HashMap: '🗺️',
  LinkedList: '🔗',
  Tree: '🌳',
  Graph: '🕸️',
  Sorting: '📈',
  Searching: '🔍',
  DynamicProgramming: '🧩',
  Recursion: '🔄',
  Math: '🔢',
  Logic: '🧠',
};

export function CodingStatsDashboard({ 
  stats = defaultStats, 
  recentActivity = [],
  className = '' 
}: CodingStatsDashboardProps) {
  const totalProblems = 50; // Target total problems in system
  const progressPercentage = Math.min((stats.totalSolved / totalProblems) * 100, 100);
  
  // Calculate difficulty distribution percentages
  const totalDifficultyProblems = stats.easySolved + stats.mediumSolved + stats.hardSolved;
  const easyPercent = totalDifficultyProblems > 0 ? (stats.easySolved / totalDifficultyProblems) * 100 : 0;
  const mediumPercent = totalDifficultyProblems > 0 ? (stats.mediumSolved / totalDifficultyProblems) * 100 : 0;
  const hardPercent = totalDifficultyProblems > 0 ? (stats.hardSolved / totalDifficultyProblems) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Solved */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold text-green-500">{stats.totalSolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
            <Progress 
              value={progressPercentage} 
              className="mt-2 h-1.5 bg-green-500/20" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(0)}% of {totalProblems} problems
            </p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500">{stats.currentStreak} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Longest: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-500">{stats.successRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalAttempts} total attempts
            </p>
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">XP Earned</p>
                <p className="text-2xl font-bold text-purple-500">{stats.totalXpFromCoding.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From coding practice
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Problems by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                    Easy
                  </Badge>
                  <span className="text-sm font-medium">{stats.easySolved}</span>
                </div>
                <span className="text-xs text-muted-foreground">{easyPercent.toFixed(0)}%</span>
              </div>
              <Progress 
                value={easyPercent} 
                className="h-2 bg-green-500/20"
              />
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                    Medium
                  </Badge>
                  <span className="text-sm font-medium">{stats.mediumSolved}</span>
                </div>
                <span className="text-xs text-muted-foreground">{mediumPercent.toFixed(0)}%</span>
              </div>
              <Progress 
                value={mediumPercent} 
                className="h-2 bg-yellow-500/20"
              />
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                    Hard
                  </Badge>
                  <span className="text-sm font-medium">{stats.hardSolved}</span>
                </div>
                <span className="text-xs text-muted-foreground">{hardPercent.toFixed(0)}%</span>
              </div>
              <Progress 
                value={hardPercent} 
                className="h-2 bg-red-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg. Execution Time</span>
              </div>
              <span className="text-sm font-medium">
                {stats.averageExecutionTime > 0 
                  ? `${stats.averageExecutionTime.toFixed(2)} ms` 
                  : '-- ms'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Successful Submissions</span>
              </div>
              <span className="text-sm font-medium text-green-500">
                {stats.totalAttempts > 0 
                  ? Math.round(stats.totalAttempts * stats.successRate / 100)
                  : 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Failed Attempts</span>
              </div>
              <span className="text-sm font-medium text-red-500">
                {stats.totalAttempts > 0 
                  ? Math.round(stats.totalAttempts * (100 - stats.successRate) / 100)
                  : 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Favorite Category</span>
              </div>
              <span className="text-sm font-medium flex items-center gap-1">
                {stats.favoriteCategory ? (
                  <>
                    <span>{categoryIcons[stats.favoriteCategory] || '📁'}</span>
                    <span>{stats.favoriteCategory}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">None yet</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (if provided) */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20">{activity.date}</span>
                    <span className="text-sm">
                      {activity.problemsSolved} problem{activity.problemsSolved !== 1 ? 's' : ''} solved
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{activity.xpEarned} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for New Users */}
      {stats.totalSolved === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Start Your Coding Journey</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Solve your first problem to see your stats here!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CodingStatsDashboard;
