import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileText,
  Layers3,
  MessageSquareText,
  PlayCircle,
  Radar,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type RoadmapKey = 'frontend-react' | 'backend-nodejs' | 'fullstack-mern';

const ROADMAP_META: Record<RoadmapKey, {
  label: string;
  role: string;
  backRoute: string;
  mentorRoute: string;
  focus: string;
}> = {
  'frontend-react': {
    label: 'Frontend React',
    role: 'Frontend Developer',
    backRoute: '/roadmap/frontend-react/flow',
    mentorRoute: '/roadmap/frontend-react/mentor',
    focus: 'React, UI debugging, component design, browser fundamentals, and frontend system design.',
  },
  'backend-nodejs': {
    label: 'Backend Node.js',
    role: 'Backend Developer',
    backRoute: '/roadmap/backend-nodejs/flow',
    mentorRoute: '/roadmap/backend-nodejs/mentor',
    focus: 'Node.js, APIs, databases, authentication, scalability, and service reliability.',
  },
  'fullstack-mern': {
    label: 'Full Stack MERN',
    role: 'MERN Stack Developer',
    backRoute: '/roadmap/fullstack-mern/flow',
    mentorRoute: '/roadmap/fullstack-mern/mentor',
    focus: 'React, Express, MongoDB, integration flows, deployment, and architecture tradeoffs.',
  },
};

const DEFAULT_ROADMAP: RoadmapKey = 'frontend-react';

const prepTracks = [
  {
    title: 'Aptitude and Communication',
    detail: 'Warm up with reasoning drills, email writing, introductions, and HR question framing.',
    duration: '3 sessions',
    icon: MessageSquareText,
  },
  {
    title: 'DSA and Coding Rounds',
    detail: 'Practice arrays, strings, hashing, recursion, trees, and timed problem-solving patterns.',
    duration: '18 drills',
    icon: Code2,
  },
  {
    title: 'Core Technical Interview',
    detail: 'Revise roadmap concepts with explain-like-an-engineer prompts and follow-up questions.',
    duration: '42 questions',
    icon: BookOpenCheck,
  },
  {
    title: 'Project and System Design',
    detail: 'Prepare project walkthroughs, tradeoff answers, architecture diagrams, and debugging stories.',
    duration: '6 scenarios',
    icon: Layers3,
  },
];

const weeklyPlan = [
  {
    week: 'Week 1',
    title: 'Profile and foundation reset',
    items: ['Resume cleanup', 'LinkedIn/GitHub alignment', 'Core concept revision'],
  },
  {
    week: 'Week 2',
    title: 'Coding speed and patterns',
    items: ['Daily timed coding', 'Pattern notebook', 'Mistake log review'],
  },
  {
    week: 'Week 3',
    title: 'Role-specific interviews',
    items: ['Technical mock rounds', 'Project deep dives', 'Scenario questions'],
  },
  {
    week: 'Week 4',
    title: 'Company readiness sprint',
    items: ['Final mock interview', 'HR stories', 'Apply with job tracker'],
  },
];

const resources = [
  {
    title: 'Resume and Profile Kit',
    description: 'ATS checklist, project bullet templates, GitHub cleanup guide, and role summary examples.',
    action: 'Open Resume Tools',
    route: '/resume',
    icon: FileText,
  },
  {
    title: 'DSA Pattern Sheet',
    description: 'Curated problem patterns with attempt targets, hints, and revision notes for interview speed.',
    action: 'Start Practice',
    route: '/practice',
    icon: ClipboardCheck,
  },
  {
    title: 'Mock Interview Room',
    description: 'Use mentor sessions for live feedback or AI coaching for instant drills before applying.',
    action: 'Book Mock',
    route: null,
    icon: Users,
  },
  {
    title: 'Job Match Board',
    description: 'Review relevant jobs, compare skill gaps, and prioritize applications based on your roadmap.',
    action: 'View Jobs',
    route: '/jobs',
    icon: BriefcaseBusiness,
  },
];

const readinessChecklist = [
  'Resume has measurable project outcomes',
  'GitHub profile has pinned projects',
  'Can solve 2 timed coding problems daily',
  'Can explain one major project end-to-end',
  'Has 5 HR stories using STAR format',
];

