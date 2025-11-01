/**
 * Quick test to check jobs table and recommendations
 * Run from backend directory: node check-jobs.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJobsAndResumes() {
  console.log('🔍 Checking Jobs and Resumes Database\n');
  console.log('='.repeat(60));

  // 1. Count jobs
  const { count: jobCount, error: jobError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 JOBS TABLE:');
  if (jobError) {
    console.log('❌ Error:', jobError.message);
  } else {
    console.log(`   Total jobs: ${jobCount}`);
    
    if (jobCount === 0) {
      console.log('\n   ⚠️  NO JOBS IN DATABASE!');
      console.log('   💡 Solution: Run the job scraper to populate jobs');
      console.log('      cd ../job-scraper');
      console.log('      npm install');
      console.log('      npm run scrape');
    } else {
      // Show sample jobs
      const { data: sampleJobs } = await supabase
        .from('jobs')
        .select('title, company_name, location, description')
        .limit(3);
      
      console.log('\n   Sample jobs:');
      sampleJobs?.forEach((job, i) => {
        console.log(`   ${i + 1}. ${job.title} at ${job.company_name}`);
        console.log(`      Location: ${job.location || 'N/A'}`);
        // Check if description contains skills
        const hasSkills = job.description && 
          (job.description.toLowerCase().includes('javascript') ||
           job.description.toLowerCase().includes('python') ||
           job.description.toLowerCase().includes('java') ||
           job.description.toLowerCase().includes('react'));
        console.log(`      Has tech skills in description: ${hasSkills ? 'Yes ✅' : 'No ❌'}`);
      });
    }
  }

  // 2. Count resumes
  const { count: resumeCount, error: resumeError } = await supabase
    .from('parsed_resumes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log('\n📊 RESUMES TABLE:');
  if (resumeError) {
    console.log('❌ Error:', resumeError.message);
  } else {
    console.log(`   Active resumes: ${resumeCount}`);
    
    if (resumeCount === 0) {
      console.log('\n   ⚠️  NO RESUMES IN DATABASE!');
      console.log('   💡 Solution: Upload a resume through the UI (Career Hub page)');
    } else {
      // Show sample resume
      const { data: sampleResumes } = await supabase
        .from('parsed_resumes')
        .select('user_id, file_name, resume_data')
        .eq('is_active', true)
        .limit(1);
      
      if (sampleResumes && sampleResumes[0]) {
        const resume = sampleResumes[0];
        const skills = [];
        
        if (resume.resume_data?.skills?.featuredSkills) {
          skills.push(...resume.resume_data.skills.featuredSkills);
        }
        
        console.log(`\n   Sample resume:`);
        console.log(`   - User ID: ${resume.user_id}`);
        console.log(`   - File: ${resume.file_name}`);
        console.log(`   - Skills: ${skills.slice(0, 5).join(', ')}${skills.length > 5 ? '...' : ''}`);
        console.log(`   - Total skills: ${skills.length}`);
        
        if (skills.length === 0) {
          console.log('\n   ⚠️  RESUME HAS NO SKILLS!');
          console.log('   💡 This might be why no recommendations are showing');
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  
  // Summary
  console.log('\n📋 SUMMARY:');
  if (jobCount === 0) {
    console.log('❌ No jobs in database - Cannot make recommendations');
    console.log('   ACTION: Run job scraper to populate jobs');
  } else if (resumeCount === 0) {
    console.log('❌ No resumes uploaded - Cannot make recommendations');
    console.log('   ACTION: Upload resume through Career Hub page');
  } else {
    console.log('✅ Both jobs and resumes exist');
    console.log('   If still no recommendations, check:');
    console.log('   1. Job descriptions contain technical skills');
    console.log('   2. Resume skills match job requirements');
    console.log('   3. Backend server is running (npm run dev)');
  }
  
  console.log('\n');
}

checkJobsAndResumes().catch(console.error);
