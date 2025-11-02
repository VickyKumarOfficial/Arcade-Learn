/**
 * Resume Service - Database operations for parsed resumes
 * Handles saving, updating, and retrieving resume data from Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Resume } from '@/types/resume';

export interface SavedResume {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_url?: string;
  resume_data: Resume;
  parser_version: string;
  parsing_accuracy_score?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ResumeEditHistory {
  id: string;
  resume_id: string;
  field_path: string;
  old_value: string;
  new_value: string;
  edited_at: string;
  edit_reason: 'manual_edit' | 'ai_suggestion' | 'auto_correction';
}

class ResumeService {
  /**
   * Save parsed resume to database
   */
  async saveResume(
    userId: string,
    resumeData: Resume,
    fileName: string,
    fileSize: number,
    fileUrl?: string
  ): Promise<{ success: boolean; data?: SavedResume; error?: string }> {
    try {
      // 1. Save to Supabase
      // Deactivate all existing resumes for this user
      await supabase
        .from('parsed_resumes')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Insert new resume
      const { data, error } = await supabase
        .from('parsed_resumes')
        .insert({
          user_id: userId,
          file_name: fileName,
          file_size: fileSize,
          file_url: fileUrl,
          resume_data: resumeData as any,
          parser_version: 'v1.0',
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving resume:', error);
        return { success: false, error: error.message };
      }

      // 2. Also save to backend (stores JSON file for AI/recommendations)
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                          (window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');
        await fetch(`${backendUrl}/api/user/${userId}/resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData,
            fileName,
            fileSize,
            fileUrl,
          }),
        });
        console.log('✅ Resume JSON saved to backend for AI processing');
      } catch (backendError) {
        // Don't fail if backend save fails, Supabase save is primary
        console.warn('⚠️ Backend JSON save failed (non-critical):', backendError);
      }

      return { success: true, data: data as SavedResume };
    } catch (error) {
      console.error('Error in saveResume:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's active resume
   */
  async getActiveResume(
    userId: string
  ): Promise<{ success: boolean; data?: SavedResume; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('parsed_resumes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned"
        console.error('Error fetching active resume:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as SavedResume | undefined };
    } catch (error) {
      console.error('Error in getActiveResume:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all resumes for a user
   */
  async getAllResumes(
    userId: string
  ): Promise<{ success: boolean; data?: SavedResume[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('parsed_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resumes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as SavedResume[] };
    } catch (error) {
      console.error('Error in getAllResumes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update resume data
   */
  async updateResume(
    resumeId: string,
    resumeData: Resume,
    userId: string
  ): Promise<{ success: boolean; data?: SavedResume; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('parsed_resumes')
        .update({
          resume_data: resumeData as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId)
        .eq('user_id', userId) // Ensure user owns this resume
        .select()
        .single();

      if (error) {
        console.error('Error updating resume:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as SavedResume };
    } catch (error) {
      console.error('Error in updateResume:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a resume
   */
  async deleteResume(
    resumeId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('parsed_resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId); // Ensure user owns this resume

      if (error) {
        console.error('Error deleting resume:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteResume:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Track resume field edit
   */
  async trackEdit(
    resumeId: string,
    userId: string,
    fieldPath: string,
    oldValue: string,
    newValue: string,
    editReason: 'manual_edit' | 'ai_suggestion' | 'auto_correction' = 'manual_edit'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('resume_edit_history').insert({
        resume_id: resumeId,
        field_path: fieldPath,
        old_value: oldValue,
        new_value: newValue,
        edit_reason: editReason,
        edited_by: userId,
      });

      if (error) {
        console.error('Error tracking edit:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in trackEdit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get edit history for a resume
   */
  async getEditHistory(
    resumeId: string
  ): Promise<{ success: boolean; data?: ResumeEditHistory[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('resume_edit_history')
        .select('*')
        .eq('resume_id', resumeId)
        .order('edited_at', { ascending: false });

      if (error) {
        console.error('Error fetching edit history:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as ResumeEditHistory[] };
    } catch (error) {
      console.error('Error in getEditHistory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export resume data as JSON
   */
  exportAsJSON(resumeData: Resume, fileName: string = 'resume'): void {
    const jsonString = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Calculate parsing accuracy score (placeholder - can be enhanced)
   */
  calculateAccuracyScore(resumeData: Resume): number {
    let score = 0;
    const maxScore = 100;

    // Profile section (30 points)
    if (resumeData.profile.name) score += 10;
    if (resumeData.profile.email) score += 10;
    if (resumeData.profile.phone) score += 5;
    if (resumeData.profile.location) score += 5;

    // Work experience (25 points)
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

    return Math.min(score, maxScore);
  }
}

export const resumeService = new ResumeService();
export default ResumeService;
