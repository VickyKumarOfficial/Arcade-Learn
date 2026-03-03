import Groq from 'groq-sdk';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string]; // always exactly 4
  correctIndex: number;                       // 0–3
  explanation: string;
}

export interface QuizResult {
  success: true;
  questions: QuizQuestion[];
}

export interface QuizError {
  success: false;
  error: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient(): Groq {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error('VITE_GROQ_API_KEY is not set in environment variables.');
  return new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(topic: string, context: string[]): string {
  return `You are a quiz generator for a developer learning platform.

Topic: "${topic}"

The learner is expected to understand these concepts:
${context.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Generate exactly 4 multiple-choice questions that test fundamental understanding of the topic above.

Rules:
- Questions must be directly related to the listed concepts
- Each question has exactly 4 options (A, B, C, D)
- Only one option is correct
- Provide a short explanation (1-2 sentences) for why the correct answer is right
- Vary difficulty: 1 easy, 2 medium, 1 slightly harder
- Do NOT repeat the same question style
- Do NOT include any markdown, preamble, or extra text — ONLY the raw JSON array

Return ONLY a valid JSON array in this exact shape, nothing else:
[
  {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": 0,
    "explanation": "string"
  }
]`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateQuiz(
  topic: string,
  context: string[],
): Promise<QuizResult | QuizError> {
  try {
    const groq = getClient();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 1.0,
      max_completion_tokens: 1500,
      top_p: 1,
      stream: false,
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON-only quiz generator. You always respond with valid JSON and nothing else. No explanation, no markdown, no preamble.',
        },
        {
          role: 'user',
          content: buildPrompt(topic, context),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response from Groq.');

    // Strip any accidental markdown fences
    const jsonString = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const parsed: unknown = JSON.parse(jsonString);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Unexpected response shape — not an array.');
    }

    // Validate shape of each question
    const questions: QuizQuestion[] = parsed.map((q: unknown, i: number) => {
      const item = q as Record<string, unknown>;
      if (
        typeof item.question !== 'string' ||
        !Array.isArray(item.options) ||
        item.options.length !== 4 ||
        typeof item.correctIndex !== 'number' ||
        typeof item.explanation !== 'string'
      ) {
        throw new Error(`Question ${i + 1} has invalid shape.`);
      }
      return {
        question: item.question,
        options: item.options as [string, string, string, string],
        correctIndex: item.correctIndex,
        explanation: item.explanation,
      };
    });

    return { success: true, questions };
  } catch (err) {
    console.error('[quizService] Error:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Something went wrong while loading your quiz.',
    };
  }
}
