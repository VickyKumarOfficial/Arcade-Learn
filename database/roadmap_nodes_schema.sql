-- Roadmap nodes schema
-- Stores ordered roadmap nodes with sub-node outlines.

BEGIN;

CREATE TABLE IF NOT EXISTS public.roadmap_nodes (
  node_id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  roadmap_title TEXT NOT NULL,
  order_index INTEGER NOT NULL CHECK (order_index > 0),
  node_title TEXT NOT NULL,
  description TEXT,
  estimated_hours INTEGER DEFAULT 0 CHECK (estimated_hours >= 0),
  sub_nodes JSON NOT NULL DEFAULT '[]'::json,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_roadmap_nodes_roadmap_order UNIQUE (roadmap_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_roadmap_order
  ON public.roadmap_nodes (roadmap_id, order_index);

ALTER TABLE public.roadmap_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view roadmap nodes" ON public.roadmap_nodes;
CREATE POLICY "Public can view roadmap nodes" ON public.roadmap_nodes
  FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.set_roadmap_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_roadmap_nodes ON public.roadmap_nodes;
CREATE TRIGGER set_updated_at_roadmap_nodes
  BEFORE UPDATE ON public.roadmap_nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_roadmap_nodes_updated_at();

GRANT SELECT ON public.roadmap_nodes TO anon, authenticated;

COMMIT;

