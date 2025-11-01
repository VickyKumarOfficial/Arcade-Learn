/**
 * Resume Service - Backend
 * Handles resume data storage in Supabase and JSON file exports
 * JSON files enable future AI recommendations and analytics
 */

import supabaseAdmin from '../lib/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to store resume JSON files
const RESUMES_DIR = path.join(__dirname, '../../data/resumes');

// Ensure resumes directory exists
if (!fs.existsSync(RESUMES_DIR)) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true });
}

class ResumeService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Save resume to both Supabase and local JSON file
   * JSON file format enables future AI processing and recommendations
   */
  async saveResume(userId, resumeData, fileName, fileSize, fileUrl = null) {
    try {
      // 1. Deactivate existing resumes
      await this.supabase
        .from('parsed_resumes')
        .update({ is_active: false })
        .eq('user_id', userId);

      // 2. Calculate accuracy score
      const accuracyScore = this.calculateAccuracyScore(resumeData);

      // 3. Insert into Supabase
      const { data: savedResume, error } = await this.supabase
        .from('parsed_resumes')
        .insert({
          user_id: userId,
          file_name: fileName,
          file_size: fileSize,
          file_url: fileUrl,
          resume_data: resumeData,
          parser_version: 'v1.0',
          parsing_accuracy_score: accuracyScore,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving resume to Supabase:', error);
        return { success: false, error: error.message };
      }

      // 4. Save as JSON file for AI/recommendation processing
      await this.saveResumeJSON(userId, savedResume.id, resumeData, accuracyScore);

      return { success: true, data: savedResume };
    } catch (error) {
      console.error('Error in saveResume:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save resume data as JSON file
   * Format: data/resumes/{userId}/{resumeId}.json
   * Enables AI processing, recommendations, and batch analytics
   */
  async saveResumeJSON(userId, resumeId, resumeData, accuracyScore) {
    try {
      const userDir = path.join(RESUMES_DIR, userId);
      
      // Create user directory if it doesn't exist
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Prepare JSON data with metadata for AI processing
      const jsonData = {
        resumeId,
        userId,
        savedAt: new Date().toISOString(),
        parserVersion: 'v1.0',
        accuracyScore,
        // Resume data
        data: resumeData,
        // Metadata for AI/recommendations
        metadata: {
          totalYearsExperience: this.calculateYearsExperience(resumeData.workExperiences),
          totalProjects: resumeData.projects.length,
          totalSkills: resumeData.skills.featuredSkills.length,
          educationLevel: this.getEducationLevel(resumeData.educations),
          industries: this.extractIndustries(resumeData.workExperiences),
          technologies: resumeData.skills.featuredSkills,
        }
      };

      const filePath = path.join(userDir, `${resumeId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

      console.log(`✅ Resume JSON saved: ${filePath}`);
      return { success: true, filePath };
    } catch (error) {
      console.error('Error saving resume JSON:', error);
      // Don't fail the whole operation if JSON save fails
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's active resume (from Supabase)
   */
  async getActiveResume(userId) {
    try {
      const { data, error } = await this.supabase
        .from('parsed_resumes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active resume:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || null };
    } catch (error) {
      console.error('Error in getActiveResume:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all resumes for a user
   */
  async getAllResumes(userId) {
    try {
      const { data, error } = await this.supabase
        .from('parsed_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resumes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getAllResumes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update resume data
   */
  async updateResume(resumeId, resumeData, userId) {
    try {
      const { data, error } = await this.supabase
        .from('parsed_resumes')
        .update({
          resume_data: resumeData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating resume:', error);
        return { success: false, error: error.message };
      }

      // Update JSON file
      await this.saveResumeJSON(
        userId,
        resumeId,
        resumeData,
        this.calculateAccuracyScore(resumeData)
      );

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateResume:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate accuracy score based on extracted data
   */
  calculateAccuracyScore(resumeData) {
    let score = 0;

    // Profile (30 points)
    if (resumeData.profile.name) score += 10;
    if (resumeData.profile.email) score += 10;
    if (resumeData.profile.phone) score += 5;
    if (resumeData.profile.location) score += 5;

    // Work Experience (25 points)
    if (resumeData.workExperiences.length > 0) {
      score += 15;
      if (resumeData.workExperiences.some(exp => exp.descriptions.length > 0)) {
        score += 10;
      }
    }

    // Education (20 points)
    if (resumeData.educations.length > 0) {
      score += 10;
      if (resumeData.educations.some(edu => edu.degree)) score += 10;
    }

    // Skills (15 points)
    if (resumeData.skills.featuredSkills.length > 0) score += 15;

    // Projects (10 points)
    if (resumeData.projects.length > 0) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Calculate total years of experience
   * Helper for AI recommendations
   */
  calculateYearsExperience(workExperiences) {
    if (!workExperiences || workExperiences.length === 0) return 0;

    // Simple calculation: count unique date ranges
    let totalYears = 0;
    workExperiences.forEach(exp => {
      const dateRange = exp.date || '';
      const years = dateRange.match(/(\d+)\s*-\s*(\d+|Present)/i);
      if (years) {
        const startYear = parseInt(years[1]);
        const endYear = years[2] === 'Present' ? new Date().getFullYear() : parseInt(years[2]);
        totalYears += Math.max(0, endYear - startYear);
      }
    });

    return totalYears;
  }

  /**
   * Get highest education level
   * Helper for AI recommendations
   */
  getEducationLevel(educations) {
    if (!educations || educations.length === 0) return 'None';

    const degrees = educations.map(edu => (edu.degree || '').toLowerCase());
    
    if (degrees.some(d => d.includes('phd') || d.includes('doctorate'))) return 'Doctorate';
    if (degrees.some(d => d.includes('master') || d.includes('m.tech') || d.includes('mba'))) return 'Masters';
    if (degrees.some(d => d.includes('bachelor') || d.includes('b.tech') || d.includes('b.e'))) return 'Bachelors';
    if (degrees.some(d => d.includes('diploma'))) return 'Diploma';
    
    return 'Other';
  }

  /**
   * Extract industries from job titles/companies
   * Helper for AI recommendations
   */
  extractIndustries(workExperiences) {
    const industries = new Set();
    
    workExperiences.forEach(exp => {
      const jobTitle = (exp.jobTitle || '').toLowerCase();
      const company = (exp.company || '').toLowerCase();
      
      // Tech keywords
      if (jobTitle.includes('software') || jobTitle.includes('developer') || 
          jobTitle.includes('engineer')) {
        industries.add('Technology');
      }
      if (jobTitle.includes('data') || jobTitle.includes('analytics')) {
        industries.add('Data Science');
      }
      if (jobTitle.includes('devops') || jobTitle.includes('cloud')) {
        industries.add('DevOps');
      }
      if (jobTitle.includes('design') || jobTitle.includes('ui') || jobTitle.includes('ux')) {
        industries.add('Design');
      }
    });

    return Array.from(industries);
  }

  /**
   * Check if user has uploaded resume
   * Returns status and basic resume info for job recommendations
   */
  async getUserResumeStatus(userId) {
    try {
      const { data, error } = await this.supabase
        .from('parsed_resumes')
        .select('id, file_name, created_at, updated_at, parsing_accuracy_score, resume_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking resume status:', error);
        return { success: false, error: error.message };
      }

      // User has no resume
      if (!data) {
        return { 
          success: true, 
          data: { 
            hasResume: false, 
            resumeData: null 
          } 
        };
      }

      // User has resume - extract key info for job matching
      const resumeInfo = {
        resumeId: data.id,
        fileName: data.file_name,
        uploadedAt: data.created_at,
        updatedAt: data.updated_at,
        accuracyScore: data.parsing_accuracy_score,
        skills: data.resume_data?.skills?.featuredSkills || [],
        experience: data.resume_data?.workExperiences || [],
        education: data.resume_data?.educations || [],
        profile: {
          name: data.resume_data?.profile?.name || '',
          email: data.resume_data?.profile?.email || '',
          location: data.resume_data?.profile?.location || ''
        }
      };

      return { 
        success: true, 
        data: { 
          hasResume: true, 
          resumeData: resumeInfo 
        } 
      };
    } catch (error) {
      console.error('Error in getUserResumeStatus:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all resume JSON files for batch AI processing
   * Used by future recommendation systems
   */
  async getAllResumeJSONs() {
    try {
      const allResumes = [];
      const userDirs = fs.readdirSync(RESUMES_DIR);

      userDirs.forEach(userId => {
        const userDir = path.join(RESUMES_DIR, userId);
        if (fs.statSync(userDir).isDirectory()) {
          const files = fs.readdirSync(userDir);
          files.forEach(file => {
            if (file.endsWith('.json')) {
              const filePath = path.join(userDir, file);
              const content = fs.readFileSync(filePath, 'utf-8');
              allResumes.push(JSON.parse(content));
            }
          });
        }
      });

      return { success: true, data: allResumes };
    } catch (error) {
      console.error('Error reading resume JSONs:', error);
      return { success: false, error: error.message };
    }
  }
}

export const resumeService = new ResumeService();
export default ResumeService;
