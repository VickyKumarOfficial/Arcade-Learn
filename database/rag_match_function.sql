-- RAG Vector Match Function
-- Purpose: Search stored RAG chunk embeddings by cosine similarity.
-- Run after database/rag_pipeline_schema.sql.

BEGIN;

CREATE OR REPLACE FUNCTION public.match_rag_chunks(
  query_embedding vector(1536),
  filter_roadmap_key TEXT DEFAULT NULL,
  match_count INTEGER DEFAULT 5,
  match_threshold DOUBLE PRECISION DEFAULT 0.2
)
RETURNS TABLE (
  id UUID,
  source_id UUID,
  chunk_key TEXT,
  content TEXT,
  roadmap_key TEXT,
  section_id TEXT,
  section_title TEXT,
  topic_id TEXT,
  topic_title TEXT,
  source_type TEXT,
  metadata JSONB,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.source_id,
    rc.chunk_key,
    rc.content,
    rc.roadmap_key,
    rc.section_id,
    rc.section_title,
    rc.topic_id,
    rc.topic_title,
    rc.source_type,
    rc.metadata,
    (1 - (rc.embedding <=> query_embedding))::DOUBLE PRECISION AS similarity
  FROM public.rag_chunks rc
  WHERE rc.is_active = true
    AND rc.embedding IS NOT NULL
    AND (filter_roadmap_key IS NULL OR rc.roadmap_key = filter_roadmap_key)
    AND (1 - (rc.embedding <=> query_embedding)) >= match_threshold
  ORDER BY rc.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 20));
END;
$$;

COMMENT ON FUNCTION public.match_rag_chunks(vector, TEXT, INTEGER, DOUBLE PRECISION) IS
  'Returns active RAG chunks nearest to a query embedding, optionally filtered by roadmap key.';

REVOKE ALL ON FUNCTION public.match_rag_chunks(vector, TEXT, INTEGER, DOUBLE PRECISION) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_rag_chunks(vector, TEXT, INTEGER, DOUBLE PRECISION) TO service_role;

COMMIT;

-- Verification after running in Supabase SQL Editor:
-- SELECT proname
-- FROM pg_proc
-- WHERE proname = 'match_rag_chunks';
