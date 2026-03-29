import { Users, BriefcaseBusiness, ClipboardCheck } from 'lucide-react';
import { initialNodes, initialEdges } from '@/data/backendRoadmapFlow';
import type { RoadmapFlowConfig } from '@/types/roadmapFlow';

const BACKEND_NODE_DETAILS = {
  'be-nodejs': {
    description: 'Node.js fundamentals for backend runtime behavior, async I/O, and high-throughput service design.',
    resources: [
      { title: 'Node.js Learn Docs', url: 'https://nodejs.org/en/learn' },
      { title: 'Node Architecture Guide', url: 'https://nodejs.org/en/docs/guides/' },
    ],
  },
  'be-express': {
    description: 'Build production-ready APIs with routing, middleware chains, and layered architecture patterns.',
    resources: [
      { title: 'Express Guide', url: 'https://expressjs.com/en/guide/routing.html' },
      { title: 'Node API Design Patterns', url: 'https://www.youtube.com/watch?v=JLGtF4Y4M2o' },
    ],
  },
  'be-databases': {
    description: 'Master relational data modeling, migrations, indexing, and transactional integrity for backend systems.',
    resources: [
      { title: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/' },
      { title: 'SQL Performance Tuning Basics', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY' },
    ],
  },
};

const BACKEND_PROJECTS = [
  {
    id: 'backend-api-starter',
    title: 'REST API Starter Service',
    description:
      'Build a clean Express API with route modules, validation, centralized error handling, and health endpoints.',
    skills: ['Node.js', 'Express', 'Validation', 'Error Handling'],
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  },
  {
    id: 'auth-api-service',
    title: 'Authentication API',
    description:
      'Implement sign up/login, JWT or session auth, role-based access control, and protected endpoints.',
    skills: ['JWT', 'RBAC', 'Security', 'PostgreSQL'],
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  },
  {
    id: 'scalable-backend-platform',
    title: 'Scalable Backend Platform',
    description:
      'Design and deploy a production-style backend with queues, caching, CI/CD, metrics, and reliability patterns.',
    skills: ['Redis', 'Queues', 'Docker', 'CI/CD', 'Observability'],
    difficulty: 'Advanced',
    difficultyColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
] as const;

const BACKEND_CAREER_FEATURES = [
  {
    id: 'mentor-sessions',
    title: '1:1 Mentor-Mentee Sessions',
    highlights: ['Human + AI guidance', 'Weekly goal tracking', 'Code and portfolio feedback'],
    action: 'Open Mentorship',
    icon: Users,
    accent: 'from-indigo-500/25 to-blue-500/20 border-indigo-500/30',
  },
  {
    id: 'recommended-jobs',
    title: 'Roadmap-Based Job Recommendations',
    highlights: ['Backend-focused listings', 'Skill-gap indicators', 'Smart role prioritization'],
    action: 'View Job Matches',
    icon: BriefcaseBusiness,
    accent: 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30',
    actionType: 'job-matches' as const,
  },
  {
    id: 'interview-prep',
    title: 'Placement & Interview Preparation',
    highlights: ['Timed coding tests', 'Question bank + patterns', 'Mock interview tracks'],
    action: 'Start Prep Track',
    icon: ClipboardCheck,
    accent: 'from-violet-500/25 to-fuchsia-500/20 border-violet-500/30',
    actionType: 'navigate' as const,
    actionTarget: '/practice',
  },
] as const;

const BACKEND_MAIN_SECTION_IDS = [
  'be-internet',
  'be-os-terminal',
  'be-javascript',
  'be-version-control',
  'be-nodejs',
  'be-package-managers',
  'be-express',
  'be-api-design',
  'be-databases',
  'be-auth',
  'be-caching-queues',
  'be-testing',
  'be-security',
  'be-deployment',
  'be-system-design',
] as const;

const BACKEND_FAQS = [
  {
    id: 'bq1',
    question: 'Should I master JavaScript before starting Node.js backend?',
    answer:
      'Yes. You should be comfortable with asynchronous JavaScript, promises, and error handling before deep backend work.',
  },
  {
    id: 'bq2',
    question: 'Do I need to learn SQL even if I use an ORM?',
    answer:
      'Absolutely. ORMs are productivity tools, but SQL understanding is required for debugging, optimization, and complex querying.',
  },
  {
    id: 'bq3',
    question: 'What is more important first: authentication or database design?',
    answer:
      'Start with a basic schema and core API flow, then add authentication early so permissions are built into your architecture.',
  },
  {
    id: 'bq4',
    question: 'When should I introduce Redis or queues?',
    answer:
      'Introduce them when request latency, heavy background work, or throughput needs exceed what direct request-response can handle.',
  },
  {
    id: 'bq5',
    question: 'How much backend testing is enough for junior readiness?',
    answer:
      'A strong baseline includes unit tests for services, integration tests for API routes, and one CI pipeline running tests on push.',
  },
  {
    id: 'bq6',
    question: 'Is Docker mandatory for backend jobs?',
    answer:
      'Not mandatory for every role, but highly recommended. Most teams use containers somewhere in dev, CI, or production deployment.',
  },
  {
    id: 'bq7',
    question: 'How can I show backend skills in my portfolio?',
    answer:
      'Publish API repos with documentation, tests, environment setup, architecture notes, and production deployment links.',
  },
  {
    id: 'bq8',
    question: 'What makes a backend roadmap project production-like?',
    answer:
      'Validation, security controls, logging, health checks, CI/CD, and clear deployment docs make projects look production-ready.',
  },
] as const;

export const backendRoadmapConfig: RoadmapFlowConfig = {
  roadmapKey: 'backend',
  title: 'Backend Development Roadmap',
  breadcrumbLabel: 'Backend',
  detailRoute: '/roadmap/backend-nodejs',
  mentorRoute: '/roadmap/backend-nodejs/mentor',
  sectionCollapseEnabled: true,
  defaultCollapsedSectionIds: [],
  flowNodes: initialNodes,
  flowEdges: initialEdges,
  mainNodeIds: [...BACKEND_MAIN_SECTION_IDS],
  mainSectionIds: [...BACKEND_MAIN_SECTION_IDS],
  nodeDetails: BACKEND_NODE_DETAILS,
  projects: BACKEND_PROJECTS,
  faqs: BACKEND_FAQS,
  careerSupportFeatures: BACKEND_CAREER_FEATURES,
  modules: {
    projects: true,
    comments: true,
    privacyWarning: true,
    careerSupport: true,
    jobMatches: true,
    faq: true,
    lockGate: false,
  },
  uiText: {
    projectSectionKicker: 'Backend Projects',
    projectSectionTitle: 'Build API-First Systems',
    projectSectionDescription:
      'Build backend services that are testable, secure, and deployable. Submit your GitHub links to track practical progress.',
    faqKicker: 'Backend Roadmap',
    faqTitle: 'Frequently Asked Questions',
    faqDescription:
      'Answers to common backend learning questions on APIs, databases, deployment, and interview readiness.',
    careerKicker: 'Career Acceleration',
    careerTitle: 'Career Launchpad',
    careerDescription:
      'Focused support modules to help convert roadmap progress into internships and full-time interviews.',
  },
};
