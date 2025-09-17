import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SurveyAnswers, SurveyState, SurveyQuestion } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// Survey questions configuration
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'userType',
    question: 'What best describes you?',
    options: ['Student', 'Teacher', 'Working Professional', 'Other'],
    type: 'single'
  },
  {
    id: 'skillLevel',
    question: 'What is your current skill level?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
    type: 'single'
  },
  {
    id: 'techInterest',
    question: 'Which tech areas interest you? (Select all that apply)',
    options: ['Web Development', 'Data Science', 'Mobile Apps', 'DevOps', 'AI/ML', 'Cybersecurity', 'Game Development', 'Not sure yet'],
    type: 'multiple',
    maxSelections: 4
  },
  {
    id: 'goal',
    question: 'What are your main goals for joining ArcadeLearn? (Select all that apply)',
    options: ['Get a job', 'Switch careers', 'Upskill for current job', 'Build a project/startup', 'Just exploring', 'Learn new technologies'],
    type: 'multiple',
    maxSelections: 3
  },
  {
    id: 'timeCommitment',
    question: 'How much time can you dedicate weekly?',
    options: ['<5 hours', '5–10 hours', '10+ hours'],
    type: 'single'
  },
  {
    id: 'learningStyle',
    question: 'What are your preferred learning styles? (Select all that apply)',
    options: ['Videos', 'Reading', 'Projects', 'Group learning', 'Interactive tutorials', 'Practice exercises'],
    type: 'multiple',
    maxSelections: 3
  },
  {
    id: 'wantsRecommendations',
    question: 'Would you like to receive roadmap recommendations?',
    options: ['Yes', 'No'],
    type: 'single'
  }
];

type SurveyAction =
  | { type: 'SET_ANSWER'; questionId: keyof SurveyAnswers; answer: string | string[] }
  | { type: 'TOGGLE_MULTI_ANSWER'; questionId: keyof SurveyAnswers; option: string; maxSelections?: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'COMPLETE_SURVEY' }
  | { type: 'SHOW_SURVEY' }
  | { type: 'HIDE_SURVEY' }
  | { type: 'LOAD_SURVEY_STATE'; state: Partial<SurveyState> }
  | { type: 'RESET_SURVEY' };

const initialState: SurveyState = {
  isCompleted: false,
  currentQuestionIndex: 0,
  answers: {},
  isVisible: false,
};

function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.answer as any,
        },
      };
    case 'TOGGLE_MULTI_ANSWER':
      const currentAnswers = state.answers[action.questionId] as string[] || [];
      const optionIndex = currentAnswers.indexOf(action.option);
      let newAnswers: string[];
      
      if (optionIndex > -1) {
        // Remove option if already selected
        newAnswers = currentAnswers.filter(item => item !== action.option);
      } else {
        // Add option if not selected and within limit
        if (!action.maxSelections || currentAnswers.length < action.maxSelections) {
          newAnswers = [...currentAnswers, action.option];
        } else {
          newAnswers = currentAnswers;
        }
      }
      
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: newAnswers,
        },
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, SURVEY_QUESTIONS.length - 1),
      };
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };
    case 'COMPLETE_SURVEY':
      return {
        ...state,
        isCompleted: true,
        isVisible: false,
      };
    case 'SHOW_SURVEY':
      return {
        ...state,
        isVisible: true,
      };
    case 'HIDE_SURVEY':
      return {
        ...state,
        isVisible: false,
      };
    case 'LOAD_SURVEY_STATE':
      return {
        ...state,
        ...action.state,
      };
    case 'RESET_SURVEY':
      return initialState;
    default:
      return state;
  }
}

