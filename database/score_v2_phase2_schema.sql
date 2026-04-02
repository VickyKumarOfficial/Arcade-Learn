-- =====================================================
-- Score V2 Phase 2 Database Foundation (Lean Consolidation)
-- Purpose: Keep user_game_data as primary global score summary,
-- add only essential new score tables for event-ledger and roadmap summary.
-- =====================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1) Extend existing global summary table: user_game_data
-- =====================================================

ALTER TABLE public.user_game_data
  ADD COLUMN IF NOT EXISTS total_score NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_stars INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_submodule_points NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_module_bonus_points NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scoring_version TEXT NOT NULL DEFAULT 'v1';

CREATE INDEX IF NOT EXISTS idx_user_game_data_total_score_rank
  ON public.user_game_data(total_score DESC, total_stars DESC, updated_at ASC);

-- =====================================================
-- 2) Score attempt ledger with idempotency
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  node_depth TEXT NOT NULL CHECK (node_depth IN ('module', 'submodule')),
  quiz_score INTEGER NOT NULL CHECK (quiz_score BETWEEN 0 AND 100),
  awarded_submodule_points NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (awarded_submodule_points >= 0),
  awarded_module_bonus_points NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (awarded_module_bonus_points >= 0),
  total_awarded_points NUMERIC(12,2) GENERATED ALWAYS AS (awarded_submodule_points + awarded_module_bonus_points) STORED,
  scoring_version TEXT NOT NULL DEFAULT 'v1',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_attempt UNIQUE (user_id, attempt_id)
);

CREATE INDEX IF NOT EXISTS idx_user_score_events_user_submitted
  ON public.user_score_events(user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_score_events_roadmap_module_node
  ON public.user_score_events(roadmap_id, module_id, node_id);

-- =====================================================
-- 3) One-time module bonus awards (dedupe by unique)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_score_module_bonus_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  awarded_points NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (awarded_points >= 0),
  scoring_version TEXT NOT NULL DEFAULT 'v1',
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_module_bonus UNIQUE (user_id, roadmap_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_user_score_module_bonus_user
  ON public.user_score_module_bonus_awards(user_id);

-- =====================================================
-- 4) Per-roadmap summary (future roadmap ranking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_roadmap_score_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  total_score NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_score >= 0),
  total_stars INTEGER NOT NULL DEFAULT 0 CHECK (total_stars >= 0),
  total_submodule_points NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_submodule_points >= 0),
  total_module_bonus_points NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_module_bonus_points >= 0),
  scoring_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_roadmap_summary UNIQUE (user_id, roadmap_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roadmap_score_summary_roadmap_rank
  ON public.user_roadmap_score_summary(roadmap_id, total_score DESC, total_stars DESC, updated_at ASC);

CREATE INDEX IF NOT EXISTS idx_user_roadmap_score_summary_user
  ON public.user_roadmap_score_summary(user_id);

-- =====================================================
-- 5) Scoring config (global row now, roadmap overrides optional later)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.score_v2_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'roadmap')),
  roadmap_id TEXT,
  pass_score_min INTEGER NOT NULL DEFAULT 80 CHECK (pass_score_min BETWEEN 0 AND 100),
  submodule_max_points NUMERIC(12,2) NOT NULL DEFAULT 2 CHECK (submodule_max_points >= 0),
  module_completion_bonus NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (module_completion_bonus >= 0),
  scoring_version TEXT NOT NULL DEFAULT 'v1',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_scope_roadmap_pair CHECK (
    (scope = 'global' AND roadmap_id IS NULL) OR
    (scope = 'roadmap' AND roadmap_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_score_v2_config_scope
  ON public.score_v2_config(scope, is_active);

INSERT INTO public.score_v2_config (scope, roadmap_id, pass_score_min, submodule_max_points, module_completion_bonus, scoring_version, is_active)
SELECT 'global', NULL, 80, 2, 1, 'v1', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.score_v2_config WHERE scope = 'global'
);

-- =====================================================
-- 6) RLS and policies for new tables
-- =====================================================

