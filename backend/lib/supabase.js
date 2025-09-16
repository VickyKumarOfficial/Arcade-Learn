import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role for backend operations

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables in backend');
}

// Backend client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for user operations (when needed) - with session persistence
export const supabase = createClient(
  supabaseUrl, 
  process.env.SUPABASE_ANON_KEY || supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

export default supabaseAdmin;
