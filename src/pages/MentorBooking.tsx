import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SessionMode = 'human' | 'ai';

interface MentorProfile {
  id: string;
  name: string;
  role: string;
  experience: string;
  timezone: string;
  rating: string;
  specialties: string[];
  weeklySlots: Record<string, string[]>;
}

interface ConfirmationState {
  bookingId: string;
  mode: SessionMode;
  summary: string;
}

const ROADMAP_LABELS: Record<string, string> = {
  'frontend-react': 'Frontend React',
  'backend-nodejs': 'Backend Node.js',
  'fullstack-mern': 'Fullstack MERN',
};

const STEP_TITLES = [
  'Choose Session Type',
  'Pick Mentor or AI Focus',
  'Add Session Context',
  'Review and Confirm',
];

const MENTOR_BASE: Omit<MentorProfile, 'weeklySlots'>[] = [
  {
    id: 'mentor-rhea',
    name: 'Rhea Kapoor',
    role: 'Senior Frontend Engineer',
    experience: '8+ years',
    timezone: 'IST',
    rating: '4.9/5',
    specialties: ['React architecture', 'Portfolio polish', 'Interview drills'],
  },
  {
    id: 'mentor-aditya',
    name: 'Aditya Menon',
    role: 'Staff Platform Engineer',
    experience: '10+ years',
    timezone: 'IST',
    rating: '4.8/5',
    specialties: ['System design', 'Performance tuning', 'Career transitions'],
  },
  {
    id: 'mentor-sana',
    name: 'Sana Qureshi',
    role: 'Frontend Lead',
    experience: '7+ years',
    timezone: 'IST',
    rating: '4.9/5',
    specialties: ['Roadmap planning', 'Code review', 'Job readiness'],
  },
];

const AI_FOCUS_AREAS = [
  {
    id: 'mock-interview',
    title: 'Mock Interview Practice',
    description: 'Get realistic interview prompts with guided feedback.',
  },
  {
    id: 'debug-coaching',
    title: 'Debugging Coaching',
    description: 'Break down blockers and get step-by-step fixes.',
  },
  {
    id: 'portfolio-review',
    title: 'Portfolio Review Plan',
    description: 'Improve project storytelling and recruiter impact.',
  },
  {
    id: 'roadmap-guidance',
    title: 'Roadmap Prioritization',
    description: 'Sequence topics for faster interview readiness.',
  },
];

const createDateRange = (count: number): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < count; i += 1) {
    const next = new Date(today);
    next.setDate(today.getDate() + i);
    dates.push(next.toISOString().slice(0, 10));
  }

  return dates;
};