ALTER TABLE public.user_score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_score_module_bonus_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roadmap_score_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_v2_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_score_events' AND policyname = 'Users can view own score events'
  ) THEN
    CREATE POLICY "Users can view own score events" ON public.user_score_events
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_score_events' AND policyname = 'Service role can manage score events'
  ) THEN
    CREATE POLICY "Service role can manage score events" ON public.user_score_events
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_score_module_bonus_awards' AND policyname = 'Users can view own module bonus awards'
  ) THEN
    CREATE POLICY "Users can view own module bonus awards" ON public.user_score_module_bonus_awards
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_score_module_bonus_awards' AND policyname = 'Service role can manage module bonus awards'
  ) THEN
    CREATE POLICY "Service role can manage module bonus awards" ON public.user_score_module_bonus_awards
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roadmap_score_summary' AND policyname = 'Users can view own roadmap score summary'
  ) THEN
    CREATE POLICY "Users can view own roadmap score summary" ON public.user_roadmap_score_summary
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roadmap_score_summary' AND policyname = 'Public can view roadmap leaderboard summary'
  ) THEN
    CREATE POLICY "Public can view roadmap leaderboard summary" ON public.user_roadmap_score_summary
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roadmap_score_summary' AND policyname = 'Service role can manage roadmap score summary'
  ) THEN
    CREATE POLICY "Service role can manage roadmap score summary" ON public.user_roadmap_score_summary
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'score_v2_config' AND policyname = 'Public can view active score config'
  ) THEN
    CREATE POLICY "Public can view active score config" ON public.score_v2_config
      FOR SELECT USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'score_v2_config' AND policyname = 'Service role can manage score config'
  ) THEN
    CREATE POLICY "Service role can manage score config" ON public.score_v2_config
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END;
$$;

-- =====================================================
-- 7) Updated_at triggers for new tables
-- =====================================================

DROP TRIGGER IF EXISTS set_updated_at_user_score_events ON public.user_score_events;
CREATE TRIGGER set_updated_at_user_score_events
  BEFORE UPDATE ON public.user_score_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_roadmap_score_summary ON public.user_roadmap_score_summary;
CREATE TRIGGER set_updated_at_user_roadmap_score_summary
  BEFORE UPDATE ON public.user_roadmap_score_summary
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_score_v2_config ON public.score_v2_config;
CREATE TRIGGER set_updated_at_score_v2_config
  BEFORE UPDATE ON public.score_v2_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 8) Leaderboard views
-- =====================================================

CREATE OR REPLACE VIEW public.v_score_v2_global_leaderboard AS
SELECT
  ugd.user_id,
  ugd.total_score,
  ugd.total_stars,
  ugd.updated_at,
  p.first_name,
  p.last_name,
  p.avatar_url,
  ROW_NUMBER() OVER (
    ORDER BY ugd.total_score DESC, ugd.total_stars DESC, ugd.updated_at ASC
  ) AS rank
FROM public.user_game_data ugd
JOIN public.profiles p ON p.id = ugd.user_id
WHERE ugd.total_score > 0;

CREATE OR REPLACE VIEW public.v_score_v2_roadmap_leaderboard AS
SELECT
  urss.roadmap_id,
  urss.user_id,
  urss.total_score,
  urss.total_stars,
  urss.updated_at,
  p.first_name,
  p.last_name,
  p.avatar_url,
  ROW_NUMBER() OVER (
    PARTITION BY urss.roadmap_id
    ORDER BY urss.total_score DESC, urss.total_stars DESC, urss.updated_at ASC
  ) AS rank
FROM public.user_roadmap_score_summary urss
JOIN public.profiles p ON p.id = urss.user_id
WHERE urss.total_score > 0;

-- Refresh PostgREST schema cache so new columns/tables are visible to Supabase API immediately.
NOTIFY pgrst, 'reload schema';

COMMIT;

-- =====================================================
-- Verification snippets (run manually after migration)
-- =====================================================

-- SELECT to_regclass('public.user_score_events');
-- SELECT to_regclass('public.user_score_module_bonus_awards');
-- SELECT to_regclass('public.user_roadmap_score_summary');
-- SELECT to_regclass('public.score_v2_config');
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_game_data' AND column_name IN ('total_score','total_stars','total_submodule_points','total_module_bonus_points','scoring_version');
-- SELECT * FROM public.score_v2_config;
-- SELECT * FROM public.v_score_v2_global_leaderboard LIMIT 5;
-- SELECT * FROM public.v_score_v2_roadmap_leaderboard LIMIT 5;
