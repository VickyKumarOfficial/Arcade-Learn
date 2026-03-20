import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ExternalLink, Globe, BookOpen, Video, MousePointerClick, BookMarked, Brain } from 'lucide-react';
import {
  INTERNET_SECTION,
  INTERNET_SUB_NODES,
  type ResourceType,
} from '../../data/internetNodeDetails';
import QuizModal from './QuizModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  activeNodeId: string | null;
  onClose: () => void;
  onMarkComplete?: (nodeId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ResourceIcon({ type }: { type: ResourceType }) {
  switch (type) {
    case 'video':
      return <Video className="w-3.5 h-3.5" />;
    case 'interactive':
      return <MousePointerClick className="w-3.5 h-3.5" />;
    case 'book':
      return <BookMarked className="w-3.5 h-3.5" />;
    default:
      return <BookOpen className="w-3.5 h-3.5" />;
  }
}

const TYPE_COLORS: Record<ResourceType, string> = {
  article:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  video:       'bg-red-500/20 text-red-300 border-red-500/30',
  interactive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  book:        'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface QuizState {
  open: boolean;
  topic: string;
  nodeId: string;
  context: string[];
}

export default function InternetDetailSidebar({ open, activeNodeId, onClose, onMarkComplete }: Props) {
  // Which accordion item is expanded (null = none)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizState>({ open: false, topic: '', nodeId: '', context: [] });

  const openQuiz = (topic: string, nodeId: string, context: string[]) =>
    setQuiz({ open: true, topic, nodeId, context });
  const closeQuiz = () =>
    setQuiz(prev => ({ ...prev, open: false }));

  // Auto-expand the clicked sub-node when the sidebar opens / the active node changes
  useEffect(() => {
    if (!open) return;
    if (activeNodeId && activeNodeId !== 'internet') {
      setExpandedId(activeNodeId);
    } else {
      // If the parent "Internet" node was clicked, open the first sub-node by default
      setExpandedId(INTERNET_SUB_NODES[0].id);
    }
  }, [open, activeNodeId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggle = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  return (
    <>
      {/* Backdrop – click to close */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="internet-backdrop"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="internet-sidebar"
            className="fixed top-0 right-0 z-50 h-screen w-[32rem] sm:w-[36rem] flex flex-col
                       bg-gradient-to-b from-slate-900 via-[#1e1b4b]/90 to-slate-900
                       border-l border-white/10 shadow-2xl overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-7 pt-7 pb-5 border-b border-white/10
                            bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* <span className="flex items-center justify-center w-12 h-12 rounded-xl
                                   bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                    <Globe className="w-6 h-6 text-white" />
                  </span> */}
                  <div>
                    <p className="text-xs font-medium text-indigo-300/80 uppercase tracking-widest">
                      Module overview
                    </p>
                    <h2 className="text-2xl font-bold text-white leading-tight">
                      {INTERNET_SECTION.label}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="mt-0.5 p-2 rounded-lg text-gray-400 hover:text-white
                             hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                {INTERNET_SECTION.description}
              </p>
            </div>

            {/* ── Sub-node count pill ── */}
            <div className="flex-shrink-0 px-7 py-3.5 border-b border-white/5 flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {INTERNET_SUB_NODES.length} topics
              </span>
              <span className="h-px flex-1 bg-white/5" />
              <span className="text-xs text-gray-500">Click a topic to expand</span>
            </div>

            {/* ── Accordion list (scrollable) ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 px-5 py-4
                            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {INTERNET_SUB_NODES.map((node, idx) => {
                const isOpen = expandedId === node.id;
                return (
                  <div
                    key={node.id}
                    className={`rounded-xl border transition-all duration-200
                                ${isOpen
                                  ? 'border-indigo-500/40 bg-indigo-600/10'
                                  : 'border-white/5 bg-white/3 hover:bg-white/5'
                                }`}
                  >
                    {/* Accordion header */}
                    <button
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
                      onClick={() => toggle(node.id)}
                    >
                      {/* Index bubble */}
                      <span className={`flex-shrink-0 flex items-center justify-center
                                        w-8 h-8 rounded-full text-sm font-bold
                                        transition-colors duration-200
                                        ${isOpen
                                          ? 'bg-indigo-500 text-white'
                                          : 'bg-white/10 text-gray-400'
                                        }`}>
                        {idx + 1}
                      </span>

                      <span className={`flex-1 text-base font-medium leading-snug transition-colors
                                        ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                        {node.label}
                      </span>

                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 text-gray-500"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.span>
                    </button>

                    {/* Accordion body */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={`body-${node.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="px-5 pb-5 space-y-5">
                            {/* Intro */}
                            <p className="text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                              {node.intro}
                            </p>

                            {/* What you'll learn */}
                            <div>
                              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                                What you'll learn
                              </h4>
                              <ul className="space-y-2">
                                {node.whatYoullLearn.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                                    <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-indigo-400" />
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Resources */}
                            <div>
                              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                                Resources
                              </h4>
                              <div className="space-y-2.5">
                                {node.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg
                                               bg-white/5 hover:bg-white/10 border border-white/5
                                               hover:border-white/15 transition-all group"
                                  >
                                    {/* Type badge */}
                                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md
                                                       text-xs font-medium border flex-shrink-0
                                                       ${TYPE_COLORS[res.type]}`}>
                                      <ResourceIcon type={res.type} />
                                      {res.type}
                                    </span>

                                    <span className="flex-1 text-sm text-gray-300 group-hover:text-white
                                                      transition-colors leading-snug line-clamp-2">
                                      {res.title}
                                    </span>

                                    <ExternalLink className="flex-shrink-0 w-4 h-4 text-gray-600
                                                              group-hover:text-gray-400 transition-colors" />
                                  </a>
                                ))}
                              </div>
                            </div>

                            {/* ── Test My Knowledge ── */}
                            <div className="pt-1">
                              <div className="h-px w-full bg-white/5 mb-4" />
                              <button
                                onClick={() => openQuiz(node.label, node.id, node.whatYoullLearn)}
                                className="w-full flex items-center justify-center gap-2.5 py-3 px-4
                                           rounded-xl border border-indigo-500/30
                                           bg-gradient-to-r from-indigo-600/20 to-purple-600/15
                                           hover:from-indigo-600/35 hover:to-purple-600/25
                                           hover:border-indigo-500/60 transition-all group"
                              >
                                <Brain className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                <span className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                                  Test My Knowledge
                                </span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 px-7 py-5 border-t border-white/10
                            bg-gradient-to-r from-slate-900 to-[#1e1b4b]/50">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[11px]">Esc</kbd> or click outside to close
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Quiz Modal (portal, above sidebar) ── */}
      <QuizModal
        open={quiz.open}
        topic={quiz.topic}
        nodeId={quiz.nodeId}
        context={quiz.context}
        onMarkComplete={onMarkComplete ?? (() => {})}
        onClose={closeQuiz}
      />
    </>
  );
}
