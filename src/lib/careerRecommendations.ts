import { Roadmap, CareerOption } from '@/types';
import { careerOptions } from '@/data/careers';

/**
 * Calculate the similarity score between two sets of tags
 * @param roadmapTags - Tags from a roadmap
 * @param careerTags - Tags from a career
 * @returns A score between 0 and 1, where 1 is perfect match
 */
export const calculateTagSimilarity = (roadmapTags: string[], careerTags: string[]): number => {
  if (roadmapTags.length === 0 || careerTags.length === 0) return 0;
  
  // Convert tags to lowercase for case-insensitive comparison
  const roadmapTagsLower = roadmapTags.map(tag => tag.toLowerCase());
  const careerTagsLower = careerTags.map(tag => tag.toLowerCase());
  
  // Calculate exact matches
  const exactMatches = roadmapTagsLower.filter(tag => 
    careerTagsLower.includes(tag)
  ).length;
  
  // Calculate partial matches (substring matches)
  let partialMatches = 0;
  roadmapTagsLower.forEach(roadmapTag => {
    careerTagsLower.forEach(careerTag => {
      if (roadmapTag !== careerTag) {
        // Check if one tag contains the other (e.g., 'web-development' contains 'web')
        if (roadmapTag.includes(careerTag) || careerTag.includes(roadmapTag)) {
          partialMatches += 0.5; // Partial match worth half an exact match
        }
      }
    });
  });
  
  // Weight exact matches more heavily than partial matches
  const totalScore = exactMatches + partialMatches;
  
  // Normalize by the average of both tag sets to prevent bias toward longer tag lists
  const avgTagCount = (roadmapTags.length + careerTags.length) / 2;
  
  return Math.min(totalScore / avgTagCount, 1);
};

/**
 * Get career recommendations for a specific roadmap based on tag similarity
 * @param roadmap - The roadmap to get recommendations for
 * @param minSimilarity - Minimum similarity score to include a career (default: 0.2)
 * @param maxRecommendations - Maximum number of careers to recommend (default: 3)
 * @returns Array of career options sorted by relevance
 */
export const getCareerRecommendationsForRoadmap = (
  roadmap: Roadmap, 
  minSimilarity: number = 0.2,
  maxRecommendations: number = 3
): CareerOption[] => {
  if (!roadmap.tags || roadmap.tags.length === 0) return [];
  
  // Calculate similarity scores for all careers
  const careerScores = careerOptions.map(career => ({
    career,
    similarity: calculateTagSimilarity(roadmap.tags, career.tags)
  }));
  
  // Filter by minimum similarity and sort by score (descending)
  const relevantCareers = careerScores
    .filter(item => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxRecommendations)
    .map(item => item.career);
  
  return relevantCareers;
};

/**
 * Get all career recommendations with their similarity scores for debugging
 * @param roadmap - The roadmap to analyze
 * @returns Array of careers with their similarity scores
 */
export const getCareerRecommendationsWithScores = (roadmap: Roadmap): Array<{
  career: CareerOption;
  similarity: number;
  matchingTags: string[];
}> => {
  if (!roadmap.tags || roadmap.tags.length === 0) return [];
  
  const roadmapTagsLower = roadmap.tags.map(tag => tag.toLowerCase());
  
  return careerOptions.map(career => {
    const similarity = calculateTagSimilarity(roadmap.tags, career.tags);
    const careerTagsLower = career.tags.map(tag => tag.toLowerCase());
    
    // Find matching tags for display
    const matchingTags = roadmap.tags.filter(roadmapTag => 
      careerTagsLower.includes(roadmapTag.toLowerCase())
    );
    
    return {
      career,
      similarity,
      matchingTags
    };
  }).sort((a, b) => b.similarity - a.similarity);
};

/**
 * Batch get career recommendations for multiple roadmaps
 * @param roadmaps - Array of roadmaps to get recommendations for
 * @param minSimilarity - Minimum similarity score to include a career
 * @param maxRecommendations - Maximum number of careers per roadmap
 * @returns Map of roadmap ID to career recommendations
 */
export const getBatchCareerRecommendations = (
  roadmaps: Roadmap[],
  minSimilarity: number = 0.2,
  maxRecommendations: number = 3
): Record<string, CareerOption[]> => {
  const recommendations: Record<string, CareerOption[]> = {};
  
  roadmaps.forEach(roadmap => {
    recommendations[roadmap.id] = getCareerRecommendationsForRoadmap(
      roadmap, 
      minSimilarity, 
      maxRecommendations
    );
  });
  
  return recommendations;
};

/**
 * Get roadmap recommendations for a specific career (reverse lookup)
 * @param career - The career to get roadmap recommendations for
 * @param roadmaps - Array of available roadmaps
 * @param minSimilarity - Minimum similarity score
 * @param maxRecommendations - Maximum number of roadmaps to recommend
 * @returns Array of recommended roadmaps
 */
export const getRoadmapRecommendationsForCareer = (
  career: CareerOption,
  roadmaps: Roadmap[],
  minSimilarity: number = 0.2,
  maxRecommendations: number = 3
): Roadmap[] => {
  if (!career.tags || career.tags.length === 0) return [];
  
  // Calculate similarity scores for all roadmaps
  const roadmapScores = roadmaps
    .filter(roadmap => roadmap.tags && roadmap.tags.length > 0)
    .map(roadmap => ({
      roadmap,
      similarity: calculateTagSimilarity(career.tags, roadmap.tags)
    }));
  
  // Filter by minimum similarity and sort by score (descending)
  const relevantRoadmaps = roadmapScores
    .filter(item => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxRecommendations)
    .map(item => item.roadmap);
  
  return relevantRoadmaps;
};