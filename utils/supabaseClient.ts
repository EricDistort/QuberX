// supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { fetch } from 'cross-fetch';

const SUPABASE_URL = 'https://wrmkuzoxnjdvlhjmtwet.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybWt1em94bmpkdmxoam10d2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjQ0OTcsImV4cCI6MjA3MDAwMDQ5N30.N69ve-MhbWjGa4pPNgEdP2Ixn5LjhqCjBt8fAV2kXKI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch },
});
