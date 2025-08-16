import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { userProgressService } from '@/services/userProgressService';
import { UserGameData } from '@/types';

interface GameSyncContextType {
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
}

const GameSyncContext = createContext<GameSyncContextType | null>(null);

export const useGameSync = () => {
  const context = useContext(GameSyncContext);
  if (!context) {
    throw new Error('useGameSync must be used within a GameSyncProvider');
  }
  return context;
};

export const GameSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Sync user data when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      syncUserData();
    }
  }, [isAuthenticated, user?.id]);

  // Auto-save user data periodically when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const autoSaveInterval = setInterval(() => {
      saveUserData();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isAuthenticated, user?.id, state.userData]);

  // Save user data when component unmounts or user logs out
  useEffect(() => {
    return () => {
      if (isAuthenticated && user) {
        saveUserData();
      }
    };
  }, []);

  const syncUserData = async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setIsSyncing(true);

    try {
      // Get local data from localStorage
      const localData = localStorage.getItem('arcade-learn-game-data');
      let localUserData: UserGameData;

      if (localData) {
        localUserData = JSON.parse(localData);
        // Convert date strings back to Date objects
        localUserData.lastActiveDate = new Date(localUserData.lastActiveDate);
        localUserData.achievements = localUserData.achievements.map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
        }));
      } else {
        localUserData = state.userData;
      }

      // Sync with remote data
      const syncedData = await userProgressService.syncUserProgress(user.id, localUserData);
      
      // Update local state
      dispatch({ type: 'LOAD_USER_DATA', payload: syncedData });
      
      // Update localStorage
      localStorage.setItem('arcade-learn-game-data', JSON.stringify(syncedData));
      
      setLastSyncTime(new Date());
      console.log('User data synced successfully');
    } catch (error) {
      console.error('Error syncing user data:', error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const saveUserData = async () => {
    if (!isAuthenticated || !user || isSyncing) return;

    try {
      await userProgressService.saveUserProgress(user.id, state.userData);
      console.log('User data saved to Supabase');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <GameSyncContext.Provider
      value={{
        isLoading,
        isSyncing,
        lastSyncTime,
        syncUserData,
        saveUserData,
      }}
    >
      {children}
    </GameSyncContext.Provider>
  );
};
