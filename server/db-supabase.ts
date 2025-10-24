/**
 * Database operations using Supabase
 * Replaces the Drizzle ORM implementation
 */

import { getSupabase, User, Job, Test, Candidate } from "./_core/supabase";

// ============ Users ============

export async function getUser(id: string): Promise<User | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[Database] Error getting user:", error);
    return undefined;
  }

  // Map database fields to User interface
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    loginMethod: null,
    createdAt: data.created_at ? new Date(data.created_at) : null,
    lastSignedIn: data.last_signed_in ? new Date(data.last_signed_in) : null,
  };
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    console.error("[Database] Error getting user by email:", error);
  }

  if (!data) return undefined;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    loginMethod: null,
    createdAt: data.created_at ? new Date(data.created_at) : null,
    lastSignedIn: data.last_signed_in ? new Date(data.last_signed_in) : null,
  };
}

export async function upsertUser(user: Partial<User> & { id: string }): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("users")
    .upsert(user, { onConflict: "id" });

  if (error) {
    console.error("[Database] Error upserting user:", error);
    throw error;
  }
}

export async function updateUserLastSignedIn(userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("users")
    .update({ last_signed_in: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[Database] Error updating last signed in:", error);
  }
}

// ============ Jobs ============

export async function createJob(job: Omit<Job, "id" | "created_at">): Promise<{ id: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select("id")
    .single();

  if (error) {
    console.error("[Database] Error creating job:", error);
    throw error;
  }

  return { id: data.id };
}

export async function getAllJobs(): Promise<Job[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Database] Error getting jobs:", error);
    return [];
  }

  return data as Job[];
}

export async function getJob(id: string): Promise<Job | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[Database] Error getting job:", error);
    return undefined;
  }

  return data as Job;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[Database] Error updating job:", error);
    throw error;
  }
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error} = await supabase
    .from("jobs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Database] Error deleting job:", error);
    throw error;
  }
}

// ============ Tests ============

export async function createTest(test: Omit<Test, "id" | "created_at">): Promise<{ id: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tests")
    .insert(test)
    .select("id")
    .single();

  if (error) {
    console.error("[Database] Error creating test:", error);
    throw error;
  }

  return { id: data.id };
}

export async function getAllTests(): Promise<(Test & { job: Job })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tests")
    .select(`
      *,
      job:jobs(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Database] Error getting tests:", error);
    return [];
  }

  return data as any[];
}

export async function getTest(id: string): Promise<Test | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[Database] Error getting test:", error);
    return undefined;
  }

  return data as Test;
}

export async function getTestByShortCode(shortCode: string): Promise<Test | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("short_code", shortCode)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Database] Error getting test by short code:", error);
  }

  return data as Test | undefined;
}

export async function deleteTest(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Database] Error deleting test:", error);
    throw error;
  }
}

// ============ Candidates ============

export async function createCandidate(candidate: Omit<Candidate, "id" | "started_at">): Promise<{ id: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .insert(candidate)
    .select("id")
    .single();

  if (error) {
    console.error("[Database] Error creating candidate:", error);
    throw error;
  }

  return { id: data.id };
}

export async function getAllCandidates(): Promise<(Candidate & { test: Test & { job: Job } })[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select(`
      *,
      test:tests(
        *,
        job:jobs(*)
      )
    `)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("[Database] Error getting candidates:", error);
    return [];
  }

  return data as any[];
}

export async function getCandidate(id: string): Promise<Candidate | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[Database] Error getting candidate:", error);
    return undefined;
  }

  return data as Candidate;
}

export async function getCandidateByEmailAndTest(email: string, testId: string): Promise<Candidate | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("email", email)
    .eq("test_id", testId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Database] Error getting candidate by email and test:", error);
  }

  return data as Candidate | undefined;
}

export async function updateCandidate(id: string, updates: Partial<Candidate>): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("candidates")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[Database] Error updating candidate:", error);
    throw error;
  }
}

export async function deleteCandidate(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Database] Error deleting candidate:", error);
    throw error;
  }
}

// ============ Stats ============

export async function getStats() {
  const supabase = getSupabase();

  // Get counts
  const [jobsResult, testsResult, candidatesResult] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("tests").select("id", { count: "exact", head: true }),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalJobs: jobsResult.count || 0,
    totalTests: testsResult.count || 0,
    totalCandidates: candidatesResult.count || 0,
  };
}

