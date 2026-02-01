-- =========================================================
-- FINAL DATABASE SETUP SCRIPT (RESET & REBUILD)
-- =========================================================
-- WARNING: THIS WILL DELETE ALL EXISTING DATA IN THESE TABLES
-- Run this script to completely reset and build the database.
-- =========================================================

-- 1. DROP EVERYTHING (CLEAN SLATE)
DROP TRIGGER IF EXISTS update_gym_settings_updated_at ON public.gym_settings;
DROP TRIGGER IF EXISTS update_cardio_subscriptions_updated_at ON public.cardio_subscriptions;
DROP TRIGGER IF EXISTS update_training_plans_updated_at ON public.training_plans;
DROP FUNCTION IF EXISTS update_updated_at_column;

DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.cardio_subscriptions CASCADE;
DROP TABLE IF EXISTS public.training_plans CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.gym_settings CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;

-- 2. CREATE TABLES

-- MEMBERS Table
CREATE TABLE public.members (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT, -- New Contact Number
    fee NUMERIC DEFAULT 0,
    payment TEXT DEFAULT 'Paid', -- 'Paid', 'Unpaid'
    status TEXT DEFAULT 'Active', -- 'Active', 'Inactive'
    profile TEXT, -- URL to image
    
    -- Supplement Tracking
    scoops_creatine NUMERIC DEFAULT 0, -- Total Scoops consumed
    scoops_whey NUMERIC DEFAULT 0,
    scoops_preworkout NUMERIC DEFAULT 0,
    cost_creatine NUMERIC DEFAULT 0, -- Manual cost overrides
    cost_whey NUMERIC DEFAULT 0,
    cost_preworkout NUMERIC DEFAULT 0,

    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATTENDANCE Table
CREATE TABLE public.attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date) -- Prevent duplicate scans per day
);

-- CLASSES Table
CREATE TABLE public.classes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    instructor TEXT,
    time TEXT,
    days JSONB,
    capacity INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GYM SETTINGS Table (Stores JSON configurations)
CREATE TABLE public.gym_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL UNIQUE, -- 'supplement', 'cardio', 'pt'
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CARDIO SUBSCRIPTIONS Table
CREATE TABLE public.cardio_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    duration TEXT NOT NULL,
    type TEXT NOT NULL,
    price NUMERIC NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRAINING PLANS (Personal Training) Table
CREATE TABLE public.training_plans (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES public.members(id) ON DELETE CASCADE,
    plan_name TEXT DEFAULT 'Personal Training',
    plan_type TEXT,
    trainer_name TEXT,
    price NUMERIC DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

-- Create Permissive Policies (Allow everything for logged in users)
CREATE POLICY "Allow All Authenticated Members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Authenticated Attendance" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Authenticated Classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Authenticated Settings" ON public.gym_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Authenticated Cardio" ON public.cardio_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Authenticated Plans" ON public.training_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow Anonymous Read for Members (Optional for QR public scan if needed later)
CREATE POLICY "Allow Anonymous Read Members" ON public.members FOR SELECT TO anon USING (true);

-- 4. SETUP HELPERS (Triggers)

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gym_settings_updated_at BEFORE UPDATE ON public.gym_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cardio_subscriptions_updated_at BEFORE UPDATE ON public.cardio_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. SEED INITIAL DATA

INSERT INTO public.gym_settings (category, settings)
VALUES
    ('supplement', '{"creatine": {"price": 100, "isAuto": true}, "whey": {"price": 300, "isAuto": true}, "preworkout": {"price": 200, "isAuto": true}}'),
    ('cardio', '{"weeklyPrice": 1000, "monthlyPrice": 3000, "unlimitedMultiplier": 1.5, "manualOverride": false}'),
    ('pt', '{"rates": {"one_month": 20000, "six_months": 100000, "one_year": 180000}}')
ON CONFLICT (category) DO NOTHING;

-- Done!
