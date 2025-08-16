import { roadmaps } from '@/data/roadmaps';
import { UserGameData, Roadmap } from '@/types';

// Get roadmaps with real-time completion status
export const getRoadmapsWithProgress = (userData: UserGameData): Roadmap[] => {
  return roadmaps.map(roadmap => ({
    ...roadmap,
    components: roadmap.components.map(component => ({
      ...component,
      completed: userData.completedComponents.includes(component.id)
    })),
    completedComponents: roadmap.components.filter(component => 
      userData.completedComponents.includes(component.id)
    ).length
  }));
};

// Get completed roadmaps
export const getCompletedRoadmaps = (userData: UserGameData): Roadmap[] => {
  const roadmapsWithProgress = getRoadmapsWithProgress(userData);
  return roadmapsWithProgress.filter(roadmap => 
    roadmap.components.length > 0 && roadmap.components.every(component => component.completed)
  );
};

// Get in-progress roadmaps
export const getInProgressRoadmaps = (userData: UserGameData): Roadmap[] => {
  const roadmapsWithProgress = getRoadmapsWithProgress(userData);
  return roadmapsWithProgress.filter(roadmap => {
    const hasCompletedComponents = roadmap.components.some(component => component.completed);
    const hasIncompleteComponents = roadmap.components.some(component => !component.completed);
    return hasCompletedComponents && hasIncompleteComponents;
  });
};

// Get overall progress statistics
export const getOverallProgress = (userData: UserGameData) => {
  const totalComponents = roadmaps.reduce((sum, roadmap) => sum + roadmap.components.length, 0);
  const completedComponents = userData.completedComponents.length;
  const overallProgress = totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0;
  
  return {
    totalComponents,
    completedComponents,
    overallProgress
  };
};