interface SurveyContextType {
  state: SurveyState;
  dispatch: React.Dispatch<SurveyAction>;
  setAnswer: (questionId: keyof SurveyAnswers, answer: string | string[]) => void;
  toggleMultiAnswer: (questionId: keyof SurveyAnswers, option: string, maxSelections?: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeSurvey: () => void;
  showSurvey: () => void;
  hideSurvey: () => void;
  getCurrentQuestion: () => SurveyQuestion;
  isLastQuestion: () => boolean;
  isFirstQuestion: () => boolean;
  canProceed: () => boolean;
  saveSurveyProgressLocally: () => void;
  loadSurveyProgressLocally: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};

interface SurveyProviderProps {
  children: ReactNode;
}

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(surveyReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load survey status when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      checkSurveyStatus();
    } else {
      // Reset survey state when user logs out
      dispatch({ type: 'RESET_SURVEY' });
    }
  }, [isAuthenticated, user]);

  // Save survey progress to localStorage whenever state changes (for persistence)
  useEffect(() => {
    if (user && state.answers && Object.keys(state.answers).length > 0) {
      saveSurveyProgressLocally();
    }
  }, [state.answers, state.currentQuestionIndex, user]);

  const checkSurveyStatus = async () => {
    if (!user) return;

    try {
      // First check localStorage for quick response
      const surveyCompleted = localStorage.getItem(`arcadelearn_survey_completed_${user.id}`);
      if (surveyCompleted === 'true') {
        dispatch({ type: 'LOAD_SURVEY_STATE', state: { isCompleted: true, isVisible: false } });
        return;
      }

      // Then check backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${apiBaseUrl}/user/${user.id}/survey/status`);
      
      if (response.ok) {
        const { completed } = await response.json();
        
        if (completed) {
          // User has already completed the survey - update localStorage and hide survey
          localStorage.setItem(`arcadelearn_survey_completed_${user.id}`, 'true');
          localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
          dispatch({ type: 'LOAD_SURVEY_STATE', state: { isCompleted: true, isVisible: false } });
          return;
        }
      }

      // If not completed, check for saved progress first
      loadSurveyProgressLocally();
      
      // If no saved progress was loaded, show fresh survey
      setTimeout(() => {
        if (!state.isCompleted && Object.keys(state.answers).length === 0) {
          dispatch({ type: 'SHOW_SURVEY' });
        }
      }, 100);
    } catch (error) {
      console.error('Failed to check survey status:', error);
      // Fallback: only show survey if not marked as completed in localStorage
      const surveyCompleted = localStorage.getItem(`arcadelearn_survey_completed_${user.id}`);
      if (surveyCompleted !== 'true') {
        loadSurveyProgressLocally();
        // Small delay to allow state to update before checking
        setTimeout(() => {
          if (!state.isCompleted) {
            dispatch({ type: 'SHOW_SURVEY' });
          }
        }, 100);
      }
    }
  };

  const setAnswer = (questionId: keyof SurveyAnswers, answer: string | string[]) => {
    dispatch({ type: 'SET_ANSWER', questionId, answer });
  };

  const toggleMultiAnswer = (questionId: keyof SurveyAnswers, option: string, maxSelections?: number) => {
    dispatch({ type: 'TOGGLE_MULTI_ANSWER', questionId, option, maxSelections });
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const previousQuestion = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };

  const completeSurvey = async () => {
    if (!user) return;

    try {
      // Save completed survey to backend
      await saveSurveyToBackend(state.answers as SurveyAnswers);
      
      // Mark as completed in localStorage
      localStorage.setItem(`arcadelearn_survey_completed_${user.id}`, 'true');
      localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
      
      dispatch({ type: 'COMPLETE_SURVEY' });
    } catch (error) {
      console.error('Failed to save survey:', error);
      // Still complete the survey locally even if backend fails
      localStorage.setItem(`arcadelearn_survey_completed_${user.id}`, 'true');
      localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
      dispatch({ type: 'COMPLETE_SURVEY' });
    }
  };

  const showSurvey = () => {
    dispatch({ type: 'SHOW_SURVEY' });
  };

  const hideSurvey = () => {
    dispatch({ type: 'HIDE_SURVEY' });
  };

  const getCurrentQuestion = (): SurveyQuestion => {
    return SURVEY_QUESTIONS[state.currentQuestionIndex];
  };

  const isLastQuestion = (): boolean => {
    return state.currentQuestionIndex === SURVEY_QUESTIONS.length - 1;
  };

  const isFirstQuestion = (): boolean => {
    return state.currentQuestionIndex === 0;
  };

  const canProceed = (): boolean => {
    const currentQuestion = getCurrentQuestion();
    const answer = state.answers[currentQuestion.id];
    
    if (!answer) return false;
    
    // For multi-select questions, check if at least one option is selected
    if (currentQuestion.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    // For single-select questions, check if answer exists
    return typeof answer === 'string' && answer.length > 0;
  };

  const saveSurveyProgressLocally = () => {
    if (!user) return;
    
    const progressData = {
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      isCompleted: state.isCompleted,
    };
    localStorage.setItem(`arcadelearn_survey_progress_${user.id}`, JSON.stringify(progressData));
  };

  const loadSurveyProgressLocally = () => {
    if (!user) return;

    try {
      const savedProgress = localStorage.getItem(`arcadelearn_survey_progress_${user.id}`);
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        console.log('Loading saved progress:', progressData);
        
        // Validate the progress data and ensure it's within bounds
        const validatedState = {
          currentQuestionIndex: Math.max(0, Math.min(progressData.currentQuestionIndex || 0, SURVEY_QUESTIONS.length - 1)),
          answers: progressData.answers || {},
          isCompleted: progressData.isCompleted || false,
          isVisible: !progressData.isCompleted // Only show if not completed
        };
        
        console.log('Validated state to load:', validatedState);
        dispatch({ type: 'LOAD_SURVEY_STATE', state: validatedState });
        
        // If survey is not completed and has progress, show it
        if (!validatedState.isCompleted) {
          dispatch({ type: 'SHOW_SURVEY' });
        }
      }
    } catch (error) {
      console.error('Failed to load survey progress:', error);
      // If there's an error loading progress, start fresh
      dispatch({ type: 'SHOW_SURVEY' });
    }
  };

  const saveSurveyToBackend = async (answers: SurveyAnswers) => {
    if (!user) throw new Error('User not authenticated');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    const response = await fetch(`${apiBaseUrl}/user/${user.id}/survey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      throw new Error(`Failed to save survey: ${response.statusText}`);
    }

    return response.json();
  };

  const value: SurveyContextType = {
    state,
    dispatch,
    setAnswer,
    toggleMultiAnswer,
    nextQuestion,
    previousQuestion,
    completeSurvey,
    showSurvey,
    hideSurvey,
    getCurrentQuestion,
    isLastQuestion,
    isFirstQuestion,
    canProceed,
    saveSurveyProgressLocally,
    loadSurveyProgressLocally,
  };

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
};