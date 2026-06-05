-- ============================================
-- GeoSecure Attendance - Supabase Tables
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance table
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT,
  roll_number TEXT,
  session_id TEXT NOT NULL,
  scan_time TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance DOUBLE PRECISION,
  status TEXT DEFAULT 'present',
  device_id TEXT,
  qr_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Location logs table
CREATE TABLE location_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  attendance_id TEXT,
  session_id TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable public access (for demo purposes only)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on location_logs" ON location_logs FOR ALL USING (true) WITH CHECK (true);
