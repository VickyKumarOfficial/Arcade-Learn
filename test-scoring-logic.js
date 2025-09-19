// Test the corrected scoring logic
import { calculateModuleScore } from './src/lib/gamification';

console.log('=== SCORING SYSTEM TEST ===');
console.log('Formula: (testScore - 80) × 0.5');
console.log();

// Test cases
const testCases = [
  { score: 79, expected: 0, description: "Below passing (79%)" },
  { score: 80, expected: 0, description: "Exactly passing (80%)" },
  { score: 81, expected: 0.5, description: "Just above passing (81%)" },
  { score: 82, expected: 1, description: "Two points above (82%)" },
  { score: 85, expected: 2.5, description: "Your example (85%)" },
  { score: 90, expected: 5, description: "Your main example (90%)" },
  { score: 95, expected: 7.5, description: "Excellent score (95%)" },
  { score: 100, expected: 10, description: "Perfect score (100%)" }
];

testCases.forEach(test => {
  const actual = calculateModuleScore(test.score);
  const status = actual === test.expected ? '✅' : '❌';
  console.log(`${status} ${test.description}: ${test.score}% → ${actual} points (expected: ${test.expected})`);
});

console.log();
console.log('=== VERIFICATION ===');
console.log('Your example: 90% test score');
console.log('Calculation: (90 - 80) × 0.5 = 10 × 0.5 = 5 points ✅');