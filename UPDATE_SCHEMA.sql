-- ============================================
-- GYM APP - SCHEMA UPDATE FOR PERSISTENCE
-- ============================================
-- Run this script in the Supabase SQL Editor
-- ============================================

-- 1. Create GYM SETTINGS Table (Stores JSON configurations)
CREATE TABLE IF NOT EXISTS public.gym_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL UNIQUE, -- 'supplement', 'cardio', 'pt'
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read settings" ON public.gym_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert settings" ON public.gym_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update settings" ON public.gym_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 2. Create CARDIO SUBSCRIPTIONS Table
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, start_date) -- Prevent duplicate entries for same day
);

-- Enable RLS
ALTER TABLE public.cardio_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read cardio_sub" ON public.cardio_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert cardio_sub" ON public.cardio_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update cardio_sub" ON public.cardio_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete cardio_sub" ON public.cardio_subscriptions FOR DELETE TO authenticated USING (true);


-- 3. Initial Data Seeding for Settings (If Empty)
INSERT INTO public.gym_settings (category, settings)
VALUES
    ('supplement', '{"creatine": {"price": 100, "isAuto": true}, "whey": {"price": 300, "isAuto": true}, "preworkout": {"price": 200, "isAuto": true}}'),
    ('cardio', '{"weeklyPrice": 1000, "monthlyPrice": 3000, "unlimitedMultiplier": 1.5, "manualOverride": false}'),
    ('pt', '{"rates": {"one_month": 20000, "six_months": 100000, "one_year": 180000}}')
ON CONFLICT (category) DO NOTHING;

-- 4. Triggers for updated_at
DROP TRIGGER IF EXISTS update_gym_settings_updated_at ON public.gym_settings;
CREATE TRIGGER update_gym_settings_updated_at BEFORE UPDATE ON public.gym_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cardio_subscriptions_updated_at ON public.cardio_subscriptions;
CREATE TRIGGER update_cardio_subscriptions_updated_at BEFORE UPDATE ON public.cardio_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
