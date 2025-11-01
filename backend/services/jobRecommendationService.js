/**
 * Job Recommendation Service - Backend
 * Matches user resume skills with job listings using AI-powered scoring
 * Inspired by: darshgandhi/job-scraper
 */

import supabaseAdmin from '../lib/supabase.js';
import { 
  normalizeSkills, 
  extractSkillsFromText, 
  calculateNormalizedSkillMatch 
} from '../lib/skillNormalizer.js';

class JobRecommendationService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Get personalized job recommendations for user based on resume
   * @param {string} userId - User ID
   * @param {number} limit - Max number of recommendations (default: 10)
   * @returns {Promise<Object>} Recommended jobs with match scores
   */
  async getRecommendations(userId, limit = 10) {
    try {
      // 1. Get user's resume data
      const { data: resume, error: resumeError } = await this.supabase
        .from('parsed_resumes')
        .select('resume_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (resumeError || !resume) {
        return {
          success: false,
          error: 'No active resume found. Please upload your resume first.',
        };
      }

    //   console.log("User's resume data = ",resume);

      const resumeData = resume.resume_data;

      // 2. Extract user skills, experience, and preferences
      const userSkills = this.extractSkills(resumeData);
      const userExperience = this.extractExperience(resumeData);
      const userLocation = resumeData.profile?.location || '';

      console.log("User skills = ",userSkills);

      // 3. Fetch all active jobs
      const { data: jobs, error: jobsError } = await this.supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // Get recent jobs only

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        return { success: false, error: jobsError.message };
      }

      if (!jobs || jobs.length === 0) {
        return {
          success: true,
          data: {
            recommendations: [],
            userProfile: { skills: userSkills, experience: userExperience },
            message: 'No jobs available at the moment. Check back soon!',
          },
        };
      }

      // 4. Score each job based on resume match
      const scoredJobs = jobs.map((job) => {
        const score = this.calculateMatchScore(job, {
          skills: userSkills,
          experience: userExperience,
          location: userLocation,
        });
        return { ...job, matchScore: score };
      });

      // 5. Sort by score and return top matches
      const recommendations = scoredJobs
        .filter((job) => job.matchScore > 0) // Only jobs with some match
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit)
        .map((job) => ({
          ...job,
          matchPercentage: Math.round(job.matchScore),
          matchReason: this.getMatchReason(job, userSkills),
        }));

      return {
        success: true,
        data: {
          recommendations,
          totalJobs: jobs.length,
          matchedJobs: recommendations.length,
          userProfile: {
            skills: userSkills,
            experience: userExperience,
            location: userLocation,
          },
        },
      };
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract skills from resume data (with normalization)
   */
  extractSkills(resumeData) {
    const skills = [];

    // Featured skills
    if (resumeData.skills?.featuredSkills) {
      skills.push(...resumeData.skills.featuredSkills);
    }

    // Skills from descriptions
    if (resumeData.skills?.descriptions) {
      resumeData.skills.descriptions.forEach((desc) => {
        // Remove leading/trailing dashes, bullets, and whitespace
        const cleanedDesc = desc.replace(/^[-•*]+\s*/, '').trim();
        
        // Split by common delimiters
        const extractedSkills = cleanedDesc.split(/[,;•\n]/).map((s) => 
          s.replace(/^[-•*]+\s*/, '').trim()
        );
        skills.push(...extractedSkills.filter((s) => s.length > 0));
      });
    }

    // Extract skills from work experience descriptions
    if (resumeData.workExperiences) {
      resumeData.workExperiences.forEach((exp) => {
        exp.descriptions?.forEach((desc) => {
          // Extract using skill normalizer (handles synonyms)
          const techSkills = extractSkillsFromText(desc);
          skills.push(...techSkills);
        });
      });
    }

    // Normalize all skills (handles ML -> machine learning, JS -> javascript, etc.)
    return normalizeSkills(skills);
  }

  /**
   * Extract experience level and years from resume
   */
  extractExperience(resumeData) {
    const workExperiences = resumeData.workExperiences || [];
    
    // Calculate total years of experience
    let totalYears = 0;
    workExperiences.forEach((exp) => {
      const years = this.calculateYearsFromDate(exp.date);
      totalYears += years;
    });

    return {
      years: Math.round(totalYears),
      level: this.getExperienceLevel(totalYears),
      roles: workExperiences.map((exp) => exp.jobTitle).filter(Boolean),
    };
  }

  /**
   * Calculate years from date string
   */
  calculateYearsFromDate(dateString) {
    if (!dateString) return 0;

    const currentYear = new Date().getFullYear();
    const dateMatch = dateString.match(/(\d{4})/g);

    if (!dateMatch || dateMatch.length === 0) return 0;

    const startYear = parseInt(dateMatch[0]);
    const endYear = dateString.toLowerCase().includes('present')
      ? currentYear
      : dateMatch.length > 1
      ? parseInt(dateMatch[1])
      : currentYear;

    return Math.max(0, endYear - startYear);
  }

  /**
   * Get experience level category
   */
  getExperienceLevel(years) {
    if (years === 0) return 'Entry Level';
    if (years < 2) return 'Junior';
    if (years < 5) return 'Mid-Level';
    if (years < 10) return 'Senior';
    return 'Expert';
  }

  /**
   * Extract tech keywords from text
   */
  extractTechKeywords(text) {
    const techKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift',
      'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST', 'API',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub',
      'Machine Learning', 'AI', 'Data Science', 'Deep Learning', 'TensorFlow', 'PyTorch',
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass', 'SCSS',
      'Agile', 'Scrum', 'DevOps', 'Testing', 'Jest', 'Cypress', 'Selenium',
    ];

    const found = [];
    techKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    });

    return found;
  }

  /**
   * Calculate match score between job and user profile (0-100)
   */
  calculateMatchScore(job, userProfile) {
    let score = 0;

    // 1. Skill matching (40 points)
    const skillMatch = this.calculateSkillMatch(job, userProfile.skills);
    score += skillMatch * 40;

    // 2. Experience level matching (20 points)
    const expMatch = this.calculateExperienceMatch(job, userProfile.experience);
    score += expMatch * 20;

    // 3. Location matching (15 points)
    const locMatch = this.calculateLocationMatch(job, userProfile.location);
    score += locMatch * 15;

    // 4. Job type preference (10 points) - prioritize Full-Time
    if (job.type === 'Full-Time') score += 10;
    else if (job.type === 'Internship' && userProfile.experience.years < 2) score += 8;

    // 5. Recency bonus (15 points) - prefer newer jobs
    const recencyScore = this.calculateRecencyScore(job.created_at);
    score += recencyScore * 15;

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate skill match score (0-1) with synonym normalization
   */
  calculateSkillMatch(job, userSkills) {
    if (!userSkills || userSkills.length === 0) return 0;

    // Extract and normalize skills from job description
    const jobText = `${job.title} ${job.description} ${job.department || ''}`;
    const jobSkills = extractSkillsFromText(jobText);

    // Calculate normalized match (handles ML = Machine Learning, JS = JavaScript, etc.)
    const matchScore = calculateNormalizedSkillMatch(userSkills, jobSkills);

    // Bonus for high number of matched skills
    const bonusScore = Math.min(0.3, jobSkills.length * 0.02); // Up to +30%

    return Math.min(1, matchScore + bonusScore);
  }

  /**
   * Calculate experience match score (0-1)
   */
  calculateExperienceMatch(job, userExperience) {
    const jobTitle = job.title.toLowerCase();
    
    // Check for experience level keywords in job title
    if (userExperience.years === 0) {
      if (jobTitle.includes('intern') || jobTitle.includes('entry')) return 1;
      if (jobTitle.includes('junior')) return 0.8;
      return 0.5;
    }

    if (userExperience.years < 2) {
      if (jobTitle.includes('junior') || jobTitle.includes('entry')) return 1;
      if (jobTitle.includes('mid') || jobTitle.includes('senior')) return 0.3;
      return 0.7;
    }

    if (userExperience.years < 5) {
      if (jobTitle.includes('mid') || jobTitle.includes('intermediate')) return 1;
      if (jobTitle.includes('senior')) return 0.6;
      if (jobTitle.includes('junior')) return 0.7;
      return 0.8;
    }

    // 5+ years experience
    if (jobTitle.includes('senior') || jobTitle.includes('lead') || jobTitle.includes('principal')) return 1;
    return 0.9; // Still good match for most roles
  }

  /**
   * Calculate location match score (0-1)
   */
  calculateLocationMatch(job, userLocation) {
    if (!userLocation || !job.location) return 0.5; // Neutral if no location data

    const jobLoc = job.location.toLowerCase();
    const userLoc = userLocation.toLowerCase();

    // Remote is always a match
    if (jobLoc.includes('remote')) return 1;

    // Exact city match
    if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 1;

    // Same state/country (basic check)
    const userParts = userLoc.split(',').map((s) => s.trim());
    const jobParts = jobLoc.split(',').map((s) => s.trim());
    const commonParts = userParts.filter((part) => jobParts.includes(part));
    
    if (commonParts.length > 0) return 0.7;

    return 0.3; // Different location, but still possible
  }

  /**
   * Calculate recency score (0-1) - newer jobs score higher
   */
  calculateRecencyScore(createdAt) {
    const now = new Date();
    const jobDate = new Date(createdAt);
    const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24);

    if (daysDiff < 7) return 1; // Last week
    if (daysDiff < 14) return 0.8; // Last 2 weeks
    if (daysDiff < 30) return 0.6; // Last month
    if (daysDiff < 60) return 0.4; // Last 2 months
    return 0.2; // Older
  }

  /**
   * Get human-readable match reason
   */
  getMatchReason(job, userSkills) {
    const jobText = `${job.title} ${job.description || ''}`.toLowerCase();
    const matchedSkills = userSkills.filter((skill) =>
      jobText.includes(skill.toLowerCase())
    ).slice(0, 3); // Top 3 skills

    if (matchedSkills.length === 0) {
      return 'General match based on your profile';
    }

    return `Matches your skills: ${matchedSkills.join(', ')}`;
  }
}

export const jobRecommendationService = new JobRecommendationService();
export default JobRecommendationService;
