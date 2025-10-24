import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for database operations
 * Replaces Drizzle ORM with Supabase
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 * Uses service role key for admin operations
 */
export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file"
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);
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

