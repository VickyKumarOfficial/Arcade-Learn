-- Adaptive roadmap progress persistence updates
-- Adds fields required to track dynamically added recommended nodes
-- and per-row current skill level snapshots.

ALTER TABLE IF EXISTS public.user_roadmap_progress
  ADD COLUMN IF NOT EXISTS extra_node_added TEXT;

ALTER TABLE IF EXISTS public.user_roadmap_progress
  ADD COLUMN IF NOT EXISTS current_level TEXT;

COMMENT ON COLUMN public.user_roadmap_progress.extra_node_added IS
  'Adaptive recommendation type for this component row: core/revision/practice.';

COMMENT ON COLUMN public.user_roadmap_progress.current_level IS
  'Effective adaptive skill level at the time this row was last synced.';
