/**
 * Skill Normalizer - Handles skill synonyms and aliases
 * Solves: "ML" vs "Machine Learning", "JS" vs "JavaScript" matching
 */

// Comprehensive skill synonym mapping
const SKILL_SYNONYMS = {
  // Programming Languages
  'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'vanilla js'],
  'typescript': ['ts', 'typescript'],
  'python': ['py', 'python', 'python3'],
  'java': ['java', 'java se', 'java ee'],
  'c++': ['cpp', 'c++', 'cplusplus'],
  'c#': ['csharp', 'c#', 'c sharp', '.net'],
  'go': ['golang', 'go', 'go lang'],
  'ruby': ['rb', 'ruby'],
  'php': ['php', 'php7', 'php8'],
  'swift': ['swift', 'swiftui'],
  'kotlin': ['kt', 'kotlin'],
  'rust': ['rs', 'rust'],
  'scala': ['scala'],
  
  // Frontend Frameworks
  'react': ['react', 'reactjs', 'react.js', 'react js'],
  'vue': ['vue', 'vuejs', 'vue.js', 'vue js'],
  'angular': ['angular', 'angularjs', 'angular.js', 'ng'],
  'svelte': ['svelte', 'sveltejs'],
  'nextjs': ['next', 'nextjs', 'next.js', 'next js'],
  'nuxt': ['nuxt', 'nuxtjs', 'nuxt.js'],
  
  // Backend Frameworks
  'nodejs': ['node', 'nodejs', 'node.js', 'node js'],
  'express': ['express', 'expressjs', 'express.js'],
  'nestjs': ['nest', 'nestjs', 'nest.js'],
  'django': ['django', 'django rest framework', 'drf'],
  'flask': ['flask'],
  'fastapi': ['fastapi', 'fast api'],
  'spring': ['spring', 'spring boot', 'springboot'],
  'rails': ['rails', 'ruby on rails', 'ror'],
  
  // Databases
  'postgresql': ['postgres', 'postgresql', 'pg', 'psql'],
  'mysql': ['mysql', 'my sql'],
  'mongodb': ['mongo', 'mongodb', 'mongo db'],
  'redis': ['redis'],
  'cassandra': ['cassandra'],
  'elasticsearch': ['elastic', 'elasticsearch', 'elastic search', 'es'],
  'dynamodb': ['dynamodb', 'dynamo db', 'dynamo'],
  'sqlite': ['sqlite', 'sqlite3'],
  
  // Cloud & DevOps
  'aws': ['aws', 'amazon web services', 'amazon aws'],
  'azure': ['azure', 'microsoft azure'],
  'gcp': ['gcp', 'google cloud', 'google cloud platform'],
  'docker': ['docker', 'containerization'],
  'kubernetes': ['k8s', 'kubernetes', 'kube'],
  'jenkins': ['jenkins', 'jenkins ci'],
  'gitlab': ['gitlab', 'gitlab ci'],
  'circleci': ['circleci', 'circle ci'],
  'terraform': ['tf', 'terraform'],
  
  // AI/ML
  'machine learning': ['ml', 'machine learning', 'machinelearning'],
  'artificial intelligence': ['ai', 'artificial intelligence'],
  'deep learning': ['dl', 'deep learning', 'deeplearning'],
  'natural language processing': ['nlp', 'natural language processing'],
  'computer vision': ['cv', 'computer vision'],
  'tensorflow': ['tf', 'tensorflow', 'tensor flow'],
  'pytorch': ['pytorch', 'torch'],
  'scikit-learn': ['sklearn', 'scikit-learn', 'scikit learn'],
  
  // Testing
  'jest': ['jest'],
  'mocha': ['mocha'],
  'cypress': ['cypress', 'cypress.io'],
  'selenium': ['selenium'],
  'junit': ['junit', 'j unit'],
  'pytest': ['pytest', 'py test'],
  
  // Tools & Others
  'git': ['git', 'version control'],
  'github': ['github', 'gh'],
  'gitlab': ['gitlab'],
  'jira': ['jira'],
  'figma': ['figma'],
  'photoshop': ['ps', 'photoshop', 'adobe photoshop'],
  'graphql': ['graphql', 'graph ql'],
  'rest api': ['rest', 'restful', 'rest api', 'rest apis'],
  'websocket': ['websocket', 'ws', 'websockets'],
  'microservices': ['microservices', 'micro services', 'microservice'],
  'agile': ['agile', 'scrum', 'agile methodology'],
  'ci/cd': ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment'],
  
  // Mobile
  'react native': ['react native', 'react-native', 'rn'],
  'flutter': ['flutter'],
  'ionic': ['ionic'],
  'xamarin': ['xamarin'],
  
  // Data & Analytics
  'tableau': ['tableau'],
  'power bi': ['powerbi', 'power bi', 'power-bi'],
  'looker': ['looker'],
  'apache spark': ['spark', 'apache spark', 'pyspark'],
  'hadoop': ['hadoop'],
  'kafka': ['kafka', 'apache kafka'],
};

/**
 * Normalize a skill to its canonical form
 * @param {string} skill - Raw skill from resume or job description
 * @returns {string} Normalized skill name
 */
export function normalizeSkill(skill) {
  if (!skill) return '';
  
  const lowerSkill = skill.toLowerCase().trim();
  
  // Find canonical form
  for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    if (aliases.some(alias => lowerSkill === alias || lowerSkill.includes(alias))) {
      return canonical;
    }
  }
  
  // If no match found, return original (lowercase)
  return lowerSkill;
}

/**
 * Normalize an array of skills
 * @param {string[]} skills - Array of skills
 * @returns {string[]} Array of normalized skills (unique)
 */
export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  
  const normalized = skills
    .map(skill => normalizeSkill(skill))
    .filter(skill => skill.length > 0);
  
  // Remove duplicates
  return [...new Set(normalized)];
}

/**
 * Extract and normalize skills from text (job description)
 * @param {string} text - Job description or any text
 * @returns {string[]} Array of normalized skills found
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  // Check each skill synonym group
  for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    // If any alias is found in text, add canonical form
    if (aliases.some(alias => lowerText.includes(alias))) {
      foundSkills.push(canonical);
    }
  }
  
  return [...new Set(foundSkills)]; // Remove duplicates
}

/**
 * Calculate skill match percentage with normalization
 * @param {string[]} resumeSkills - Skills from user resume
 * @param {string[]} jobSkills - Skills from job description
 * @returns {number} Match percentage (0.0 to 1.0)
 */
export function calculateNormalizedSkillMatch(resumeSkills, jobSkills) {
  if (!resumeSkills.length || !jobSkills.length) return 0;
  
  // Normalize both skill sets
  const normalizedResume = normalizeSkills(resumeSkills);
  const normalizedJob = normalizeSkills(jobSkills);
  
  // Find matches
  const matches = normalizedResume.filter(skill => 
    normalizedJob.includes(skill)
  );
  
  // Return percentage of resume skills that match
  return matches.length / normalizedResume.length;
}

/**
 * Get all possible aliases for a skill
 * @param {string} skill - Skill name
 * @returns {string[]} Array of all aliases including canonical
 */
export function getSkillAliases(skill) {
  const normalized = normalizeSkill(skill);
  return SKILL_SYNONYMS[normalized] || [skill];
}

export default {
  normalizeSkill,
  normalizeSkills,
  extractSkillsFromText,
  calculateNormalizedSkillMatch,
  getSkillAliases,
  SKILL_SYNONYMS,
};
