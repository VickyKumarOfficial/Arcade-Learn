import { UserGameData, Achievement, RoadmapComponent } from '@/types';
import { roadmaps } from '@/data/roadmaps';

// XP calculation - fixed amount per component completion
export const calculateComponentXP = (component: RoadmapComponent): number => {
  // Base XP: 10 per component, with bonus based on estimated hours
  const baseXP = 10;
  const hourlyBonus = Math.min(component.estimatedHours * 2, 40); // Max 40 bonus XP
  return baseXP + hourlyBonus;
};

// Get level title based on level number
export const getLevelTitle = (level: number): string => {
  if (level <= 5) return "Beginner";
  if (level <= 15) return "Intermediate";
  if (level <= 30) return "Advanced";
  if (level <= 50) return "Expert";
  return "Master";
};

// Level calculation - 100 XP per level (simple threshold)
export const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 100) + 1;
};

// XP required for next level
export const getXPForNextLevel = (currentLevel: number): number => {
  return currentLevel * 100;
};

// Current level progress with better calculation
export const getLevelProgress = (totalXP: number): { 
  current: number; 
  next: number; 
  progress: number; 
  currentLevelXP: number; 
  xpToNext: number; 
} => {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = (currentLevel - 1) * 100;
  const nextLevelXP = currentLevel * 100;
  const progressXP = totalXP - currentLevelXP;
  const xpToNext = nextLevelXP - totalXP;
  
  return {
    current: currentLevel,
    next: currentLevel + 1,
    progress: Math.round((progressXP / 100) * 100),
    currentLevelXP: progressXP,
    xpToNext: Math.max(0, xpToNext)
  };
};

// Helper functions for roadmap progress calculation
export const getRoadmapProgress = (roadmapId: string, completedComponents: string[]): number => {
  const roadmap = roadmaps.find(r => r.id === roadmapId);
  if (!roadmap) return 0;
  
  const totalComponents = roadmap.components.length;
  const completedCount = roadmap.components.filter(component => 
    completedComponents.includes(`${roadmapId}-${component.id}`)
  ).length;
  
  return totalComponents > 0 ? (completedCount / totalComponents) * 100 : 0;
};

export const getRoadmapWithProgress = (completedComponents: string[]) => {
  return roadmaps.map(roadmap => {
    const totalComponents = roadmap.components.length;
    const completedCount = roadmap.components.filter(component => 
      completedComponents.includes(`${roadmap.id}-${component.id}`)
    ).length;
    
    const progress = totalComponents > 0 ? (completedCount / totalComponents) * 100 : 0;
    
    return {
      ...roadmap,
      progress,
      completedComponents: completedCount,
      totalComponents,
      isCompleted: progress === 100
    };
  });
};

export const getCompletedRoadmaps = (completedComponents: string[]) => {
  return getRoadmapWithProgress(completedComponents).filter(roadmap => roadmap.isCompleted);
};

export const getInProgressRoadmaps = (completedComponents: string[]) => {
  return getRoadmapWithProgress(completedComponents).filter(roadmap => 
    roadmap.progress > 0 && roadmap.progress < 100
  );
};

