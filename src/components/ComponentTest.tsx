import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ComponentTest as ComponentTestType, TestQuestion, TestResult } from '@/types';
import { componentTests } from '@/data/componentTests';
import { useGameTest } from '@/contexts/GameTestContext';

interface ComponentTestProps {
  testId: string;
  componentId: string;
  roadmapId: string;
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}

export const ComponentTest: React.FC<ComponentTestProps> = ({ 
  testId, 
  componentId, 
  roadmapId, 
  onComplete, 
  onCancel 
}) => {
  // Get the test data
  const test = componentTests[testId];
  
  // Handle case where test is not found
  if (!test) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Test Not Found
          </CardTitle>
          <CardDescription>
            The test for "{testId}" could not be found. Please contact support.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onCancel} variant="outline" className="w-full">
            Close
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // State for the test
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(test.timeLimit * 60); // Convert minutes to seconds
  const [testComplete, setTestComplete] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { state } = useGameTest();
  
  // Check if this is a retake
  const previousAttempts = state.userData.testResults.filter(
    result => result.testId === testId && result.componentId === componentId
  ).length;
  
  // Timer effect
  useEffect(() => {
    if (testComplete) return;
    
    const timer = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testComplete]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle answer selection
  const selectAnswer = (questionId: string, answer: string | boolean) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  // Handle navigation between questions
  const goToNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    return answers[test.questions[currentQuestion].id] !== undefined;
  };
  
  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / test.questions.length) * 100;
  
  // Submit the test
  const submitTest = () => {
    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const answersWithCorrectness = test.questions.map(question => {
      const userAnswer = answers[question.id];
      
      // Ensure consistent string comparison for all answer types
      const userAnswerStr = userAnswer?.toString() || '';
      const correctAnswerStr = question.correctAnswer.toString();
      const isCorrect = userAnswerStr === correctAnswerStr;
      
      totalPoints += question.points;
      if (isCorrect) earnedPoints += question.points;
      
      return {
        questionId: question.id,
        answer: userAnswer || '',
        correct: isCorrect
      };
    });
    
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= test.passingScore;
    const rating = score * 2; // Each percentage point is worth 2 rating points
    const stars = Math.floor(rating / 100); // Each 100 rating points = 1 star
    
    const result: TestResult = {
      testId,
      componentId,
      roadmapId,
      score,
      rating,
      stars,
      passed,
      attemptCount: previousAttempts + 1,
      completedAt: new Date(),
      answers: answersWithCorrectness
    };
    
    setTestResult(result);
    setTestComplete(true);
    onComplete(result);
  };
  
  // Calculate time warning thresholds
  const isTimeWarning = timeLeft < 60; // Less than 1 minute
  const isTimeCritical = timeLeft < 30; // Less than 30 seconds
  
  // Check if the test is ready to submit (all questions answered)
  const canSubmit = Object.keys(answers).length === test.questions.length;
  
  // Render test results if complete
  if (testComplete && testResult) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className={testResult.passed ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              {testResult.passed ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <AlertCircle className="text-red-500" />
              )}
              {testResult.passed ? "Test Passed!" : "Test Failed"}
            </CardTitle>
            <Badge className={testResult.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              Score: {testResult.score}%
            </Badge>
          </div>
          <CardDescription>
            {testResult.passed 
              ? `Great job! You've earned ${testResult.rating} rating points and ${testResult.stars} stars.` 
              : `You need ${test.passingScore}% to pass. Keep practicing and try again!`}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Score</span>
              <span className="text-sm font-bold">{testResult.score}%</span>
            </div>
            <Progress 
              value={testResult.score} 
              className={`h-3 ${testResult.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`} 
            />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {testResult.rating}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Rating Points</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  {"⭐".repeat(testResult.stars)}
                  {testResult.stars === 0 && "0"}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Stars Earned</div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h3 className="font-medium">Question Summary:</h3>
              <div className="text-sm">
                <p>Correct answers: {testResult.answers.filter(a => a.correct).length} of {test.questions.length}</p>
                {!testResult.passed && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Review the material and try again. You can retake this test up to {test.maxAttempts} times.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          {!testResult.passed && previousAttempts + 1 < test.maxAttempts && (
            <Button onClick={onCancel} variant="secondary">
              Retake Test
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Current question being displayed
  const question = test.questions[currentQuestion];
  
  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{test.title}</CardTitle>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isTimeCritical ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
            isTimeWarning ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        <CardDescription>{test.description}</CardDescription>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {test.questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="py-6">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">
              {question.question}
            </h3>
            
            {/* Multiple choice question */}
            {question.type === 'multiple-choice' && question.options && (
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={(value) => selectAnswer(question.id, value)}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
                    <Label htmlFor={`${question.id}-option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {/* True/False question */}
            {question.type === 'true-false' && (
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={(value) => selectAnswer(question.id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${question.id}-true`} />
                  <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${question.id}-false`} />
                  <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion < test.questions.length - 1 ? (
            <Button
              onClick={goToNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submitTest}
              disabled={!canSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Test
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel} className="text-gray-500">
            Cancel
          </Button>
          
          {answeredCount < test.questions.length && currentQuestion === test.questions.length - 1 && (
            <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {test.questions.length - answeredCount} unanswered
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ComponentTest;