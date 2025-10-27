import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for database operations
 * Replaces Drizzle ORM with Supabase
 */

// Try multiple environment variable names to support different deployment setups
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 * Uses service role key for admin operations
 */
export function getSupabase(): SupabaseClient {
  console.log('[Supabase] Checking configuration...');
  console.log('[Supabase] Has URL:', !!SUPABASE_URL);
  console.log('[Supabase] Has Service Key:', !!SUPABASE_SERVICE_KEY);
  
  const availableEnvVars = Object.keys(process.env).filter(k => k.includes('SUPABASE'));
  console.log('[Supabase] Available SUPABASE env vars:', availableEnvVars);
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    const missingVars = [];
    if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
    if (!SUPABASE_SERVICE_KEY) missingVars.push('SUPABASE_SERVICE_KEY');
    
    console.error('[Supabase] Configuration missing!');
    console.error('[Supabase] Missing variables:', missingVars);
    console.error('[Supabase] Available env vars:', availableEnvVars);
    
    const errorMsg = `Supabase configuration missing. Please set ${missingVars.join(' and ')} environment variables. For Vercel deployment, add these in Settings > Environment Variables.`;
    console.error('[Supabase] Error:', errorMsg);
    
    throw new Error(errorMsg);
  }

  if (!supabaseClient) {
    console.log('[Supabase] Creating client...');
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      console.log('[Supabase] Client created successfully');
    } catch (error) {
      console.error('[Supabase] Error creating client:', error);
      throw new Error('Failed to create Supabase client');
    }
  }

  return supabaseClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const configured = !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);
  console.log('[Supabase] Configuration check:', configured);
  return configured;
}

/**
 * Database type definitions matching PostgreSQL schema
 */
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  loginMethod: string | null;
  createdAt: Date | null;
  lastSignedIn: Date | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  experience: string;
  skills: string; // JSON stringified
  created_at: string;
}

export interface Test {
  id: string;
  job_id: string;
  complexity: "low" | "medium" | "high";
  questions: string; // JSON stringified
  short_code: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  test_id: string;
  questions: string | null; // JSON stringified
  answers: string | null; // JSON stringified
  score: number | null;
  total_questions: number | null;
  status: "in_progress" | "completed" | "locked_out" | "reappearance_requested";
  lockout_reason: string | null;
  video_recording_url: string | null;
  eye_tracking_data: string | null;
  reappearance_requested_at: string | null;
  reappearance_approved_at: string | null;
  reappearance_approved_by: string | null;
  started_at: string;
  completed_at: string | null;
}

