import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useSurvey } from '@/contexts/SurveyContext';
import { useAuth } from '@/contexts/AuthContext';

export const SurveyModal: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    state,
    setAnswer,
    nextQuestion,
    previousQuestion,
    completeSurvey,
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
    setAnswer(currentQuestion.id, option);
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Pure black background overlay with dramatic gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black to-black dark:from-black dark:via-black dark:to-black" />
        
        {/* Survey Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-md"
        >
          <Card className="border-2 border-gray-800/50 dark:border-black shadow-2xl bg-black/95 dark:bg-black backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 bg-gradient-to-br from-black/90 to-gray-900/90 dark:from-black dark:to-black rounded-t-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-800 dark:to-black rounded-full flex items-center justify-center shadow-lg shadow-black/60"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Welcome to ArcadeLearn!
                </CardTitle>
                <p className="text-sm text-gray-300 dark:text-gray-300 font-medium">
                  Help us personalize your learning experience
                </p>
              </div>
              
              <div className="flex justify-center">
                <Badge 
                  variant="secondary" 
                  className="text-xs px-3 py-1 bg-gray-800/90 dark:bg-black text-gray-200 dark:text-white border border-gray-700 dark:border-gray-800"
                >
                  Question {state.currentQuestionIndex + 1} of {7}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <motion.div
                key={currentQuestion.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white dark:text-white mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h3>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.2 }}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 group relative overflow-hidden ${
                        currentAnswer === option
                          ? 'border-gray-600 dark:border-gray-500 bg-gradient-to-r from-gray-800/80 to-gray-700/80 dark:from-gray-900/80 dark:to-black/80 text-gray-200 dark:text-gray-200 shadow-lg shadow-black/40 dark:shadow-black/60'
                          : 'border-gray-700 dark:border-gray-800 hover:border-gray-600 dark:hover:border-gray-600 hover:bg-gradient-to-r hover:from-gray-800/40 hover:to-gray-700/40 dark:hover:from-gray-900/40 dark:hover:to-black/40 bg-gray-900/50 dark:bg-black/50 text-gray-300 dark:text-gray-300 hover:shadow-md dark:hover:shadow-black/40'
                      }`}
                    >
                      {/* Subtle background animation */}
                      <div 
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          currentAnswer === option
                            ? 'opacity-100 bg-gradient-to-r from-gray-700/20 to-gray-900/20 dark:from-gray-800/20 dark:to-black/20'
                            : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-gray-700/10 to-gray-900/10 dark:from-gray-800/10 dark:to-black/10'
                        }`}
                      />
                      
                      <span className="relative font-medium text-sm sm:text-base">{option}</span>
                      
                      {/* Selection indicator */}
                      {currentAnswer === option && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex justify-between bg-black/50 dark:bg-black rounded-b-lg">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={isFirstQuestion()}
                className="flex items-center gap-2 border-gray-700 dark:border-gray-800 text-gray-300 dark:text-gray-300 hover:bg-gray-800/50 dark:hover:bg-black/50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 dark:from-gray-800 dark:to-black dark:hover:from-gray-700 dark:hover:to-gray-900 text-white border-0"
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