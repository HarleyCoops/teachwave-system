
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxekxuboywmrzhzgpaei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZWt4dWJveXdtcnpoemdwYWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NzQwODksImV4cCI6MjA1NTI1MDA4OX0.roDSe9ZlwPoaeYJDT86BUnLj_QSvv18Mg_J4Hs5KgIA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
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
