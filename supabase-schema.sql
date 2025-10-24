-- Atom HR Portal - Supabase PostgreSQL Schema
-- This schema replaces the MySQL database with PostgreSQL for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (with password authentication instead of OAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email VARCHAR(320) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hashed password
  role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job roles table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  experience VARCHAR(100) NOT NULL,
  skills TEXT NOT NULL, -- JSON stringified array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('low', 'medium', 'high')),
  questions TEXT NOT NULL, -- JSON stringified array
  short_code VARCHAR(10) UNIQUE, -- Short code for URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email VARCHAR(320) NOT NULL,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  questions TEXT, -- JSON stringified array of questions for this candidate
  answers TEXT, -- JSON stringified array
  score INTEGER, -- Store as integer
  total_questions INTEGER, -- Total number of questions
  status VARCHAR(30) DEFAULT 'in_progress' NOT NULL CHECK (status IN ('in_progress', 'completed', 'locked_out', 'reappearance_requested')),
  lockout_reason TEXT, -- Reason for lockout (e.g., "tab_switch", "eye_tracking")
  video_recording_url TEXT, -- URL to proctoring video
  eye_tracking_data TEXT, -- JSON stringified eye tracking events
  reappearance_requested_at TIMESTAMP WITH TIME ZONE,
  reappearance_approved_at TIMESTAMP WITH TIME ZONE,
  reappearance_approved_by UUID REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better query performance
CREATE INDEX idx_tests_job_id ON tests(job_id);
CREATE INDEX idx_candidates_test_id ON candidates(test_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_users_email ON users(email);

-- Create default admin user (password: admin123 - CHANGE THIS IMMEDIATELY)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@atom.ai', '$2b$10$rKZxQXGxGxGxGxGxGxGxGOe7YvYvYvYvYvYvYvYvYvYvYvYvYvYv', 'Admin User', 'admin');

-- Note: The password hash above is a placeholder. You should generate a real bcrypt hash for your admin password.
-- To generate a bcrypt hash, you can use: https://bcrypt-generator.com/ or run:
-- node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"

