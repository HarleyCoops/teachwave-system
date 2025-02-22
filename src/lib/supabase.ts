import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseKey = '';

// Check if we're in development or production
if (import.meta.env.DEV) {
  console.log('Running in development mode');
  // Use development URLs from environment variables
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sxekxuboywmrzhzgpaei.supabase.co';
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWt4dWJveXdtcnpoemdwYWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NzQwODksImV4cCI6MjA1NTI1MDA4OX0.roDSe9ZlwPoaeYJDT86BUnLj_QSvv18Mg_J4Hs5KgIA';
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
