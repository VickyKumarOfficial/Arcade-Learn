import { Users, BriefcaseBusiness, ClipboardCheck } from 'lucide-react';
import { initialNodes, initialEdges } from '@/data/frontendRoadmapFlow';
import type { RoadmapFlowConfig } from '@/types/roadmapFlow';

const FRONTEND_NODE_DETAILS = {
  internet: {
    description: 'Understand how the web works at a fundamental level - requests, responses, DNS, HTTP, hosting, and browser mechanics.',
    resources: [
      { title: 'How the Internet Works - MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work' },
      { title: 'What is HTTP? - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
      { title: 'DNS Explained - Cloudflare', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' },
      { title: 'How Browsers Work - web.dev', url: 'https://web.dev/articles/howbrowserswork' },
      { title: 'HTTP Crash Course - Traversy Media (YouTube)', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0' },
      { title: 'CS50 - How the Internet Works (Video)', url: 'https://www.youtube.com/watch?v=n_KghQP86Sw' },
    ],
  },
  html: {
    description: 'HTML is the backbone of every webpage. Learn semantic elements, forms, accessibility, and SEO basics.',
    resources: [
      { title: 'HTML - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { title: 'HTML Full Course - freeCodeCamp (YouTube)', url: 'https://www.youtube.com/watch?v=kUMe1FH4CHE' },
      { title: 'Semantic HTML - web.dev', url: 'https://web.dev/learn/html/semantic-html' },
      { title: 'HTML Forms - MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms' },
      { title: 'A11y (Accessibility) Guide - a11yproject.com', url: 'https://www.a11yproject.com/checklist/' },
      { title: 'HTML Reference - htmlreference.io', url: 'https://htmlreference.io/' },
    ],
  },
  css: {
    description: 'Style your pages with CSS - master the box model, Flexbox, Grid, responsive design, and animations.',
    resources: [
      { title: 'Learn CSS - web.dev', url: 'https://web.dev/learn/css/' },
      { title: 'CSS - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { title: 'Flexbox Froggy (Interactive)', url: 'https://flexboxfroggy.com/' },
      { title: 'CSS Grid Garden (Interactive)', url: 'https://cssgridgarden.com/' },
      { title: 'CSS Full Course - Kevin Powell (YouTube)', url: 'https://www.youtube.com/kepowob' },
      { title: 'CSS Reference - cssreference.io', url: 'https://cssreference.io/' },
    ],
  },
  javascript: {
    description: 'JavaScript brings interactivity to the web. Learn ES6+, DOM manipulation, async/await, Promises, and Fetch API.',
    resources: [
      { title: 'Modern JavaScript - javascript.info', url: 'https://javascript.info/' },
      { title: 'JavaScript - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { title: 'JavaScript Full Course - freeCodeCamp (YouTube)', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
      { title: 'Eloquent JavaScript (Free Book)', url: 'https://eloquentjavascript.net/' },
      { title: 'ES6+ Features - exploringjs.com', url: 'https://exploringjs.com/es6/' },
      { title: 'JavaScript Algorithms & DS - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
    ],
  },
  'version-control': {
    description: 'Git lets you track changes, collaborate, and maintain your code history. It is an essential tool for every developer.',
    resources: [
      { title: 'Git Official Documentation', url: 'https://git-scm.com/doc' },
      { title: 'Git & GitHub Crash Course - Traversy Media (YouTube)', url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc' },
      { title: 'Pro Git (Free Book)', url: 'https://git-scm.com/book/en/v2' },
      { title: 'Learn Git Branching (Interactive)', url: 'https://learngitbranching.js.org/' },
      { title: 'Git Cheat Sheet - GitHub', url: 'https://education.github.com/git-cheat-sheet-education.pdf' },
    ],
  },
};

const FRONTEND_PROJECTS = [
  {
    id: 'portfolio',
    title: 'Personal Portfolio',
    description:
      'Build a responsive personal portfolio showcasing your name, bio, skills, and links to your GitHub and social profiles.',
    skills: ['HTML', 'CSS', 'Responsive Design'],
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  },
  {
    id: 'weather-app',
    title: 'Weather App',
    description:
      'Fetch live weather data from the OpenWeatherMap API and display temperature, conditions, humidity, and a 5-day forecast.',
    skills: ['JavaScript', 'Fetch API', 'Async/Await'],
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  },
  {
    id: 'fullstack-frontend',
    title: 'Full Frontend App',
    description:
      'Pick any real-world idea (for example expense tracker, recipe app, or job board) and build it with a framework, routing, state, and APIs.',
    skills: ['React / Vue', 'TypeScript', 'State Mgmt', 'Routing', 'API'],
    difficulty: 'Advanced',
    difficultyColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
] as const;

const FRONTEND_CAREER_FEATURES = [
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
    highlights: ['Frontend-focused listings', 'Skill-gap indicators', 'Smart role prioritization'],
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

const FRONTEND_MAIN_NODE_IDS = [
  'internet',
  'html',
  'css',
  'javascript',
  'version-control',
  'vcs-hosting',
  'pkg-managers',
  'framework',
  'css-frameworks',
  'build-tools',
  'typescript',
  'testing',
  'security',
  'performance',
  'deployment',
] as const;

const FRONTEND_FAQS = [
  {
    id: 'fq1',
    question: 'Do I need to learn HTML, CSS, and JavaScript in order?',
    answer: 'Yes. HTML gives structure, CSS adds visual style, and JavaScript adds interactivity. Skipping fundamentals makes frameworks harder.',
  },
  {
    id: 'fq2',
    question: 'Which JavaScript framework should I learn first?',
    answer: 'React is the most in-demand by job listings and has a large ecosystem. Once comfortable, Vue or Angular become easier to pick up.',
  },
  {
    id: 'fq3',
    question: 'Is TypeScript mandatory for frontend development?',
    answer: 'Not mandatory, but increasingly expected. Most modern codebases use TypeScript for safer refactoring and better editor support.',
  },
  {
    id: 'fq4',
    question: 'How long does it take to become job-ready as a frontend developer?',
    answer: 'With consistent study (3-5 hours daily), many learners become junior-ready in 6-12 months with projects and fundamentals completed.',
  },
  {
    id: 'fq5',
    question: 'What is the difference between Tailwind and Bootstrap?',
    answer: 'Bootstrap offers pre-built components. Tailwind provides utility classes for custom designs. Tailwind offers flexibility; Bootstrap is faster for prototyping.',
  },
  {
    id: 'fq6',
    question: 'Why do I need a build tool like Vite or Webpack?',
    answer: 'Build tools bundle and optimize assets, handle module resolution and transpilation, and improve DX with hot reload and production optimization.',
  },
  {
    id: 'fq7',
    question: 'How important is accessibility for frontend developers?',
    answer: 'Very important. Semantic HTML, keyboard navigation, labels, and contrast are key for usability and often legal compliance.',
  },
  {
    id: 'fq8',
    question: 'Where should I deploy frontend projects?',
    answer: 'Vercel and Netlify are easiest for React/Vite projects, with fast CI/CD previews and free tiers for early portfolios.',
  },
] as const;

export const frontendRoadmapConfig: RoadmapFlowConfig = {
  roadmapKey: 'frontend',
  title: 'Frontend Development Roadmap',
  breadcrumbLabel: 'Frontend',
  detailRoute: '/roadmap/frontend-react',
  mentorRoute: '/roadmap/frontend-react/mentor',
  sectionCollapseEnabled: true,
  defaultCollapsedSectionIds: [],
  flowNodes: initialNodes,
  flowEdges: initialEdges,
  mainNodeIds: [...FRONTEND_MAIN_NODE_IDS],
  mainSectionIds: [...FRONTEND_MAIN_NODE_IDS],
  nodeDetails: FRONTEND_NODE_DETAILS,
  projects: FRONTEND_PROJECTS,
  faqs: FRONTEND_FAQS,
  careerSupportFeatures: FRONTEND_CAREER_FEATURES,
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
    projectSectionKicker: 'Hands-on Practice',
    projectSectionTitle: 'Build Real Projects',
    projectSectionDescription:
      'Reading is not enough. Build projects, push code to GitHub, and submit links to track applied progress.',
    faqKicker: 'Frontend Roadmap',
    faqTitle: 'Frequently Asked Questions',
    faqDescription:
      'Common questions about learning frontend development - from where to start to landing your first role.',
    careerKicker: 'Career Acceleration',
    careerTitle: 'Career Launchpad',
    careerDescription:
      'Focused support modules to help convert roadmap progress into internships and full-time interviews.',
  },
};
