-- User roadmap credits summary
-- Stores per-roadmap credit totals per user.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_roadmap_credit_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  earned_credits INTEGER NOT NULL DEFAULT 0 CHECK (earned_credits >= 0),
  total_credits INTEGER NOT NULL DEFAULT 0 CHECK (total_credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_roadmap_credit_summary UNIQUE (user_id, roadmap_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roadmap_credit_user
  ON public.user_roadmap_credit_summary(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roadmap_credit_roadmap
  ON public.user_roadmap_credit_summary(roadmap_id);

ALTER TABLE public.user_roadmap_credit_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roadmap credits" ON public.user_roadmap_credit_summary;
CREATE POLICY "Users can view own roadmap credits" ON public.user_roadmap_credit_summary
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own roadmap credits" ON public.user_roadmap_credit_summary;
CREATE POLICY "Users can update own roadmap credits" ON public.user_roadmap_credit_summary
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own roadmap credits" ON public.user_roadmap_credit_summary;
CREATE POLICY "Users can insert own roadmap credits" ON public.user_roadmap_credit_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at_user_roadmap_credit_summary ON public.user_roadmap_credit_summary;
CREATE TRIGGER set_updated_at_user_roadmap_credit_summary
  BEFORE UPDATE ON public.user_roadmap_credit_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.user_roadmap_credit_summary TO authenticated;

COMMIT;
