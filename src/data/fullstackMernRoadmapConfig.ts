import { Users, BriefcaseBusiness, ClipboardCheck } from 'lucide-react';
import { initialNodes, initialEdges } from '@/data/fullstackMernRoadmapFlow';
import type { RoadmapFlowConfig } from '@/types/roadmapFlow';

const FULLSTACK_MERN_NODE_DETAILS = {
  'fs-react-core': {
    description: 'Build robust UI architecture with reusable components, hooks, and data-fetching boundaries.',
    resources: [
      { title: 'React Learn', url: 'https://react.dev/learn' },
      { title: 'React Router Docs', url: 'https://reactrouter.com/en/main' },
    ],
  },
  'fs-express-api': {
    description: 'Design API routes, middleware, validation, and service layers for clean backend architecture.',
    resources: [
      { title: 'Express Guide', url: 'https://expressjs.com/en/guide/routing.html' },
      { title: 'Zod Documentation', url: 'https://zod.dev/' },
    ],
  },
  'fs-mongodb-data': {
    description: 'Model real-world domains with MongoDB collections, indexes, and scalable query patterns.',
    resources: [
      { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' },
      { title: 'Mongoose Docs', url: 'https://mongoosejs.com/docs/' },
    ],
  },
};

const FULLSTACK_MERN_PROJECTS = [
  {
    id: 'mern-crm-foundation',
    title: 'MERN CRM Foundation',
    description:
      'Build a role-based CRM with auth, customer pipeline CRUD, and protected React dashboard routes.',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  },
  {
    id: 'mern-realtime-collab',
    title: 'Real-time Collaboration Workspace',
    description:
      'Create a collaborative full stack app with live updates, activity feeds, and audit-friendly backend events.',
    skills: ['WebSocket', 'Mongoose', 'State Sync', 'Permissions'],
    difficulty: 'Advanced',
    difficultyColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
  {
    id: 'mern-production-platform',
    title: 'Production-ready MERN Platform',
    description:
      'Ship a deployable platform with CI/CD, observability, performance tuning, and reliability runbooks.',
    skills: ['CI/CD', 'Monitoring', 'Caching', 'Security', 'Architecture'],
    difficulty: 'Advanced',
    difficultyColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
] as const;

const FULLSTACK_MERN_CAREER_FEATURES = [
  {
    id: 'mentor-sessions',
    title: '1:1 Mentor-Mentee Sessions',
    highlights: ['System design feedback', 'Architecture review loops', 'Portfolio positioning support'],
    action: 'Open Mentorship',
    icon: Users,
    accent: 'from-indigo-500/25 to-blue-500/20 border-indigo-500/30',
  },
  {
    id: 'recommended-jobs',
    title: 'Roadmap-Based Job Recommendations',
    highlights: ['Full stack role matching', 'Skill-gap indicators', 'Priority shortlist'],
    action: 'View Job Matches',
    icon: BriefcaseBusiness,
    accent: 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30',
    actionType: 'job-matches' as const,
  },
  {
    id: 'interview-prep',
    title: 'Placement & Interview Preparation',
    highlights: ['MERN interview drills', 'API + React scenario bank', 'Timed assessments'],
    action: 'Start Prep Track',
    icon: ClipboardCheck,
    accent: 'from-violet-500/25 to-fuchsia-500/20 border-violet-500/30',
    actionType: 'navigate' as const,
    actionTarget: '/practice',
  },
] as const;

const FULLSTACK_MERN_MAIN_SECTION_IDS = [
  'fs-internet',
  'fs-frontend-foundations',
  'fs-react-core',
  'fs-typescript-state',
  'fs-nodejs-core',
  'fs-express-api',
  'fs-mongodb-data',
  'fs-auth-security',
  'fs-fullstack-integration',
  'fs-testing-quality',
  'fs-performance',
  'fs-devops-cicd',
  'fs-deployment-cloud',
  'fs-monitoring',
  'fs-capstone',
] as const;

const FULLSTACK_MERN_FAQS = [
  {
    id: 'mq1',
    question: 'Should I learn React and Node separately before MERN projects?',
    answer:
      'Yes. Build basic frontend and backend confidence first, then combine them in integration-focused MERN projects.',
  },
  {
    id: 'mq2',
    question: 'Is MongoDB mandatory for every full stack job?',
    answer:
      'No. Many roles use SQL databases. MERN still teaches transferable full stack architecture and API design skills.',
  },
  {
    id: 'mq3',
    question: 'When should I add TypeScript in MERN?',
    answer:
      'Start early if possible. TypeScript improves API contracts and refactoring safety across frontend and backend.',
  },
  {
    id: 'mq4',
    question: 'How do I make a MERN project look production-ready?',
    answer:
      'Add validation, auth hardening, tests, CI/CD, observability, and clear architecture documentation.',
  },
  {
    id: 'mq5',
    question: 'How much testing is expected for junior full stack roles?',
    answer:
      'A strong baseline includes component tests, API integration tests, and one E2E happy-path flow.',
  },
  {
    id: 'mq6',
    question: 'Should I learn Docker for MERN interviews?',
    answer:
      'Highly recommended. Many teams expect container basics for local setup and deployment workflows.',
  },
  {
    id: 'mq7',
    question: 'Can I get hired with one major MERN capstone?',
    answer:
      'Yes, if it demonstrates clean architecture, secure auth, tests, deployment, and a clear product story.',
  },
  {
    id: 'mq8',
    question: 'What is the biggest MERN skill gap in interviews?',
    answer:
      'Most gaps are in system integration and debugging across layers, not in isolated React or Node syntax.',
  },
] as const;

export const fullstackMernRoadmapConfig: RoadmapFlowConfig = {
  roadmapKey: 'fullstack-mern',
  title: 'Full Stack MERN Development Roadmap',
  breadcrumbLabel: 'MERN',
  detailRoute: '/roadmap/fullstack-mern',
  mentorRoute: '/roadmap/fullstack-mern/mentor',
  sectionCollapseEnabled: true,
  defaultCollapsedSectionIds: [],
  flowNodes: initialNodes,
  flowEdges: initialEdges,
  mainNodeIds: [...FULLSTACK_MERN_MAIN_SECTION_IDS],
  mainSectionIds: [...FULLSTACK_MERN_MAIN_SECTION_IDS],
  nodeDetails: FULLSTACK_MERN_NODE_DETAILS,
  projects: FULLSTACK_MERN_PROJECTS,
  faqs: FULLSTACK_MERN_FAQS,
  careerSupportFeatures: FULLSTACK_MERN_CAREER_FEATURES,
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
    projectSectionKicker: 'MERN Projects',
    projectSectionTitle: 'Ship Full Stack Products',
    projectSectionDescription:
      'Build end-to-end MERN products with clean architecture, reliable APIs, and polished user experience.',
    faqKicker: 'MERN Roadmap',
    faqTitle: 'Frequently Asked Questions',
    faqDescription:
      'Practical answers to common MERN learning, project, interview, and deployment questions.',
    careerKicker: 'Career Acceleration',
    careerTitle: 'Career Launchpad',
    careerDescription:
      'Focused support modules to help convert roadmap progress into internships and full-time interviews.',
  },
};
