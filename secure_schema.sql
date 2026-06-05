-- ============================================
-- GeoSecure Attendance - Secure Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  student_id TEXT UNIQUE,
  name TEXT NOT NULL,
  roll_number TEXT,
  username TEXT UNIQUE NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies:
-- 1. Everyone can read all profiles (needed to see names)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
-- 2. Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Update Sessions Table RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Sessions Policies:
-- 1. Anyone logged in can read sessions
CREATE POLICY "Authenticated users can read sessions" ON sessions FOR SELECT TO authenticated USING (true);
-- 2. Only Admins can insert/update/delete sessions
CREATE POLICY "Admins can manage sessions" ON sessions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Update Attendance Table RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Attendance Policies:
-- 1. Admins can see all attendance
CREATE POLICY "Admins can view all attendance" ON attendance FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- 2. Students can only view their own attendance (we must join with profiles on student_id, or rely on auth.uid())
-- Note: Currently attendance uses `student_id` as STU001 instead of UUID. 
-- For backward compatibility, we will link via `profiles.student_id`.
CREATE POLICY "Students can view own attendance" ON attendance FOR SELECT TO authenticated USING (
  student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
);
-- 3. Students can only insert their own attendance
CREATE POLICY "Students can insert own attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (
  student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
);
-- 4. Students can update their own attendance (distance updates)
CREATE POLICY "Students can update own attendance" ON attendance FOR UPDATE TO authenticated USING (
  student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
);

-- 4. Update Location Logs Table RLS
ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;

-- Location Logs Policies:
-- 1. Admins can view all logs
CREATE POLICY "Admins can view all logs" ON location_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- 2. Students can only view own logs
CREATE POLICY "Students can view own logs" ON location_logs FOR SELECT TO authenticated USING (
  student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
);
-- 3. Students can insert own logs
CREATE POLICY "Students can insert own logs" ON location_logs FOR INSERT TO authenticated WITH CHECK (
  student_id = (SELECT student_id FROM profiles WHERE id = auth.uid())
);

-- 5. Drop the old insecure policies
DROP POLICY IF EXISTS "Allow all on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow all on attendance" ON attendance;
DROP POLICY IF EXISTS "Allow all on location_logs" ON location_logs;