// Predefined achievements
export const defaultAchievements: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first component',
    icon: '🎯',
    condition: { type: 'complete_components', value: 1 },
    xpReward: 50,
    unlocked: false
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Complete 5 components',
    icon: '🚀',
    condition: { type: 'complete_components', value: 5 },
    xpReward: 100,
    unlocked: false
  },
  {
    id: 'dedicated-learner',
    title: 'Dedicated Learner',
    description: 'Complete 10 components',
    icon: '📚',
    condition: { type: 'complete_components', value: 10 },
    xpReward: 200,
    unlocked: false
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 25 components',
    icon: '🔍',
    condition: { type: 'complete_components', value: 25 },
    xpReward: 500,
    unlocked: false
  },
  {
    id: 'master-learner',
    title: 'Master Learner',
    description: 'Complete 50 components',
    icon: '🏆',
    condition: { type: 'complete_components', value: 50 },
    xpReward: 1000,
    unlocked: false
  },
  {
    id: 'roadmap-conqueror',
    title: 'Roadmap Conqueror',
    description: 'Complete your first roadmap',
    icon: '🛣️',
    condition: { type: 'complete_roadmap', value: 1 },
    xpReward: 300,
    unlocked: false
  },
  {
    id: 'xp-hunter',
    title: 'XP Hunter',
    description: 'Earn 1000 XP',
    icon: '⭐',
    condition: { type: 'earn_xp', value: 1000 },
    xpReward: 200,
    unlocked: false
  },
  {
    id: 'xp-master',
    title: 'XP Master',
    description: 'Earn 5000 XP',
    icon: '💎',
    condition: { type: 'earn_xp', value: 5000 },
    xpReward: 500,
    unlocked: false
  },
  {
    id: 'consistent-learner',
    title: 'Consistent Learner',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    condition: { type: 'streak_days', value: 7 },
    xpReward: 300,
    unlocked: false
  },
  {
    id: 'streak-legend',
    title: 'Streak Legend',
    description: 'Maintain a 30-day learning streak',
    icon: '🌟',
    condition: { type: 'streak_days', value: 30 },
    xpReward: 1000,
    unlocked: false
  },
  {
    id: 'beginner-graduate',
    title: 'Beginner Graduate',
    description: 'Complete a beginner roadmap',
    icon: '🎓',
    condition: { type: 'complete_difficulty', value: 1, difficulty: 'Beginner' },
    xpReward: 250,
    unlocked: false
  },
  {
    id: 'intermediate-achiever',
    title: 'Intermediate Achiever',
    description: 'Complete an intermediate roadmap',
    icon: '🏅',
    condition: { type: 'complete_difficulty', value: 1, difficulty: 'Intermediate' },
    xpReward: 500,
    unlocked: false
  },
  {
    id: 'advanced-expert',
    title: 'Advanced Expert',
    description: 'Complete an advanced roadmap',
    icon: '👑',
    condition: { type: 'complete_difficulty', value: 1, difficulty: 'Advanced' },
    xpReward: 1000,
    unlocked: false
  }
];

// Check and unlock achievements
export const checkAchievements = (userData: UserGameData, roadmapDifficulty?: string): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];
  
  userData.achievements.forEach(achievement => {
    if (achievement.unlocked) return;
    
    let shouldUnlock = false;
    
    switch (achievement.condition.type) {
      case 'complete_components':
        shouldUnlock = userData.totalComponentsCompleted >= achievement.condition.value;
        break;
      case 'complete_roadmap':
        shouldUnlock = userData.completedRoadmaps.length >= achievement.condition.value;
        break;
      case 'earn_xp':
        shouldUnlock = userData.totalXP >= achievement.condition.value;
        break;
      case 'streak_days':
        shouldUnlock = userData.currentStreak >= achievement.condition.value;
        break;
      case 'complete_difficulty':
        if (roadmapDifficulty && achievement.condition.difficulty === roadmapDifficulty) {
          const completedOfDifficulty = userData.completedRoadmaps.length; // This would need more specific tracking
          shouldUnlock = completedOfDifficulty >= achievement.condition.value;
        }
        break;
    }
    
    if (shouldUnlock) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      newlyUnlocked.push(achievement);
    }
  });
  
  return newlyUnlocked;
};

// Update streak based on daily activity
export const updateStreak = (userData: UserGameData): UserGameData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(userData.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return userData;
  } else if (daysDiff === 1) {
    // Consecutive day, increment streak
    userData.currentStreak += 1;
    userData.longestStreak = Math.max(userData.longestStreak, userData.currentStreak);
  } else {
    // Streak broken, reset to 1
    userData.currentStreak = 1;
  }
  
  userData.lastActiveDate = new Date();
  return userData;
};

// Initialize default user game data
export const initializeUserGameData = (): UserGameData => ({
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date(),
  achievements: [...defaultAchievements],
  completedRoadmaps: [],
  totalComponentsCompleted: 0,
  completedComponents: []
});
