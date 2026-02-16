-- ============================================
-- GYM APP - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this entire script in the Supabase SQL Editor
-- to set up the complete database structure.
-- ============================================

-- 1. MEMBERS Table
CREATE TABLE IF NOT EXISTS public.members (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    fee NUMERIC DEFAULT 0,
    payment TEXT DEFAULT 'Paid', -- 'Paid', 'Unpaid'
    status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
    profile TEXT, -- URL to image
    contact TEXT, -- Phone Number
    
    -- Supplement Tracking (Populated by Supplements.jsx)
    scoops_creatine NUMERIC DEFAULT 0,
    scoops_whey NUMERIC DEFAULT 0,
    scoops_preworkout NUMERIC DEFAULT 0,
    cost_creatine NUMERIC DEFAULT 0,
    cost_whey NUMERIC DEFAULT 0,
    cost_preworkout NUMERIC DEFAULT 0,

    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date) -- Prevent duplicate attendance for same day
);

-- 3. CLASSES Table
CREATE TABLE IF NOT EXISTS public.classes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    instructor TEXT,
    time TEXT, -- e.g. "10:00 AM"
    days JSONB, -- Array of days e.g. ["Mon", "Wed"]
    capacity INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GYM SETTINGS Table (Stores JSON configurations)
CREATE TABLE IF NOT EXISTS public.gym_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL UNIQUE, -- 'supplement', 'cardio', 'pt'
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CARDIO SUBSCRIPTIONS Table
CREATE TABLE IF NOT EXISTS public.cardio_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    duration TEXT NOT NULL, -- 'Monthly', 'Weekly', etc.
    type TEXT NOT NULL, -- 'Unlimited', etc.
    price NUMERIC NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TRAINING PLANS (Personal Training) Table
CREATE TABLE IF NOT EXISTS public.training_plans (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    plan_name TEXT DEFAULT 'Personal Training',
    plan_type TEXT, -- Duration e.g '1 Month'
    trainer_name TEXT,
    price NUMERIC DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================
-- We enable RLS but allow access to 'authenticated' users (and 'anon' if you want public access).
-- Adjust strictness based on your auth needs.

-- Enable RLS for all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- Helper function to create generic permissive policies
-- (You can copy-paste these blocks for each table)

-- MEMBERS Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users (members)" ON public.members;
CREATE POLICY "Enable all access for authenticated users (members)" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for anon (members)" ON public.members;
CREATE POLICY "Enable read access for anon (members)" ON public.members FOR SELECT TO anon USING (true);

-- ATTENDANCE Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users (attendance)" ON public.attendance;
CREATE POLICY "Enable all access for authenticated users (attendance)" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CLASSES Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users (classes)" ON public.classes;
CREATE POLICY "Enable all access for authenticated users (classes)" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- GYM SETTINGS Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users (settings)" ON public.gym_settings;
CREATE POLICY "Enable all access for authenticated users (settings)" ON public.gym_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CARDIO SUBSCRIPTIONS Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users (cardio)" ON public.cardio_subscriptions;
CREATE POLICY "Enable all access for authenticated users (cardio)" ON public.cardio_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TRAINING PLANS Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users (plans)" ON public.training_plans;
CREATE POLICY "Enable all access for authenticated users (plans)" ON public.training_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_gym_settings_updated_at ON public.gym_settings;
CREATE TRIGGER update_gym_settings_updated_at BEFORE UPDATE ON public.gym_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cardio_subscriptions_updated_at ON public.cardio_subscriptions;
CREATE TRIGGER update_cardio_subscriptions_updated_at BEFORE UPDATE ON public.cardio_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_plans_updated_at ON public.training_plans;
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (INITIAL VALUES)
-- ============================================

-- Default Settings
INSERT INTO public.gym_settings (category, settings)
VALUES
    ('supplement', '{"creatine": {"price": 100, "isAuto": true}, "whey": {"price": 300, "isAuto": true}, "preworkout": {"price": 200, "isAuto": true}}'),
    ('cardio', '{"weeklyPrice": 1000, "monthlyPrice": 3000, "unlimitedMultiplier": 1.5, "manualOverride": false}'),
    ('pt', '{"rates": {"one_month": 20000, "six_months": 100000, "one_year": 180000}}')
ON CONFLICT (category) DO NOTHING;
