import { RoadmapComponent, UserGameData, TestResult, RatingBadge } from '@/types';

// Helper to check component prerequisites with strong 80% pass requirement
export const checkPrerequisites = (
  component: RoadmapComponent,
  completedComponents: string[],
  roadmapId: string,
  testResults?: TestResult[]
): boolean => {
  // If no prerequisites, component is unlocked
  if (!component.prerequisiteIds || component.prerequisiteIds.length === 0) {
    return true;
  }
  
  // Check if all prerequisites are completed AND passed with at least 80%
  return component.prerequisiteIds.every(prereqId => {
    const componentKey = `${roadmapId}-${prereqId}`;
    const isCompleted = completedComponents.includes(componentKey);
    
    // If not completed, definitely locked
    if (!isCompleted) return false;
    
    // If testResults provided, check for 80% pass requirement
    if (testResults && testResults.length > 0) {
      const prereqTestResults = testResults.filter(result => 
        result.componentId === prereqId && result.roadmapId === roadmapId
      );
      
      if (prereqTestResults.length > 0) {
        // Get the best score for this prerequisite component
        const bestScore = Math.max(...prereqTestResults.map(result => result.score));
        
        // STRONG LOCK: Must have at least 80% to unlock next component
        return bestScore >= 80;
      }
    }
    
    // If no test results available, default to completed status
    // This ensures backward compatibility but maintains security
    return isCompleted;
  });
};

// Helper to check if a component can be accessed (stronger version)
export const canAccessComponent = (
  component: RoadmapComponent,
  userData: UserGameData,
  roadmapId: string
): { canAccess: boolean; reason?: string; requiredScore?: number } => {
  // Check if component has prerequisites
  if (!component.prerequisiteIds || component.prerequisiteIds.length === 0) {
    return { canAccess: true };
  }

  // Check each prerequisite
  for (const prereqId of component.prerequisiteIds) {
    const componentKey = `${roadmapId}-${prereqId}`;
    const isCompleted = userData.completedComponents.includes(componentKey);
    
    if (!isCompleted) {
      return { 
        canAccess: false, 
        reason: `Complete the previous component first` 
      };
    }

    // Check test score requirement
    const prereqTestResults = userData.testResults?.filter(result => 
      result.componentId === prereqId && result.roadmapId === roadmapId
    ) || [];

    if (prereqTestResults.length > 0) {
      const bestScore = Math.max(...prereqTestResults.map(result => result.score));
      
      if (bestScore < 80) {
        return { 
          canAccess: false, 
          reason: `You need at least 80% score in the previous component to unlock this. Your best score: ${bestScore}%`,
          requiredScore: 80
        };
      }
    }
  }

  return { canAccess: true };
};

// Check for badges based on user's data (updated version)
export const processBadges = (userData: UserGameData): { 
  badges: RatingBadge[];
  newlyUnlocked: RatingBadge[];
} => {
  const updatedBadges = [...userData.badges];
  const newlyUnlocked: RatingBadge[] = [];
  
  // Check each badge condition
  updatedBadges.forEach(badge => {
    if (badge.unlocked) return; // Skip already unlocked badges
    
    let isUnlocked = false;
    
    switch (badge.condition.type) {
      case 'total_stars':
        isUnlocked = userData.totalStars >= badge.condition.value;
        break;
        
      case 'perfect_scores':
        const perfectScores = userData.testResults.filter(result => result.score === 100).length;
        isUnlocked = perfectScores >= badge.condition.value;
        break;
        
      case 'consecutive_passes':
        // TODO: Implement streak checking logic
        isUnlocked = userData.currentStreak >= badge.condition.value;
        break;
        
      case 'roadmap_complete':
        if (badge.condition.roadmapId) {
          isUnlocked = userData.completedRoadmaps.includes(badge.condition.roadmapId);
        }
        break;
    }
    
    // Update badge if newly unlocked
    if (isUnlocked) {
      badge.unlocked = true;
      badge.unlockedAt = new Date();
      newlyUnlocked.push(badge);
    }
  });
  
  return { badges: updatedBadges, newlyUnlocked };
};

