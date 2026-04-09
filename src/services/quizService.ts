// ─── Types ────────────────────────────────────────────────────────────────────

import { BACKEND_URL } from '@/config/env';

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

const DEFAULT_CONTEXT_POINTS = [
  'Core concepts and terminology',
  'Practical implementation patterns',
  'Common mistakes and debugging',
  'Real-world use cases',
  'Best practices and performance considerations',
];

const FALLBACK_STEMS: Array<(topic: string, focus: string) => string> = [
  (topic, focus) => `For ${topic}, which statement best matches: "${focus}"?`,
  (topic) => `Which concept is most important when working with ${topic}?`,
  (topic) => `In practical ${topic} development, which choice is correct?`,
  (topic) => `Which point should be prioritized while learning ${topic}?`,
  (topic) => `Which idea directly applies to ${topic}?`,
  (topic) => `When revising ${topic}, which option reflects a strong understanding?`,
];

function compactText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeKey(value: string): string {
  return compactText(value).toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const trimmed = compactText(value);
    if (!trimmed) return;

    const key = normalizeKey(trimmed);
    if (seen.has(key)) return;

    seen.add(key);
    output.push(trimmed);
  });

  return output;
}

function pickUniqueRandom(values: string[], count: number): string[] {
  const pool = [...values];
  const picked: string[] = [];

  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}

function isSameOption(left: string, right: string): boolean {
  return normalizeKey(left) === normalizeKey(right);
}

function getFocusSnippet(value: string): string {
  const compact = compactText(value).replace(/[.?!]\s*$/, '');
  if (compact.length <= 72) return compact;
  return `${compact.slice(0, 69)}...`;
}

function sanitizeTopic(topic: string): string {
  const trimmed = topic.trim();
  return trimmed.length > 0 ? trimmed : 'this topic';
}

function normalizeContext(context: string[]): string[] {
  const cleaned = context
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);

  const unique = uniqueStrings(cleaned);
  return unique.length > 0 ? unique : DEFAULT_CONTEXT_POINTS;
}

function fallbackDistractors(topic: string): string[] {
  return [
    `${topic} can be mastered by memorizing terms only, without practice`,
    `Ignore debugging and edge cases while learning ${topic}`,
    `Use one fixed approach for every ${topic} problem without adapting`,
    `Skip fundamentals and rely only on copy-paste solutions for ${topic}`,
    `${topic} does not need real-world application or review`,
  ];
}

function shuffleOptions(question: QuizQuestion): QuizQuestion {
  const indexedOptions = question.options.map((option, index) => ({ option, index }));

  for (let i = indexedOptions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indexedOptions[i];
    indexedOptions[i] = indexedOptions[j];
    indexedOptions[j] = tmp;
  }

  const shuffledOptions = indexedOptions.map((item) => item.option) as [string, string, string, string];
  const shuffledCorrectIndex = Math.max(
    0,
    indexedOptions.findIndex((item) => item.index === question.correctIndex),
  );

  return {
    ...question,
    options: shuffledOptions,
    correctIndex: shuffledCorrectIndex,
  };
}

function normalizeQuestions(
  questions: QuizQuestion[],
  expectedCount: number,
  topic: string,
  context: string[],
): QuizQuestion[] {
  const safeTopic = sanitizeTopic(topic);
  const safeContext = normalizeContext(context);
  const seenQuestions = new Set<string>();
  const normalized: QuizQuestion[] = [];

  for (const question of questions) {
    const questionText = compactText(question?.question ?? '');
    if (!questionText) continue;

    const questionKey = normalizeKey(questionText);
    if (seenQuestions.has(questionKey)) continue;

    const sourceOptions = Array.isArray(question?.options) ? question.options : [];
    const rawOptions = uniqueStrings(sourceOptions.map((option) => String(option)));

    const safeCorrectIndex = Number.isInteger(question?.correctIndex)
      ? Math.max(0, Math.min(3, question.correctIndex))
      : 0;

    const sourceCorrectOption = compactText(String(sourceOptions[safeCorrectIndex] ?? ''));
    const correctOption = sourceCorrectOption || rawOptions[0] || safeContext[0] || DEFAULT_CONTEXT_POINTS[0];

    const distractorPool = uniqueStrings([
      ...rawOptions.filter((option) => !isSameOption(option, correctOption)),
      ...safeContext.filter((option) => !isSameOption(option, correctOption)),
      ...fallbackDistractors(safeTopic).filter((option) => !isSameOption(option, correctOption)),
      ...DEFAULT_CONTEXT_POINTS.filter((option) => !isSameOption(option, correctOption)),
    ]);

    const distractors = pickUniqueRandom(distractorPool, 3);
    if (distractors.length < 3) continue;

    const sanitizedQuestion: QuizQuestion = {
      question: questionText,
      options: [correctOption, ...distractors] as [string, string, string, string],
      correctIndex: 0,
      explanation: compactText(question?.explanation ?? '')
        || `${correctOption} is the most accurate answer for ${safeTopic}.`,
    };

    normalized.push(shuffleOptions(sanitizedQuestion));
    seenQuestions.add(questionKey);

    if (normalized.length >= expectedCount) break;
  }

  return normalized.slice(0, expectedCount);
}