export default function PlacementPrep() {
  const navigate = useNavigate();
  const { roadmapKey } = useParams();

  const activeRoadmap = useMemo(() => {
    if (roadmapKey && roadmapKey in ROADMAP_META) {
      return roadmapKey as RoadmapKey;
    }

    return DEFAULT_ROADMAP;
  }, [roadmapKey]);

  const meta = ROADMAP_META[activeRoadmap];

  const handleResourceClick = (route: string | null) => {
    navigate(route || meta.mentorRoute);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(meta.backRoute)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roadmap
          </Button>
          <Badge variant="outline" className="hidden border-blue-500/30 text-blue-300 sm:inline-flex">
            {meta.label} Placement Track
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-6">
          <Card className="overflow-hidden border-border bg-card">
            <CardContent className="relative p-6 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.28),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.8),transparent)]" />
              <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-5">
                  <Badge className="bg-blue-500/15 text-blue-200 hover:bg-blue-500/20">
                    Placement and interview prep
                  </Badge>
                  <div className="space-y-3">
                    <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                      Get interview-ready for {meta.role} roles
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                      A guided mockup for converting your roadmap progress into applications, interview practice,
                      role-specific revision, and confident placement readiness.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/practice')} className="bg-blue-600 hover:bg-blue-500">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Practice Drill
                    </Button>
                    <Button variant="outline" onClick={() => navigate(meta.mentorRoute)}>
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Book Mock Interview
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-500/25 bg-slate-950/70 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-blue-300">Readiness</p>
                      <p className="mt-1 text-3xl font-bold">68%</p>
                    </div>
                    <div className="rounded-full border border-blue-400/30 bg-blue-500/10 p-3">
                      <Radar className="h-6 w-6 text-blue-300" />
                    </div>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    Complete the mock interview and resume checklist to unlock application-ready status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Prep materials', value: '24+', icon: FileText },
              { label: 'Mock rounds', value: '8', icon: Timer },
              { label: 'Target outcome', value: 'Job-ready', icon: Trophy },
            ].map((item) => (
              <Card key={item.label} className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <item.icon className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Role-specific interview rounds</CardTitle>
              <CardDescription>{meta.focus}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {prepTracks.map((track) => (
                <div
                  key={track.title}
                  className="group rounded-2xl border border-border bg-background/60 p-5 transition hover:border-blue-500/50 hover:bg-blue-500/5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                      <track.icon className="h-5 w-5 text-blue-300" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {track.duration}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{track.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{track.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>4-week placement sprint</CardTitle>
              <CardDescription>A clean flow from profile polish to final mock and applications.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {weeklyPlan.map((week, index) => (
                <div key={week.week} className="rounded-2xl border border-border bg-background/60 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-blue-300">{week.week}</p>
                      <h3 className="font-semibold">{week.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {week.items.map((item) => (
                      <p key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Materials and learning resources</CardTitle>
              <CardDescription>Everything a learner needs after finishing the roadmap.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <button
                  key={resource.title}
                  type="button"
                  onClick={() => handleResourceClick(resource.route)}
                  className="group rounded-2xl border border-border bg-background/60 p-5 text-left transition hover:border-blue-500/50 hover:bg-blue-500/5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                      <resource.icon className="h-5 w-5 text-blue-300" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-blue-300" />
                  </div>
                  <h3 className="font-semibold">{resource.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.description}</p>
                  <p className="mt-4 text-sm font-medium text-blue-300">{resource.action}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-blue-300" />
                Next best action
              </CardTitle>
              <CardDescription>Suggested order for this learner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Fix resume project bullets',
                'Complete one timed DSA set',
                'Book a mock interview',
                'Apply to 5 matched jobs',
              ].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-blue-300" />
                Readiness checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readinessChecklist.map((item, index) => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <div
                    className={`mt-0.5 rounded-full border p-0.5 ${
                      index < 2
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className={index < 2 ? 'text-foreground' : 'text-muted-foreground'}>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-blue-500/25 bg-blue-500/10">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-sm font-semibold text-blue-200">Mock interview slot</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Run a 30-minute role-specific round and get feedback on clarity, depth, and confidence.
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => navigate(meta.mentorRoute)}>
                Schedule Mock
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
