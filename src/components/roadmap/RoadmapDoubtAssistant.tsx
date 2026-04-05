import { useEffect, useMemo, useRef, useState, type KeyboardEventHandler } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircleQuestion, Send, Sparkles, X } from 'lucide-react';
import { roadmapDoubtService } from '@/services/roadmapDoubtService';
import FormattedText from '@/components/FormattedText';

type ChatRole = 'assistant' | 'user';

interface RoadmapDoubtMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface RoadmapDoubtAssistantProps {
  roadmapKey: string;
  roadmapTitle: string;
  activeTopic?: string | null;
  activeTopicDescription?: string | null;
}

function makeMessage(role: ChatRole, content: string): RoadmapDoubtMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export default function RoadmapDoubtAssistant({
  roadmapKey,
  roadmapTitle,
  activeTopic,
  activeTopicDescription,
}: RoadmapDoubtAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<RoadmapDoubtMessage[]>([]);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const starterMessage = useMemo(
    () =>
      makeMessage(
        'assistant',
        `Ask me any doubt while learning ${roadmapTitle}. I can explain concepts, unblock errors, and suggest the next best step.`,
      ),
    [roadmapTitle],
  );

  useEffect(() => {
    setMessages([starterMessage]);
    setServiceError(null);
  }, [starterMessage, roadmapKey]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const submit = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMessage = makeMessage('user', question);
    setInput('');
    setServiceError(null);
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    const history = messages
      .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
      .slice(-8)
      .map((entry) => ({
        role: entry.role,
        content: entry.content,
      }));

    const result = await roadmapDoubtService.askDoubt({
      roadmapKey,
      roadmapTitle,
      question,
      activeTopic,
      activeTopicDescription,
      history,
    });

    setLoading(false);

    if (!result.success || !result.response) {
      const errorText = result.error || 'AI could not answer right now. Please try again.';
      setServiceError(errorText);
      setMessages((prev) => [
        ...prev,
        makeMessage('assistant', 'I hit a temporary issue while solving that doubt. Please try again in a moment.'),
      ]);
      return;
    }

    setMessages((prev) => [...prev, makeMessage('assistant', result.response!)]);
  };

  const onEnterSubmit: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/35 hover:from-indigo-400 hover:to-blue-400 transition-all"
      >
        <MessageCircleQuestion className="w-4 h-4" />
        Doubt Solver
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/55"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-indigo-500/30 bg-gradient-to-b from-[#090b14] via-[#0f172a] to-[#090b14] shadow-2xl"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-indigo-300/80">Roadmap AI</p>
                      <h3 className="mt-1 text-base font-semibold text-white">On-the-go Doubt Solving</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-md p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                    <span className="text-zinc-500">Roadmap:</span> {roadmapTitle}
                    {activeTopic && (
                      <>
                        <span className="mx-1.5 text-zinc-600">|</span>
                        <span className="text-zinc-500">Topic:</span> {activeTopic}
                      </>
                    )}
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white whitespace-pre-wrap'
                            : 'border border-white/10 bg-white/5 text-zinc-100'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-indigo-300/85">
                            <Sparkles className="h-3 w-3" /> Assistant
                          </div>
                        )}
                        {message.role === 'assistant' ? (
                          <FormattedText
                            content={message.content}
                            className="[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h4]:text-sm [&_p]:text-sm [&_p]:leading-6 [&_p]:mb-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:text-sm [&_li]:leading-6 [&_pre]:my-2 [&_pre_code]:text-xs"
                          />
                        ) : (
                          <div>{message.content}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-300">
                        <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}

                  {serviceError && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                      {serviceError}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 px-4 py-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      rows={2}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={onEnterSubmit}
                      placeholder="Ask your roadmap doubt..."
                      className="min-h-[48px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-400/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={loading || input.trim().length === 0}
                      onClick={() => void submit()}
                      className="inline-flex h-[42px] items-center justify-center rounded-xl bg-indigo-500 px-3 text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
