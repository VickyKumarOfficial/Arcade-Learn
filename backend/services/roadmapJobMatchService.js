import supabaseAdmin from '../lib/supabase.js';
import {
  normalizeSkills,
  extractSkillsFromText,
} from '../lib/skillNormalizer.js';

const FRONTEND_ROADMAP_KEYWORDS = [
  'html', 'css', 'javascript', 'typescript',
  'react', 'vue', 'angular', 'svelte',
  'tailwind', 'bootstrap', 'material ui',
  'vite', 'webpack', 'eslint', 'prettier',
  'jest', 'vitest', 'cypress', 'playwright',
  'accessibility', 'responsive design', 'performance',
  'api', 'rest api', 'frontend', 'ui', 'ux',
  'git', 'github', 'nodejs',
];

const BACKEND_ROADMAP_KEYWORDS = [
  'backend', 'backend developer',
  'nodejs', 'node.js', 'javascript', 'typescript',
  'express', 'nestjs', 'api', 'rest api', 'microservices',
  'database', 'sql', 'postgresql', 'mysql', 'mongodb',
  'redis', 'queue', 'kafka', 'rabbitmq',
  'authentication', 'jwt', 'security',
  'docker', 'kubernetes', 'ci/cd',
  'testing', 'jest', 'mocha',
  'system design',
];

const ROADMAP_KEYWORD_MAP = {
  frontend: FRONTEND_ROADMAP_KEYWORDS,
  backend: BACKEND_ROADMAP_KEYWORDS,
  'backend-nodejs': BACKEND_ROADMAP_KEYWORDS,
};

class RoadmapJobMatchService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  async getRoadmapMatches(roadmap = 'frontend', limit = 20) {
    try {
      const normalizedRoadmap = String(roadmap || '').toLowerCase().trim();
      const roadmapKeywords = ROADMAP_KEYWORD_MAP[normalizedRoadmap];

      if (!roadmapKeywords) {
        return {
          success: false,
          error: `Unsupported roadmap: ${roadmap}`,
        };
      }

      const safeLimit = Number.isFinite(limit)
        ? Math.max(1, Math.min(Number(limit), 40))
        : 20;

      // Pull a bounded recent window for scoring in memory.
      const { data: jobs, error } = await this.supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        return { success: false, error: error.message };
      }

      const normalizedRoadmapKeywords = normalizeSkills(roadmapKeywords);

      const scoredJobs = (jobs || [])
        .map((job) => {
          const combinedText = [
            job.title,
            job.department,
            job.description,
            job.type,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const extractedJobSkills = normalizeSkills(extractSkillsFromText(combinedText));

          const matchedSkills = normalizedRoadmapKeywords.filter((skill) =>
            extractedJobSkills.includes(skill)
          );

          const directKeywordHits = roadmapKeywords.filter((keyword) =>
            combinedText.includes(keyword.toLowerCase())
          );

          const skillScore = extractedJobSkills.length > 0
            ? matchedSkills.length / extractedJobSkills.length
            : 0;

          const textScore = Math.min(1, directKeywordHits.length / 10);
          const matchScore = Math.min(1, skillScore * 0.7 + textScore * 0.3);

          const matchPercentage = Math.round(matchScore * 100);

          return {
            ...job,
            matchScore,
            matchPercentage,
            matchedKeywords: [...new Set([...matchedSkills, ...directKeywordHits])].slice(0, 6),
          };
        })
        .filter((job) => job.matchScore >= 0.1)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, safeLimit)
        .map((job) => ({
          ...job,
          matchReason: job.matchedKeywords.length > 0
            ? `Matched on: ${job.matchedKeywords.slice(0, 3).join(', ')}`
            : `Matched by ${normalizedRoadmap} roadmap relevance`,
        }));

      return {
        success: true,
        data: {
          roadmap: normalizedRoadmap,
          matchedKeywords: normalizedRoadmapKeywords,
          totalMatched: scoredJobs.length,
          recommendations: scoredJobs,
          fetchedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const roadmapJobMatchService = new RoadmapJobMatchService();
export default RoadmapJobMatchService;