const formatDateLabel = (isoDate: string) => {
  const parsed = new Date(isoDate);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getRoadmapContext = (pathname: string) => {
  const parts = pathname.split('/');
  const slug = parts.length > 2 ? parts[2] : '';
  const label = ROADMAP_LABELS[slug] || 'Learning';
  const backRoute = ROADMAP_LABELS[slug] ? `/roadmap/${slug}/flow` : '/roadmaps';
  return { label, backRoute };
};

export default function MentorBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const { label: roadmapLabel, backRoute } = useMemo(
    () => getRoadmapContext(location.pathname),
    [location.pathname],
  );

  const dateOptions = useMemo(() => createDateRange(7), []);

  const mentors = useMemo(() => {
    const [d1, d2, d3, d4, d5, d6, d7] = dateOptions;

    return MENTOR_BASE.map((mentor) => {
      if (mentor.id === 'mentor-rhea') {
        return {
          ...mentor,
          weeklySlots: {
            [d1]: ['10:00 AM', '6:30 PM'],
            [d2]: ['8:00 PM'],
            [d4]: ['11:30 AM'],
            [d6]: ['9:30 AM', '7:00 PM'],
          },
        };
      }

      if (mentor.id === 'mentor-aditya') {
        return {
          ...mentor,
          weeklySlots: {
            [d1]: ['7:30 PM'],
            [d3]: ['8:30 PM'],
            [d5]: ['6:30 PM', '9:00 PM'],
            [d7]: ['11:00 AM'],
          },
        };
      }

      return {
        ...mentor,
        weeklySlots: {
          [d2]: ['10:30 AM'],
          [d3]: ['5:00 PM'],
          [d4]: ['7:30 PM'],
          [d5]: ['11:30 AM'],
          [d6]: [],
          [d7]: ['4:30 PM'],
        },
      };
    });
  }, [dateOptions]);

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedAIFocus, setSelectedAIFocus] = useState('');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const selectedMentor = useMemo(
    () => mentors.find((mentor) => mentor.id === selectedMentorId) || null,
    [mentors, selectedMentorId],
  );

  const availableSlots = useMemo(() => {
    if (!selectedMentor) return [];
    return selectedMentor.weeklySlots[selectedDate] || [];
  }, [selectedMentor, selectedDate]);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(mode);
    if (step === 1) {
      if (mode === 'human') return Boolean(selectedMentor && selectedSlot);
      return Boolean(selectedAIFocus);
    }
    if (step === 2) return goal.trim().length >= 3 && Boolean(level);
    return true;
  }, [step, mode, selectedMentor, selectedSlot, selectedAIFocus, goal, level]);

  const completionPercent = Math.round(((step + 1) / STEP_TITLES.length) * 100);

  const handleModeChange = (nextMode: SessionMode) => {
    setMode(nextMode);
    setConfirmation(null);
    if (nextMode === 'ai') {
      setSelectedMentorId('');
      setSelectedSlot('');
      setSelectedAIFocus((prev) => prev || 'mock-interview');
      return;
    }

    setSelectedAIFocus('');
  };

  const handleContinue = () => {
    if (!canContinue || step >= STEP_TITLES.length - 1) return;

    if (step === 1 && mode === 'human' && selectedMentor && !selectedSlot) {
      const firstAvailableSlot = (selectedMentor.weeklySlots[selectedDate] || [])[0];
      if (firstAvailableSlot) {
        setSelectedSlot(firstAvailableSlot);
      }
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step <= 0) return;
    setStep((prev) => prev - 1);
  };

  const handleSwitchToAI = () => {
    setMode('ai');
    setSelectedMentorId('');
    setSelectedSlot('');
    setSelectedAIFocus('mock-interview');
  };

  const buildSummary = () => {
    if (mode === 'ai') {
      const focusTitle = AI_FOCUS_AREAS.find((item) => item.id === selectedAIFocus)?.title || 'AI Coaching';
      return `${focusTitle} starts instantly with guided prompts and action-oriented feedback.`;
    }

    if (!selectedMentor || !selectedSlot) {
      return 'Session details are incomplete.';
    }

    return `${selectedMentor.name} on ${formatDateLabel(selectedDate)} at ${selectedSlot} (${selectedMentor.timezone}).`;
  };

  const confirmBooking = () => {
    if (!mode) return;

    setConfirmation({
      bookingId: `AL-${Math.floor(100000 + Math.random() * 900000)}`,
      mode,
      summary: buildSummary(),
    });
  };

  const resetFlow = () => {
    setStep(0);
    setMode(null);
    setSelectedMentorId('');
    setSelectedDate(dateOptions[0]);
    setSelectedSlot('');
    setSelectedAIFocus('');
    setGoal('');
    setLevel('');
    setNotes('');
    setConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(backRoute)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Roadmap
          </Button>
          <Badge variant="outline" className="text-xs">
            {roadmapLabel} - 1:1 Mentee Session
          </Badge>
        </div>
      </header>

      <main className="flex-1 pt-8 pb-20 px-4">
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <section className="flex flex-row items-start gap-6 min-w-[1080px]">
            <Card className="order-2 w-[320px] md:w-[340px] xl:w-[360px] shrink-0 border border-border bg-card h-fit sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session Summary</CardTitle>
                <CardDescription>Live details update as you complete each step.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-muted-foreground" />
                  <span>Type: {mode === 'human' ? 'Human Mentor' : mode === 'ai' ? 'AI Coach' : 'Not selected'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span>Date: {mode === 'human' && selectedMentor ? formatDateLabel(selectedDate) : 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-muted-foreground" />
                  <span>Slot: {mode === 'human' ? selectedSlot || 'N/A' : mode === 'ai' ? 'Instant' : 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Goal: {goal.trim() || 'Add your primary goal'}</span>
                </p>

                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Why this flow works</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Structured session prep for better outcomes.
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Fallback to AI when human slots are unavailable.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="order-1 flex-1 min-w-[720px] space-y-6">
              <Card className="border border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Book Your 1:1 Mentorship Session</CardTitle>
                  <CardDescription>
                    Follow the guided flow to schedule the right support session for your current learning goal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${completionPercent}%` }} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {STEP_TITLES.map((title, index) => (
                      <div
                        key={title}
                        className={`rounded-lg border p-2 text-xs ${
                          index === step
                            ? 'border-primary bg-primary/10 text-primary'
                            : index < step
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        <p className="font-medium">Step {index + 1}</p>
                        <p>{title}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {!confirmation && (
                <Card className="border border-border bg-card">
                  <CardContent className="p-5 sm:p-6 space-y-6">
                    {step === 0 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Step 1: Choose Session Type</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleModeChange('human')}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              mode === 'human'
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-muted/20 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-primary" />
                              <p className="font-semibold text-sm">Human Mentor Session</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Live 30-minute session for targeted feedback and mentoring.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleModeChange('ai')}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                              mode === 'ai'
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-muted/20 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="w-4 h-4 text-primary" />
                              <p className="font-semibold text-sm">AI Coach Session</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Instant coaching for interview prep, debugging, and roadmap support.
                            </p>
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 1 && mode === 'human' && (
                      <div className="space-y-5">
                        <h2 className="text-lg font-semibold">Step 2: Choose Mentor and Time Slot</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mentors.map((mentor) => {
                            const slotCount = Object.values(mentor.weeklySlots).reduce((sum, slots) => sum + slots.length, 0);
                            const isSelected = selectedMentorId === mentor.id;

                            return (
                              <button
                                key={mentor.id}
                                type="button"
                                onClick={() => {
                                  setSelectedMentorId(mentor.id);
                                  setSelectedSlot('');
                                }}
                                className={`rounded-xl border p-4 text-left transition-colors ${
                                  isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-muted/20 hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-sm">{mentor.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{mentor.role}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{mentor.experience} • {mentor.rating}</p>
                                  </div>
                                  <Badge variant="outline">{slotCount} slots</Badge>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {mentor.specialties.map((item) => (
                                    <span
                                      key={item}
                                      className="text-[11px] px-2 py-0.5 rounded-md border border-border bg-muted/30 text-muted-foreground"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {selectedMentor && (
                          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Select Date</p>
                              <div className="flex flex-wrap gap-2">
                                {dateOptions.map((dateValue) => (
                                  <button
                                    key={dateValue}
                                    type="button"
                                    onClick={() => {
                                      setSelectedDate(dateValue);
                                      setSelectedSlot('');
                                    }}
                                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                                      selectedDate === dateValue
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-background hover:border-primary/50'
                                    }`}
                                  >
                                    {formatDateLabel(dateValue)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Available Slots</p>
                              {availableSlots.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {availableSlots.map((slot) => (
                                    <button
                                      key={slot}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                                        selectedSlot === slot
                                          ? 'border-primary bg-primary/10 text-primary'
                                          : 'border-border bg-background hover:border-primary/50'
                                      }`}
                                    >
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 space-y-2">
                                  <p>No human slots available on {formatDateLabel(selectedDate)} for this mentor.</p>
                                  <Button size="sm" variant="outline" onClick={handleSwitchToAI}>
                                    Switch to AI Coach
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {step === 1 && mode === 'ai' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Step 2: Choose AI Coaching Focus</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {AI_FOCUS_AREAS.map((focus) => {
                            const isSelected = selectedAIFocus === focus.id;
                            return (
                              <button
                                key={focus.id}
                                type="button"
                                onClick={() => setSelectedAIFocus(focus.id)}
                                className={`rounded-xl border p-4 text-left transition-colors ${
                                  isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-muted/20 hover:border-primary/50'
                                }`}
                              >
                                <p className="font-semibold text-sm">{focus.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{focus.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Step 3: Add Session Context</h2>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Primary Goal</label>
                          <Input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Example: Improve interview confidence for frontend roles"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Current Level</label>
                          <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Select your level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Notes for Mentor/Coach</label>
                          <Textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add repo links, blockers, or topics you want to cover."
                          />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Step 4: Review and Confirm</h2>
                        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 text-sm">
                          <p><span className="text-muted-foreground">Session type:</span> {mode === 'human' ? 'Human Mentor' : 'AI Coach'}</p>
                          {mode === 'human' ? (
                            <>
                              <p><span className="text-muted-foreground">Mentor:</span> {selectedMentor?.name || 'Not selected'}</p>
                              <p><span className="text-muted-foreground">Date:</span> {formatDateLabel(selectedDate)}</p>
                              <p><span className="text-muted-foreground">Slot:</span> {selectedSlot || 'Not selected'}</p>
                            </>
                          ) : (
                            <p>
                              <span className="text-muted-foreground">AI focus:</span>{' '}
                              {AI_FOCUS_AREAS.find((item) => item.id === selectedAIFocus)?.title || 'Not selected'}
                            </p>
                          )}
                          <p><span className="text-muted-foreground">Goal:</span> {goal.trim() || 'Not provided'}</p>
                          <p><span className="text-muted-foreground">Level:</span> {level || 'Not provided'}</p>
                          {notes.trim() && <p><span className="text-muted-foreground">Notes:</span> {notes.trim()}</p>}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                        Back
                      </Button>

                      {step < STEP_TITLES.length - 1 ? (
                        <Button onClick={handleContinue} disabled={!canContinue}>
                          Continue
                        </Button>
                      ) : (
                        <Button onClick={confirmBooking} disabled={!canContinue}>
                          Confirm Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {confirmation && (
                <Card className="border border-emerald-500/40 bg-emerald-500/10">
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">Session Confirmed</h2>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                          Booking ID: <span className="font-semibold">{confirmation.bookingId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/30 bg-background/70 p-4 text-sm space-y-2">
                      <p>{confirmation.summary}</p>
                      <p>Goal: {goal.trim()}</p>
                      <p>Level: {level}</p>
                      {notes.trim() && <p>Notes: {notes.trim()}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => navigate(backRoute)}>Back to Roadmap</Button>
                      <Button variant="outline" onClick={resetFlow}>Book Another Session</Button>
                      {confirmation.mode === 'ai' && (
                        <Button variant="outline" onClick={() => navigate('/ai/chat')}>
                          Open AI Coach
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
