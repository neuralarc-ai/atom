import { pgTable, text, timestamp, varchar, integer, uuid, pgEnum } from "drizzle-orm/pg-core";

/**
 * PostgreSQL schema for Supabase
 * This replaces the MySQL schema with PostgreSQL-compatible types
 */

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const complexityEnum = pgEnum("complexity", ["low", "medium", "high"]);
export const statusEnum = pgEnum("status", ["in_progress", "completed", "locked_out", "reappearance_requested"]);

// Users table (with password authentication instead of OAuth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(), // bcrypt hashed password
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastSignedIn: timestamp("last_signed_in").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Job roles table
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  experience: varchar("experience", { length: 100 }).notNull(),
  skills: text("skills").notNull(), // JSON stringified array
  createdAt: timestamp("created_at").defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Tests table
export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  complexity: complexityEnum("complexity").notNull(),
  questions: text("questions").notNull(), // JSON stringified array
  shortCode: varchar("short_code", { length: 10 }).unique(), // Short code for URL
  createdAt: timestamp("created_at").defaultNow(),
});

export type Test = typeof tests.$inferSelect;
export type InsertTest = typeof tests.$inferInsert;

// Candidates table
export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  testId: uuid("test_id").notNull().references(() => tests.id, { onDelete: "cascade" }),
  questions: text("questions"), // JSON stringified array of questions for this candidate
  answers: text("answers"), // JSON stringified array
  score: integer("score"), // Store as integer
  totalQuestions: integer("total_questions"), // Total number of questions
  status: statusEnum("status").default("in_progress").notNull(),
  lockoutReason: text("lockout_reason"), // Reason for lockout (e.g., "tab_switch", "eye_tracking")
  videoRecordingUrl: text("video_recording_url"), // URL to proctoring video
  eyeTrackingData: text("eye_tracking_data"), // JSON stringified eye tracking events
  reappearanceRequestedAt: timestamp("reappearance_requested_at"),
  reappearanceApprovedAt: timestamp("reappearance_approved_at"),
  reappearanceApprovedBy: uuid("reappearance_approved_by").references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

