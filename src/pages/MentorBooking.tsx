import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

type SessionMode = 'human' | 'ai';

interface MentorProfile {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  weeklySlots: Record<string, string[]>;
  timezone: string;
}

interface ConfirmationState {
  bookingId: string;
  mode: SessionMode;
  summary: string;
}

const steps = [
  'Select master blaster campaign settings',
  'Create an ad group',
  'Create an ad',
];

const formatDateLabel = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const createDateRange = (count: number): string[] => {
  const dates: string[] = [];
  const now = new Date();

  for (let i = 0; i < count; i += 1) {
    const next = new Date(now);
    next.setDate(now.getDate() + i);
    dates.push(next.toISOString().slice(0, 10));
  }

  return dates;
};

const MENTORS: MentorProfile[] = [
  {
    id: 'mentor-rhea',
    name: 'Rhea Kapoor',
    role: 'Senior Frontend Engineer, Product UI',
    specialties: ['React architecture', 'Interview storytelling', 'Portfolio reviews'],
    timezone: 'IST',
    weeklySlots: {},
  },
  {
    id: 'mentor-aditya',
    name: 'Aditya Menon',
    role: 'Staff Engineer, Web Platform',
    specialties: ['Performance tuning', 'System design basics', 'Mock interviews'],
    timezone: 'IST',
    weeklySlots: {},
  },
  {
    id: 'mentor-sana',
    name: 'Sana Qureshi',
    role: 'Frontend Lead, SaaS Apps',
    specialties: ['Roadmap planning', 'Career transitions', 'Live code reviews'],
    timezone: 'IST',
    weeklySlots: {},
  },
];

