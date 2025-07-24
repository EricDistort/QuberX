// supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { fetch } from 'cross-fetch';

const SUPABASE_URL = 'https://wplzxpodnfsxtdguwpsl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbHp4cG9kbmZzeHRkZ3V3cHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODE4MDMsImV4cCI6MjA2ODg1NzgwM30.IIQw5dTdxBwzXNVoRhpeA0uDU6qyIQYsrKiOjDDLLBU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch },
});
