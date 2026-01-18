-- ============================================
-- FIXED GYM MANAGEMENT SYSTEM - SUPABASE DATABASE
-- ============================================
-- This script fixes the index creation error by properly dropping existing indexes first
-- Instructions:
-- 1. Copy this ENTIRE code
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and click "Run"
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING INDEXES FIRST
-- ============================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS public.idx_members_name;
DROP INDEX IF EXISTS public.idx_members_payment;
DROP INDEX IF EXISTS public.idx_members_status;
DROP INDEX IF EXISTS public.idx_members_email;
DROP INDEX IF EXISTS public.idx_attendance_member_id;
DROP INDEX IF EXISTS public.idx_attendance_date;
DROP INDEX IF EXISTS public.idx_classes_day;
DROP INDEX IF EXISTS public.idx_classes_time;
DROP INDEX IF EXISTS public.idx_supplements_member_id;
DROP INDEX IF EXISTS public.idx_supplements_type;
DROP INDEX IF EXISTS public.idx_cardio_member_id;
DROP INDEX IF EXISTS public.idx_cardio_date;
DROP INDEX IF EXISTS public.idx_training_member_id;
DROP INDEX IF EXISTS public.idx_training_status;
DROP INDEX IF EXISTS public.idx_invoices_member_id;
DROP INDEX IF EXISTS public.idx_invoices_number;
DROP INDEX IF EXISTS public.idx_invoices_status;
DROP INDEX IF EXISTS public.idx_cardio_subscriptions_member_id;
DROP INDEX IF EXISTS public.idx_cardio_subscriptions_status;
DROP INDEX IF EXISTS public.idx_gym_settings_category;

-- ============================================
-- STEP 2: DROP ALL EXISTING TABLES (Clean Start)
-- ============================================

DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.supplements CASCADE;
DROP TABLE IF EXISTS public.cardio_sessions CASCADE;
DROP TABLE IF EXISTS public.cardio_subscriptions CASCADE;
DROP TABLE IF EXISTS public.training_plans CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.gym_settings CASCADE;

-- ============================================
-- STEP 3: CREATE ALL TABLES
-- ============================================

-- 1. MEMBERS TABLE
CREATE TABLE public.members (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    fee NUMERIC NOT NULL DEFAULT 3000,
    payment TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment IN ('Paid', 'Unpaid')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    profile TEXT,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE TABLE
CREATE TABLE public.attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);

-- 3. CLASSES TABLE (Schedule)
CREATE TABLE public.classes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    instructor TEXT NOT NULL,
    time TEXT NOT NULL,
    day TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUPPLEMENTS TABLE
CREATE TABLE public.supplements (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    supplement_type TEXT NOT NULL CHECK (supplement_type IN ('creatine', 'whey', 'preworkout')),
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CARDIO SESSIONS TABLE
CREATE TABLE public.cardio_sessions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('weekly', 'monthly', 'unlimited')),
    duration INTEGER, -- in minutes
    calories_burned INTEGER,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CARDIO SUBSCRIPTIONS TABLE (NEW - for Cardio page)
CREATE TABLE public.cardio_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    duration TEXT NOT NULL CHECK (duration IN ('Weekly', 'Monthly')),
    type TEXT NOT NULL CHECK (type IN ('Standard', 'Unlimited')),
    price NUMERIC NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TRAINING PLANS TABLE (Personal Training)
CREATE TABLE public.training_plans (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('one_month', 'six_months', 'one_year')),
    trainer_name TEXT,
    goals TEXT[], -- Array of fitness goals
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    price NUMERIC NOT NULL,
    sessions_completed INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 12,
    notes TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INVOICES TABLE
