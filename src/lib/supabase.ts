
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseKey = '';

// Check if we're in development or production
if (import.meta.env.DEV) {
  console.log('Running in development mode');
  // Use development URLs
  supabaseUrl = 'https://your-project-url.supabase.co';
  supabaseKey = 'your-anon-key';
} else {
  // Use environment variables in production
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
}

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseKey ? 'Present' : 'Missing'
  });
  throw new Error(
    'Missing Supabase configuration. Please ensure you have set up your Supabase project and configured the environment variables.'
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'apikey': supabaseKey
    }
  }
});

export const supabase = supabaseClient;
