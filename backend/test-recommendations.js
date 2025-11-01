/**
 * Test the updated skill extraction
 */

import { jobRecommendationService } from './services/jobRecommendationService.js';

const testUserId = '839e5c04-b5b8-4c94-bc9d-cda48fc81f06';

console.log('🔍 Testing Job Recommendations with Updated Skill Extraction\n');
console.log('='.repeat(60));

const result = await jobRecommendationService.getRecommendations(testUserId, 10);

console.log('\nResult:', JSON.stringify(result, null, 2));

if (result.success) {
  console.log('\n✅ SUCCESS!');
  console.log(`\nUser Profile:`);
  console.log(`  Skills: ${result.data.userProfile.skills.join(', ')}`);
  console.log(`  Experience: ${result.data.userProfile.experience.years} years (${result.data.userProfile.experience.level})`);
  console.log(`  Location: ${result.data.userProfile.location || 'N/A'}`);
  
  console.log(`\nJob Stats:`);
  console.log(`  Total jobs: ${result.data.totalJobs}`);
  console.log(`  Matched jobs: ${result.data.matchedJobs}`);
  
  if (result.data.recommendations.length > 0) {
    console.log(`\n🎯 Top Recommendations:`);
    result.data.recommendations.forEach((rec, i) => {
      console.log(`\n${i + 1}. ${rec.title} at ${rec.company_name}`);
      console.log(`   Match: ${rec.matchPercentage}%`);
      console.log(`   Reason: ${rec.matchReason}`);
      console.log(`   Location: ${rec.location || 'N/A'}`);
      console.log(`   Type: ${rec.type || 'N/A'}`);
    });
  } else {
    console.log('\n⚠️  No job matches found!');
    console.log('\nPossible reasons:');
    console.log('1. Your skills (HTML, CSS, JavaScript) don\'t match job requirements');
    console.log('2. Jobs are non-technical (Community Manager, Accounts, Art Director)');
    console.log('3. Need to scrape more relevant tech jobs');
  }
} else {
  console.log('\n❌ ERROR:', result.error);
}

console.log('\n' + '='.repeat(60));
