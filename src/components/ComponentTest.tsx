import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Shield, Eye, X } from 'lucide-react';
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
  
  // Anti-cheating state
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [testTerminated, setTestTerminated] = useState<boolean>(false);
  const [terminationReason, setTerminationReason] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [showPreTestRules, setShowPreTestRules] = useState<boolean>(true);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  
  // Handle case where test is not found
  if (!test) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card">
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
  
  // Anti-cheating functions
  const handleTabSwitch = useCallback(() => {
    if (testComplete || testTerminated) return;
    
    const newWarningCount = tabSwitchWarnings + 1;
    setTabSwitchWarnings(newWarningCount);
    
    if (newWarningCount === 1) {
      // First warning
      setShowWarningModal(true);
    } else if (newWarningCount >= 2) {
      // Second violation - terminate test
      terminateTest('Multiple tab switches detected');
    }
  }, [tabSwitchWarnings, testComplete, testTerminated]);

  const terminateTest = (reason: string) => {
    setTestTerminated(true);
    setTerminationReason(reason);
    setTestComplete(true);
    
    // Create a failed test result
    const result: TestResult = {
      testId,
      componentId,
      roadmapId,
      score: 0,
      rating: 0,
      stars: 0,
      passed: false,
      attemptCount: previousAttempts + 1,
      completedAt: new Date(),
      answers: []
    };
    
    onComplete(result);
  };

  const forceEndTest = () => {
    // Calculate current score before termination
    let totalPoints = 0;
    let earnedPoints = 0;
    const answeredQuestions = Math.min(currentQuestion + 1, test.questions.length);
    
    test.questions.slice(0, answeredQuestions).forEach(question => {
      const userAnswer = answers[question.id];
      totalPoints += question.points;
      
      if (userAnswer !== undefined) {
        const userAnswerStr = userAnswer.toString();
        const correctAnswerStr = question.correctAnswer.toString();
        if (userAnswerStr === correctAnswerStr) {
          earnedPoints += question.points;
        }
      }
    });
    
    const currentScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    terminateTest(`Test ended by user. Score at termination: ${currentScore}% (${earnedPoints}/${totalPoints} points from ${answeredQuestions} questions)`);
  };

  const startTest = () => {
    setShowPreTestRules(false);
    setTestStarted(true);
    // Start the timer and enable anti-cheating
    setTimeout(() => {
      enterFullscreen();
      setIsFullscreen(true);
    }, 100);
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  // Prevent copy/paste
  const preventCopyPaste = useCallback((e: Event) => {
    e.preventDefault();
    if (e.type === 'copy') {
      terminateTest('Copy operation detected - anti-cheating violation');
    } else if (e.type === 'paste') {
      terminateTest('Paste operation detected - anti-cheating violation');
    } else if (e.type === 'cut') {
      terminateTest('Cut operation detected - anti-cheating violation');
    }
    return false;
  }, []);

  const preventRightClick = useCallback((e: Event) => {
    e.preventDefault();
    terminateTest('Right-click detected - anti-cheating violation');
    return false;
  }, []);

  const preventKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Prevent common shortcuts
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x' || e.key === 's' || e.key === 'p')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      terminateTest(`Keyboard shortcut (${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}) detected - anti-cheating violation`);
      return false;
    }
  }, []);

  // Anti-cheating effects
  useEffect(() => {
    if (testComplete || testTerminated || !testStarted) return;

    // Request fullscreen when test starts
    enterFullscreen();
    setIsFullscreen(true);

    // Add event listeners for anti-cheating
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    
    // Detect visibility changes (tab switches)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Detect fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && !testComplete && !testTerminated) {
        handleTabSwitch();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Detect focus changes
    const handleFocusChange = () => {
      if (!document.hasFocus() && !testComplete && !testTerminated) {
        handleTabSwitch();
      }
    };
    
    window.addEventListener('blur', handleFocusChange);

    // Cleanup function
    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleFocusChange);
      
      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        exitFullscreen();
      }
    };
  }, [handleTabSwitch, testComplete, testTerminated, testStarted, preventCopyPaste, preventRightClick, preventKeyboardShortcuts]);
  
  // Timer effect
  useEffect(() => {
    if (testComplete || !testStarted) return;
    
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
  }, [testComplete, testStarted]);
  
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
  
  // Render test termination screen
  if (testTerminated) {
    // Check if this was a cheating violation or force-end
    const isCheatingViolation = terminationReason.includes('tab switch') || 
                               terminationReason.includes('Copy operation detected') || 
                               terminationReason.includes('Paste operation detected') || 
                               terminationReason.includes('Cut operation detected') ||
                               terminationReason.includes('Right-click detected') ||
                               terminationReason.includes('Keyboard shortcut') ||
                               terminationReason.includes('Fullscreen') ||
                               terminationReason.includes('Multiple tab switches') ||
                               terminationReason.includes('anti-cheating violation');
    
    const isForceEnd = terminationReason.includes('Test ended by user');
    
    // Extract score from force-end message or set to zero for cheating
    let currentScore = 0;
    let scoreMessage = '';
    
    if (isForceEnd) {
      const scoreMatch = terminationReason.match(/Score at termination: (\d+)%/);
      if (scoreMatch) {
        currentScore = parseInt(scoreMatch[1]);
        const detailsMatch = terminationReason.match(/\(([^)]+)\)/);
        scoreMessage = detailsMatch ? detailsMatch[1] : '';
      }
    } else {
      // For cheating violations, score remains 0
      currentScore = 0;
    }
    
    const answeredQuestions = currentQuestion + 1;
    
    return (
      <div className="fixed inset-0 bg-background/90 z-[9999] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              {isForceEnd ? 'Test Ended Early' : 'Test Terminated'}
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300 text-base sm:text-lg font-semibold">
              {isCheatingViolation ? 'Anti-Cheating Violation Detected' : 'Test Ended by User'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-4">
              {isCheatingViolation && (
                <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-semibold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    Violation Details
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {terminationReason}
                  </p>
                </div>
              )}
              
              {isForceEnd && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    Test Summary
                  </div>
                  <p className="text-sm text-foreground">
                    You chose to end the test early. Your progress has been saved.
                  </p>
                </div>
              )}
              
              <div className="bg-muted rounded-lg p-3 sm:p-4">
                <div className="text-center">
                  {isCheatingViolation ? (
                    <>
                      <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                        TEST TERMINATED DUE TO CHEATING
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-red-500 dark:text-red-400 mb-1">
                        0%
                      </div>
                      <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold">
                        Final Score (Cheating Penalty Applied)
                      </div>
                      <div className="text-xs text-red-500 dark:text-red-500 mt-2 bg-red-100 dark:bg-red-900/50 p-2 rounded">
                        Anti-cheating violation results in automatic zero score
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                        {currentScore}%
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Score at Early Termination
                      </div>
                      <div className="text-xs text-primary mt-1">
                        Your progress has been saved
                      </div>
                      {scoreMessage && (
                        <div className="text-xs text-muted-foreground mt-2 break-words">
                          Details: {scoreMessage}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 break-words">
                        Reason: {terminationReason}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {isCheatingViolation ? (
                <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">
                      🚨 TEST TERMINATED DUE TO CHEATING 🚨
                    </div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">
                      ⚠️ ANTI-CHEATING VIOLATION DETECTED ⚠️
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-2 rounded">
                      <strong>Violation Details:</strong> {terminationReason}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-primary text-sm text-center">
                    <strong>Test ended early by user choice.</strong><br />
                    You can retake the test anytime to improve your score.
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground text-center">
                {isCheatingViolation ? 'Violation detected' : 'Test ended'} at: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button onClick={onCancel} className="w-full" variant="destructive">
              Return to Roadmap
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Warning Modal
  const WarningModal = () => (
    <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="text-yellow-600 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Warning: Tab Switch Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We detected that you switched away from the test. This is your first warning. 
            If this happens again, your test will be automatically terminated.
          </p>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              <strong>Test Rules:</strong>
              <br />• Stay focused on the test tab
              <br />• No copying or pasting allowed
              <br />• Keep the test in fullscreen mode
              <br />• No external resources permitted
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setShowWarningModal(false)} 
            className="w-full"
            variant="default"
          >
            I Understand - Continue Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Render test results if complete
  if (testComplete && testResult && !testTerminated) {
    return (
      <div className="p-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className={`${testResult.passed ? "bg-primary/10" : "bg-destructive/10"} p-4 sm:p-6 border-b border-border`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-2xl flex items-center gap-2 text-foreground">
                {testResult.passed ? (
                  <CheckCircle className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <AlertCircle className="text-destructive w-5 h-5 sm:w-6 sm:h-6" />
                )}
                {testResult.passed ? "Test Passed!" : "Test Failed"}
              </CardTitle>
              <Badge className={`${testResult.passed ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"} text-xs sm:text-sm`}>
                Score: {testResult.score}%
              </Badge>
            </div>
            <CardDescription className="text-sm sm:text-base mt-2">
              {testResult.passed 
                ? `Great job! You've earned ${testResult.rating} rating points and ${testResult.stars} stars.` 
                : `You need ${test.passingScore}% to pass. Keep practicing and try again!`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-foreground">Score</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">Target: {test.passingScore}%</span>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-3 sm:h-4">
                    {/* Background progress bar */}
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${testResult.passed ? "bg-primary" : "bg-destructive"}`}
                      style={{ width: `${testResult.score}%` }}
                    />
                    
                    {/* Score label positioned at actual progress */}
                    <div 
                      className="absolute top-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ 
                        left: `${Math.min(testResult.score, 95)}%`,
                        transform: 'translateX(-50%)',
                        height: '100%'
                      }}
                    >
                      {testResult.score}%
                    </div>
                    
                    {/* 80% passing threshold marker */}
                    {test.passingScore !== 100 && (
                      <>
                        <div 
                          className="absolute top-0 w-0.5 h-full bg-yellow-500"
                          style={{ left: `${(test.passingScore / 100) * 100}%` }}
                        />
                        <div 
                          className="absolute -top-6 text-xs font-medium text-yellow-600 whitespace-nowrap bg-white px-1 rounded shadow-sm"
                          style={{ left: `${(test.passingScore / 100) * 100}%`, transform: 'translateX(-50%)' }}
                        >
                          {test.passingScore}%
                        </div>
                      </>
                    )}
                  </div>
                </div>              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-primary/10 p-3 sm:p-4 rounded-lg text-center border border-primary/20">
                  <div className="text-base sm:text-lg font-bold text-primary">
                    {testResult.rating}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating Points</div>
                </div>
                <div className="bg-primary/10 p-3 sm:p-4 rounded-lg text-center border border-primary/20">
                  <div className="text-base sm:text-lg font-bold text-primary">
                    {"⭐".repeat(testResult.stars)}
                    {testResult.stars === 0 && "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Stars Earned</div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 space-y-2">
                <h3 className="text-sm sm:text-base font-medium">Question Summary:</h3>
                <div className="text-xs sm:text-sm">
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
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between p-4 sm:p-6">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Close
            </Button>
            {!testResult.passed && previousAttempts + 1 < test.maxAttempts && (
              <Button onClick={onCancel} variant="secondary" className="w-full sm:w-auto">
                Retake Test
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Current question being displayed
  const question = test.questions[currentQuestion];
  
  return (
    <>
      {/* Pre-test rules modal */}
      {showPreTestRules && (
        <div className="fixed inset-0 bg-background/80 z-[10000] flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md lg:max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground">Test Security Rules</h3>
              <div className="text-left text-xs sm:text-sm text-muted-foreground space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span>The test will run in fullscreen mode for security</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>Switching tabs or windows will terminate the test</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>Copy, paste, cut, and right-click are disabled</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <div>
                    <span>These keyboard shortcuts will terminate the test:</span>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 ml-4 break-words">
                      • Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A (copy/paste/select)<br/>
                      • Ctrl+S, Ctrl+P (save/print)<br/>
                      • Ctrl+U (view source)<br/>
                      • Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (developer tools)<br/>
                      • F12 (developer console)
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">⏰</span>
                  <span>Test duration: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold">✅</span>
                  <span>You can force-end the test using the "End Test" button</span>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 sm:mb-6">
                <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
                  Any violation of these rules will automatically terminate the test and record your current score.
                </p>
              </div>
              <Button 
                onClick={startTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                I Understand - Start Test
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Force End Test Button - Always visible during active test */}
      {testStarted && !testComplete && !testTerminated && !showPreTestRules && (
        <div className="fixed bottom-4 right-4 z-[10001]">
          <Button
            onClick={forceEndTest}
            variant="destructive"
            size="lg"
            className="flex items-center gap-2 shadow-lg border-2 border-red-600"
          >
            <X className="w-5 h-5" />
            Force End Test
          </Button>
        </div>
      )}
      
      {/* Warning Modal */}
      {showWarningModal && <WarningModal />}
      
      {/* Full screen test container - only show when test has started */}
      {testStarted && !testComplete && !testTerminated && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] overflow-auto">
        {/* Anti-cheating header */}
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <Shield className="w-4 h-4" />
              <span>Anti-Cheating Active</span>
              {tabSwitchWarnings > 0 && (
                <Badge variant="destructive" className="ml-2">
                  Warnings: {tabSwitchWarnings}/2
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main test content */}
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="w-full bg-white dark:bg-gray-800 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  {test.title}
                </CardTitle>
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
              
              {/* Security notice */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Test Security:</strong> Copy/paste disabled • Tab switching monitored • Fullscreen required
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Question {currentQuestion + 1} of {test.questions.length}</span>
                  <span>{answeredCount} answered</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardHeader>
            
            <CardContent className="py-6" style={{ userSelect: 'none' }}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-4" style={{ userSelect: 'none' }}>
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
                          <Label 
                            htmlFor={`${question.id}-option-${index}`} 
                            className="cursor-pointer"
                            style={{ userSelect: 'none' }}
                          >
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
                        <Label 
                          htmlFor={`${question.id}-true`} 
                          className="cursor-pointer"
                          style={{ userSelect: 'none' }}
                        >
                          True
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${question.id}-false`} />
                        <Label 
                          htmlFor={`${question.id}-false`} 
                          className="cursor-pointer"
                          style={{ userSelect: 'none' }}
                        >
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
              
              <div className="flex items-center gap-4">
                {answeredCount < test.questions.length && currentQuestion === test.questions.length - 1 && (
                  <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {test.questions.length - answeredCount} unanswered
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secure Mode
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      )}
    </>
  );
};

export default ComponentTest;