CREATE TABLE public.invoices (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    items JSONB, -- Store invoice items as JSON
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Card', 'Online')),
    status TEXT DEFAULT 'Paid' CHECK (status IN ('Paid', 'Unpaid', 'Partial')),
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. GYM SETTINGS TABLE (NEW - for storing app settings)
CREATE TABLE public.gym_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL UNIQUE CHECK (category IN ('supplement', 'cardio', 'pt', 'general')),
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Members indexes
CREATE INDEX idx_members_name ON public.members(name);
CREATE INDEX idx_members_payment ON public.members(payment);
CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_members_email ON public.members(email);

-- Attendance indexes
CREATE INDEX idx_attendance_member_id ON public.attendance(member_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);

-- Classes indexes
CREATE INDEX idx_classes_day ON public.classes(day);
CREATE INDEX idx_classes_time ON public.classes(time);

-- Supplements indexes
CREATE INDEX idx_supplements_member_id ON public.supplements(member_id);
CREATE INDEX idx_supplements_type ON public.supplements(supplement_type);

-- Cardio indexes
CREATE INDEX idx_cardio_member_id ON public.cardio_sessions(member_id);
CREATE INDEX idx_cardio_date ON public.cardio_sessions(session_date);

-- Cardio subscriptions indexes
CREATE INDEX idx_cardio_subscriptions_member_id ON public.cardio_subscriptions(member_id);
CREATE INDEX idx_cardio_subscriptions_status ON public.cardio_subscriptions(status);

-- Training plans indexes
CREATE INDEX idx_training_member_id ON public.training_plans(member_id);
CREATE INDEX idx_training_status ON public.training_plans(status);

-- Invoices indexes
CREATE INDEX idx_invoices_member_id ON public.invoices(member_id);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Gym settings indexes
CREATE INDEX idx_gym_settings_category ON public.gym_settings(category);

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE RLS POLICIES (Allow authenticated users)
-- ============================================

-- Members policies
CREATE POLICY "Allow authenticated read members" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update members" ON public.members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete members" ON public.members FOR DELETE TO authenticated USING (true);

-- Attendance policies
CREATE POLICY "Allow authenticated read attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated delete attendance" ON public.attendance FOR DELETE TO authenticated USING (true);

-- Classes policies
CREATE POLICY "Allow authenticated read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update classes" ON public.classes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete classes" ON public.classes FOR DELETE TO authenticated USING (true);

-- Supplements policies
CREATE POLICY "Allow authenticated read supplements" ON public.supplements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert supplements" ON public.supplements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update supplements" ON public.supplements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete supplements" ON public.supplements FOR DELETE TO authenticated USING (true);

-- Cardio policies
CREATE POLICY "Allow authenticated read cardio" ON public.cardio_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert cardio" ON public.cardio_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update cardio" ON public.cardio_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete cardio" ON public.cardio_sessions FOR DELETE TO authenticated USING (true);

-- Cardio subscriptions policies
CREATE POLICY "Allow authenticated read cardio_subscriptions" ON public.cardio_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert cardio_subscriptions" ON public.cardio_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update cardio_subscriptions" ON public.cardio_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete cardio_subscriptions" ON public.cardio_subscriptions FOR DELETE TO authenticated USING (true);

-- Training plans policies
CREATE POLICY "Allow authenticated read training" ON public.training_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert training" ON public.training_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update training" ON public.training_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete training" ON public.training_plans FOR DELETE TO authenticated USING (true);

-- Invoices policies
CREATE POLICY "Allow authenticated read invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);

-- Gym settings policies
CREATE POLICY "Allow authenticated read gym_settings" ON public.gym_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert gym_settings" ON public.gym_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update gym_settings" ON public.gym_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete gym_settings" ON public.gym_settings FOR DELETE TO authenticated USING (true);

-- ============================================
-- STEP 7: CREATE TRIGGERS FOR AUTO TIMESTAMPS
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cardio_subscriptions_updated_at ON public.cardio_subscriptions;
CREATE TRIGGER update_cardio_subscriptions_updated_at BEFORE UPDATE ON public.cardio_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_updated_at ON public.training_plans;
CREATE TRIGGER update_training_updated_at BEFORE UPDATE ON public.training_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_settings_updated_at ON public.gym_settings;
CREATE TRIGGER update_gym_settings_updated_at BEFORE UPDATE ON public.gym_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 8: INSERT SAMPLE DATA FOR TESTING
-- ============================================

-- Sample Members
INSERT INTO public.members (name, email, phone, fee, payment, status, profile) VALUES
('Ahmed Ali', 'ahmed@example.com', '0300-1234567', 3000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=ahmed'),
('Fatima Khan', 'fatima@example.com', '0301-2345678', 3500, 'Unpaid', 'Active', 'https://i.pravatar.cc/150?u=fatima'),
('Hassan Raza', 'hassan@example.com', '0302-3456789', 3000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=hassan'),
('Ayesha Malik', 'ayesha@example.com', '0303-4567890', 4000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=ayesha'),
('Bilal Ahmed', 'bilal@example.com', '0304-5678901', 3000, 'Unpaid', 'Inactive', 'https://i.pravatar.cc/150?u=bilal'),
('Sara Hussain', 'sara@example.com', '0305-6789012', 3500, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=sara'),
('Usman Tariq', 'usman@example.com', '0306-7890123', 3000, 'Paid', 'Active', 'https://i.pravatar.cc/150?u=usman'),
('Zainab Ali', 'zainab@example.com', '0307-8901234', 4000, 'Unpaid', 'Active', 'https://i.pravatar.cc/150?u=zainab')
ON CONFLICT DO NOTHING;

-- Sample Classes
INSERT INTO public.classes (name, instructor, time, day, capacity, description) VALUES
('Yoga Class', 'Instructor Ali', '06:00 AM', 'Monday', 20, 'Morning yoga for flexibility and relaxation'),
('CrossFit', 'Instructor Sara', '07:00 AM', 'Tuesday', 15, 'High-intensity functional training'),
('Zumba', 'Instructor Fatima', '05:00 PM', 'Wednesday', 25, 'Dance fitness workout'),
('Boxing', 'Instructor Hassan', '06:00 PM', 'Thursday', 12, 'Boxing techniques and cardio'),
('Pilates', 'Instructor Ayesha', '07:00 AM', 'Friday', 18, 'Core strengthening exercises'),
('Spinning', 'Instructor Usman', '06:30 AM', 'Saturday', 20, 'Indoor cycling workout'),
('HIIT', 'Instructor Zainab', '05:30 PM', 'Sunday', 15, 'High-intensity interval training')
ON CONFLICT DO NOTHING;

-- Sample Attendance (for today)
INSERT INTO public.attendance (member_id, date) 
SELECT id, TO_CHAR(NOW(), 'Mon DD YYYY') 
FROM public.members 
WHERE status = 'Active' 
LIMIT 5
ON CONFLICT DO NOTHING;

-- Sample Supplements
INSERT INTO public.supplements (member_id, supplement_type, quantity, price)
SELECT id, 'whey', 1, 300
FROM public.members
WHERE payment = 'Paid'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Sample Cardio Subscriptions
INSERT INTO public.cardio_subscriptions (member_id, duration, type, price, end_date)
SELECT 
    id, 
    'Monthly', 
    'Unlimited', 
    4500,
    NOW() + INTERVAL '1 month'
FROM public.members
WHERE status = 'Active'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Sample Training Plans
INSERT INTO public.training_plans (member_id, plan_name, plan_type, trainer_name, price, end_date, goals, total_sessions)
SELECT 
    id, 
    'Muscle Building Program', 
    'one_month', 
    'Trainer Ali', 
    20000,
    NOW() + INTERVAL '1 month',
    ARRAY['Muscle Gain', 'Strength Training'],
    12
FROM public.members
WHERE status = 'Active'
LIMIT 2
ON CONFLICT DO NOTHING;

-- Sample Invoices
INSERT INTO public.invoices (member_id, invoice_number, amount, items, payment_method, status)
SELECT 
    id,
    'INV-' || LPAD(id::TEXT, 5, '0'),
    fee,
    jsonb_build_object(
        'membership', fee,
        'description', 'Monthly Gym Membership'
    ),
    'Cash',
    payment
FROM public.members
WHERE payment = 'Paid'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Sample Gym Settings
INSERT INTO public.gym_settings (category, settings) VALUES
('supplement', jsonb_build_object(
    'creatine', jsonb_build_object('price', 100, 'isAuto', true),
    'whey', jsonb_build_object('price', 300, 'isAuto', true),
    'preworkout', jsonb_build_object('price', 200, 'isAuto', true)
)),
('cardio', jsonb_build_object(
    'weeklyPrice', 1000,
    'monthlyPrice', 3000,
    'unlimitedMultiplier', 1.5,
    'manualOverride', false
)),
('pt', jsonb_build_object(
    'rates', jsonb_build_object(
        'one_month', 20000,
        'six_months', 100000,
        'one_year', 180000
    )
))
ON CONFLICT (category) DO UPDATE SET
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ============================================
-- STEP 9: CREATE USEFUL VIEWS
-- ============================================

-- View: Active Members with Attendance Count
CREATE OR REPLACE VIEW active_members_stats AS
SELECT 
    m.id,
    m.name,
    m.email,
    m.fee,
    m.payment,
    COUNT(a.id) as attendance_count,
    MAX(a.date) as last_attendance
FROM public.members m
LEFT JOIN public.attendance a ON m.id = a.member_id
WHERE m.status = 'Active'
GROUP BY m.id, m.name, m.email, m.fee, m.payment;

-- View: Monthly Revenue
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    SUM(amount) as total_revenue,
    COUNT(*) as total_invoices
FROM public.invoices
WHERE status = 'Paid'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- View: Active Subscriptions Summary
CREATE OR REPLACE VIEW active_subscriptions_summary AS
SELECT 
    'Cardio' as subscription_type,
    COUNT(*) as active_count,
    SUM(price) as total_revenue
FROM public.cardio_subscriptions
WHERE status = 'Active'
UNION ALL
SELECT 
    'Personal Training' as subscription_type,
    COUNT(*) as active_count,
    SUM(price) as total_revenue
FROM public.training_plans
WHERE status = 'Active';

-- ============================================
-- STEP 10: VERIFICATION QUERIES
-- ============================================

-- Check all tables
SELECT 
    'members' as table_name, COUNT(*) as record_count FROM public.members
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'classes', COUNT(*) FROM public.classes
UNION ALL
SELECT 'supplements', COUNT(*) FROM public.supplements
UNION ALL
SELECT 'cardio_sessions', COUNT(*) FROM public.cardio_sessions
UNION ALL
SELECT 'cardio_subscriptions', COUNT(*) FROM public.cardio_subscriptions
UNION ALL
SELECT 'training_plans', COUNT(*) FROM public.training_plans
UNION ALL
SELECT 'invoices', COUNT(*) FROM public.invoices
UNION ALL
SELECT 'gym_settings', COUNT(*) FROM public.gym_settings;

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- Your complete gym management database is ready!
-- 
-- Fixed Issues:
-- ✅ Added DROP INDEX IF EXISTS statements to prevent index creation errors
-- ✅ Added cardio_subscriptions table for Cardio page functionality
-- ✅ Added gym_settings table for storing app settings
-- ✅ Enhanced training_plans table with goals and session tracking
-- ✅ Added proper sample data for all tables
-- ✅ Created useful views for reporting
-- 
-- Next Steps:
-- 1. Go to Authentication > Users
-- 2. Create admin user: admin@gym.com / admin123
-- 3. Update .env file with your Project URL and anon key
-- 4. Restart your development server
-- 5. Login and test all pages!
-- ============================================