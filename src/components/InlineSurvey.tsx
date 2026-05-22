import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { SURVEY_QUESTIONS, useSurvey } from '@/contexts/SurveyContext';
import { useNavigate } from 'react-router-dom';

export const InlineSurvey: React.FC = () => {
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    state,
    setAnswer,
    toggleMultiAnswer,
    nextQuestion,
    previousQuestion,
    completeSurvey,
    getCurrentQuestion,
    isLastQuestion,
    isFirstQuestion,
    canProceed,
  } = useSurvey();

  if (state.isCompleted) {
    return null;
  }

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = state.answers[currentQuestion.id];
  const totalQuestions = SURVEY_QUESTIONS.length;
  const currentIndex = state.currentQuestionIndex;

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

  const handleNext = async () => {
    setSubmitError('');

    if (isLastQuestion()) {
      setIsSubmitting(true);
      try {
        await completeSurvey();
        navigate('/dashboard');
      } catch (error: any) {
        setSubmitError(error?.message || 'Failed to save survey. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="w-full flex flex-col mt-4">
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-lg font-semibold text-white leading-relaxed">
          {currentQuestion.question}
        </h3>
      </div>

      <div className="mb-4" aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const segmentClass = isCurrent
              ? 'bg-white'
              : isComplete
                ? 'bg-white/70'
                : 'bg-white/10';

            return (
              <span
                key={`survey-progress-${index}`}
                className={`h-1.5 flex-1 rounded-full transition ${segmentClass}`}
              />
            );
          })}
        </div>
        <span className="sr-only">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {currentQuestion.type === 'multiple' && currentQuestion.maxSelections && (
        <div className="mb-4">
          <Badge variant="outline" className="text-xs bg-white/5 text-white/70 border-white/10">
            Select up to {currentQuestion.maxSelections} options ({getSelectedCount()}/{currentQuestion.maxSelections})
          </Badge>
        </div>
      )}

      <div className="survey-scroll flex flex-wrap gap-3 mb-6 max-h-[42vh] overflow-y-auto pr-1">
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
                  if (!isDisabled) {
                    handleOptionSelect(option);
                  }
                }}
                disabled={isDisabled}
                type="button"
                className={`inline-flex max-w-full px-3.5 py-2 text-left rounded-2xl border transition-all duration-300 items-start gap-3 min-h-[40px] flex-none ${
                  isSelected
                    ? 'bg-white/15 border-white/40 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]'
                    : isDisabled
                    ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed text-white/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 border flex items-center justify-center transition-all duration-200 ${
                  currentQuestion.type === 'multiple' ? 'rounded-md' : 'rounded-full'
                } ${isSelected ? 'border-white bg-white' : 'border-white/30'}`}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {currentQuestion.type === 'multiple' ? (
                        <Check className="w-3 h-3 text-black font-bold" />
                      ) : (
                        <div className="w-2 h-2 bg-black rounded-full" />
                      )}
                    </motion.div>
                  )}
                </div>
                
                <span className="min-w-0 font-medium text-sm leading-snug whitespace-normal break-words">
                  {option}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-auto">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={isFirstQuestion()}
          className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent h-12 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="flex-[2] bg-white text-black hover:bg-white/90 h-12 rounded-xl"
        >
          {isLastQuestion() ? (isSubmitting ? 'Saving...' : 'Complete & Start Journey') : 'Next Question'}
          {!isLastQuestion() && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
      
      {submitError && (
        <div className="mt-4 text-xs text-red-400 text-center">
          {submitError}
        </div>
      )}
    </div>
  );
};
