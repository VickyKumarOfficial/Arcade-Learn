import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SurveyAnswers, SurveyState, SurveyQuestion } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
      // Reset survey state and clear session storage when user logs out
      dispatch({ type: 'RESET_SURVEY' });
      // Clear all session storage keys related to surveys
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('arcadelearn_survey_shown_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, [isAuthenticated, user]);

  // Save survey progress to localStorage whenever state changes (for persistence)
  useEffect(() => {
    if (user && state.answers && Object.keys(state.answers).length > 0 && !state.isCompleted) {
      saveSurveyProgressLocally();
    }
  }, [state.answers, state.currentQuestionIndex, user, state.isCompleted]);

  const checkSurveyStatus = async () => {
    if (!user) return;

    try {
      // First check localStorage for completion status
      const surveyCompleted = localStorage.getItem(`arcadelearn_survey_completed_${user.id}`);
      if (surveyCompleted === 'true') {
        dispatch({ type: 'LOAD_SURVEY_STATE', state: { isCompleted: true, isVisible: false } });
        return;
      }

      // Check if we've already shown survey to this user in this session
      const surveyShownThisSession = sessionStorage.getItem(`arcadelearn_survey_shown_${user.id}`);
      
      // Check backend for survey completion status
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
      let backendResponse;
      try {
        const response = await fetch(`${backendUrl}/api/user/${user.id}/survey/status`);
        backendResponse = response.ok ? await response.json() : null;
      } catch (error) {
        console.log('Backend not available, checking Supabase directly...');
        backendResponse = null;
      }
      
      if (backendResponse) {
        const { completed, isNewUser } = backendResponse;
        
        if (completed) {
          // User has already completed the survey - mark as completed and hide
          localStorage.setItem(`arcadelearn_survey_completed_${user.id}`, 'true');
          localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
          dispatch({ type: 'LOAD_SURVEY_STATE', state: { isCompleted: true, isVisible: false } });
          return;
        }
        
        // Only show survey for new users who haven't completed it and haven't been shown it this session
        if (isNewUser && !surveyShownThisSession) {
          // Check for saved progress first
          loadSurveyProgressLocally();
          
          // Mark that we've shown the survey to this user in this session
          sessionStorage.setItem(`arcadelearn_survey_shown_${user.id}`, 'true');
          
          // Show survey after a brief delay to allow state to settle
          setTimeout(() => {
            if (!state.isCompleted) {
              dispatch({ type: 'SHOW_SURVEY' });
            }
          }, 500);
        }
      } else {
        // Fallback: Direct Supabase check
        try {
          const { data: surveyData, error: surveyError } = await supabase
            .from('user_survey_responses')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_latest', true)
            .single();

          if (surveyData) {
            // User has completed survey
            localStorage.setItem(`arcadelearn_survey_completed_${user.id}`, 'true');
            localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
            dispatch({ type: 'LOAD_SURVEY_STATE', state: { isCompleted: true, isVisible: false } });
            return;
          }

          // No survey found, show it if not shown this session
          if (!surveyShownThisSession) {
            sessionStorage.setItem(`arcadelearn_survey_shown_${user.id}`, 'true');
            loadSurveyProgressLocally();
            
            setTimeout(() => {
              if (!state.isCompleted) {
                dispatch({ type: 'SHOW_SURVEY' });
              }
            }, 500);
          }
        } catch (supabaseError) {
          console.error('Supabase check failed:', supabaseError);
          // Conservative fallback: only show if definitely not completed and not shown this session
          if (surveyCompleted !== 'true' && !surveyShownThisSession) {
            sessionStorage.setItem(`arcadelearn_survey_shown_${user.id}`, 'true');
            loadSurveyProgressLocally();
            
            setTimeout(() => {
              if (!state.isCompleted) {
                dispatch({ type: 'SHOW_SURVEY' });
              }
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check survey status:', error);
      // Conservative fallback: only show if definitely not completed and not shown this session
      const surveyCompleted = localStorage.getItem(`arcadelearn_survey_completed_${user.id}`);
      const surveyShownThisSession = sessionStorage.getItem(`arcadelearn_survey_shown_${user.id}`);
      
      if (surveyCompleted !== 'true' && !surveyShownThisSession) {
        sessionStorage.setItem(`arcadelearn_survey_shown_${user.id}`, 'true');
        loadSurveyProgressLocally();
        
        setTimeout(() => {
          if (!state.isCompleted) {
            dispatch({ type: 'SHOW_SURVEY' });
          }
        }, 500);
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

    console.log('🔄 Starting survey completion process for user:', user.id);
    console.log('📝 Survey answers:', state.answers);

    try {
      // Try to save completed survey to backend first
      console.log('💾 Attempting to save survey via backend...');
      await saveSurveyToBackend(state.answers as SurveyAnswers);
      console.log('✅ Survey saved via backend successfully');
    } catch (backendError) {
      console.error('❌ Backend save failed, trying direct Supabase save:', backendError);
      
      // Fallback: Save directly to Supabase
      try {
        console.log('💾 Attempting to save survey via Supabase fallback...');
        await saveSurveyToSupabase(state.answers as SurveyAnswers);
        console.log('✅ Survey saved via Supabase fallback successfully');
      } catch (supabaseError) {
        console.error('❌ Supabase fallback save also failed:', supabaseError);
        // Continue anyway - we'll still mark as completed locally
      }
    }
    
    // Mark as completed in localStorage regardless of save success
    console.log('💾 Marking survey as completed in localStorage');
    localStorage.setItem(`arcadelearn_survey_completed_${user.id}`, 'true');
    localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
    
    console.log('🎉 Survey completion process finished');
    dispatch({ type: 'COMPLETE_SURVEY' });
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
        console.log('Loading saved survey progress:', progressData);
        
        // Validate the progress data and ensure it's within bounds
        const validatedState = {
          currentQuestionIndex: Math.max(0, Math.min(progressData.currentQuestionIndex || 0, SURVEY_QUESTIONS.length - 1)),
          answers: progressData.answers || {},
          isCompleted: progressData.isCompleted || false,
          isVisible: false // Don't automatically show, let checkSurveyStatus decide
        };
        
        console.log('Validated survey state to load:', validatedState);
        dispatch({ type: 'LOAD_SURVEY_STATE', state: validatedState });
        
        return true; // Indicate that progress was loaded
      }
    } catch (error) {
      console.error('Failed to load survey progress:', error);
      // Clear corrupted data
      localStorage.removeItem(`arcadelearn_survey_progress_${user.id}`);
    }
    
    return false; // No progress was loaded
  };

  const saveSurveyToBackend = async (answers: SurveyAnswers) => {
    if (!user) throw new Error('User not authenticated');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
    const response = await fetch(`${backendUrl}/api/user/${user.id}/survey`, {
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

  const saveSurveyToSupabase = async (answers: SurveyAnswers) => {
    if (!user) throw new Error('User not authenticated');

    // Process survey data similar to backend
    const skillLevelMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    const timeCommitmentMap = { 
      '<5 hours': 3, 
      '5–10 hours': 7, 
      '10+ hours': 15
    };

    // Create preference tags from survey responses
    const preferenceTags = [];
    if (answers.techInterest) {
      const interests = Array.isArray(answers.techInterest) ? answers.techInterest : [answers.techInterest];
      preferenceTags.push(...interests.map(interest => `tech:${interest.toLowerCase()}`));
    }
    if (answers.goal) {
      const goals = Array.isArray(answers.goal) ? answers.goal : [answers.goal];
      preferenceTags.push(...goals.map(goal => `goal:${goal.toLowerCase()}`));
    }
    if (answers.learningStyle) {
      const styles = Array.isArray(answers.learningStyle) ? answers.learningStyle : [answers.learningStyle];
      preferenceTags.push(...styles.map(style => `style:${style.toLowerCase()}`));
    }

    const surveyRecord = {
      user_id: user.id,
      survey_version: 'v1.0',
      responses: answers,
      user_profile: {
        userType: answers.userType,
        skillLevel: answers.skillLevel,
        techInterest: answers.techInterest,
        goal: answers.goal,
        timeCommitment: answers.timeCommitment,
        learningStyle: answers.learningStyle,
        wantsRecommendations: answers.wantsRecommendations
      },
      preference_tags: preferenceTags,
      skill_level_numeric: skillLevelMap[answers.skillLevel as string] || 1,
      time_commitment_hours: timeCommitmentMap[answers.timeCommitment as string] || 5,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_latest: true
    };

    // Mark any existing responses as not latest
    await supabase
      .from('user_survey_responses')
      .update({ is_latest: false })
      .eq('user_id', user.id);

    // Insert new response
    const { data, error } = await supabase
      .from('user_survey_responses')
      .insert(surveyRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save survey to Supabase: ${error.message}`);
    }

    return data;
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