// Default badges for the rating system
export const getDefaultBadges = (): RatingBadge[] => [
  {
    id: 'first-star',
    title: 'First Star',
    description: 'Earn your first star from completing a component',
    icon: '⭐',
    type: 'stars',
    condition: {
      type: 'total_stars',
      value: 1
    },
    unlocked: false
  },
  {
    id: 'rising-star',
    title: 'Rising Star',
    description: 'Earn 5 stars from completing components',
    icon: '🌟',
    type: 'stars',
    condition: {
      type: 'total_stars',
      value: 5
    },
    unlocked: false
  },
  {
    id: 'stellar-learner',
    title: 'Stellar Learner',
    description: 'Earn 10 stars from completing components',
    icon: '✨',
    type: 'stars',
    condition: {
      type: 'total_stars',
      value: 10
    },
    unlocked: false
  },
  {
    id: 'perfect-start',
    title: 'Perfect Start',
    description: 'Get a perfect score on your first test',
    icon: '💯',
    type: 'perfect',
    condition: {
      type: 'perfect_scores',
      value: 1
    },
    unlocked: false
  },
  {
    id: 'consistent-perfect',
    title: 'Consistent Perfection',
    description: 'Get 5 perfect scores on tests',
    icon: '🎯',
    type: 'perfect',
    condition: {
      type: 'perfect_scores',
      value: 5
    },
    unlocked: false
  },
  {
    id: 'learning-streak',
    title: 'Learning Streak',
    description: 'Pass 3 tests consecutively',
    icon: '🔥',
    type: 'streak',
    condition: {
      type: 'consecutive_passes',
      value: 3
    },
    unlocked: false
  },
  {
    id: 'mastery-streak',
    title: 'Mastery Streak',
    description: 'Pass 7 tests consecutively',
    icon: '⚡',
    type: 'streak',
    condition: {
      type: 'consecutive_passes',
      value: 7
    },
    unlocked: false
  },
  {
    id: 'roadmap-complete-frontend',
    title: 'Frontend Master',
    description: 'Complete the Frontend Development Roadmap',
    icon: '🏆',
    type: 'milestone',
    condition: {
      type: 'roadmap_complete',
      value: 1,
      roadmapId: 'frontend-react'
    },
    unlocked: false
  },
  {
    id: 'roadmap-complete-backend',
    title: 'Backend Master',
    description: 'Complete the Backend Development Roadmap',
    icon: '🏅',
    type: 'milestone',
    condition: {
      type: 'roadmap_complete',
      value: 1,
      roadmapId: 'backend-nodejs'
    },
    unlocked: false
  }
];

// Check and unlock badges based on user's progress
export const checkBadges = (userData: UserGameData): RatingBadge[] => {
  const newlyUnlocked: RatingBadge[] = [];
  
  userData.badges.forEach(badge => {
    if (badge.unlocked) return;
    
    let shouldUnlock = false;
    
    switch (badge.condition.type) {
      case 'total_stars':
        shouldUnlock = userData.totalStars >= badge.condition.value;
        break;
      case 'perfect_scores':
        const perfectScores = userData.testResults.filter(result => result.score === 100).length;
        shouldUnlock = perfectScores >= badge.condition.value;
        break;
      case 'consecutive_passes':
        // Sort by completion date and check consecutive passes
        const sortedResults = [...userData.testResults]
          .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        
        let maxConsecutive = 0;
        let currentConsecutive = 0;
        
        sortedResults.forEach(result => {
          if (result.passed) {
            currentConsecutive++;
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
          } else {
            currentConsecutive = 0;
          }
        });
        
        shouldUnlock = maxConsecutive >= badge.condition.value;
        break;
      case 'roadmap_complete':
        if (badge.condition.roadmapId) {
          shouldUnlock = userData.completedRoadmaps.includes(badge.condition.roadmapId);
        }
        break;
    }
    
    if (shouldUnlock) {
      badge.unlocked = true;
      badge.unlockedAt = new Date();
      newlyUnlocked.push(badge);
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

// Get the potential rating and stars for a score
export const calculateRatingAndStars = (score: number): { rating: number; stars: number } => {
  const rating = score * 2; // Each percentage point is worth 2 rating points
  const stars = Math.floor(rating / 100); // Each 100 rating points = 1 star
  
  return { rating, stars };
};