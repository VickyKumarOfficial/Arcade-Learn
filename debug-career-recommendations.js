// Quick test to check career recommendations
import { roadmaps } from './src/data/roadmaps.js';
import { careerOptions } from './src/data/careers.js';

// Test function
function calculateTagSimilarity(roadmapTags, careerTags) {
  if (roadmapTags.length === 0 || careerTags.length === 0) return 0;
  
  const roadmapTagsLower = roadmapTags.map(tag => tag.toLowerCase());
  const careerTagsLower = careerTags.map(tag => tag.toLowerCase());
  
  const exactMatches = roadmapTagsLower.filter(tag => 
    careerTagsLower.includes(tag)
  ).length;
  
  let partialMatches = 0;
  roadmapTagsLower.forEach(roadmapTag => {
    careerTagsLower.forEach(careerTag => {
      if (roadmapTag !== careerTag) {
        if (roadmapTag.includes(careerTag) || careerTag.includes(roadmapTag)) {
          partialMatches += 0.5;
        }
      }
    });
  });
  
  const totalMatches = exactMatches + partialMatches;
  const maxPossibleMatches = Math.max(roadmapTags.length, careerTags.length);
  
  return totalMatches / maxPossibleMatches;
}

// Test with frontend roadmap
const frontendRoadmap = roadmaps.find(r => r.id === 'frontend-react');
console.log('Frontend Roadmap Tags:', frontendRoadmap?.tags);

careerOptions.forEach(career => {
  const similarity = calculateTagSimilarity(frontendRoadmap?.tags || [], career.tags);
  console.log(`${career.title}: ${(similarity * 100).toFixed(1)}% similarity`);
  if (similarity >= 0.15) {
    console.log('  ✅ Would be shown (>= 15%)');
  } else {
    console.log('  ❌ Would be hidden (< 15%)');
  }
});