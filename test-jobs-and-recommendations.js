/**
 * Test script to check jobs table and job recommendations
 * Run with: node test-jobs-and-recommendations.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in backend/.env');
  console.log('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testJobsAndRecommendations() {
  console.log('🔍 Testing Jobs and Recommendations System\n');
  console.log('=' .repeat(60));

  // 1. Check if jobs table has data
  console.log('\n📊 Step 1: Checking jobs table...');
  const { data: jobs, error: jobsError, count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .limit(5);

  if (jobsError) {
    console.error('❌ Error fetching jobs:', jobsError.message);
  } else {
    console.log(`✅ Found ${count} total jobs in database`);
    
    if (jobs.length > 0) {
      console.log('\n📝 Sample jobs (first 5):');
      jobs.forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company_name}`);
        console.log(`   Location: ${job.location || 'N/A'}`);
        console.log(`   Type: ${job.type || 'N/A'}`);
        console.log(`   Description: ${(job.description || 'N/A').substring(0, 100)}...`);
        console.log(`   URL: ${job.url}`);
      });
    } else {
      console.log('⚠️  No jobs found in database!');
      console.log('\n💡 You need to run the job scraper to populate jobs:');
      console.log('   cd job-scraper');
      console.log('   npm install');
      console.log('   npm run scrape');
    }
  }

  // 2. Check if there are any resumes
  console.log('\n\n📊 Step 2: Checking parsed_resumes table...');
  const { data: resumes, error: resumesError } = await supabase
    .from('parsed_resumes')
    .select('id, user_id, file_name, is_active, created_at, resume_data')
    .eq('is_active', true)
    .limit(5);

  if (resumesError) {
    console.error('❌ Error fetching resumes:', resumesError.message);
  } else {
    console.log(`✅ Found ${resumes.length} active resume(s)`);
    
    if (resumes.length > 0) {
      resumes.forEach((resume, index) => {
        console.log(`\n${index + 1}. User: ${resume.user_id}`);
        console.log(`   File: ${resume.file_name}`);
        console.log(`   Created: ${new Date(resume.created_at).toLocaleString()}`);
        
        // Extract skills from resume
        const resumeData = resume.resume_data;
        const skills = [];
        
        if (resumeData.skills?.featuredSkills) {
          skills.push(...resumeData.skills.featuredSkills);
        }
        
        if (resumeData.skills?.descriptions) {
          resumeData.skills.descriptions.forEach((desc) => {
            const extractedSkills = desc.split(/[,;•\n]/).map((s) => s.trim());
            skills.push(...extractedSkills.filter((s) => s.length > 0 && s.length < 50));
          });
        }
        
        console.log(`   Skills found: ${skills.slice(0, 10).join(', ')}${skills.length > 10 ? '...' : ''}`);
        console.log(`   Total skills: ${skills.length}`);
        
        if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
          console.log(`   Work Experience: ${resumeData.workExperiences.length} role(s)`);
          resumeData.workExperiences.slice(0, 2).forEach(exp => {
            console.log(`     - ${exp.jobTitle || 'N/A'} at ${exp.organization || 'N/A'}`);
          });
        }
      });
    } else {
      console.log('⚠️  No resumes found!');
      console.log('\n💡 Upload a resume through the UI first');
    }
  }

  // 3. Test recommendation endpoint if both exist
  if (jobs && jobs.length > 0 && resumes && resumes.length > 0) {
    console.log('\n\n📊 Step 3: Testing job recommendations...');
    const testUserId = resumes[0].user_id;
    
    console.log(`Testing for user: ${testUserId}`);
    
    try {
      const response = await fetch(`http://localhost:8081/api/user/${testUserId}/jobs/recommendations?limit=5`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Recommendation API working!`);
        console.log(`   Total jobs available: ${result.data.totalJobs}`);
        console.log(`   Matched jobs: ${result.data.matchedJobs}`);
        
        if (result.data.recommendations.length > 0) {
          console.log(`\n🎯 Top recommendations:`);
          result.data.recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.title} at ${rec.company_name}`);
            console.log(`   Match: ${rec.matchPercentage}%`);
            console.log(`   Reason: ${rec.matchReason}`);
            console.log(`   Location: ${rec.location || 'N/A'}`);
          });
        } else {
          console.log('\n⚠️  No matched jobs found!');
          console.log('\n🔍 Possible reasons:');
          console.log('   1. Job descriptions don\'t contain your resume skills');
          console.log('   2. Skills are written differently (e.g., "JS" vs "JavaScript")');
          console.log('   3. Location mismatch');
          console.log('   4. All jobs are too old (low recency score)');
        }
      } else {
        console.log(`❌ Recommendation API error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Failed to call recommendation API: ${error.message}`);
      console.log('Make sure backend is running on port 8081');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test complete!\n');
}

testJobsAndRecommendations();
