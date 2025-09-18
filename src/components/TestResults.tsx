import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Star, Award, BarChart2 } from 'lucide-react';
import { TestResult, ComponentTest } from '@/types';
import { componentTests } from '@/data/componentTests';

interface TestResultsProps {
  result: TestResult;
  onRetake?: () => void;
  onClose: () => void;
  attemptsRemaining?: number;
}

export const TestResults: React.FC<TestResultsProps> = ({
  result,
  onRetake,
  onClose,
  attemptsRemaining = 0
}) => {
  // Get the test data
  const test = componentTests[result.testId];
  
  // Stars visualization
  const renderStars = (count: number) => {
    return (
      <div className="flex">
        {Array.from({ length: count }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
        {count === 0 && <span className="text-gray-400">No stars earned</span>}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className={result.passed ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            {result.passed ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
            {result.passed ? "Test Passed!" : "Test Failed"}
          </CardTitle>
          <Badge className={result.passed ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : 
                           "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}>
            {result.score}%
          </Badge>
        </div>
        <CardDescription>
          {result.passed 
            ? `Congratulations! You've completed this component with a score of ${result.score}%.` 
            : `You need ${test?.passingScore || 80}% to pass. Keep practicing and try again!`}
        </CardDescription>
        
        {/* Unlock Warning for scores below 80% */}
        {!result.passed && result.score < 80 && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200">Unlock Requirement Not Met</p>
                <p className="text-orange-700 dark:text-orange-300 mt-1">
                  You need at least 80% to unlock the next component in this roadmap.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="py-6">
        <div className="space-y-8">
          {/* Score Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Your Score</div>
              <div className="text-sm font-bold">{result.score}%</div>
            </div>
            <Progress 
              value={result.score} 
              className={`h-3 ${result.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
            />
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
              <div>0%</div>
              <div className="border-l-2 border-green-500 pl-1">{test?.passingScore || 80}% (passing)</div>
              <div>100%</div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium">Rating Points</h4>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {result.rating}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Score × 2 = {result.score} × 2
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <h4 className="font-medium">Stars Earned</h4>
              </div>
              <div className="text-xl mt-1">
                {renderStars(result.stars)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {result.rating} ÷ 100 = {result.stars}
              </div>
            </div>
          </div>
          
          {/* Questions Summary */}
          <div className="space-y-3">
            <h3 className="font-medium text-lg">Questions Summary</h3>
            <div className="flex justify-between text-sm">
              <div>Total Questions</div>
              <div>{result.answers.length}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Correct Answers</div>
              <div className="font-medium text-green-600 dark:text-green-400">
                {result.answers.filter(a => a.correct).length}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Incorrect Answers</div>
              <div className="font-medium text-red-600 dark:text-red-400">
                {result.answers.filter(a => !a.correct).length}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Attempt</div>
              <div>{result.attemptCount} of {test?.maxAttempts || 3}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Completed On</div>
              <div>{new Date(result.completedAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          {!result.passed && attemptsRemaining > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>You have {attemptsRemaining} attempts remaining.</strong> Review the material
                and try again to improve your score.
              </p>
            </div>
          )}
          
          {!result.passed && attemptsRemaining === 0 && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>No attempts remaining.</strong> Please contact an administrator
                if you need to unlock additional attempts.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {!result.passed && attemptsRemaining > 0 && onRetake && (
          <Button onClick={onRetake} variant="default">
            Retake Test
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TestResults;