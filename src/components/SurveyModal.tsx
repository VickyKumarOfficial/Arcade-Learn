import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Sparkles, Check, X } from 'lucide-react';
import { useSurvey } from '@/contexts/SurveyContext';
import { useAuth } from '@/contexts/AuthContext';

export const SurveyModal: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    state,
    setAnswer,
    toggleMultiAnswer,
    nextQuestion,
    previousQuestion,
    completeSurvey,
    hideSurvey,
    getCurrentQuestion,
    isLastQuestion,
    isFirstQuestion,
    canProceed,
  } = useSurvey();

  // Only show survey for authenticated users
  if (!isAuthenticated || !state.isVisible || state.isCompleted) {
    return null;
  }

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = state.answers[currentQuestion.id];

  const handleOptionSelect = (option: string) => {
    if (currentQuestion.type === 'multiple') {
      toggleMultiAnswer(currentQuestion.id, option, currentQuestion.maxSelections);
    } else {
      setAnswer(currentQuestion.id, option);
    }
  };

  const isOptionSelected = (option: string): boolean => {
    if (currentQuestion.type === 'multiple') {
      return Array.isArray(currentAnswer) && currentAnswer.includes(option);
    } else {
      return currentAnswer === option;
    }
  };

  const handleSkipSurvey = () => {
    if (user) {
      // Mark that user has been shown the survey in this session
      sessionStorage.setItem(`arcadelearn_survey_shown_${user.id}`, 'true');
    }
    hideSurvey();
  };

  const getSelectedCount = (): number => {
    if (currentQuestion.type === 'multiple' && Array.isArray(currentAnswer)) {
      return currentAnswer.length;
    }
    return 0;
  };

  const isMaxSelectionReached = (): boolean => {
    if (currentQuestion.type === 'multiple' && currentQuestion.maxSelections) {
      return getSelectedCount() >= currentQuestion.maxSelections;
    }
    return false;
  };

  const handleNext = () => {
    if (isLastQuestion()) {
      completeSurvey();
    } else {
      nextQuestion();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-background/95" />
        
        {/* Survey Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg mx-auto my-8 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-2 border-gray-800/50 dark:border-black shadow-2xl bg-black/95 dark:bg-black backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="text-center space-y-4 bg-gradient-to-br from-black/90 to-gray-900/90 dark:from-black dark:to-black rounded-t-lg flex-shrink-0 relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipSurvey}
                className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-gray-800/50 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              
              <div className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                  Welcome to ArcadeLearn!
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Help us personalize your learning experience
                </p>
              </div>
              
              <div className="flex justify-center">
                <Badge 
                  variant="secondary" 
                  className="text-xs px-3 py-1"
                >
                  Question {state.currentQuestionIndex + 1} of {7}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4 sm:p-6 flex-1 overflow-y-auto">
              <motion.div
                key={currentQuestion.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-white dark:text-white mb-4 sm:mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h3>
                
                {/* Selection limit indicator for multi-select */}
                {currentQuestion.type === 'multiple' && currentQuestion.maxSelections && (
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                      Select up to {currentQuestion.maxSelections} options ({getSelectedCount()}/{currentQuestion.maxSelections})
                    </Badge>
                  </div>
                )}
                
                <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = isOptionSelected(option);
                    const isDisabled = currentQuestion.type === 'multiple' && 
                      !isSelected && isMaxSelectionReached();
                    
                    return (
                      <motion.div
                        key={option}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.2 }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isDisabled) {
                              handleOptionSelect(option);
                            }
                          }}
                          disabled={isDisabled}
                          type="button"
                          className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                            isSelected
                              ? 'border-primary bg-primary/20 shadow-lg text-foreground'
                              : isDisabled
                              ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed text-muted-foreground'
                              : 'border-border hover:border-primary hover:bg-primary/10 bg-card/50 hover:shadow-md text-foreground'
                          }`}
                        >
                          {/* Custom checkbox/radio indicator */}
                          <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                            currentQuestion.type === 'multiple' 
                              ? 'rounded-md' 
                              : 'rounded-full'
                          } ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-border'
                          }`}>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {currentQuestion.type === 'multiple' ? (
                                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                ) : (
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                )}
                              </motion.div>
                            )}
                          </div>
                          
                          <span className="font-medium text-sm sm:text-base leading-tight">
                            {option}
                          </span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex justify-between bg-black/50 dark:bg-black rounded-b-lg flex-shrink-0 p-4 sm:p-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={isFirstQuestion()}
                  className="flex items-center gap-2 border-gray-700 dark:border-gray-800 text-gray-300 dark:text-gray-300 hover:bg-gray-800/50 dark:hover:bg-black/50 text-sm sm:text-base"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleSkipSurvey}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm"
                >
                  Skip Survey
                </Button>
              </div>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 text-sm sm:text-base"
              >
                {isLastQuestion() ? 'Complete' : 'Next'}
                {!isLastQuestion() && <ChevronRight className="w-4 h-4" />}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};