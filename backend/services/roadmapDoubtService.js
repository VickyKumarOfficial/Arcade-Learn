import { mapOpenRouterError, openRouterProvider } from './openRouterProvider.js';
import { ragRetrievalService } from './rag/ragRetrievalService.js';

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

function formatRagContext(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return '';
  }

  return chunks
    .map((chunk, index) => {
      const title = chunk.topicTitle || chunk.sectionTitle || chunk.chunkKey;
      const similarity = Number.isFinite(Number(chunk.similarity))
        ? ` Similarity: ${Number(chunk.similarity).toFixed(3)}.`
        : '';

      return `Source ${index + 1}: ${title}
Roadmap: ${chunk.roadmapKey || 'unknown'}
Section: ${chunk.sectionTitle || 'unknown'}
${similarity}
Content:
${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

function buildSystemPrompt({ roadmapTitle, roadmapKey, activeTopic, ragChunks }) {
  const ragContext = formatRagContext(ragChunks);

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
- Keep tone supportive and avoid unnecessary verbosity.
- If ArcadeLearn RAG context is provided, use it as the most trusted source for roadmap-specific answers.
- If ArcadeLearn RAG context is not provided or does not cover the question, answer generally but do not invent ArcadeLearn-specific curriculum details.

ArcadeLearn RAG context:
${ragContext || 'No retrieved RAG context available for this request.'}`;
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
    const ragResult = await ragRetrievalService.retrieveRoadmapContext({
      query: `${activeTopic || ''}\n${activeTopicDescription || ''}\n${safeQuestion}`,
      roadmapKey,
      limit: 5,
      threshold: 0.2,
    });
    const ragChunks = ragResult.success ? ragResult.chunks : [];
    const ragDebug = (() => {
      if (ragResult.success && ragChunks.length > 0) {
        return {
          status: 'success',
          message: `RAG retrieved ${ragChunks.length} roadmap chunk${ragChunks.length === 1 ? '' : 's'} for grounding.`,
          provider: ragResult.debug?.provider || 'google',
          chunkCount: ragChunks.length,
        };
      }

      if (ragResult.success) {
        return {
          status: 'fallback',
          message: 'RAG found no strong matching roadmap chunks; response used the normal roadmap prompt fallback.',
          provider: ragResult.debug?.provider || 'google',
          chunkCount: 0,
        };
      }

      return {
        status: 'failed',
        message: `RAG retrieval failed; response used the normal roadmap prompt fallback. ${ragResult.error || ''}`.trim(),
        provider: 'google',
        chunkCount: 0,
      };
    })();
    const systemPrompt = buildSystemPrompt({ roadmapTitle, roadmapKey, activeTopic, ragChunks });
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
        debug: {
          rag: ragDebug,
          llm: {
            status: 'success',
            provider: 'openrouter',
            message: 'OpenRouter completed the roadmap doubt response.',
          },
        },
      };
    } catch (error) {
      console.error('OpenRouter roadmap doubt provider error:', error);
      const mapped = mapOpenRouterError(error);

      return {
        success: false,
        statusCode: mapped.statusCode,
        error: mapped.error,
        debug: {
          rag: ragDebug,
          llm: {
            status: 'failed',
            provider: 'openrouter',
            message: mapped.error,
          },
        },
      };
    }
  },
};

export default roadmapDoubtService;
