import { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, RotateCcw, CheckCircle2, XCircle, Info, Loader2, AlertTriangle } from 'lucide-react';
import { generateQuiz, type QuizQuestion } from '../../services/quizService';
import type { FrontendQuizEvaluationResult } from '@/types/adaptiveRoadmap';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  topic: string;                  // e.g. "What is HTTP?"
  nodeId: string;                 // node id to mark complete
  context: string[];              // whatYoullLearn bullets passed as context
  mode?: 'submodule' | 'main';
  questionCount?: number;
  persistResult?: boolean;
  completionScope?: 'node' | 'module';
  passScorePercentage?: number;
  onMarkComplete?: (nodeId: string, options?: { scope?: 'node' | 'module' }) => void;
  onQuizEvaluated?: (result: FrontendQuizEvaluationResult) => void;
  onClose: () => void;
}

type Phase = 'rules' | 'loading' | 'quiz' | 'results' | 'error';
type QuizMode = 'submodule' | 'main';

const DEFAULT_MAIN_TEST_PASS_PERCENTAGE = 80;
const DEFAULT_MAIN_TEST_QUESTIONS = 12;
const DEFAULT_SUBMODULE_QUESTIONS = 5;

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Disclaimer({ mode }: { mode: QuizMode }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
      <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-300/90 leading-relaxed">
        {mode === 'main' ? (
          <>
            <span className="font-semibold">Main component test mode:</span> this is a full-screen
            assessment with 10-15 questions. Use it to evaluate your overall understanding of the
            component before moving to the next stage.
          </>
        ) : (
          <>
            <span className="font-semibold">Sub-module quick check:</span> this attempt is temporary
            and is not saved to progress history. Only a perfect score marks this sub-module as
            completed.
          </>
        )}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuizModal({
  open,
  topic,
  nodeId,
  context,
  mode = 'submodule',
  questionCount,
  persistResult,
  completionScope,
  passScorePercentage,
  onMarkComplete,
  onQuizEvaluated,
  onClose,
}: Props) {
  const [phase, setPhase]                   = useState<Phase>('loading');
  const [questions, setQuestions]           = useState<QuizQuestion[]>([]);
  const [current, setCurrent]               = useState(0);
  const [selected, setSelected]             = useState<number | null>(null);
  const [answered, setAnswered]             = useState(false);
  const [score, setScore]                   = useState(0);
  const [errorMsg, setErrorMsg]             = useState('');
  const [marked, setMarked]                 = useState(false);
  const [mainTestStarted, setMainTestStarted] = useState(false);
  const [antiCheatViolation, setAntiCheatViolation] = useState<string | null>(null);
  const quizStartedAtRef = useRef<number>(0);
  const hasReportedResultRef = useRef(false);
  const isMainTestMode = mode === 'main';
  const requestedQuestionCount = Math.max(
    2,
    Math.min(15, questionCount ?? (isMainTestMode ? DEFAULT_MAIN_TEST_QUESTIONS : DEFAULT_SUBMODULE_QUESTIONS)),
  );
  const shouldReportResult = persistResult ?? isMainTestMode;
  const completionTarget = completionScope ?? (isMainTestMode ? 'module' : 'node');
  const requiredScorePercentage = Math.max(
    0,
    Math.min(100, passScorePercentage ?? (isMainTestMode ? DEFAULT_MAIN_TEST_PASS_PERCENTAGE : 100)),
  );

  const resetQuizState = useCallback((nextPhase: Phase) => {
    setPhase(nextPhase);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setMarked(false);
    setErrorMsg('');
    setAntiCheatViolation(null);
    hasReportedResultRef.current = false;
    quizStartedAtRef.current = Date.now();
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      // Best effort; ignore browser restrictions.
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // If fullscreen is blocked, UI still renders in full-screen modal layout.
    }
  }, []);

  const handleClose = useCallback(() => {
    setMainTestStarted(false);
    void exitFullscreen();
    onClose();
  }, [exitFullscreen, onClose]);

  // ── Load quiz ────────────────────────────────────────────────────────────────
  const loadQuiz = useCallback(async () => {
    resetQuizState('loading');

    const result = await generateQuiz(topic, context, requestedQuestionCount);

    if (result.success) {
      setQuestions(result.questions);
      setPhase('quiz');
    } else {
      setErrorMsg((result as { success: false; error: string }).error);
      setPhase('error');
    }
  }, [context, requestedQuestionCount, resetQuizState, topic]);

  const startMainTest = useCallback(() => {
    setMainTestStarted(true);
    void enterFullscreen();
    void loadQuiz();
  }, [enterFullscreen, loadQuiz]);

  const handleRetry = useCallback(() => {
    if (isMainTestMode) {
      setMainTestStarted(false);
      void exitFullscreen();
      resetQuizState('rules');
      return;
    }

    void loadQuiz();
  }, [exitFullscreen, isMainTestMode, loadQuiz, resetQuizState]);

  // Trigger load when modal opens
  useEffect(() => {
    if (!open) {
      setMainTestStarted(false);
      void exitFullscreen();
      return;
    }

    if (isMainTestMode) {
      resetQuizState('rules');
      return;
    }

    void loadQuiz();
  }, [exitFullscreen, isMainTestMode, loadQuiz, open, resetQuizState]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  useEffect(() => {
    if (!open) return;
    if (!isMainTestMode || !mainTestStarted) return;
    if (phase !== 'quiz') return;

    const failForCheating = (reason: string) => {
      setAntiCheatViolation(reason);
      setPhase('results');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        failForCheating('Tab switching detected. Main tests do not allow leaving the active tab.');
      }
    };

    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      failForCheating('Right click is disabled during the main test.');
    };

    const preventClipboard = (event: ClipboardEvent) => {
      event.preventDefault();
      failForCheating('Copy, cut, and paste are disabled during the main test.');
    };

    const handleBlur = () => {
      failForCheating('Focus was lost from the test window. This is not allowed during main tests.');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        failForCheating('Exiting fullscreen is not allowed during the main test.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventClipboard);
    document.addEventListener('cut', preventClipboard);
    document.addEventListener('paste', preventClipboard);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventClipboard);
      document.removeEventListener('cut', preventClipboard);
      document.removeEventListener('paste', preventClipboard);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isMainTestMode, mainTestStarted, open, phase]);

  const effectiveCorrectAnswers = antiCheatViolation ? 0 : score;

  useEffect(() => {
    if (phase !== 'results') return;
    if (questions.length === 0) return;
    if (hasReportedResultRef.current) return;
    if (!shouldReportResult) return;

    hasReportedResultRef.current = true;

    onQuizEvaluated?.({
      nodeId,
      topic,
      scorePercentage: Math.round((effectiveCorrectAnswers / questions.length) * 100),
      correctAnswers: effectiveCorrectAnswers,
      totalQuestions: questions.length,
      durationSeconds: Math.max(1, Math.round((Date.now() - quizStartedAtRef.current) / 1000)),
    });
  }, [
    effectiveCorrectAnswers,
    nodeId,
    onQuizEvaluated,
    phase,
    questions.length,
    shouldReportResult,
    topic,
  ]);

  // ── Answer selection ─────────────────────────────────────────────────────────
  const handleSelect = (idx: number) => {
    if (answered) return;
    if (antiCheatViolation) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[current].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase('results');
    }
  };

  // ── Option style ─────────────────────────────────────────────────────────────
  const optionClass = (idx: number): string => {
    const base =
      'w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ';

    if (!answered) {
      return base + 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 cursor-pointer';
    }

    const isCorrect = idx === questions[current].correctIndex;
    const isSelected = idx === selected;

    if (isCorrect) return base + 'border-emerald-500/60 bg-emerald-500/15 cursor-default';
    if (isSelected && !isCorrect) return base + 'border-red-500/60 bg-red-500/15 cursor-default';
    return base + 'border-white/5 bg-white/3 opacity-50 cursor-default';
  };

  // ── Score helpers ─────────────────────────────────────────────────────────────
  const pct = questions.length > 0 ? effectiveCorrectAnswers / questions.length : 0;
  const scorePercentage = Math.round(pct * 100);
  const passed = scorePercentage >= requiredScorePercentage;

  useEffect(() => {
    if (phase !== 'results') return;
    if (!passed) return;
    if (marked) return;

    onMarkComplete?.(nodeId, { scope: completionTarget });
    setMarked(true);
  }, [completionTarget, marked, nodeId, onMarkComplete, passed, phase]);

  const scoreColor =
    effectiveCorrectAnswers === questions.length
      ? 'text-emerald-400'
      : effectiveCorrectAnswers >= questions.length * 0.75
      ? 'text-emerald-400'
      : effectiveCorrectAnswers >= questions.length * 0.5
      ? 'text-amber-400'
      : 'text-red-400';

  const scoreLabel =
    antiCheatViolation
      ? 'Main test failed due to anti-cheating policy.'
      : effectiveCorrectAnswers === questions.length
      ? '🎉 Perfect!'
      : effectiveCorrectAnswers >= questions.length * 0.75
      ? '🌟 Great job!'
      : effectiveCorrectAnswers >= questions.length * 0.5
      ? '📚 Keep learning!'
      : '💪 Review the topic and try again.';

  // ─────────────────────────────────────────────────────────────────────────────
  if (!open) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className={`fixed inset-0 z-[61] flex items-center justify-center ${isMainTestMode ? 'p-0' : 'p-4'}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className={`relative w-full overflow-y-auto
                         bg-gradient-to-b from-slate-900 via-[#1a1740] to-slate-900
                         border border-white/10 shadow-2xl
                         ${isMainTestMode
                           ? 'h-[100vh] max-h-[100vh] rounded-none'
                           : 'max-w-xl max-h-[90vh] rounded-2xl'}`}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400
                           hover:text-white hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg
                                   bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Brain className="w-4 h-4 text-white" />
                  </span>
                  <p className="text-xs font-medium text-indigo-300/80 uppercase tracking-widest">
                    {isMainTestMode ? 'Main Component Test Mode' : 'Knowledge Check'}
                  </p>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight pr-8">{topic}</h3>
              </div>

              {/* Body */}
              <div className="px-6 py-5">

                {/* ── Rules (main test only) ── */}
                {phase === 'rules' && isMainTestMode && (
                  <motion.div
                    className="max-w-3xl mx-auto py-8"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5 mb-5">
                      <h4 className="text-lg font-bold text-cyan-200">Main Test Rules</h4>
                      <p className="text-sm text-cyan-100/90 mt-1">
                        This is a proctored test mode. Read and accept the rules before starting.
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-200">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        1. Test opens in full-screen and must stay in full-screen until submission.
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        2. Tab switching or losing focus is not allowed.
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        3. Right click, copy, cut, and paste actions are blocked.
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        4. Any rule violation ends the attempt as failed.
                      </div>
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                        5. Pass requirement: {requiredScorePercentage}% or above across {requestedQuestionCount} questions.
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={startMainTest}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-sm font-bold transition-all shadow-lg shadow-cyan-500/30"
                      >
                        Accept Rules and Start Test
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Loading ── */}
                {phase === 'loading' && (
                  <motion.div
                    className="flex flex-col items-center justify-center py-14 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                    <div className="text-center">
                      <p className="text-white font-medium">AI is crafting your quiz…</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {isMainTestMode
                          ? `Preparing ${requestedQuestionCount}-question test mode`
                          : 'Fresh questions generated just for you'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Error ── */}
                {phase === 'error' && (
                  <motion.div
                    className="flex flex-col items-center justify-center py-10 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                    <div className="text-center">
                      <p className="text-white font-medium">Couldn't load the quiz</p>
                      <p className="text-sm text-gray-400 mt-1 max-w-xs">{errorMsg}</p>
                    </div>
                    <button
                      onClick={loadQuiz}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600
                                 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Try Again
                    </button>
                  </motion.div>
                )}

                {/* ── Quiz ── */}
                {phase === 'quiz' && questions.length > 0 && (
                  <motion.div
                    key={`q-${current}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Disclaimer mode={mode} />

                    {isMainTestMode && (
                      <div className="mb-4 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-2.5 text-xs text-cyan-100">
                        Anti-cheating active: stay on this tab, keep fullscreen, and avoid right-click/copy/cut/paste.
                      </div>
                    )}

                    {/* Progress */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 font-medium">
                        Question {current + 1} of {questions.length}
                      </span>
                      <span className="text-xs text-gray-500">{effectiveCorrectAnswers} correct so far</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mb-5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        initial={{ width: `${(current / questions.length) * 100}%` }}
                        animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Question */}
                    <p className="text-base font-semibold text-white leading-relaxed mb-5">
                      {questions[current].question}
                    </p>

                    {/* Options */}
                    <div className="space-y-3 mb-5">
                      {questions[current].options.map((opt, idx) => {
                        const isCorrect = idx === questions[current].correctIndex;
                        const isSelected = idx === selected;
                        return (
                          <button
                            key={idx}
                            className={optionClass(idx)}
                            onClick={() => handleSelect(idx)}
                          >
                            {/* Letter badge */}
                            <span className={`flex-shrink-0 flex items-center justify-center
                                              w-7 h-7 rounded-lg text-xs font-bold mt-0.5
                                              transition-colors duration-200
                                              ${!answered
                                                ? 'bg-white/10 text-gray-400'
                                                : isCorrect
                                                ? 'bg-emerald-500 text-white'
                                                : isSelected
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/10 text-gray-500'
                                              }`}>
                              {OPTION_LABELS[idx]}
                            </span>
                            <span className={`flex-1 text-sm leading-snug
                                              ${!answered
                                                ? 'text-gray-200'
                                                : isCorrect
                                                ? 'text-emerald-200 font-medium'
                                                : isSelected
                                                ? 'text-red-200'
                                                : 'text-gray-500'
                                              }`}>
                              {opt}
                            </span>
                            {answered && isCorrect && (
                              <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400" />
                            )}
                            {answered && isSelected && !isCorrect && (
                              <XCircle className="flex-shrink-0 w-4 h-4 text-red-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                      {answered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-5"
                        >
                          <p className="text-xs font-semibold text-indigo-300 mb-1">Explanation</p>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {questions[current].explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Next button */}
                    {answered && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleNext}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                                   hover:from-indigo-500 hover:to-purple-500 text-white font-semibold
                                   text-sm transition-all shadow-lg shadow-indigo-500/20"
                      >
                        {current + 1 < questions.length ? 'Next Question →' : 'See Results'}
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* ── Results ── */}
                {phase === 'results' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-4"
                  >
                    <Disclaimer mode={mode} />

                    {/* Score card */}
                    <div className="flex flex-col items-center py-6 mb-5 rounded-2xl
                                    bg-gradient-to-b from-white/5 to-white/3 border border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Your Score</p>
                      <p className={`text-6xl font-black mb-2 ${scoreColor}`}>
                        {score}<span className="text-3xl text-gray-500 font-semibold">/{questions.length}</span>
                      </p>
                      <p className="text-base font-medium text-white">{scoreLabel}</p>

                      {/* Per-question dots */}
                      <div className="flex items-center gap-2 mt-4">
                        {questions.map((_, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full"
                            style={{
                              background:
                                i < score
                                  ? 'rgb(52,211,153)'  // emerald
                                  : 'rgb(239,68,68)',  // red
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleRetry}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                   bg-white/10 hover:bg-white/15 border border-white/10 text-white
                                   text-sm font-medium transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" /> Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                                   hover:from-indigo-500 hover:to-purple-500 text-white font-semibold
                                   text-sm transition-all"
                      >
                        Back to Learning
                      </button>
                    </div>

                    {/* ── Mark as Completed ── */}
                    <div className="mt-4">
                      <div className="h-px w-full bg-white/5 mb-4" />

                      {!marked ? (
                        <div
                          className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border
                                      ${passed
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-red-500/10 border-red-500/25'}`}
                        >
                          {passed ? (
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                          )}
                          <p
                            className={`text-xs leading-relaxed ${passed ? 'text-emerald-200' : 'text-red-300/90'}`}
                          >
                            {antiCheatViolation
                              ? `Test invalidated: ${antiCheatViolation}`
                              : passed
                              ? `Passed with ${scorePercentage}%. ${completionTarget === 'module' ? 'Module' : 'Sub-node'} will be marked completed automatically.`
                              : `You scored ${scorePercentage}%. Need at least ${requiredScorePercentage}% to complete this ${completionTarget === 'module' ? 'module' : 'sub-node'}.`}
                          </p>
                        </div>
                      ) : (
                        // Already marked
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl
                                     bg-emerald-500/15 border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-300">
                            {completionTarget === 'module' ? 'Module marked as completed!' : 'Sub-node marked as completed!'}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
