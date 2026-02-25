-- =============================================================
-- AUTH SIGNUP REPAIR (Supabase)
-- =============================================================
-- Use this when signup returns:
-- "Database error saving new user" (500 unexpected_failure)
--
-- Run section-by-section in Supabase SQL editor.

-- -------------------------------------------------------------
-- 1) Inspect custom triggers on auth.users
-- -------------------------------------------------------------
SELECT
  t.tgname AS trigger_name,
  p.proname AS function_name,
  n.nspname AS function_schema,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE t.tgrelid = 'auth.users'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- -------------------------------------------------------------
-- 2) Inspect likely trigger functions source (if any exist)
-- -------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN (
  'handle_new_user',
  'on_auth_user_created',
  'create_profile_for_new_user',
  'insert_user_profile'
)
ORDER BY n.nspname, p.proname;

-- -------------------------------------------------------------
-- 3) TEMP FIX: drop custom auth.users triggers
--    (Safe and reversible by recreating them later)
-- -------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    WHERE t.tgrelid = 'auth.users'::regclass
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users;', r.tgname);
    RAISE NOTICE 'Dropped trigger: %', r.tgname;
  END LOOP;
END $$;

-- -------------------------------------------------------------
-- 4) Verify no custom triggers remain
-- -------------------------------------------------------------
SELECT
  t.tgname AS remaining_trigger,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
WHERE t.tgrelid = 'auth.users'::regclass
  AND NOT t.tgisinternal;

-- -------------------------------------------------------------
-- 5) Optional: ensure admin_accounts table exists (for your app)
-- -------------------------------------------------------------
-- Run ADMIN_ACCOUNTS_SCHEMA.sql after this if not already done.

-- -------------------------------------------------------------
-- 6) IMPORTANT MANUAL CHECKS IN SUPABASE DASHBOARD
-- -------------------------------------------------------------
-- Auth -> Providers -> Email: enabled
-- Auth -> Hooks: disable any custom DB/Webhook hooks temporarily
--              if signup still fails after trigger cleanup
