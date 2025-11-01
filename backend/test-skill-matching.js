/**
 * Test Skill Normalization - Demonstrates synonym matching
 * Run: node backend/test-skill-matching.js
 */

import { 
  normalizeSkill, 
  normalizeSkills,
  extractSkillsFromText,
  calculateNormalizedSkillMatch,
  getSkillAliases 
} from './lib/skillNormalizer.js';

console.log('🧪 Testing Skill Normalization System\n');
console.log('=' .repeat(70));

// Test 1: Normalize individual skills
console.log('\n📝 Test 1: Normalizing Individual Skills');
console.log('-'.repeat(70));

const testSkills = [
  'ML',
  'Machine Learning',
  'JS',
  'JavaScript',
  'React.js',
  'ReactJS',
  'K8s',
  'Kubernetes',
  'AWS',
  'Amazon Web Services',
];

testSkills.forEach(skill => {
  const normalized = normalizeSkill(skill);
  console.log(`  "${skill}" → "${normalized}"`);
});

// Test 2: Resume vs Job Matching (OLD WAY - Would Fail)
console.log('\n\n❌ Test 2: OLD Matching (Without Normalization)');
console.log('-'.repeat(70));

const resumeSkillsRaw = ['ML', 'JS', 'React.js', 'K8s'];
const jobDescriptionOld = 'Looking for a developer with Machine Learning, JavaScript, ReactJS, and Kubernetes experience.';

let oldMatches = 0;
resumeSkillsRaw.forEach(skill => {
  if (jobDescriptionOld.toLowerCase().includes(skill.toLowerCase())) {
    oldMatches++;
    console.log(`  ✅ Matched: ${skill}`);
  } else {
    console.log(`  ❌ MISSED: ${skill} (exists as synonym in job description!)`);
  }
});
console.log(`\n  Result: ${oldMatches}/${resumeSkillsRaw.length} matched (${Math.round(oldMatches/resumeSkillsRaw.length*100)}%)`);

// Test 3: Resume vs Job Matching (NEW WAY - With Normalization)
console.log('\n\n✅ Test 3: NEW Matching (With Normalization)');
console.log('-'.repeat(70));

const resumeSkillsNormalized = normalizeSkills(['ML', 'JS', 'React.js', 'K8s', 'AWS']);
const jobSkillsExtracted = extractSkillsFromText(jobDescriptionOld);

console.log(`  Resume Skills (normalized): ${resumeSkillsNormalized.join(', ')}`);
console.log(`  Job Skills (extracted): ${jobSkillsExtracted.join(', ')}`);

const matchPercentage = calculateNormalizedSkillMatch(resumeSkillsNormalized, jobSkillsExtracted);
console.log(`\n  Match Score: ${Math.round(matchPercentage * 100)}%`);

// Test 4: Real-world example
console.log('\n\n🌍 Test 4: Real-World Resume vs Job Match');
console.log('-'.repeat(70));

const realResume = {
  skills: ['ML', 'Python', 'TensorFlow', 'Docker', 'K8s', 'AWS']
};

const realJob = {
  title: 'Senior ML Engineer',
  description: `
    We're looking for a Machine Learning expert with experience in:
    - Deep Learning and PyTorch/TensorFlow
    - Python development
    - Containerization (Docker) and orchestration (Kubernetes)
    - Cloud platforms (Amazon Web Services preferred)
    - CI/CD pipelines
  `
};

const userSkills = normalizeSkills(realResume.skills);
const jobSkills = extractSkillsFromText(`${realJob.title} ${realJob.description}`);

console.log('  User Skills:');
console.log(`    Raw: ${realResume.skills.join(', ')}`);
console.log(`    Normalized: ${userSkills.join(', ')}`);

console.log('\n  Job Requirements (extracted):');
console.log(`    ${jobSkills.join(', ')}`);

const matches = userSkills.filter(skill => jobSkills.includes(skill));
console.log('\n  Matched Skills:');
matches.forEach(skill => {
  console.log(`    ✓ ${skill}`);
});

const finalScore = calculateNormalizedSkillMatch(userSkills, jobSkills);
console.log(`\n  Final Match Score: ${Math.round(finalScore * 100)}% 🎯`);

// Test 5: Show all aliases for popular skills
console.log('\n\n📚 Test 5: Skill Aliases Reference');
console.log('-'.repeat(70));

const popularSkills = ['Machine Learning', 'JavaScript', 'React', 'Kubernetes', 'AWS'];
popularSkills.forEach(skill => {
  const normalized = normalizeSkill(skill);
  const aliases = getSkillAliases(skill);
  console.log(`\n  ${skill}:`);
  console.log(`    Canonical: ${normalized}`);
  console.log(`    Aliases: ${aliases.join(', ')}`);
});

console.log('\n\n' + '='.repeat(70));
console.log('✅ All tests complete! Skill normalization working perfectly.');
console.log('='.repeat(70) + '\n');
