// Initialize the user data with the rating system
import { UserGameData, RatingBadge } from '@/types';
import { getDefaultBadges } from './testSystem';

// Initialize user game data for the test-based system
export const initializeTestUserGameData = (): UserGameData => {
  const savedData = localStorage.getItem('arcade-learn-game-data');
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      
      // Convert dates from strings back to Date objects
      if (parsedData.lastActiveDate) {
        parsedData.lastActiveDate = new Date(parsedData.lastActiveDate);
      }
      
      if (parsedData.badges) {
        parsedData.badges = parsedData.badges.map((badge: RatingBadge) => {
          if (badge.unlockedAt) {
            badge.unlockedAt = new Date(badge.unlockedAt);
          }
          return badge;
        });
      }
      
      if (parsedData.testResults) {
        parsedData.testResults = parsedData.testResults.map((result: any) => {
          if (result.completedAt) {
            result.completedAt = new Date(result.completedAt);
          }
          return result;
        });
      }
      
      // Add missing fields for the rating system
      const updatedData: UserGameData = {
        // Default values
        totalRating: 0,
        totalStars: 0,
        averageScore: 0,
        completedTests: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
        badges: getDefaultBadges(),
        completedRoadmaps: [],
        totalComponentsCompleted: 0,
        completedComponents: [],
        testResults: [],
        
        // Overwrite with any existing data
        ...parsedData
      };
      
      return updatedData;
    } catch (e) {
      console.error('Error parsing saved game data:', e);
      return createDefaultTestUserData();
    }
  }
  
  return createDefaultTestUserData();
};

// Create default test user data
const createDefaultTestUserData = (): UserGameData => {
  return {
    totalRating: 0,
    totalStars: 0,
    averageScore: 0,
    completedTests: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date(),
    badges: getDefaultBadges(),
    completedRoadmaps: [],
    totalComponentsCompleted: 0,
    completedComponents: [],
    testResults: []
  };
};

// Update user streak based on current date
export const updateTestStreak = (userData: UserGameData): UserGameData => {
  const today = new Date();
  const lastActive = userData.lastActiveDate;
  
  // Format dates to compare just the date part (ignore time)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const lastActiveDate = new Date(
    lastActive.getFullYear(), 
    lastActive.getMonth(), 
    lastActive.getDate()
  ).getTime();
  
  // Calculate the difference in days
  const diffDays = Math.floor((todayDate - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  let currentStreak = userData.currentStreak;
  
  if (diffDays === 0) {
    // Same day, streak unchanged
  } else if (diffDays === 1) {
    // Next day, increase streak
    currentStreak++;
  } else {
    // More than one day passed, reset streak
    currentStreak = 1;
  }
  
  return {
    ...userData,
    currentStreak,
    longestStreak: Math.max(userData.longestStreak, currentStreak),
    lastActiveDate: today
  };
};