import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserGameData, Achievement, RoadmapComponent, Roadmap } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  initializeUserGameData, 
  calculateComponentXP, 
  updateStreak, 
  checkAchievements,
  calculateLevel
} from '@/lib/gamification';
import { userProgressService } from '@/services/userProgressService';

interface GameState {
  userData: UserGameData;
  newlyUnlockedAchievements: Achievement[];
  recentXPGain: number;
  showXPAnimation: boolean;
  lastCompletedComponent?: RoadmapComponent;
  levelUp: boolean;
  newLevel?: number;
}

type GameAction = 
  | { type: 'COMPLETE_COMPONENT'; payload: { component: RoadmapComponent; roadmapId: string } }
  | { type: 'UNCOMPLETE_COMPONENT'; payload: { component: RoadmapComponent; roadmapId: string } }
  | { type: 'COMPLETE_ROADMAP'; payload: { roadmap: Roadmap } }
  | { type: 'DISMISS_ACHIEVEMENT'; payload: { achievementId: string } }
  | { type: 'HIDE_XP_ANIMATION' }
  | { type: 'LOAD_USER_DATA'; payload: UserGameData }
  | { type: 'RESET_GAME_DATA' };

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'COMPLETE_COMPONENT': {
      const { component, roadmapId } = action.payload;
      const componentKey = `${roadmapId}-${component.id}`;
      
      // Check if already completed to prevent duplicate XP
      if (state.userData.completedComponents.includes(componentKey)) {
        return state;
      }
      
      const xpGained = calculateComponentXP(component);
      
      const previousLevel = calculateLevel(state.userData.totalXP);
      const newTotalXP = state.userData.totalXP + xpGained;
      const newLevel = calculateLevel(newTotalXP);
      const leveledUp = newLevel > previousLevel;
      
      const updatedUserData = {
        ...state.userData,
        totalXP: newTotalXP,
        totalComponentsCompleted: state.userData.totalComponentsCompleted + 1,
        level: newLevel,
        completedComponents: [...state.userData.completedComponents, componentKey]
      };

      // Update streak
      const streakUpdatedData = updateStreak(updatedUserData);
      
      // Check for new achievements
      const newAchievements = checkAchievements(streakUpdatedData);
      
      // Add XP from newly unlocked achievements
      const achievementXP = newAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0);
      if (achievementXP > 0) {
        streakUpdatedData.totalXP += achievementXP;
        streakUpdatedData.level = calculateLevel(streakUpdatedData.totalXP);
      }

      // Save to localStorage
      localStorage.setItem('arcade-learn-game-data', JSON.stringify(streakUpdatedData));

      console.log('COMPLETE_COMPONENT: XP gained:', xpGained + achievementXP, 'showXPAnimation:', true);

      return {
        ...state,
        userData: streakUpdatedData,
        newlyUnlockedAchievements: [...state.newlyUnlockedAchievements, ...newAchievements],
        recentXPGain: xpGained + achievementXP,
        showXPAnimation: true,
        lastCompletedComponent: component,
        levelUp: leveledUp,
        newLevel: leveledUp ? newLevel : undefined
      };
    }

    case 'UNCOMPLETE_COMPONENT': {
      const { component, roadmapId } = action.payload;
      const componentKey = `${roadmapId}-${component.id}`;
      const xpLost = calculateComponentXP(component);
      
      const updatedUserData = {
        ...state.userData,
        totalXP: Math.max(0, state.userData.totalXP - xpLost),
        totalComponentsCompleted: Math.max(0, state.userData.totalComponentsCompleted - 1),
        completedComponents: state.userData.completedComponents.filter(id => id !== componentKey)
      };
      
      updatedUserData.level = calculateLevel(updatedUserData.totalXP);

      // Save to localStorage
      localStorage.setItem('arcade-learn-game-data', JSON.stringify(updatedUserData));

      return {
        ...state,
        userData: updatedUserData
      };
    }

    case 'COMPLETE_ROADMAP': {
      const { roadmap } = action.payload;
      const updatedUserData = {
        ...state.userData,
        completedRoadmaps: [...state.userData.completedRoadmaps, roadmap.id]
      };

      // Check for roadmap completion achievements
      const newAchievements = checkAchievements(updatedUserData, roadmap.difficulty);
      
      // Add XP from newly unlocked achievements
      const achievementXP = newAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0);
      if (achievementXP > 0) {
        updatedUserData.totalXP += achievementXP;
        updatedUserData.level = calculateLevel(updatedUserData.totalXP);
      }

      console.log('COMPLETE_ROADMAP: Achievement XP:', achievementXP, 'showXPAnimation preserved:', state.showXPAnimation || achievementXP > 0);

      return {
        ...state,
        userData: updatedUserData,
        newlyUnlockedAchievements: [...state.newlyUnlockedAchievements, ...newAchievements],
        recentXPGain: state.recentXPGain + achievementXP,
        // Preserve existing showXPAnimation state - don't override it
        showXPAnimation: state.showXPAnimation || achievementXP > 0
      };
    }

    case 'DISMISS_ACHIEVEMENT': {
      return {
        ...state,
        newlyUnlockedAchievements: state.newlyUnlockedAchievements.filter(
          achievement => achievement.id !== action.payload.achievementId
        )
      };
    }

    case 'HIDE_XP_ANIMATION': {
      return {
        ...state,
        showXPAnimation: false,
        recentXPGain: 0,
        lastCompletedComponent: undefined,
        levelUp: false,
        newLevel: undefined
      };
    }

    case 'LOAD_USER_DATA': {
      return {
        ...state,
        userData: action.payload
      };
    }

    case 'RESET_GAME_DATA': {
      return {
        ...state,
        userData: initializeUserGameData(),
        newlyUnlockedAchievements: [],
        recentXPGain: 0,
        showXPAnimation: false,
        lastCompletedComponent: undefined,
        levelUp: false,
        newLevel: undefined
      };
    }

    default:
      return state;
  }
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(gameReducer, {
    userData: initializeUserGameData(),
    newlyUnlockedAchievements: [],
    recentXPGain: 0,
    showXPAnimation: false,
    levelUp: false
  });

  // Load user data from localStorage on mount (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset to default data when not authenticated
      dispatch({ type: 'RESET_GAME_DATA' });
      return;
    }

    const savedData = localStorage.getItem('arcade-learn-game-data');
    if (savedData) {
      try {
        const userData = JSON.parse(savedData);
        // Convert date strings back to Date objects
        userData.lastActiveDate = new Date(userData.lastActiveDate);
        userData.achievements = userData.achievements.map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
        }));
        dispatch({ type: 'LOAD_USER_DATA', payload: userData });
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    }
  }, [isAuthenticated]);

  // Save user data to localStorage whenever it changes (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('arcade-learn-game-data', JSON.stringify(state.userData));
    }
  }, [state.userData, isAuthenticated]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
