-- =============================================================
-- MULTI-TENANT DATA ISOLATION MIGRATION
-- =============================================================
-- This script adds an owner_id column to every gym data table
-- so each admin only sees their own gym's data.
-- Super admins can see everything.
--
-- Run this in Supabase SQL Editor AFTER the existing schema.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ADD owner_id COLUMN TO ALL DATA TABLES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.gym_settings
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cardio_subscriptions
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- 2. CREATE INDEXES FOR FAST LOOKUPS
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_members_owner ON public.members(owner_id);
CREATE INDEX IF NOT EXISTS idx_attendance_owner ON public.attendance(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_classes_owner ON public.classes(owner_id);
CREATE INDEX IF NOT EXISTS idx_gym_settings_owner ON public.gym_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_cardio_subscriptions_owner ON public.cardio_subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_owner ON public.training_plans(owner_id);

-- ─────────────────────────────────────────────────────────────
-- 3. FIX gym_settings UNIQUE CONSTRAINT
--    (was category-only, now needs owner_id + category)
-- ─────────────────────────────────────────────────────────────

-- Drop the old unique constraint on category alone
ALTER TABLE public.gym_settings DROP CONSTRAINT IF EXISTS gym_settings_category_key;

-- Create a new unique constraint scoped to each owner
ALTER TABLE public.gym_settings
  ADD CONSTRAINT gym_settings_owner_category_key UNIQUE (owner_id, category);

-- ─────────────────────────────────────────────────────────────
-- 4. ENSURE is_super_admin() FUNCTION EXISTS
--    (may already exist from SUPABASE_ADMIN_APPROVAL_SCHEMA.sql)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_email TEXT;
BEGIN
  jwt_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  IF jwt_email = '' THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.super_admins sa WHERE lower(sa.email) = jwt_email
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. DROP ALL OLD PERMISSIVE POLICIES & CREATE OWNER-SCOPED ONES
--    We must drop EVERY old policy, otherwise PostgreSQL OR's
--    them together and data leaks across gyms.
-- ─────────────────────────────────────────────────────────────

-- ── MEMBERS ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (members)" ON public.members;
DROP POLICY IF EXISTS "Enable read access for anon (members)" ON public.members;
DROP POLICY IF EXISTS "Allow All Authenticated Members" ON public.members;
DROP POLICY IF EXISTS "Allow Anonymous Read Members" ON public.members;
DROP POLICY IF EXISTS "members_authenticated_all" ON public.members;
DROP POLICY IF EXISTS "Allow all access members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated read members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated insert members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated update members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated delete members" ON public.members;
DROP POLICY IF EXISTS "members_owner_all" ON public.members;

CREATE POLICY "members_owner_all" ON public.members
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ── ATTENDANCE ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (attendance)" ON public.attendance;
DROP POLICY IF EXISTS "Allow All Authenticated Attendance" ON public.attendance;
DROP POLICY IF EXISTS "attendance_authenticated_all" ON public.attendance;
DROP POLICY IF EXISTS "Allow all access attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow authenticated read attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow authenticated insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow authenticated update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow authenticated delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "attendance_owner_all" ON public.attendance;

CREATE POLICY "attendance_owner_all" ON public.attendance
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ── PAYMENTS ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (payments)" ON public.payments;
DROP POLICY IF EXISTS "Allow All Authenticated Payments" ON public.payments;
DROP POLICY IF EXISTS "payments_authenticated_all" ON public.payments;
DROP POLICY IF EXISTS "Allow all access payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all access" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated insert payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated update payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated delete payments" ON public.payments;
DROP POLICY IF EXISTS "payments_owner_all" ON public.payments;

CREATE POLICY "payments_owner_all" ON public.payments
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ── CLASSES ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (classes)" ON public.classes;
DROP POLICY IF EXISTS "Allow All Authenticated Classes" ON public.classes;
DROP POLICY IF EXISTS "classes_authenticated_all" ON public.classes;
DROP POLICY IF EXISTS "Allow all access classes" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated read classes" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated insert classes" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated update classes" ON public.classes;
DROP POLICY IF EXISTS "Allow authenticated delete classes" ON public.classes;
DROP POLICY IF EXISTS "classes_owner_all" ON public.classes;

CREATE POLICY "classes_owner_all" ON public.classes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ── GYM SETTINGS ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (settings)" ON public.gym_settings;
DROP POLICY IF EXISTS "Allow All Authenticated Settings" ON public.gym_settings;
DROP POLICY IF EXISTS "gym_settings_authenticated_all" ON public.gym_settings;
DROP POLICY IF EXISTS "Allow all access gym_settings" ON public.gym_settings;
DROP POLICY IF EXISTS "Allow authenticated read gym_settings" ON public.gym_settings;
DROP POLICY IF EXISTS "Allow authenticated insert gym_settings" ON public.gym_settings;
DROP POLICY IF EXISTS "Allow authenticated update gym_settings" ON public.gym_settings;
DROP POLICY IF EXISTS "Allow authenticated delete gym_settings" ON public.gym_settings;
DROP POLICY IF EXISTS "gym_settings_owner_all" ON public.gym_settings;

CREATE POLICY "gym_settings_owner_all" ON public.gym_settings
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ── CARDIO SUBSCRIPTIONS ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (cardio)" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "Allow All Authenticated Cardio" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "cardio_subscriptions_authenticated_all" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "Allow all access cardio_subscriptions" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated read cardio_subscriptions" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated insert cardio_subscriptions" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated update cardio_subscriptions" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated delete cardio_subscriptions" ON public.cardio_subscriptions;
DROP POLICY IF EXISTS "cardio_subscriptions_owner_all" ON public.cardio_subscriptions;

CREATE POLICY "cardio_subscriptions_owner_all" ON public.cardio_subscriptions
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ── TRAINING PLANS ──
DROP POLICY IF EXISTS "Enable all access for authenticated users (plans)" ON public.training_plans;
DROP POLICY IF EXISTS "Allow All Authenticated Plans" ON public.training_plans;
DROP POLICY IF EXISTS "training_plans_authenticated_all" ON public.training_plans;
DROP POLICY IF EXISTS "Allow all access training_plans" ON public.training_plans;
DROP POLICY IF EXISTS "Allow authenticated read training_plans" ON public.training_plans;
DROP POLICY IF EXISTS "Allow authenticated insert training_plans" ON public.training_plans;
DROP POLICY IF EXISTS "Allow authenticated update training_plans" ON public.training_plans;
DROP POLICY IF EXISTS "Allow authenticated delete training_plans" ON public.training_plans;
DROP POLICY IF EXISTS "training_plans_owner_all" ON public.training_plans;

CREATE POLICY "training_plans_owner_all" ON public.training_plans
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

-- ─────────────────────────────────────────────────────────────
-- 6. NUCLEAR CLEANUP: Drop ANY remaining policies we missed
--    This catches policies created by other SQL scripts.
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  _tbl TEXT;
  _pol RECORD;
BEGIN
  FOREACH _tbl IN ARRAY ARRAY['members','attendance','payments','classes','gym_settings','cardio_subscriptions','training_plans']
  LOOP
    FOR _pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = _tbl
        AND policyname NOT LIKE '%_owner_all'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', _pol.policyname, _tbl);
      RAISE NOTICE 'Dropped leftover policy: % on %', _pol.policyname, _tbl;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 6. (OPTIONAL) BACKFILL EXISTING DATA
-- ─────────────────────────────────────────────────────────────
-- If you already have data in these tables without owner_id,
-- you can assign them to a specific admin user like this:
--
--   UPDATE public.members SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--   UPDATE public.attendance SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--   UPDATE public.payments SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--   UPDATE public.classes SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--   UPDATE public.gym_settings SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--   UPDATE public.cardio_subscriptions SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--   UPDATE public.training_plans SET owner_id = '<admin-user-uuid>' WHERE owner_id IS NULL;
--
-- Replace <admin-user-uuid> with the user_id from admin_accounts.
-- ─────────────────────────────────────────────────────────────

-- Done! Each admin now only sees their own gym data.
-- Super admins (listed in super_admins table) can see all data.
