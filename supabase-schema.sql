-- ============================================
-- GYM MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- ============================================
-- Copy this entire code and run it in Supabase SQL Editor
-- ============================================

-- DROP EXISTING TABLES (if they exist with wrong schema)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;

-- 1. MEMBERS TABLE
-- Stores all gym member information
CREATE TABLE public.members (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    fee NUMERIC NOT NULL,
    payment TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment IN ('Paid', 'Unpaid')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    profile TEXT,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE TABLE
-- Tracks daily attendance for each member
CREATE TABLE public.attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);

-- 3. CLASSES TABLE
-- Stores gym class schedules
CREATE TABLE public.classes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    instructor TEXT NOT NULL,
    time TEXT NOT NULL,
    day TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Index on member name for faster searches
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members(name);

-- Index on member payment status
CREATE INDEX IF NOT EXISTS idx_members_payment ON public.members(payment);

-- Index on member status
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);

-- Index on attendance member_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON public.attendance(member_id);

-- Index on attendance date
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- Index on class day for schedule queries
CREATE INDEX IF NOT EXISTS idx_classes_day ON public.classes(day);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all members
CREATE POLICY "Allow authenticated users to read members"
ON public.members FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert members
CREATE POLICY "Allow authenticated users to insert members"
ON public.members FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update members
CREATE POLICY "Allow authenticated users to update members"
ON public.members FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete members
CREATE POLICY "Allow authenticated users to delete members"
ON public.members FOR DELETE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to read all attendance
CREATE POLICY "Allow authenticated users to read attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert attendance
CREATE POLICY "Allow authenticated users to insert attendance"
ON public.attendance FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to delete attendance
CREATE POLICY "Allow authenticated users to delete attendance"
ON public.attendance FOR DELETE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to read all classes
CREATE POLICY "Allow authenticated users to read classes"
ON public.classes FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert classes
CREATE POLICY "Allow authenticated users to insert classes"
ON public.classes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update classes
CREATE POLICY "Allow authenticated users to update classes"
ON public.classes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete classes
CREATE POLICY "Allow authenticated users to delete classes"
ON public.classes FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for members table
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for classes table
DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Insert sample members
INSERT INTO public.members (name, fee, payment, status, profile) VALUES
('Ahmed Ali', 3000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=ahmed'),
('Fatima Khan', 3500, 'Unpaid', 'Active', 'https://i.pravatar.cc/150?u=fatima'),
('Hassan Raza', 3000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=hassan'),
('Ayesha Malik', 4000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=ayesha'),
('Bilal Ahmed', 3000, 'Unpaid', 'Inactive', 'https://i.pravatar.cc/150?u=bilal')
ON CONFLICT DO NOTHING;

-- Insert sample classes
INSERT INTO public.classes (name, instructor, time, day, capacity) VALUES
('Yoga Class', 'Instructor Ali', '06:00 AM', 'Monday', 20),
('CrossFit', 'Instructor Sara', '07:00 AM', 'Tuesday', 15),
('Zumba', 'Instructor Fatima', '05:00 PM', 'Wednesday', 25),
('Boxing', 'Instructor Hassan', '06:00 PM', 'Thursday', 12),
('Pilates', 'Instructor Ayesha', '07:00 AM', 'Friday', 18)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('members', 'attendance', 'classes');

-- Count records in each table
SELECT 
    (SELECT COUNT(*) FROM public.members) as total_members,
    (SELECT COUNT(*) FROM public.attendance) as total_attendance,
    (SELECT COUNT(*) FROM public.classes) as total_classes;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready to use with the Gym Management App
-- ============================================