export default function MentorBooking() {
  const navigate = useNavigate();

  const dateOptions = useMemo(() => createDateRange(6), []);

  const mentors = useMemo(() => {
    const [d1, d2, d3, d4, d5, d6] = dateOptions;

    return MENTORS.map((mentor) => {
      if (mentor.id === 'mentor-rhea') {
        return {
          ...mentor,
          weeklySlots: {
            [d1]: ['10:00 AM', '6:30 PM'],
            [d3]: ['11:30 AM'],
            [d5]: ['9:30 AM', '8:00 PM'],
          },
        };
      }

      if (mentor.id === 'mentor-aditya') {
        return {
          ...mentor,
          weeklySlots: {
            [d2]: ['7:00 PM'],
            [d4]: ['8:30 PM'],
          },
        };
      }

      return {
        ...mentor,
        weeklySlots: {
          [d1]: [],
          [d2]: [],
          [d3]: [],
          [d4]: [],
          [d5]: [],
          [d6]: [],
        },
      };
    });
  }, [dateOptions]);

  const [mode, setMode] = useState<SessionMode | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [goal, setGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [focusQuestions, setFocusQuestions] = useState('');

  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const stepperActiveStep = Math.min(Math.max(activeStep - 1, 0), 2);

  const selectedMentor = useMemo(
    () => mentors.find((mentor) => mentor.id === selectedMentorId),
    [mentors, selectedMentorId],
  );

  const availableSlots = useMemo(() => {
    if (!selectedMentor) return [];
    return selectedMentor.weeklySlots[selectedDate] ?? [];
  }, [selectedMentor, selectedDate]);

  const isStep3Valid = goal.trim().length >= 8;

  const handleModeSelect = (nextMode: SessionMode) => {
    setMode(nextMode);
    setConfirmation(null);

    if (nextMode === 'human') {
      setActiveStep(2);
      return;
    }

    setSelectedMentorId('');
    setSelectedSlot('');
    setActiveStep(3);
  };

  const continueFromHumanSlot = () => {
    if (!selectedMentor || !selectedDate || !selectedSlot) return;
    setActiveStep(3);
  };

  const switchToAiFallback = () => {
    setMode('ai');
    setSelectedMentorId('');
    setSelectedSlot('');
    setActiveStep(3);
  };

  const buildSessionSummary = (): string => {
    if (mode === 'ai') {
      return 'AI mentor session starts instantly with adaptive guidance and interview-ready prompts.';
    }

    if (!selectedMentor || !selectedDate || !selectedSlot) {
      return 'Human mentor session details are incomplete.';
    }

    return `${selectedMentor.name} on ${formatDateLabel(selectedDate)} at ${selectedSlot} (${selectedMentor.timezone}).`;
  };

  const confirmBooking = () => {
    if (!mode || !isStep3Valid) return;

    if (mode === 'human' && (!selectedMentor || !selectedDate || !selectedSlot)) {
      return;
    }

    setConfirmation({
      bookingId: `AL-${Math.floor(100000 + Math.random() * 900000)}`,
      mode,
      summary: buildSessionSummary(),
    });

    setActiveStep(4);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/roadmap/frontend-react/flow')}
            className="text-zinc-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back To Roadmap
          </Button>
          <span className="text-xs sm:text-sm text-zinc-400">Career Launchpad / 1:1 Mentorship</span>
        </div>
      </div>

      <main className="flex-1 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-cyan-500/10 p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-indigo-300/90 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Mentor Program
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Book Your 1:1 Growth Session</h1>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Choose a human mentor for deep feedback, or switch to an AI coaching session for instant help when mentor slots are full.
            </p>

            <Box
              sx={{
                width: '100%',
                mt: 4,
                '& .MuiStepLabel-label': {
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: '#ffffff',
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#ffffff',
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(161, 161, 170, 0.9)',
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: '#90caf9',
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#90caf9',
                },
                '& .MuiStepConnector-line': {
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                },
              }}
            >
              <Stepper activeStep={stepperActiveStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </section>

          {!confirmation && (
            <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">1. Pick Session Type</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModeSelect('human')}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        mode === 'human'
                          ? 'border-indigo-400/70 bg-indigo-500/20'
                          : 'border-white/10 bg-black/30 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-indigo-300" />
                        <p className="font-semibold text-sm text-white">Human Mentor</p>
                      </div>
                      <p className="text-xs text-zinc-300">Scheduled 30-minute session with portfolio and interview feedback.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeSelect('ai')}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        mode === 'ai'
                          ? 'border-cyan-400/70 bg-cyan-500/20'
                          : 'border-white/10 bg-black/30 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-cyan-300" />
                        <p className="font-semibold text-sm text-white">AI Coach</p>
                      </div>
                      <p className="text-xs text-zinc-300">Start instantly with adaptive prompts, code review guidance, and action plans.</p>
                    </button>
                  </div>
                </div>

                {mode === 'human' && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-white">2. Choose Mentor and Slot</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mentors.map((mentor) => {
                        const mentorSlotsCount = Object.values(mentor.weeklySlots).reduce((acc, slots) => acc + slots.length, 0);
                        const isSelected = selectedMentorId === mentor.id;

                        return (
                          <button
                            type="button"
                            key={mentor.id}
                            onClick={() => {
                              setSelectedMentorId(mentor.id);
                              setSelectedSlot('');
                            }}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              isSelected
                                ? 'border-indigo-400/70 bg-indigo-500/20'
                                : 'border-white/10 bg-black/25 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-white">{mentor.name}</p>
                                <p className="text-xs text-zinc-400 mt-1">{mentor.role}</p>
                              </div>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                mentorSlotsCount > 0
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                  : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                              }`}>
                                {mentorSlotsCount > 0 ? `${mentorSlotsCount} slots` : 'Slots full'}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {mentor.specialties.map((item) => (
                                <span key={item} className="text-[11px] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-zinc-300">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedMentor && (
                      <div className="space-y-4 rounded-xl border border-white/10 bg-black/25 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Choose Date</p>
                          <div className="flex flex-wrap gap-2">
                            {dateOptions.map((dateValue) => (
                              <button
                                key={dateValue}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dateValue);
                                  setSelectedSlot('');
                                }}
                                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                                  selectedDate === dateValue
                                    ? 'border-indigo-400/70 bg-indigo-500/20 text-white'
                                    : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                                }`}
                              >
                                {formatDateLabel(dateValue)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Available Slots</p>

                          {availableSlots.length === 0 ? (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                              <p className="text-xs text-amber-100 leading-relaxed mb-2">
                                This mentor has no open slots on {formatDateLabel(selectedDate)}.
                                Switch to AI coaching for an instant session while waiting for mentor availability.
                              </p>
                              <button
                                type="button"
                                onClick={switchToAiFallback}
                                className="text-xs px-3 py-1.5 rounded-md border border-cyan-400/35 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                              >
                                Switch To AI Session
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                                    selectedSlot === slot
                                      ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-50'
                                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          onClick={continueFromHumanSlot}
                          disabled={!selectedMentor || !selectedSlot || availableSlots.length === 0}
                          className="bg-indigo-600 hover:bg-indigo-500"
                        >
                          Continue To Session Context
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {mode && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">3. Add Session Context</h2>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">Primary goal</label>
                      <input
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Example: Improve my frontend interview confidence in 3 weeks"
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">Current level</label>
                      <select
                        value={currentLevel}
                        onChange={(e) => setCurrentLevel(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      >
                        <option value="" className="bg-zinc-900">Select level</option>
                        <option value="Beginner" className="bg-zinc-900">Beginner</option>
                        <option value="Intermediate" className="bg-zinc-900">Intermediate</option>
                        <option value="Advanced" className="bg-zinc-900">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">What do you want reviewed?</label>
                      <textarea
                        value={focusQuestions}
                        onChange={(e) => setFocusQuestions(e.target.value)}
                        rows={4}
                        placeholder="Share repo links, interview concerns, roadmap blockers, or portfolio questions..."
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveStep(mode === 'human' ? 2 : 1)}
                        className="border-white/20 bg-white/5 text-zinc-200 hover:bg-white/10"
                      >
                        Edit Previous Step
                      </Button>
                      <Button
                        type="button"
                        onClick={confirmBooking}
                        disabled={!isStep3Valid}
                        className="bg-emerald-600 hover:bg-emerald-500"
                      >
                        Review Booking
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 h-fit lg:sticky lg:top-24">
                <h3 className="text-sm font-semibold text-white mb-4">Live Summary</h3>
                <div className="space-y-3 text-sm text-zinc-300">
                  <p className="flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-zinc-500" />
                    Mode: {mode === 'human' ? 'Human Mentor' : mode === 'ai' ? 'AI Coach' : 'Not selected'}
                  </p>

                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-zinc-500" />
                    Date: {mode === 'human' && selectedMentor ? formatDateLabel(selectedDate) : 'N/A'}
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-zinc-500" />
                    Slot: {mode === 'human' && selectedSlot ? selectedSlot : mode === 'ai' ? 'Instant session' : 'N/A'}
                  </p>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-xs text-zinc-400 mb-1">Goal</p>
                    <p className="text-sm text-zinc-200">{goal.trim() || 'Add your goal to personalize guidance.'}</p>
                  </div>
                </div>
              </aside>
            </section>
          )}

          {confirmation && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-6 sm:p-8"
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xl font-bold text-emerald-50">Session Confirmed</h2>
                  <p className="text-sm text-emerald-100/90 mt-1">
                    Booking ID: <span className="font-semibold">{confirmation.bookingId}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200/20 bg-black/20 p-4 text-sm text-emerald-50/95 space-y-2">
                <p>{confirmation.summary}</p>
                <p>
                  Session Context: {goal.trim()}
                  {currentLevel ? ` | Level: ${currentLevel}` : ''}
                </p>
                {focusQuestions.trim() && <p>Focus Notes: {focusQuestions.trim()}</p>}
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <Button
                  type="button"
                  onClick={() => navigate('/roadmap/frontend-react/flow')}
                  className="bg-white text-zinc-900 hover:bg-zinc-100"
                >
                  Back To Roadmap
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setConfirmation(null);
                    setActiveStep(1);
                    setMode(null);
                    setSelectedMentorId('');
                    setSelectedSlot('');
                    setGoal('');
                    setCurrentLevel('');
                    setFocusQuestions('');
                  }}
                  className="border-emerald-200/35 bg-emerald-500/10 text-emerald-50 hover:bg-emerald-500/20"
                >
                  Book Another Session
                </Button>
                {confirmation.mode === 'ai' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/ai/chat')}
                    className="border-cyan-300/35 bg-cyan-500/10 text-cyan-50 hover:bg-cyan-500/20"
                  >
                    Open AI Coach
                  </Button>
                )}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
