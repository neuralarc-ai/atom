import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Job roles table
export const jobs = mysqlTable("jobs", {
  id: varchar("id", { length: 64 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  experience: varchar("experience", { length: 100 }).notNull(),
  skills: text("skills").notNull(), // JSON stringified array
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Tests table
export const tests = mysqlTable("tests", {
  id: varchar("id", { length: 64 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  complexity: mysqlEnum("complexity", ["low", "medium", "high"]).notNull(),
  questions: text("questions").notNull(), // JSON stringified array
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Test = typeof tests.$inferSelect;
export type InsertTest = typeof tests.$inferInsert;

// Candidates table
export const candidates = mysqlTable("candidates", {
  id: varchar("id", { length: 64 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  testId: varchar("testId", { length: 64 }).notNull(),
  questions: text("questions"), // JSON stringified array of questions for this candidate
  answers: text("answers"), // JSON stringified array
  score: varchar("score", { length: 10 }),
  startedAt: timestamp("startedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;
