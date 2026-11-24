import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only instantiate when URL and Key are provided, preventing build-time prerender errors
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface TimelapseRecord {
  id: number;
  filename: string;
  image_url: string;
  date: string;
  time: string;
  hour: number;
  size_kb: number;
  captured_at: string;
  formatted_time: string;
}
