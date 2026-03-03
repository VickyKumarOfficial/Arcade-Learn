import { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, RotateCcw, CheckCircle2, XCircle, Info, Loader2, AlertTriangle } from 'lucide-react';
import { generateQuiz, type QuizQuestion } from '../../services/quizService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  topic: string;                  // e.g. "What is HTTP?"
  nodeId: string;                 // node id to mark complete
  context: string[];              // whatYoullLearn bullets passed as context
  onMarkComplete: (nodeId: string) => void;
  onClose: () => void;
}

type Phase = 'loading' | 'quiz' | 'results' | 'error';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Disclaimer() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
      <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-300/90 leading-relaxed">
        <span className="font-semibold">Note:</span> This mini-quiz is only for your own
        self-review. Your score is <span className="font-semibold">not stored</span> and
        won't affect any evaluation. The full graded test covering all topics will be
        available at the end of this module.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuizModal({ open, topic, nodeId, context, onMarkComplete, onClose }: Props) {
  const [phase, setPhase]                   = useState<Phase>('loading');
  const [questions, setQuestions]           = useState<QuizQuestion[]>([]);
  const [current, setCurrent]               = useState(0);
  const [selected, setSelected]             = useState<number | null>(null);
  const [answered, setAnswered]             = useState(false);
  const [score, setScore]                   = useState(0);
  const [errorMsg, setErrorMsg]             = useState('');
  const [markConfirmShown, setMarkConfirmShown] = useState(false);
  const [marked, setMarked]                 = useState(false);

  // ── Load quiz ────────────────────────────────────────────────────────────────
  const loadQuiz = useCallback(async () => {
    setPhase('loading');
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setMarkConfirmShown(false);
    setMarked(false);

    const result = await generateQuiz(topic, context);

    if (result.success) {
      setQuestions(result.questions);
      setPhase('quiz');
    } else {
      setErrorMsg((result as { success: false; error: string }).error);
      setPhase('error');
    }
  }, [topic, context]);

  // Trigger load when modal opens
  useEffect(() => {
    if (open) loadQuiz();
  }, [open, loadQuiz]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Answer selection ─────────────────────────────────────────────────────────
  const handleSelect = (idx: number) => {
    if (answered) return;
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
  const pct = questions.length > 0 ? score / questions.length : 0;

  const scoreColor =
    score === questions.length
      ? 'text-emerald-400'
      : score >= questions.length * 0.75
      ? 'text-emerald-400'
      : score >= questions.length * 0.5
      ? 'text-amber-400'
      : 'text-red-400';

  const scoreLabel =
    score === questions.length
      ? '🎉 Perfect!'
      : score >= questions.length * 0.75
      ? '🌟 Great job!'
      : score >= questions.length * 0.5
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl
                         bg-gradient-to-b from-slate-900 via-[#1a1740] to-slate-900
                         border border-white/10 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={onClose}
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
                    Knowledge Check
                  </p>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight pr-8">{topic}</h3>
              </div>

              {/* Body */}
              <div className="px-6 py-5">

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
                      <p className="text-sm text-gray-500 mt-1">Fresh questions generated just for you</p>
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
                    <Disclaimer />

                    {/* Progress */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 font-medium">
                        Question {current + 1} of {questions.length}
                      </span>
                      <span className="text-xs text-gray-500">{score} correct so far</span>
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
                    <Disclaimer />

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
                        onClick={loadQuiz}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                   bg-white/10 hover:bg-white/15 border border-white/10 text-white
                                   text-sm font-medium transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" /> Try Again
                      </button>
                      <button
                        onClick={onClose}
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
                        <>
                          {/* Inline warning / confirmation */}
                          <AnimatePresence>
                            {markConfirmShown && pct > 0 && pct < 1 && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border mb-3
                                            ${
                                              pct >= 0.6
                                                ? 'bg-amber-500/10 border-amber-500/25'
                                                : 'bg-red-500/10 border-red-500/25'
                                            }`}
                              >
                                <AlertTriangle
                                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                                    pct >= 0.6 ? 'text-amber-400' : 'text-red-400'
                                  }`}
                                />
                                <div className="flex-1">
                                  <p
                                    className={`text-xs leading-relaxed ${
                                      pct >= 0.6 ? 'text-amber-300/90' : 'text-red-300/90'
                                    }`}
                                  >
                                    {pct >= 0.6
                                      ? "Your foundation's coming along, but some concepts still need attention. Revisit the weaker areas and keep building — strong fundamentals now will save you hours down the road. You've got this! 💪"
                                      : 'Are you sure you want to mark this module as completed? Your score suggests some core concepts are unclear. We strongly recommend reviewing the material first for the best long-term results.'}
                                  </p>
                                  <button
                                    onClick={() => { onMarkComplete(nodeId); setMarked(true); }}
                                    className={`mt-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                                transition-colors
                                                ${
                                                  pct >= 0.6
                                                    ? 'bg-amber-500/30 hover:bg-amber-500/50 text-amber-200'
                                                    : 'bg-red-500/30 hover:bg-red-500/50 text-red-200'
                                                }`}
                                  >
                                    Yes, mark as completed anyway
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* The mark button — style changes by score */}
                          {pct === 0 ? (
                            <button
                              disabled
                              title="Score at least one question to unlock this"
                              className="w-full py-3 rounded-xl bg-white/5 border border-white/5
                                         text-gray-600 text-sm font-semibold cursor-not-allowed"
                            >
                              Mark as Completed
                            </button>
                          ) : pct === 1 ? (
                            <button
                              onClick={() => { onMarkComplete(nodeId); setMarked(true); }}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                                         bg-gradient-to-r from-emerald-600 to-teal-600
                                         hover:from-emerald-500 hover:to-teal-500
                                         text-white text-sm font-semibold transition-all
                                         shadow-lg shadow-emerald-500/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Completed
                            </button>
                          ) : (
                            <button
                              onClick={() => setMarkConfirmShown(prev => !prev)}
                              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl
                                          border text-sm font-semibold transition-all
                                          ${
                                            pct >= 0.6
                                              ? 'bg-amber-500/15 border-amber-500/30 hover:bg-amber-500/25 text-amber-300'
                                              : 'bg-orange-500/15 border-orange-500/30 hover:bg-orange-500/25 text-orange-300'
                                          }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Completed
                              <span className="text-xs opacity-60 ml-1">{markConfirmShown ? '▲' : '▼'}</span>
                            </button>
                          )}
                        </>
                      ) : (
                        // Already marked
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl
                                     bg-emerald-500/15 border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-300">Node marked as completed!</span>
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
