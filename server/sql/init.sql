CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_input TEXT NOT NULL,
  bug_title VARCHAR(240) NOT NULL,
  summary TEXT NOT NULL,
  module VARCHAR(180) NOT NULL,
  environment TEXT NOT NULL,
  preconditions TEXT NOT NULL,
  steps_to_reproduce JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_result TEXT NOT NULL,
  actual_result TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  labels JSONB NOT NULL DEFAULT '[]'::jsonb,
  possible_root_cause TEXT NOT NULL,
  additional_notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id_created_at ON reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_bug_title ON reports USING GIN (to_tsvector('english', bug_title));
