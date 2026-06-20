const GOOGLE_EMBEDDING_BASE_URL =
  process.env.GOOGLE_EMBEDDING_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_EMBEDDING_MODEL = process.env.GOOGLE_EMBEDDING_MODEL || 'gemini-embedding-2';
const RAG_EMBEDDING_DIMENSIONS = Number.isFinite(Number(process.env.RAG_EMBEDDING_DIMENSIONS))
  ? Math.max(128, Math.min(3072, Number(process.env.RAG_EMBEDDING_DIMENSIONS)))
  : 1536;

function getGoogleEmbeddingApiKey() {
  const apiKey = process.env.GOOGLE_EMBEDDING_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_google_embedding_api_key_here') {
    throw new Error('GOOGLE_EMBEDDING_API_KEY is not configured on the backend.');
  }
  return apiKey;
}

function normalizeModelName(model) {
  return String(model || GOOGLE_EMBEDDING_MODEL).replace(/^models\//, '').trim();
}

function normalizeText(value, label) {
  const text = String(value || '').trim();
  if (!text) {
    throw new Error(`${label} text is required for embedding.`);
  }
  return text;
}

function formatDocumentInput({ title, content }) {
  const safeTitle = String(title || 'none').trim() || 'none';
  return `title: ${safeTitle} | text: ${normalizeText(content, 'Document')}`;
}

function formatQueryInput({ query }) {
  return `task: question answering | query: ${normalizeText(query, 'Query')}`;
}

function extractEmbeddingValues(payload) {
  const values =
    payload?.embedding?.values ||
    payload?.embeddings?.[0]?.values ||
    payload?.embeddings?.[0]?.embedding?.values;

  if (!Array.isArray(values)) {
    return null;
  }

  return values.map((value) => Number(value));
}

function assertEmbedding(values) {
  if (!Array.isArray(values) || values.length !== RAG_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Google embedding dimension mismatch. Expected ${RAG_EMBEDDING_DIMENSIONS}, received ${values?.length || 0}.`,
    );
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error('Google embedding response contained non-numeric values.');
  }
}

async function embedText({ text, model = GOOGLE_EMBEDDING_MODEL }) {
  const normalizedModel = normalizeModelName(model);
  const response = await fetch(`${GOOGLE_EMBEDDING_BASE_URL}/models/${normalizedModel}:embedContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': getGoogleEmbeddingApiKey(),
    },
    body: JSON.stringify({
      model: `models/${normalizedModel}`,
      content: {
        parts: [{ text: normalizeText(text, 'Embedding') }],
      },
      output_dimensionality: RAG_EMBEDDING_DIMENSIONS,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload?.error?.message ||
      payload?.error?.status ||
      `Google embedding request failed with status ${response.status}`;
    throw new Error(String(errorMessage));
  }

  const values = extractEmbeddingValues(payload);
  assertEmbedding(values);

  return {
    values,
    model: normalizedModel,
    dimensions: RAG_EMBEDDING_DIMENSIONS,
    payload,
  };
}

export const googleEmbeddingProvider = {
  dimensions: RAG_EMBEDDING_DIMENSIONS,
  model: GOOGLE_EMBEDDING_MODEL,

  formatDocumentInput,
  formatQueryInput,

  async embedDocument({ title, content }) {
    return embedText({
      text: formatDocumentInput({ title, content }),
    });
  },

  async embedQuery({ query }) {
    return embedText({
      text: formatQueryInput({ query }),
    });
  },
};

export default googleEmbeddingProvider;
