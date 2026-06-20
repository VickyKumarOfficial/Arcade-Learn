import { googleEmbeddingProvider } from './googleEmbeddingProvider.js';
import supabaseAdmin from '../../lib/supabase.js';

function normalizeLimit(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 5;
  }
  return Math.max(1, Math.min(20, Math.round(numeric)));
}

function normalizeThreshold(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0.2;
  }
  return Math.max(0, Math.min(1, numeric));
}

function normalizeRoadmapKey(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

function mapChunk(row) {
  return {
    id: row.id,
    sourceId: row.source_id,
    chunkKey: row.chunk_key,
    content: row.content,
    roadmapKey: row.roadmap_key,
    sectionId: row.section_id,
    sectionTitle: row.section_title,
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    sourceType: row.source_type,
    metadata: row.metadata || {},
    similarity: Number(row.similarity || 0),
  };
}

export const ragRetrievalService = {
  async retrieveRoadmapContext({
    query,
    roadmapKey,
    limit = 5,
    threshold = 0.2,
  }) {
    const safeQuery = String(query || '').trim();
    if (!safeQuery) {
      return {
        success: false,
        status: 'skipped',
        error: 'Query is required for RAG retrieval.',
        chunks: [],
      };
    }

    try {
      const embedding = await googleEmbeddingProvider.embedQuery({ query: safeQuery });
      const matchCount = normalizeLimit(limit);
      const matchThreshold = normalizeThreshold(threshold);

      const { data, error } = await supabaseAdmin.rpc('match_rag_chunks', {
        query_embedding: embedding.values,
        filter_roadmap_key: normalizeRoadmapKey(roadmapKey),
        match_count: matchCount,
        match_threshold: matchThreshold,
      });

      if (error) {
        throw new Error(error.message);
      }

      const chunks = (data || []).map(mapChunk);

      return {
        success: true,
        status: chunks.length > 0 ? 'success' : 'empty',
        chunks,
        debug: {
          provider: 'google',
          embeddingModel: embedding.model,
          dimensions: embedding.dimensions,
          chunkCount: chunks.length,
          threshold: matchThreshold,
          roadmapKey: normalizeRoadmapKey(roadmapKey),
        },
      };
    } catch (error) {
      console.error('RAG retrieval failed:', error);
      return {
        success: false,
        status: 'failed',
        error: error.message || 'RAG retrieval failed.',
        chunks: [],
      };
    }
  },
};

export default ragRetrievalService;
