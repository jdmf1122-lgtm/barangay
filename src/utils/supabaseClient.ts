import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!((import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ [B-CONNECT] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined. Running in offline/demo mode with local seed data.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
