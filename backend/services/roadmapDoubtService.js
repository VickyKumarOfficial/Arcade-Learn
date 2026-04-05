import { mapOpenRouterError, openRouterProvider } from './openRouterProvider.js';

const OPENROUTER_MODEL = process.env.OPENROUTER_ROADMAP_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
const OPENROUTER_MAX_TOKENS = Number.isFinite(Number(process.env.OPENROUTER_MAX_TOKENS))
  ? Math.max(256, Math.min(4000, Number(process.env.OPENROUTER_MAX_TOKENS)))
  : 900;
const OPENROUTER_TEMPERATURE = Number.isFinite(Number(process.env.OPENROUTER_TEMPERATURE))
  ? Math.max(0, Math.min(1, Number(process.env.OPENROUTER_TEMPERATURE)))
  : 0.35;

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
      const completion = await openRouterProvider.chatCompletion({
        model: OPENROUTER_MODEL,
        maxTokens: OPENROUTER_MAX_TOKENS,
        temperature: OPENROUTER_TEMPERATURE,
        messages: [
          { role: 'system', content: systemPrompt },
          ...normalizedHistory,
          { role: 'user', content: userMessage },
        ],
      });

      return {
        success: true,
        provider: 'openrouter',
        response: completion.text,
      };
    } catch (error) {
      console.error('OpenRouter roadmap doubt provider error:', error);
      const mapped = mapOpenRouterError(error);

      return {
        success: false,
        statusCode: mapped.statusCode,
        error: mapped.error,
      };
    }
  },
};

export default roadmapDoubtService;