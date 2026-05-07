-- Roadmaps catalog schema
-- Stores roadmap metadata for recommendations and UI listings.

BEGIN;

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT[] DEFAULT '{}',
  estimated_hours INTEGER DEFAULT 0,
  cover_img_url TEXT,
  version TEXT,
  total_nodes INTEGER DEFAULT 0,
  total_sub_nodes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_category
  ON public.roadmaps USING GIN (category);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view roadmaps" ON public.roadmaps;
CREATE POLICY "Public can view roadmaps" ON public.roadmaps
  FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.set_roadmaps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_roadmaps ON public.roadmaps;
CREATE TRIGGER set_updated_at_roadmaps
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.set_roadmaps_updated_at();

GRANT SELECT ON public.roadmaps TO anon, authenticated;

INSERT INTO public.roadmaps (
  id,
  slug,
  title,
  description,
  category,
  estimated_hours,
  cover_img_url,
  version,
  total_nodes,
  total_sub_nodes
) VALUES
  (
    'frontend-react',
    'frontend-react',
    'Frontend Development with React',
    'Master modern frontend development with React, TypeScript, and related technologies',
    ARRAY['Frontend'],
    255,
    NULL,
    NULL,
    15,
    52
  ),
  (
    'backend-nodejs',
    'backend-nodejs',
    'Backend Development with Node.js',
    'Build scalable backend services with Node.js, Express, and databases',
    ARRAY['Backend'],
    130,
    NULL,
    NULL,
    15,
    44
  ),
  (
    'fullstack-mern',
    'fullstack-mern',
    'Full Stack MERN Development',
    'Complete web application development with MongoDB, Express, React, and Node.js',
    ARRAY['Full Stack'],
    65,
    NULL,
    NULL,
    15,
    45
  )
ON CONFLICT (id)
DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_hours = EXCLUDED.estimated_hours,
  cover_img_url = EXCLUDED.cover_img_url,
  version = EXCLUDED.version,
  total_nodes = EXCLUDED.total_nodes,
  total_sub_nodes = EXCLUDED.total_sub_nodes;

COMMIT;