function buildFallbackQuiz(topic: string, context: string[], count = 4): QuizQuestion[] {
  const safeTopic = sanitizeTopic(topic);
  const safeContext = normalizeContext(context);
  const totalQuestions = Math.max(2, Math.min(15, count));
  const staticDistractors = uniqueStrings(fallbackDistractors(safeTopic));

  return Array.from({ length: totalQuestions }, (_, index) => {
    const correctPoint = safeContext[index % safeContext.length];
    const focusSnippet = getFocusSnippet(correctPoint);
    const stem = FALLBACK_STEMS[index % FALLBACK_STEMS.length];

    const contextualDistractors = safeContext.filter(
      (candidate) => !isSameOption(candidate, correctPoint),
    );

    const distractorPool = uniqueStrings([
      ...contextualDistractors,
      ...staticDistractors,
      ...DEFAULT_CONTEXT_POINTS,
    ]).filter((candidate) => !isSameOption(candidate, correctPoint));

    const selectedDistractors = pickUniqueRandom(distractorPool, 3);
    if (selectedDistractors.length < 3) {
      selectedDistractors.push(
        ...pickUniqueRandom(
          uniqueStrings([...DEFAULT_CONTEXT_POINTS, ...staticDistractors]).filter(
            (candidate) => !isSameOption(candidate, correctPoint),
          ),
          3 - selectedDistractors.length,
        ),
      );
    }

    return {
      question: stem(safeTopic, focusSnippet),
      options: [correctPoint, ...selectedDistractors].slice(0, 4) as [string, string, string, string],
      correctIndex: 0,
      explanation: `${correctPoint} is a core ${safeTopic} concept and should be understood through practice, not memorization alone.`,
    };
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateQuiz(
  topic: string,
  context: string[],
  count = 4,
): Promise<QuizResult | QuizError> {
  const safeTopic = sanitizeTopic(topic);
  const safeContext = normalizeContext(context);
  const safeCount = Math.max(2, Math.min(15, Math.round(count)));

  const getFallbackQuestions = () =>
    normalizeQuestions(
      buildFallbackQuiz(safeTopic, safeContext, safeCount),
      safeCount,
      safeTopic,
      safeContext,
    );

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: safeTopic,
        context: safeContext,
        count: safeCount,
      }),
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    const payload = await response.json().catch(() => ({
      success: false,
      error: 'Invalid server response.',
    }));

    if (!response.ok || !payload?.success || !Array.isArray(payload?.questions)) {
      console.warn('[quizService] Falling back to client quiz due to API response issue:', {
        status: response.status,
        error: payload?.error,
      });

      return {
        success: true,
        questions: getFallbackQuestions(),
      };
    }

    const mergedQuestions = normalizeQuestions(
      [
        ...(payload.questions as QuizQuestion[]),
        ...buildFallbackQuiz(safeTopic, safeContext, safeCount),
      ],
      safeCount,
      safeTopic,
      safeContext,
    );

    if (mergedQuestions.length === 0) {
      return {
        success: true,
        questions: getFallbackQuestions(),
      };
    }

    return {
      success: true,
      questions: mergedQuestions,
    };
  } catch (err) {
    console.warn('[quizService] API unavailable, using fallback quiz:', err);

    return {
      success: true,
      questions: getFallbackQuestions(),
    };
  }
}
