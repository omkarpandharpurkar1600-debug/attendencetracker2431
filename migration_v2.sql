-- ============================================
-- GeoSecure v2 Migration — Run in Supabase SQL Editor
-- Fixes BUG-001, BUG-006, BUG-007, BUG-012, BUG-016, BUG-019, BUG-024
-- ============================================

-- ── BUG-001: Add monitoring columns to attendance ──
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS monitoring_status TEXT DEFAULT 'Pending';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS monitoring_end_time TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS origin_lat DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS origin_lng DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS current_distance DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS current_lat DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS current_lng DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'Low';

-- ── BUG-006: Add session_name to attendance ──
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS session_name TEXT;

-- ── BUG-007: Add qr_token to sessions ──
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS qr_token TEXT;

-- ── BUG-019: Add event and status columns to location_logs ──
ALTER TABLE location_logs ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE location_logs ADD COLUMN IF NOT EXISTS event TEXT;

-- ── BUG-016: Add foreign key constraints with cascade ──
-- First check if constraints exist to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_attendance_session') THEN
    ALTER TABLE attendance ADD CONSTRAINT fk_attendance_session
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add fk_attendance_session: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_location_logs_attendance') THEN
    ALTER TABLE location_logs ADD CONSTRAINT fk_location_logs_attendance
      FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add fk_location_logs_attendance: %', SQLERRM;
END $$;

-- ── BUG-024: Drop ALL old permissive policies (try all common names) ──
DROP POLICY IF EXISTS "Allow all on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow all on attendance" ON attendance;
DROP POLICY IF EXISTS "Allow all on location_logs" ON location_logs;
DROP POLICY IF EXISTS "Enable all for all users" ON sessions;
DROP POLICY IF EXISTS "Enable all for all users" ON attendance;
DROP POLICY IF EXISTS "Enable all for all users" ON location_logs;

-- ── BUG-012: Fix RLS policies — drop and recreate properly ──

-- Sessions: Drop existing
DROP POLICY IF EXISTS "Authenticated users can read sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can manage sessions" ON sessions;

-- Sessions: Recreate with proper separation
CREATE POLICY "Anyone authenticated can read sessions"
  ON sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert sessions"
  ON sessions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update sessions"
  ON sessions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete sessions"
  ON sessions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Attendance: Drop and recreate with monitoring field support
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Students can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Students can update own attendance" ON attendance;

CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT TO authenticated
  USING (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Students can insert own attendance"
  ON attendance FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Students can update own attendance"
  ON attendance FOR UPDATE TO authenticated
  USING (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

-- Location Logs: Drop and recreate
DROP POLICY IF EXISTS "Admins can view all logs" ON location_logs;
DROP POLICY IF EXISTS "Students can view own logs" ON location_logs;
DROP POLICY IF EXISTS "Students can insert own logs" ON location_logs;

CREATE POLICY "Admins can view all logs"
  ON location_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students can view own logs"
  ON location_logs FOR SELECT TO authenticated
  USING (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Students can insert own logs"
  ON location_logs FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT student_id FROM profiles WHERE id = auth.uid()));

-- ── Verify ──
SELECT 'Migration complete. New columns added, RLS policies fixed.' AS result;
