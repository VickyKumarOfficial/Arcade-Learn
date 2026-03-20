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

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateQuiz(
  topic: string,
  context: string[],
): Promise<QuizResult | QuizError> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/api/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        context,
        count: 4,
      }),
    });

    const payload = await response.json().catch(() => ({
      success: false,
      error: 'Invalid server response.',
    }));

    if (!response.ok || !payload?.success || !Array.isArray(payload?.questions)) {
      return {
        success: false,
        error: payload?.error || `Quiz request failed with status ${response.status}.`,
      };
    }

    return {
      success: true,
      questions: payload.questions as QuizQuestion[],
    };
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
