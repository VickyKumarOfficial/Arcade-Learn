-- User details schema
-- Stores extended profile details for each user.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_details (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  phone_no TEXT,
  location TEXT,
  role TEXT,
  bio TEXT,
  highest_edu TEXT,
  education_institution TEXT,
  current_company TEXT,
  social_profiles JSONB,
  skills JSONB,
  interests TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  learning_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user details" ON public.user_details;
CREATE POLICY "Users can view own user details" ON public.user_details
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user details" ON public.user_details;
CREATE POLICY "Users can update own user details" ON public.user_details
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user details" ON public.user_details;
CREATE POLICY "Users can insert own user details" ON public.user_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_user_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_details ON public.user_details;
CREATE TRIGGER set_updated_at_user_details
  BEFORE UPDATE ON public.user_details
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_details_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.user_details TO authenticated;

COMMIT;
