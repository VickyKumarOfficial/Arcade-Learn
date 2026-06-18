-- RAG Pipeline Schema
-- Purpose: Store ArcadeLearn curriculum/book sources and searchable vector chunks.
-- Notes:
-- - Additive only; does not modify existing app/chat/progress tables.
-- - User-private progress/state must not be embedded or stored in these tables.
-- - Retrieval should happen through backend services with LLM fallback if RAG fails.

BEGIN;

-- Supabase Vector / pgvector support for embedding similarity search.
CREATE EXTENSION IF NOT EXISTS vector;

-- Shared updated_at trigger function used across ArcadeLearn migrations.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Parent knowledge sources for RAG.
-- Examples: one roadmap topic, one book chapter, one platform doc page.
CREATE TABLE IF NOT EXISTS public.rag_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  roadmap_key TEXT,
  roadmap_title TEXT,
  source_title TEXT NOT NULL,
  source_path TEXT,
  content_hash TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Searchable chunks generated from rag_sources.
-- Each row is a small retrievable piece of source content.
CREATE TABLE IF NOT EXISTS public.rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.rag_sources(id) ON DELETE CASCADE,
  chunk_key TEXT NOT NULL UNIQUE,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding vector(1536),
  roadmap_key TEXT,
  section_id TEXT,
  section_title TEXT,
  topic_id TEXT,
  topic_title TEXT,
  source_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  token_count INTEGER CHECK (token_count IS NULL OR token_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rag_chunks_source_index UNIQUE (source_id, chunk_index)
);

-- Source lookup indexes.
CREATE INDEX IF NOT EXISTS idx_rag_sources_roadmap_key
  ON public.rag_sources (roadmap_key);

CREATE INDEX IF NOT EXISTS idx_rag_sources_source_type
  ON public.rag_sources (source_type);

CREATE INDEX IF NOT EXISTS idx_rag_sources_is_active
  ON public.rag_sources (is_active);

-- Chunk filtering indexes.
CREATE INDEX IF NOT EXISTS idx_rag_chunks_source_id
  ON public.rag_chunks (source_id);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_roadmap_active
  ON public.rag_chunks (roadmap_key, is_active);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_topic_id
  ON public.rag_chunks (topic_id);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_source_type
  ON public.rag_chunks (source_type);

-- Vector similarity index.
-- Uses cosine distance for semantic retrieval.
CREATE INDEX IF NOT EXISTS idx_rag_chunks_embedding
  ON public.rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100)
  WHERE embedding IS NOT NULL;

-- RLS enabled. The frontend does not need direct access to RAG internals.
ALTER TABLE public.rag_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_chunks ENABLE ROW LEVEL SECURITY;

-- Keep policies idempotent for repeated migration runs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'rag_sources'
      AND policyname = 'Service role can manage RAG sources'
  ) THEN
    CREATE POLICY "Service role can manage RAG sources" ON public.rag_sources
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role')
      WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'rag_chunks'
      AND policyname = 'Service role can manage RAG chunks'
  ) THEN
    CREATE POLICY "Service role can manage RAG chunks" ON public.rag_chunks
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role')
      WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END;
$$;

-- Recreate updated_at triggers safely.
DROP TRIGGER IF EXISTS set_updated_at_rag_sources ON public.rag_sources;
CREATE TRIGGER set_updated_at_rag_sources
  BEFORE UPDATE ON public.rag_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_rag_chunks ON public.rag_chunks;
CREATE TRIGGER set_updated_at_rag_chunks
  BEFORE UPDATE ON public.rag_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Explicit grants. RLS still blocks anon/authenticated because no read policies exist.
REVOKE ALL ON TABLE public.rag_sources FROM anon, authenticated;
REVOKE ALL ON TABLE public.rag_chunks FROM anon, authenticated;
GRANT ALL ON TABLE public.rag_sources TO service_role;
GRANT ALL ON TABLE public.rag_chunks TO service_role;

COMMENT ON TABLE public.rag_sources IS
  'Parent knowledge sources for ArcadeLearn RAG, such as roadmap topics, docs, book chapters, or project guides.';

COMMENT ON TABLE public.rag_chunks IS
  'Searchable vector chunks generated from RAG sources for semantic retrieval.';

COMMENT ON COLUMN public.rag_sources.source_key IS
  'Stable unique key generated by ingestion for dedupe/upsert.';

COMMENT ON COLUMN public.rag_sources.source_type IS
  'Source category such as roadmap_topic, roadmap_resource, project_guide, platform_doc, or book_chapter.';

COMMENT ON COLUMN public.rag_sources.content_hash IS
  'Hash of normalized source content used to detect changed sources.';

COMMENT ON COLUMN public.rag_chunks.chunk_key IS
  'Stable unique key generated by ingestion for this source chunk.';

COMMENT ON COLUMN public.rag_chunks.content IS
  'Plain text chunk passed to retrieval and prompt assembly.';

COMMENT ON COLUMN public.rag_chunks.embedding IS
  '1536-dimension embedding vector used for semantic similarity search.';

COMMENT ON COLUMN public.rag_chunks.content_hash IS
  'Hash of normalized chunk content used to skip unchanged embeddings.';

COMMIT;

-- Verification queries after running this migration in Supabase SQL Editor:
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('rag_sources', 'rag_chunks')
-- ORDER BY table_name;
--
-- SELECT id, source_key, source_type, roadmap_key, is_active
-- FROM public.rag_sources
-- LIMIT 5;
--
-- SELECT id, source_id, chunk_key, roadmap_key, topic_title, is_active
-- FROM public.rag_chunks
-- LIMIT 5;
