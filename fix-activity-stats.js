/**
 * Apply Database Migration: Fix get_user_activity_stats Function
 * 
 * This script updates the get_user_activity_stats function to fix
 * the return type mismatch error (VARCHAR -> TEXT).
 * 
 * Run this script with: node fix-activity-stats.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_ANON_KEY; // Note: For production, use service role key

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('🔧 Starting migration: Fix get_user_activity_stats function...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'database', 'fix_activity_stats_function.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Migration SQL loaded from:', sqlPath);
    console.log('📊 Executing migration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // If exec_sql RPC doesn't exist, provide manual instructions
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('\n📋 Manual Migration Required:');
        console.log('─'.repeat(80));
        console.log('Since direct SQL execution is not available, please:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of:');
        console.log(`   ${sqlPath}`);
        console.log('4. Click "Run" to execute the migration');
        console.log('─'.repeat(80));
        console.log('\n📄 SQL to execute:');
        console.log('─'.repeat(80));
        console.log(sql);
        console.log('─'.repeat(80));
      }
      
      return;
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n🎉 The get_user_activity_stats function has been updated.');
    console.log('📊 Activity stats should now work without errors.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n📋 Please run the migration manually:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Execute the SQL in: database/fix_activity_stats_function.sql');
  }
}

// Run the migration
runMigration();
