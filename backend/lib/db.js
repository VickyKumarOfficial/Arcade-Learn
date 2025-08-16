import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Basic connection validation
console.log('🔍 Checking database configuration...');
console.log('Database URL present:', !!supabaseUrl);
console.log('Database key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Database configuration missing. Please check your .env file');
  process.exit(1);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', error.message);
  console.error('Current URL:', supabaseUrl);
  process.exit(1);
}

// Create client with basic config and logging
const db = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Test the connection
async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // First test basic connectivity
    const { error: healthError } = await db.from('profiles').select('count').limit(1);
    
    if (healthError) {
      console.error('❌ Database query failed:', {
        code: healthError.code,
        message: healthError.message,
        details: healthError.details,
        hint: healthError.hint
      });
      throw healthError;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed with details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: error?.status,
      statusText: error?.statusText
    });
    return false;
  }
}

// Export both the client and the test function
export { db, testConnection };
