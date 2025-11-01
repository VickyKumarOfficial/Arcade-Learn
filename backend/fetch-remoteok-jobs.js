/**
 * RemoteOK Job API Integration
 * Fetches 1000+ remote tech jobs (no API key needed!)
 * Perfect alternative to web scraping
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Fetch jobs from RemoteOK API
 * No API key required, completely free!
 */
async function fetchRemoteOKJobs() {
  console.log('🌍 Fetching jobs from RemoteOK API...\n');

  try {
    // RemoteOK free API - returns all remote jobs
    const response = await fetch('https://remoteok.com/api');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // First element is metadata, skip it
    const jobs = data.slice(1);

    console.log(`✅ Fetched ${jobs.length} jobs from RemoteOK\n`);

    // Filter for tech jobs relevant to your skills
    const techJobs = jobs.filter(job => {
      const tags = (job.tags || []).map(t => t.toLowerCase());
      const position = (job.position || '').toLowerCase();
      
      // Filter for: JavaScript, Frontend, Web Development, React, etc.
      const relevantTags = [
        'javascript', 'frontend', 'react', 'vue', 'angular',
        'web', 'html', 'css', 'typescript', 'node',
        'fullstack', 'full-stack', 'junior', 'entry'
      ];
      
      return relevantTags.some(tag => 
        tags.includes(tag) || position.includes(tag)
      );
    });

    console.log(`🎯 Found ${techJobs.length} relevant tech jobs\n`);

    // Transform to match our database schema
    const transformedJobs = techJobs.map(job => ({
      title: job.position,
      company_name: job.company,
      location: job.location || 'Remote',
      department: job.tags?.[0] || 'Technology',
      type: job.contract_time || 'Full-Time',
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
        : null,
      description: job.description || `${job.position} at ${job.company}. Tags: ${job.tags?.join(', ')}`,
      url: job.url ? `https://remoteok.com${job.url}` : job.apply_url,
      posted_at: job.date ? new Date(job.date * 1000).toISOString() : null,
      source: 'https://remoteok.com',
    }));

    return transformedJobs;
  } catch (error) {
    console.error('❌ Error fetching from RemoteOK:', error.message);
    return [];
  }
}

/**
 * Save jobs to Supabase (avoiding duplicates)
 */
async function saveJobsToDatabase(jobs) {
  console.log(`💾 Saving ${jobs.length} jobs to Supabase...\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const job of jobs) {
    try {
      // Check if job already exists (by URL)
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('url', job.url)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Insert new job
      const { error } = await supabase
        .from('jobs')
        .insert([job]);

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          skipped++;
        } else {
          console.error(`Error inserting job "${job.title}":`, error.message);
          errors++;
        }
      } else {
        inserted++;
      }
    } catch (err) {
      console.error(`Unexpected error for job "${job.title}":`, err.message);
      errors++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`   ✅ Inserted: ${inserted} new jobs`);
  console.log(`   ⏭️  Skipped: ${skipped} duplicates`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n✨ Total jobs in database: ${inserted + skipped}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 RemoteOK Job Fetcher\n');
  console.log('='.repeat(60));
  console.log('\n');

  // Fetch jobs from RemoteOK
  const jobs = await fetchRemoteOKJobs();

  if (jobs.length === 0) {
    console.log('⚠️  No jobs fetched. Exiting...');
    return;
  }

  // Save to database
  await saveJobsToDatabase(jobs);

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Done! Jobs are now in your database.');
  console.log('💡 Refresh your app to see job recommendations!\n');
}

// Run it
main().catch(console.error);
