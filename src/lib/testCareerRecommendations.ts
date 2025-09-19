// Test file to verify the career recommendation algorithm
import { getCareerRecommendationsForRoadmap, calculateTagSimilarity, getCareerRecommendationsWithScores } from '@/lib/careerRecommendations';
import { roadmaps } from '@/data/roadmaps';

// Example usage and testing
export const testCareerRecommendations = () => {
  console.log('=== Career Recommendation System Test ===\n');
  
  // Test with Frontend React roadmap
  const frontendRoadmap = roadmaps.find(r => r.id === 'frontend-react');
  if (frontendRoadmap) {
    console.log(`Testing roadmap: ${frontendRoadmap.title}`);
    console.log(`Roadmap tags: [${frontendRoadmap.tags.join(', ')}]`);
    
    const recommendations = getCareerRecommendationsForRoadmap(frontendRoadmap, 0.1, 5);
    console.log('\nCareer Recommendations:');
    recommendations.forEach((career, index) => {
      console.log(`${index + 1}. ${career.title} - ${career.averageSalary}`);
      console.log(`   Tags: [${career.tags.join(', ')}]`);
    });
    
    console.log('\nDetailed analysis with scores:');
    const detailedResults = getCareerRecommendationsWithScores(frontendRoadmap);
    detailedResults.slice(0, 3).forEach(result => {
      console.log(`${result.career.title}: ${(result.similarity * 100).toFixed(1)}% match`);
      console.log(`   Matching tags: [${result.matchingTags.join(', ')}]`);
    });
  }
  
  console.log('\n=== Tag Similarity Tests ===');
  
  // Test exact matches
  const exactMatch = calculateTagSimilarity(['react', 'javascript'], ['react', 'javascript']);
  console.log(`Exact match similarity: ${(exactMatch * 100).toFixed(1)}%`);
  
  // Test partial matches
  const partialMatch = calculateTagSimilarity(['frontend', 'react'], ['backend', 'nodejs']);
  console.log(`No match similarity: ${(partialMatch * 100).toFixed(1)}%`);
  
  // Test mixed matches
  const mixedMatch = calculateTagSimilarity(['frontend', 'react', 'javascript'], ['frontend', 'web-development', 'typescript']);
  console.log(`Mixed match similarity: ${(mixedMatch * 100).toFixed(1)}%`);
  
  console.log('\n=== System Ready! ===');
};

// Export for easy testing
export default testCareerRecommendations;