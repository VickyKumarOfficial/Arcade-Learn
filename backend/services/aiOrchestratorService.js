import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.0-flash-lite';

const SYSTEM_PROMPT = `You are Nova, a helpful AI coding assistant for ArcadeLearn.
Your role is to help users learn programming concepts, debug issues, and suggest best practices.
Keep answers practical, concise, and structured.
When sharing code, always use fenced code blocks with language tags.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured on the backend.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildPrompt(messages) {
  let prompt = `${SYSTEM_PROMPT}\n\n`;

  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `System context: ${msg.content}\n\n`;
    } else if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n\n`;
    }
  }

  if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
    prompt += 'Assistant: ';
  }

  return prompt;
}

function mapProviderError(error) {
  const rawMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const lower = rawMessage.toLowerCase();

  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return {
      statusCode: 429,
      error: 'AI quota is temporarily exceeded. Please retry in a minute.'
    };
  }

  if (lower.includes('401') || lower.includes('403') || lower.includes('api key') || lower.includes('unauthorized')) {
    return {
      statusCode: 401,
      error: 'AI service authentication failed. Please check backend API key configuration.'
    };
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('econnrefused') || lower.includes('timeout')) {
    return {
      statusCode: 503,
      error: 'AI provider is temporarily unreachable. Please try again shortly.'
    };
  }

  return {
    statusCode: 500,
    error: 'Failed to generate AI response.'
  };
}

export const aiOrchestratorService = {
  async getChatCompletion({ messages }) {
    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
      const prompt = buildPrompt(messages);

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          topP: 0.9,
        },
      });

      const response = result?.response?.text()?.trim();
      if (!response) {
        return {
          success: false,
          error: 'No response received from AI service.',
        };
      }

      return {
        success: true,
        response,
      };
    } catch (error) {
      const mapped = mapProviderError(error);
      return {
        success: false,
        error: mapped.error,
        statusCode: mapped.statusCode,
      };
    }
  },
};

export default aiOrchestratorService;
