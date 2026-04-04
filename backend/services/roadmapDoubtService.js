import Groq from 'groq-sdk';

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_ROADMAP_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
const OPENROUTER_MAX_TOKENS = Number.isFinite(Number(process.env.OPENROUTER_MAX_TOKENS))
  ? Math.max(256, Math.min(4000, Number(process.env.OPENROUTER_MAX_TOKENS)))
  : 900;
const OPENROUTER_TEMPERATURE = Number.isFinite(Number(process.env.OPENROUTER_TEMPERATURE))
  ? Math.max(0, Math.min(1, Number(process.env.OPENROUTER_TEMPERATURE)))
  : 0.35;
const GROQ_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.3-70b-versatile';
const GROQ_MAX_TOKENS = Number.isFinite(Number(process.env.GROQ_FALLBACK_MAX_TOKENS))
  ? Math.max(256, Math.min(2000, Number(process.env.GROQ_FALLBACK_MAX_TOKENS)))
  : 900;

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not configured on the backend.');
  }
  return apiKey;
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not configured on the backend.');
  }
  return new Groq({ apiKey });
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((entry) => (
      entry &&
      (entry.role === 'user' || entry.role === 'assistant') &&
      typeof entry.content === 'string' &&
      entry.content.trim().length > 0
    ))
    .slice(-8)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim().slice(0, 3000),
    }));
}

function buildSystemPrompt({ roadmapTitle, roadmapKey, activeTopic }) {
  return `You are Nova, an on-page roadmap doubt-solving assistant for ArcadeLearn.
Answer with practical, concise guidance and focus on helping the learner move forward.

Roadmap context:
- Roadmap title: ${roadmapTitle || 'General roadmap'}
- Roadmap key: ${roadmapKey || 'general'}
- Current topic: ${activeTopic || 'Not specified'}

Response rules:
- Prefer direct actionable answers.
- If asked for code, provide compact runnable snippets.
- If the doubt is unclear, ask one short clarifying question.
- Keep tone supportive and avoid unnecessary verbosity.`;
}

function buildUserMessage({ question, activeTopic, activeTopicDescription }) {
  const topicLine = activeTopic ? `Current topic: ${activeTopic}` : 'Current topic: not specified';
  const topicDescLine = activeTopicDescription
    ? `Topic detail: ${activeTopicDescription}`
    : 'Topic detail: not specified';

  return `${topicLine}
${topicDescLine}

Learner doubt:
${question}`;
}

function extractOpenRouterText(payload) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part.text === 'string') return part.text;
        return '';
      })
      .join('')
      .trim();

    return joined;
  }

  return '';
}

function mapProviderError(error) {
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

async function callOpenRouter({ systemPrompt, history, userMessage }) {
  const apiKey = getOpenRouterApiKey();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  if (process.env.OPENROUTER_APP_URL) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_APP_URL;
  }

  if (process.env.OPENROUTER_APP_NAME) {
    headers['X-OpenRouter-Title'] = process.env.OPENROUTER_APP_NAME;
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: OPENROUTER_TEMPERATURE,
      max_tokens: OPENROUTER_MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
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

  return text;
}

async function callGroqFallback({ systemPrompt, history, userMessage }) {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: OPENROUTER_TEMPERATURE,
    max_tokens: GROQ_MAX_TOKENS,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  const text = completion?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('No response returned from Groq fallback provider.');
  }

  return text;
}

export const roadmapDoubtService = {
  async solveDoubt({
    roadmapKey,
    roadmapTitle,
    activeTopic,
    activeTopicDescription,
    question,
    history,
  }) {
    const normalizedHistory = normalizeHistory(history);
    const safeQuestion = String(question || '').trim().slice(0, 3000);
    const systemPrompt = buildSystemPrompt({ roadmapTitle, roadmapKey, activeTopic });
    const userMessage = buildUserMessage({
      question: safeQuestion,
      activeTopic,
      activeTopicDescription,
    });

    try {
      const response = await callOpenRouter({
        systemPrompt,
        history: normalizedHistory,
        userMessage,
      });

      return {
        success: true,
        provider: 'openrouter',
        response,
      };
    } catch (openRouterError) {
      console.error('OpenRouter roadmap doubt provider error:', openRouterError);

      try {
        const response = await callGroqFallback({
          systemPrompt,
          history: normalizedHistory,
          userMessage,
        });

        return {
          success: true,
          provider: 'groq',
          response,
        };
      } catch (groqError) {
        console.error('Groq roadmap doubt fallback error:', groqError);
        const mapped = mapProviderError(groqError);

        return {
          success: false,
          statusCode: mapped.statusCode,
          error: mapped.error,
        };
      }
    }
  },
};

export default roadmapDoubtService;