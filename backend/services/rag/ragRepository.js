import supabaseAdmin from '../../lib/supabase.js';

function assertString(value, label) {
  const text = String(value || '').trim();
  if (!text) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

function normalizeNullableString(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

function normalizeMetadata(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeEmbedding(value) {
  if (value == null) {
    return null;
  }

  if (!Array.isArray(value) || value.some((item) => !Number.isFinite(Number(item)))) {
    throw new Error('Chunk embedding must be an array of finite numbers.');
  }

  return value.map((item) => Number(item));
}

function toSourceRow(source) {
  return {
    source_key: assertString(source.sourceKey, 'sourceKey'),
    source_type: assertString(source.sourceType, 'sourceType'),
    roadmap_key: normalizeNullableString(source.roadmapKey),
    roadmap_title: normalizeNullableString(source.roadmapTitle),
    source_title: assertString(source.sourceTitle, 'sourceTitle'),
    source_path: normalizeNullableString(source.sourcePath),
    content_hash: assertString(source.contentHash, 'contentHash'),
    metadata: normalizeMetadata(source.metadata),
    is_active: source.isActive !== false,
    updated_at: new Date().toISOString(),
  };
}

function toChunkRow(chunk, sourceId) {
  return {
    source_id: assertString(sourceId, 'sourceId'),
    chunk_key: assertString(chunk.chunkKey, 'chunkKey'),
    chunk_index: Number.isFinite(Number(chunk.chunkIndex)) ? Number(chunk.chunkIndex) : 0,
    content: assertString(chunk.content, 'content'),
    content_hash: assertString(chunk.contentHash, 'contentHash'),
    embedding: normalizeEmbedding(chunk.embedding),
    roadmap_key: normalizeNullableString(chunk.roadmapKey),
    section_id: normalizeNullableString(chunk.sectionId),
    section_title: normalizeNullableString(chunk.sectionTitle),
    topic_id: normalizeNullableString(chunk.topicId),
    topic_title: normalizeNullableString(chunk.topicTitle),
    source_type: assertString(chunk.sourceType, 'sourceType'),
    metadata: normalizeMetadata(chunk.metadata),
    token_count: Number.isFinite(Number(chunk.tokenCount)) ? Math.max(0, Math.round(Number(chunk.tokenCount))) : null,
    is_active: chunk.isActive !== false,
    updated_at: new Date().toISOString(),
  };
}

export class RagRepository {
  constructor(supabase = supabaseAdmin) {
    this.supabase = supabase;
  }

  async getSourcesByKeys(sourceKeys) {
    const keys = Array.isArray(sourceKeys)
      ? sourceKeys.map((key) => String(key || '').trim()).filter(Boolean)
      : [];

    if (keys.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from('rag_sources')
      .select('id, source_key, content_hash, is_active')
      .in('source_key', keys);

    if (error) {
      throw new Error(`Failed to fetch RAG sources: ${error.message}`);
    }

    return new Map((data || []).map((row) => [row.source_key, row]));
  }

  async getChunksByKeys(chunkKeys) {
    const keys = Array.isArray(chunkKeys)
      ? chunkKeys.map((key) => String(key || '').trim()).filter(Boolean)
      : [];

    if (keys.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from('rag_chunks')
      .select('id, chunk_key, content_hash, is_active')
      .in('chunk_key', keys);

    if (error) {
      throw new Error(`Failed to fetch RAG chunks: ${error.message}`);
    }

    return new Map((data || []).map((row) => [row.chunk_key, row]));
  }

  async upsertSources(sources) {
    const rows = Array.isArray(sources) ? sources.map(toSourceRow) : [];
    if (rows.length === 0) {
      return { upserted: 0, sourcesByKey: new Map() };
    }

    const { data, error } = await this.supabase
      .from('rag_sources')
      .upsert(rows, { onConflict: 'source_key' })
      .select('id, source_key, content_hash, is_active');

    if (error) {
      throw new Error(`Failed to upsert RAG sources: ${error.message}`);
    }

    return {
      upserted: rows.length,
      sourcesByKey: new Map((data || []).map((row) => [row.source_key, row])),
    };
  }

  async upsertChunks(chunks, sourcesByKey) {
    const rows = (Array.isArray(chunks) ? chunks : []).map((chunk) => {
      const source = sourcesByKey?.get(chunk.sourceKey);
      if (!source?.id) {
        throw new Error(`Missing source id for chunk sourceKey: ${chunk.sourceKey}`);
      }

      return toChunkRow(chunk, source.id);
    });

    if (rows.length === 0) {
      return { upserted: 0 };
    }

    const { error } = await this.supabase
      .from('rag_chunks')
      .upsert(rows, { onConflict: 'chunk_key' });

    if (error) {
      throw new Error(`Failed to upsert RAG chunks: ${error.message}`);
    }

    return { upserted: rows.length };
  }
}

export const ragRepository = new RagRepository();
export default ragRepository;
