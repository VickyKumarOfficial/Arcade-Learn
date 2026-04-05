const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const DEFAULT_MAX_TOKENS = Number.isFinite(Number(process.env.OPENROUTER_MAX_TOKENS))
  ? Math.max(64, Math.min(8000, Number(process.env.OPENROUTER_MAX_TOKENS)))
  : 900;
const DEFAULT_TEMPERATURE = Number.isFinite(Number(process.env.OPENROUTER_TEMPERATURE))
  ? Math.max(0, Math.min(1, Number(process.env.OPENROUTER_TEMPERATURE)))
  : 0.35;

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not configured on the backend.');
  }
  return apiKey;
}

function buildDefaultHeaders() {
  const headers = {
    Authorization: `Bearer ${getOpenRouterApiKey()}`,
    'Content-Type': 'application/json',
  };

  if (process.env.OPENROUTER_APP_URL) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_APP_URL;
  }

  if (process.env.OPENROUTER_APP_NAME) {
    headers['X-OpenRouter-Title'] = process.env.OPENROUTER_APP_NAME;
  }

  return headers;
}

function extractOpenRouterText(payload) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();
  }

  return '';
}

export function mapOpenRouterError(error) {
  const rawMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const lower = rawMessage.toLowerCase();

  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return {
      statusCode: 429,
      error: 'AI quota is temporarily exceeded. Please retry in a minute.',
    };
  }

  if (lower.includes('401') || lower.includes('403') || lower.includes('api key') || lower.includes('unauthorized')) {
    return {
      statusCode: 401,
      error: 'AI service authentication failed. Please check API key configuration.',
    };
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('econnrefused') || lower.includes('timeout')) {
    return {
      statusCode: 503,
      error: 'AI provider is temporarily unreachable. Please try again shortly.',
    };
  }

  return {
    statusCode: 500,
    error: 'Failed to generate AI response.',
  };
}

export const openRouterProvider = {
  async chatCompletion({ messages, model, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE }) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('OpenRouter messages must be a non-empty array.');
    }

    if (typeof model !== 'string' || model.trim().length === 0) {
      throw new Error('OpenRouter model is required.');
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: buildDefaultHeaders(),
      body: JSON.stringify({
        model: model.trim(),
        temperature,
        max_tokens: maxTokens,
        messages,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message ||
        payload?.error ||
        `OpenRouter request failed with status ${response.status}`;
      throw new Error(String(errorMessage));
    }

    const text = extractOpenRouterText(payload);
    if (!text) {
      throw new Error('No response returned from OpenRouter provider.');
    }

    return {
      text,
      payload,
    };
  },
};

export default openRouterProvider;
