import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserGameData, RatingBadge, TestResult } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { initializeTestUserGameData, updateTestStreak } from '@/lib/ratingSystem';
import { processBadges } from '@/lib/testSystem';
// import { userProgressService } from '@/services/userProgressService';

interface GameTestState {
  userData: UserGameData;
  newlyUnlockedBadges: RatingBadge[];
  recentRatingGain: number;
  showRatingAnimation: boolean;
  lastTestResult?: TestResult;
}

type GameTestAction = 
  | { type: 'COMPLETE_TEST'; payload: { result: TestResult } }
  | { type: 'DISMISS_BADGE'; payload: { badgeId: string } }
  | { type: 'HIDE_RATING_ANIMATION' }
  | { type: 'LOAD_USER_DATA'; payload: UserGameData }
  | { type: 'RESET_GAME_DATA' };

const GameTestContext = createContext<{
  state: GameTestState;
  dispatch: React.Dispatch<GameTestAction>;
} | null>(null);

const gameTestReducer = (state: GameTestState, action: GameTestAction): GameTestState => {
  switch (action.type) {
    case 'COMPLETE_TEST': {
      const { result } = action.payload;
      
      // Check if the test was passed
      if (!result.passed) {
        // If the test wasn't passed, we only record the result but don't update other stats
        const updatedUserData = {
          ...state.userData,
          testResults: [...state.userData.testResults, result]
        };
        
        // Save to localStorage
        localStorage.setItem('arcade-learn-test-data', JSON.stringify(updatedUserData));
        
        return {
          ...state,
          userData: updatedUserData,
          lastTestResult: result
        };
      }
      
      // Calculate component key for completion tracking
      const componentKey = `${result.roadmapId}-${result.componentId}`;
      
      // Check if already completed to prevent duplicate badges
      const alreadyCompleted = state.userData.completedComponents.includes(componentKey);
      
      // Update stats with new test result
      const updatedUserData = {
        ...state.userData,
        totalRating: state.userData.totalRating + result.rating,
        totalStars: state.userData.totalStars + result.stars,
        averageScore: alreadyCompleted 
          ? state.userData.averageScore 
          : (state.userData.averageScore * state.userData.completedTests + result.score) / 
            (state.userData.completedTests + 1),
        completedTests: alreadyCompleted 
          ? state.userData.completedTests 
          : state.userData.completedTests + 1,
        totalComponentsCompleted: alreadyCompleted 
          ? state.userData.totalComponentsCompleted 
          : state.userData.totalComponentsCompleted + 1,
        completedComponents: alreadyCompleted 
          ? state.userData.completedComponents 
          : [...state.userData.completedComponents, componentKey],
        testResults: [...state.userData.testResults, result]
      };

      // Update streak
      const streakUpdatedData = updateTestStreak(updatedUserData);
      
      // Check for new badges
      const { badges: updatedBadges, newlyUnlocked } = processBadges(streakUpdatedData);
      streakUpdatedData.badges = updatedBadges;

      // Save to localStorage
      localStorage.setItem('arcade-learn-test-data', JSON.stringify(streakUpdatedData));

      return {
        ...state,
        userData: streakUpdatedData,
        newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...newlyUnlocked],
        recentRatingGain: result.rating,
        showRatingAnimation: true,
        lastTestResult: result
      };
    }

    case 'DISMISS_BADGE': {
      return {
        ...state,
        newlyUnlockedBadges: state.newlyUnlockedBadges.filter(
          badge => badge.id !== action.payload.badgeId
        )
      };
    }

    case 'HIDE_RATING_ANIMATION': {
      return {
        ...state,
        showRatingAnimation: false
      };
    }

    case 'LOAD_USER_DATA': {
      return {
        ...state,
        userData: action.payload
      };
    }

    case 'RESET_GAME_DATA': {
      const freshUserData = initializeTestUserGameData();
      localStorage.setItem('arcade-learn-test-data', JSON.stringify(freshUserData));
      return {
        ...state,
        userData: freshUserData,
        newlyUnlockedBadges: [],
        recentRatingGain: 0,
        showRatingAnimation: false,
        lastTestResult: undefined
      };
    }

    default: {
      return state;
    }
  }
};

export const GameTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const initialState: GameTestState = {
    userData: initializeTestUserGameData(),
    newlyUnlockedBadges: [],
    recentRatingGain: 0,
    showRatingAnimation: false
  };
  
  const [state, dispatch] = useReducer(gameTestReducer, initialState);
  
  // Load user data from backend when user is authenticated
  useEffect(() => {
    if (user) {
      // For now, we're using local storage, but in a real app, we would load from the backend
      // userProgressService.getUserProgress(user.id)
      //   .then(data => {
      //     if (data) {
      //       dispatch({ type: 'LOAD_USER_DATA', payload: data });
      //     }
      //   })
      //   .catch(err => console.error('Error loading user progress:', err));
    }
  }, [user]);
  
  // Sync test results to backend when they change
  useEffect(() => {
    if (user) {
      // In a real app, we would save to the backend
      // userProgressService.saveUserProgress(user.id, state.userData)
      //   .catch(err => console.error('Error saving user progress:', err));
    }
  }, [user, state.userData.testResults]);
  
  return (
    <GameTestContext.Provider value={{ state, dispatch }}>
      {children}
    </GameTestContext.Provider>
  );
};

export const useGameTest = () => {
  const context = useContext(GameTestContext);
  if (!context) {
    throw new Error('useGameTest must be used within a GameTestProvider');
  }
  return context;
};