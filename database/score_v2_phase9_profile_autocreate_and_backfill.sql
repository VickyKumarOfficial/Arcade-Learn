-- =====================================================
-- Score V2 Phase 9 - Profile Auto-Create + Backfill
-- Purpose: Ensure every auth user has a public.profiles row.
-- Safe: Idempotent trigger + backfill missing profiles.
-- =====================================================

BEGIN;

-- 1) Ensure profiles table has RLS enabled.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Ensure baseline policies exist (idempotent checks by policy name).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END;
$$;

-- 3) Create/replace trigger function to auto-create profile on auth signup.
CREATE OR REPLACE FUNCTION public.handle_auth_user_profile_bootstrap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_first_name TEXT;
  derived_last_name TEXT;
  derived_phone TEXT;
  derived_avatar_url TEXT;
BEGIN
  derived_first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );

  derived_last_name := NULLIF(COALESCE(NEW.raw_user_meta_data->>'last_name', ''), '');
  derived_phone := NULLIF(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '');
  derived_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    derived_first_name,
    derived_last_name,
    derived_phone,
    derived_avatar_url,
    NOW(),
    NOW()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile_bootstrap ON auth.users;
CREATE TRIGGER on_auth_user_created_profile_bootstrap
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_profile_bootstrap();

-- 4) Backfill any existing auth users missing in profiles.
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  avatar_url,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(
    u.raw_user_meta_data->>'first_name',
    split_part(COALESCE(u.email, ''), '@', 1),
    'User'
  ) AS first_name,
  NULLIF(COALESCE(u.raw_user_meta_data->>'last_name', ''), '') AS last_name,
  NULLIF(COALESCE(u.raw_user_meta_data->>'phone', ''), '') AS phone,
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') AS avatar_url,
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- =====================================================
-- Post-check
-- =====================================================

-- Should be 0
SELECT COUNT(*) AS missing_profile_rows
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Latest users with profile snapshot
SELECT p.id, p.email, p.first_name, p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;
