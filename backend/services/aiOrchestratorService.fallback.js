import { mapOpenRouterError, openRouterProvider } from './openRouterProvider.js';

const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL ||
  process.env.OPENROUTER_MODEL ||
  process.env.OPENROUTER_ROADMAP_MODEL ||
  'nvidia/nemotron-3-super-120b-a12b:free';
const OPENROUTER_CHAT_MAX_TOKENS = Number.isFinite(Number(process.env.OPENROUTER_CHAT_MAX_TOKENS))
  ? Math.max(256, Math.min(4000, Number(process.env.OPENROUTER_CHAT_MAX_TOKENS)))
  : 1400;
const OPENROUTER_CHAT_TEMPERATURE = Number.isFinite(Number(process.env.OPENROUTER_CHAT_TEMPERATURE))
  ? Math.max(0, Math.min(1, Number(process.env.OPENROUTER_CHAT_TEMPERATURE)))
  : 0.55;

const SYSTEM_PROMPT = `You are Nova, a helpful AI coding assistant for ArcadeLearn.
Your role is to help users learn programming concepts, debug issues, and suggest best practices.
Keep answers practical, concise, and structured.
When sharing code, always use fenced code blocks with language tags.`;

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => (
      message &&
      (message.role === 'system' || message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0
    ))
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 6000),
    }));
}

export const aiOrchestratorService = {
  async getChatCompletion({ messages }) {
    const normalizedMessages = normalizeMessages(messages);

    if (normalizedMessages.length === 0) {
      return {
        success: false,
        statusCode: 400,
        error: 'Messages array is required.',
      };
    }

    try {
      const completion = await openRouterProvider.chatCompletion({
        model: OPENROUTER_CHAT_MODEL,
        maxTokens: OPENROUTER_CHAT_MAX_TOKENS,
        temperature: OPENROUTER_CHAT_TEMPERATURE,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...normalizedMessages,
        ],
      });

      return {
        success: true,
        provider: 'openrouter',
        response: completion.text,
      };
    } catch (error) {
      console.error('OpenRouter chat provider error:', error);
      const mapped = mapOpenRouterError(error);
      return {
        success: false,
        error: mapped.error,
        statusCode: mapped.statusCode,
      };
    }
  },
};

export default aiOrchestratorService;
