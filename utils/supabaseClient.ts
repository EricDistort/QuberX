// supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { fetch } from 'cross-fetch';

const SUPABASE_URL = 'https://pqcsllldgplvksiksskb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY3NsbGxkZ3BsdmtzaWtzc2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTgwNTYsImV4cCI6MjA3NTc5NDA1Nn0.p6NDp9A0WvVbc4GTz_gE5VyXLmQRiwIuuOEB5CcpCFc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch },
});
