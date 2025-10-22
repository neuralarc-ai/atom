import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jobs, InsertJob, tests, InsertTest, candidates, InsertCandidate } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Jobs ============
export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobs).values(job);
  return result;
}

export async function getAllJobs() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  return result.map(job => ({
    ...job,
    skills: JSON.parse(job.skills as string)
  }));
}

export async function getJobById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (result.length === 0) return undefined;
  const job = result[0];
  return {
    ...job,
    skills: JSON.parse(job.skills as string)
  };
}

export async function updateJob(id: string, data: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(jobs).set(data).where(eq(jobs.id, id));
}

export async function deleteJob(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(jobs).where(eq(jobs.id, id));
}

// ============ Tests ============
export async function createTest(test: InsertTest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tests).values(test);
  return result;
}

export async function getAllTests() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tests).orderBy(desc(tests.createdAt));
}

export async function getTestById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTestsByJobId(jobId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tests).where(eq(tests.jobId, jobId)).orderBy(desc(tests.createdAt));
}

export async function deleteTest(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tests).where(eq(tests.id, id));
}

// ============ Candidates ============
export async function createCandidate(candidate: InsertCandidate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(candidates).values(candidate);
  return result;
}

export async function getAllCandidates() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(candidates).orderBy(desc(candidates.completedAt));
}

export async function getCandidateById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCandidatesByTestId(testId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(candidates).where(eq(candidates.testId, testId)).orderBy(desc(candidates.completedAt));
}

export async function updateCandidate(id: string, data: Partial<InsertCandidate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(candidates).set(data).where(eq(candidates.id, id));
}

export async function getCandidateByEmailAndTest(email: string, testId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(candidates)
    .where(and(eq(candidates.email, email), eq(candidates.testId, testId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function deleteCandidate(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(candidates).where(eq(candidates.id, id));
}

