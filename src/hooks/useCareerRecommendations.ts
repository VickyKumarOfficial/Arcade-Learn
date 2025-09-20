import { useMemo } from 'react';
import { Roadmap, CareerOption } from '@/types';
import { getCareerRecommendationsForRoadmap, getCareerRecommendationsWithScores } from '@/lib/careerRecommendations';

/**
 * Custom hook to get career recommendations for a roadmap
 * @param roadmap - The roadmap to get recommendations for
 * @param minSimilarity - Minimum similarity score (default: 0.2)
 * @param maxRecommendations - Maximum number of recommendations (default: 3)
 * @returns Array of recommended careers
 */
export const useCareerRecommendations = (
  roadmap: Roadmap,
  minSimilarity: number = 0.2,
  maxRecommendations: number = 3
): CareerOption[] => {
  return useMemo(() => {
    return getCareerRecommendationsForRoadmap(roadmap, minSimilarity, maxRecommendations);
  }, [roadmap, minSimilarity, maxRecommendations]);
};

/**
 * Custom hook to get detailed career recommendations with scores and matching tags
 * @param roadmap - The roadmap to analyze
 * @returns Array of careers with similarity scores and matching tags
 */
export const useDetailedCareerRecommendations = (roadmap: Roadmap) => {
  return useMemo(() => {
    return getCareerRecommendationsWithScores(roadmap);
  }, [roadmap]);
};

/**
 * Custom hook to check if a roadmap has any career recommendations
 * @param roadmap - The roadmap to check
 * @param minSimilarity - Minimum similarity threshold
 * @returns Boolean indicating if recommendations exist
 */
export const useHasCareerRecommendations = (
  roadmap: Roadmap,
  minSimilarity: number = 0.2
): boolean => {
  return useMemo(() => {
    const recommendations = getCareerRecommendationsForRoadmap(roadmap, minSimilarity, 1);
    return recommendations.length > 0;
  }, [roadmap, minSimilarity]);
};

/**
 * Custom hook to get the top career recommendation for a roadmap
 * @param roadmap - The roadmap to get recommendation for
 * @param minSimilarity - Minimum similarity threshold
 * @returns The top recommended career or null
 */
export const useTopCareerRecommendation = (
  roadmap: Roadmap,
  minSimilarity: number = 0.2
): CareerOption | null => {
  return useMemo(() => {
    const recommendations = getCareerRecommendationsForRoadmap(roadmap, minSimilarity, 1);
    return recommendations.length > 0 ? recommendations[0] : null;
  }, [roadmap, minSimilarity]);
};