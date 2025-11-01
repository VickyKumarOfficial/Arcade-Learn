/**
 * Fetch Jobs from Adzuna API - India Specific
 * Get thousands of Indian jobs instantly (no scraping needed!)
 * 
 * API Docs: https://developer.adzuna.com/docs/search
 * Free Tier: 1,000 calls/month
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
  console.error('❌ Missing Adzuna credentials in .env file');
  console.log('Required: ADZUNA_APP_ID and ADZUNA_API_KEY');
  console.log('Get them from: https://developer.adzuna.com/');
  process.exit(1);
}

/**
 * Fetch jobs from Adzuna API
 */
async function fetchAdzunaJobs(searchQuery, page = 1, resultsPerPage = 50) {
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/in/search/${page}`);
  
  url.searchParams.append('app_id', ADZUNA_APP_ID);
  url.searchParams.append('app_key', ADZUNA_API_KEY);
  url.searchParams.append('results_per_page', resultsPerPage);
  url.searchParams.append('what', searchQuery);
  url.searchParams.append('sort_by', 'date'); // Get newest jobs first
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from Adzuna:`, error.message);
    return null;
  }
}

/**
 * Convert Adzuna job to our database format
 */
function convertAdzunaJob(job) {
  return {
    title: job.title,
    company_name: job.company?.display_name || 'Company Not Listed',
    location: job.location?.display_name || 'India',
    department: job.category?.label || 'Technology',
    type: job.contract_time === 'part_time' ? 'Part-Time' : 
          job.contract_time === 'contract' ? 'Contract' : 
          'Full-Time',
    salary: job.salary_min && job.salary_max 
      ? `₹${Math.round(job.salary_min)} - ₹${Math.round(job.salary_max)} per year`
      : null,
    description: job.description || '',
    url: job.redirect_url,
    posted_at: job.created,
    source: 'https://www.adzuna.in',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Save jobs to Supabase (skip duplicates based on URL)
 */
async function saveJobsToDatabase(jobs) {
  let inserted = 0;
  let skipped = 0;
  
  for (const job of jobs) {
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
      .insert(job);
    
    if (error) {
      console.error(`Error inserting job "${job.title}":`, error.message);
    } else {
      inserted++;
    }
  }
  
  return { inserted, skipped };
}

/**
 * Main function - fetch and save jobs
 */
async function main() {
  console.log('🚀 Fetching jobs from Adzuna API (India)\n');
  console.log('='.repeat(60));
  
  // Define search queries for different job types
  const searchQueries = [
    'javascript developer',
    'frontend developer',
    'web developer',
    'react developer',
    'html css developer',
    'wordpress developer',
    'junior developer',
    'software engineer fresher',
    'ui developer',
    'web designer'
  ];
  
  let totalJobsFetched = 0;
  let totalJobsSaved = 0;
  let totalJobsSkipped = 0;
  
  for (const query of searchQueries) {
    console.log(`\n🔍 Searching for: "${query}"`);
    
    // Fetch first 2 pages (100 jobs per query)
    for (let page = 1; page <= 2; page++) {
      console.log(`   Page ${page}...`);
      
      const data = await fetchAdzunaJobs(query, page, 50);
      
      if (!data || !data.results) {
        console.log(`   ⚠️  No results found`);
        break;
      }
      
      const jobs = data.results.map(convertAdzunaJob);
      totalJobsFetched += jobs.length;
      
      console.log(`   Found ${jobs.length} jobs`);
      
      // Save to database
      const { inserted, skipped } = await saveJobsToDatabase(jobs);
      totalJobsSaved += inserted;
      totalJobsSkipped += skipped;
      
      console.log(`   ✅ Saved: ${inserted} | ⏭️  Skipped: ${skipped}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   Total jobs fetched: ${totalJobsFetched}`);
  console.log(`   New jobs saved: ${totalJobsSaved}`);
  console.log(`   Duplicates skipped: ${totalJobsSkipped}`);
  console.log(`   Final database size: ${totalJobsSaved + totalJobsSkipped}`);
  
  console.log('\n✅ Job import complete!\n');
  
  // Verify in database
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });
  
  console.log(`🗄️  Total jobs in database: ${count}`);
  console.log('\n💡 Next step: Refresh your Career Hub page to see recommendations!\n');
}

main().catch(console.error);
