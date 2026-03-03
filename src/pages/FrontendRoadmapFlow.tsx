import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Node,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, CheckSquare, ChevronDown, ChevronRight, Code2, X, Zap,
  Github, Send, Link2, CheckCircle2, AlertCircle, FolderGit2, Trash2, Trophy, Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

import { nodeTypes } from '@/components/roadmap/RoadmapFlowNodes';
import Footer from '@/components/Footer';
import NodeDetailSidebar from '@/components/roadmap/NodeDetailSidebar';
import { SECTION_NODE_MAP, ALL_NODE_DETAILS } from '@/data/allNodeDetails';
import { initialNodes, initialEdges, RoadmapNodeData } from '@/data/frontendRoadmapFlow';

// Exact bounding box of all nodes + padding
const CANVAS_W = 1040;
const CANVAS_H = 2700;

// ── Node detail side-panel data ───────────────────────────────────────────────
const NODE_DETAILS: Record<string, { description: string; resources: { title: string; url: string }[] }> = {
  internet: {
    description: 'Understand how the web works at a fundamental level — requests, responses, DNS, HTTP, hosting, and browser mechanics.',
    resources: [
      { title: 'How the Internet Works – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work' },
      { title: 'What is HTTP? – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
      { title: 'DNS Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' },
      { title: 'How Browsers Work – web.dev', url: 'https://web.dev/articles/howbrowserswork' },
      { title: 'HTTP Crash Course – Traversy Media (YouTube)', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0' },
      { title: 'CS50 – How the Internet Works (Video)', url: 'https://www.youtube.com/watch?v=n_KghQP86Sw' },
    ],
  },
  html: {
    description: 'HTML is the backbone of every webpage. Learn semantic elements, forms, accessibility, and SEO basics.',
    resources: [
      { title: 'HTML – MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { title: 'HTML Full Course – freeCodeCamp (YouTube)', url: 'https://www.youtube.com/watch?v=kUMe1FH4CHE' },
      { title: 'Semantic HTML – web.dev', url: 'https://web.dev/learn/html/semantic-html' },
      { title: 'HTML Forms – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms' },
      { title: 'A11y (Accessibility) Guide – a11yproject.com', url: 'https://www.a11yproject.com/checklist/' },
      { title: 'HTML Reference – htmlreference.io', url: 'https://htmlreference.io/' },
    ],
  },
  css: {
    description: 'Style your pages with CSS — master the box model, Flexbox, Grid, responsive design, and animations.',
    resources: [
      { title: 'Learn CSS – web.dev', url: 'https://web.dev/learn/css/' },
      { title: 'CSS – MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { title: 'Flexbox Froggy (Interactive)', url: 'https://flexboxfroggy.com/' },
      { title: 'CSS Grid Garden (Interactive)', url: 'https://cssgridgarden.com/' },
      { title: 'CSS Full Course – Kevin Powell (YouTube)', url: 'https://www.youtube.com/kepowob' },
      { title: 'CSS Reference – cssreference.io', url: 'https://cssreference.io/' },
    ],
  },
  javascript: {
    description: 'JavaScript brings interactivity to the web. Learn ES6+, DOM manipulation, async/await, Promises, and Fetch API.',
    resources: [
      { title: 'Modern JavaScript – javascript.info', url: 'https://javascript.info/' },
      { title: 'JavaScript – MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { title: 'JavaScript Full Course – freeCodeCamp (YouTube)', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
      { title: 'Eloquent JavaScript (Free Book)', url: 'https://eloquentjavascript.net/' },
      { title: 'ES6+ Features – exploringjs.com', url: 'https://exploringjs.com/es6/' },
      { title: 'JavaScript Algorithms & DS – freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
    ],
  },
  'version-control': {
    description: 'Git lets you track changes, collaborate, and maintain your code history. It is an essential tool for every developer.',
    resources: [
      { title: 'Git Official Documentation', url: 'https://git-scm.com/doc' },
      { title: 'Git & GitHub Crash Course – Traversy Media (YouTube)', url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc' },
      { title: 'Pro Git (Free Book)', url: 'https://git-scm.com/book/en/v2' },
      { title: 'Learn Git Branching (Interactive)', url: 'https://learngitbranching.js.org/' },
      { title: 'Git Cheat Sheet – GitHub', url: 'https://education.github.com/git-cheat-sheet-education.pdf' },
    ],
  },
  'vcs-hosting': {
    description: 'Host your Git repositories on GitHub or GitLab for collaboration, pull requests, and CI/CD workflows.',
    resources: [
      { title: 'GitHub Docs', url: 'https://docs.github.com/en' },
      { title: 'GitLab Docs', url: 'https://docs.gitlab.com/' },
      { title: 'GitHub Flow Guide', url: 'https://docs.github.com/en/get-started/using-github/github-flow' },
      { title: 'GitHub Actions (CI/CD)', url: 'https://docs.github.com/en/actions' },
      { title: 'GitHub for Beginners – freeCodeCamp (YouTube)', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' },
    ],
  },
  'pkg-managers': {
    description: 'Package managers like npm, yarn, pnpm, and Bun let you install, update, and manage project dependencies efficiently.',
    resources: [
      { title: 'npm Documentation', url: 'https://docs.npmjs.com/' },
      { title: 'pnpm Documentation', url: 'https://pnpm.io/' },
      { title: 'Yarn Documentation', url: 'https://yarnpkg.com/getting-started' },
      { title: 'Bun Documentation', url: 'https://bun.sh/docs' },
      { title: 'npm vs yarn vs pnpm – comparison', url: 'https://blog.logrocket.com/javascript-package-managers-compared/' },
    ],
  },
  framework: {
    description: 'JavaScript frameworks help you build complex UIs efficiently with components, state management, and routing.',
    resources: [
      { title: 'React Official Docs', url: 'https://react.dev/learn' },
      { title: 'Vue.js Official Docs', url: 'https://vuejs.org/guide/introduction' },
      { title: 'Angular Official Docs', url: 'https://angular.dev/overview' },
      { title: 'Svelte Official Docs', url: 'https://svelte.dev/docs/introduction' },
      { title: 'React Full Course – Scrimba', url: 'https://scrimba.com/learn/learnreact' },
      { title: 'Framework Comparison – State of JS', url: 'https://stateofjs.com/en-US' },
    ],
  },
  'css-frameworks': {
    description: 'CSS frameworks accelerate styling. Tailwind offers utility classes; Bootstrap and MUI provide pre-built components.',
    resources: [
      { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs' },
      { title: 'Bootstrap Docs', url: 'https://getbootstrap.com/docs/' },
      { title: 'Material UI (MUI) Docs', url: 'https://mui.com/material-ui/getting-started/' },
      { title: 'Tailwind Crash Course – Traversy Media (YouTube)', url: 'https://www.youtube.com/watch?v=dFgzHOX84xQ' },
      { title: 'shadcn/ui – Component Library', url: 'https://ui.shadcn.com/' },
    ],
  },
  'build-tools': {
    description: 'Build tools bundle, transpile, and optimize your code. Linters and formatters enforce code quality and consistency.',
    resources: [
      { title: 'Vite Guide', url: 'https://vitejs.dev/guide/' },
      { title: 'Webpack Documentation', url: 'https://webpack.js.org/concepts/' },
      { title: 'ESLint Getting Started', url: 'https://eslint.org/docs/latest/use/getting-started' },
      { title: 'Prettier Documentation', url: 'https://prettier.io/docs/en/index.html' },
      { title: 'Vite vs Webpack – comparison', url: 'https://vitejs.dev/guide/why.html' },
    ],
  },
  typescript: {
    description: 'TypeScript adds static types to JavaScript, catching bugs at compile time and improving IDE support.',
    resources: [
      { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
      { title: 'TypeScript for JavaScript Programmers', url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html' },
      { title: 'TypeScript Full Course – Matt Pocock (YouTube)', url: 'https://www.youtube.com/watch?v=SpwzRDUQ1GI' },
      { title: 'Total TypeScript – Free Tutorials', url: 'https://www.totaltypescript.com/tutorials' },
      { title: 'TypeScript Deep Dive (Free Book)', url: 'https://basarat.gitbook.io/typescript/' },
      { title: 'TS Playground – Try Online', url: 'https://www.typescriptlang.org/play' },
    ],
  },
  testing: {
    description: 'Testing ensures your app works correctly. Learn unit tests with Jest/Vitest, component tests with RTL, and E2E with Cypress.',
    resources: [
      { title: 'Vitest Documentation', url: 'https://vitest.dev/guide/' },
      { title: 'Jest Documentation', url: 'https://jestjs.io/docs/getting-started' },
      { title: 'React Testing Library Docs', url: 'https://testing-library.com/docs/react-testing-library/intro/' },
      { title: 'Cypress Documentation', url: 'https://docs.cypress.io/app/get-started/why-cypress' },
      { title: 'Playwright Documentation', url: 'https://playwright.dev/docs/intro' },
      { title: 'Testing JavaScript – Kent C. Dodds', url: 'https://testingjavascript.com/' },
    ],
  },
  security: {
    description: 'Web security protects users and data. Learn HTTPS, CORS, Content Security Policy, and the OWASP Top 10 vulnerabilities.',
    resources: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'Web Security – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/Security' },
      { title: 'HTTPS Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/ssl/what-is-https/' },
      { title: 'CORS – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' },
      { title: 'Content Security Policy – web.dev', url: 'https://web.dev/articles/csp' },
      { title: 'Web Security Academy – PortSwigger', url: 'https://portswigger.net/web-security' },
    ],
  },
  performance: {
    description: 'Optimize Core Web Vitals, implement lazy loading and code splitting, and use Lighthouse to audit your app.',
    resources: [
      { title: 'Core Web Vitals – web.dev', url: 'https://web.dev/vitals/' },
      { title: 'Performance – MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance' },
      { title: 'Lighthouse Docs', url: 'https://developer.chrome.com/docs/lighthouse/overview/' },
      { title: 'Lazy Loading – web.dev', url: 'https://web.dev/articles/lazy-loading' },
      { title: 'Code Splitting – web.dev', url: 'https://web.dev/articles/code-splitting-suspense' },
      { title: 'Web Performance Fundamentals – Frontend Masters', url: 'https://frontendmasters.com/courses/web-perf/' },
    ],
  },
  deployment: {
    description: 'Deploy your app to platforms like Vercel or Netlify, or set up Docker containers and CI/CD pipelines for cloud deployments.',
    resources: [
      { title: 'Vercel Documentation', url: 'https://vercel.com/docs' },
      { title: 'Netlify Documentation', url: 'https://docs.netlify.com/' },
      { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/' },
      { title: 'GitHub Actions CI/CD', url: 'https://docs.github.com/en/actions/use-cases-and-examples/deploying/deploying-with-github-actions' },
      { title: 'AWS Amplify Docs', url: 'https://docs.amplify.aws/' },
      { title: 'DevOps Roadmap – roadmap.sh', url: 'https://roadmap.sh/devops' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────

// ── Capstone projects (1 per difficulty level) ────────────────────────────────
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
      'Pick any real-world idea (e.g. expense tracker, recipe app, job board), build it with a framework, routing, global state, and a public API or your own backend.',
    skills: ['React / Vue', 'TypeScript', 'State Mgmt', 'Routing', 'API'],
    difficulty: 'Advanced',
    difficultyColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
] as const;

type ProjectId = (typeof FRONTEND_PROJECTS)[number]['id'];

interface Submission {
  id: string;
  projectId: ProjectId;
  url: string;
  date: string;
}

// ── IDs of all main section (parent) nodes ────────────────────────────────────
// These get auto-completed once every sub-node under them is marked done.
// Used by the LOCK GATE further below — comment the gate out to bypass.
const MAIN_SECTION_IDS = [
  'internet', 'html', 'css', 'javascript', 'version-control',
  'vcs-hosting', 'pkg-managers', 'framework', 'css-frameworks',
  'build-tools', 'typescript', 'testing', 'security', 'performance', 'deployment',
] as const;

// ─────────────────────────────────────────────────────────────────────────────

const FRONTEND_FAQS = [
  {
    id: 'fq1',
    question: 'Do I need to learn HTML, CSS, and JavaScript in order?',
    answer: 'Yes — they build on each other. HTML gives you structure, CSS adds visual style, and JavaScript adds interactivity. Skipping the fundamentals makes frameworks much harder to understand.',
  },
  {
    id: 'fq2',
    question: 'Which JavaScript framework should I learn first?',
    answer: 'React is the most in-demand framework by job listings and has the largest ecosystem. Once you are comfortable with React concepts (components, state, props), picking up Vue or Angular is much easier.',
  },
  {
    id: 'fq3',
    question: 'Is TypeScript mandatory for frontend development?',
    answer: 'Not mandatory, but increasingly expected. Most modern codebases use TypeScript. Learning it after you are solid with JavaScript is recommended — it will catch bugs early and improve your IDE experience significantly.',
  },
  {
    id: 'fq4',
    question: 'How long does it take to become job-ready as a frontend developer?',
    answer: 'With consistent daily study (3–5 hours), most people reach a junior-ready level in 6–12 months. Covering HTML/CSS/JS fundamentals, one framework, Git, and building 2–3 portfolio projects is typically sufficient.',
  },
  {
    id: 'fq5',
    question: 'What is the difference between CSS frameworks like Tailwind and Bootstrap?',
    answer: 'Bootstrap provides pre-built components (navbars, cards, modals) that you assemble. Tailwind provides low-level utility classes so you build your own design. Tailwind offers more design flexibility; Bootstrap is faster for rapid prototyping.',
  },
  {
    id: 'fq6',
    question: 'Why do I need a build tool like Vite or Webpack?',
    answer: 'Build tools bundle your many source files into optimised assets the browser can load efficiently. They handle module resolution, TypeScript transpilation, code splitting, hot module replacement during development, and tree-shaking to remove unused code.',
  },
  {
    id: 'fq7',
    question: 'What is responsive design and why does it matter?',
    answer: 'Responsive design means your UI adapts to different screen sizes — mobile, tablet, desktop — without separate codebases. Over 60% of web traffic is mobile, so a non-responsive site delivers a poor experience to the majority of visitors.',
  },
  {
    id: 'fq8',
    question: 'How important is accessibility (a11y) for frontend developers?',
    answer: 'Very important — both ethically and legally. Semantic HTML, ARIA labels, keyboard navigation, and sufficient colour contrast ensure your site is usable by people with disabilities. Many companies are legally required to meet WCAG standards.',
  },
  {
    id: 'fq9',
    question: 'Should I learn testing as a beginner?',
    answer: 'A basic understanding of unit and integration testing is valuable from the start. Start with Vitest or Jest for unit tests and React Testing Library for component tests. Full E2E testing with Cypress or Playwright can come later.',
  },
  {
    id: 'fq10',
    question: 'What is the difference between Git and GitHub?',
    answer: 'Git is a version control system that runs locally on your machine to track code changes. GitHub is a cloud hosting platform for Git repositories that adds collaboration features like pull requests, issues, and CI/CD pipelines.',
  },
  {
    id: 'fq11',
    question: 'What are Core Web Vitals and why should I care?',
    answer: "Core Web Vitals (LCP, INP, CLS) are Google metrics that measure real-world user experience — load speed, interactivity, and visual stability. They directly influence your site's Google search ranking, making performance optimisation business-critical.",
  },
  {
    id: 'fq12',
    question: 'Where should I deploy my frontend projects?',
    answer: 'Vercel and Netlify are the easiest options for React/Vite projects — connect your GitHub repo and get instant deployments with CI/CD for free. For more control, explore GitHub Pages for static sites or a VPS with Docker for custom setups.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const MAIN_NODE_IDS = [
  'internet','html','css','javascript','version-control',
  'vcs-hosting','pkg-managers','framework','css-frameworks',
  'build-tools','typescript','testing','security','performance','deployment',
];

export default function FrontendRoadmapFlow() {
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange]          = useEdgesState(initialEdges);
  const [selected, setSelected]            = useState<Node<RoadmapNodeData> | null>(null);
  const [openFaqs, setOpenFaqs]             = useState<string[]>([]);

  // ── Projects section state ─────────────────────────────────────────────────
  const [selectedProject, setSelectedProject] = useState<ProjectId>('portfolio');
  const [githubUrl, setGithubUrl]               = useState('');
  const [submissions, setSubmissions]           = useState<Submission[]>([]);
  const [submitError, setSubmitError]           = useState('');
  const [submitSuccess, setSubmitSuccess]       = useState(false);

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    const trimmed = githubUrl.trim();
    if (!trimmed) { setSubmitError('Please enter a GitHub repository URL.'); return; }

    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname.includes('github.com')) {
        setSubmitError('URL must be a github.com link.');
        return;
      }
    } catch {
      setSubmitError('Please enter a valid URL.');
      return;
    }

    setSubmissions(prev => [
      {
        id: crypto.randomUUID(),
        projectId: selectedProject,
        url: trimmed,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      },
      ...prev,
    ]);
    setGithubUrl('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3500);
  };
  const [showLegend, setShowLegend]          = useState(true);
  const [sidebar, setSidebar] = useState<{ open: boolean; sectionId: string | null; activeNodeId: string | null }>({ open: false, sectionId: null, activeNodeId: null });
  const projectsRef                          = useRef<HTMLDivElement>(null);

  // ── LOCK GATE ─────────────────────────────────────────────────────────────
  // DEV / TEST BYPASS: comment out the line below and uncomment the one after it.
  const completedSectionCount = MAIN_SECTION_IDS.filter(id => nodes.find(n => n.id === id)?.data?.completed === true).length;
  const isProjectsLocked = completedSectionCount < MAIN_SECTION_IDS.length; // [LOCK] comment to bypass
//   const isProjectsLocked = false;                                          // [BYPASS] uncomment to bypass
  // ── END LOCK GATE ─────────────────────────────────────────────────────────

  // Hide legend when Projects section enters the viewport
  useEffect(() => {
    const el = projectsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowLegend(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const toggleFaq = (id: string) =>
    setOpenFaqs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── Node click: open panels only — no completion toggling ─────────────────
  const onNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => {
      if (node.type === 'startNode' || node.type === 'infoCard') return;

      // Any node with known section data → open the generic detail sidebar
      const sectionId = SECTION_NODE_MAP[node.id];
      if (sectionId) {
        setSidebar(prev =>
          prev.open && prev.activeNodeId === node.id
            ? { open: false, sectionId: null, activeNodeId: null }
            : { open: true, sectionId, activeNodeId: node.id },
        );
        return;
      }

      // Fallback: open the generic detail panel for unlisted main nodes
      if (node.type === 'mainNode') {
        setSelected(prev => (prev?.id === node.id ? null : node));
      }
    },
    [],
  );

  // ── Progress ───────────────────────────────────────────────────────────────
  const completedMain = useMemo(
    () => nodes.filter(n => MAIN_NODE_IDS.includes(n.id) && n.data.completed).length,
    [nodes],
  );
  const progressPct = Math.round((completedMain / MAIN_NODE_IDS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">

      {/* ── Sticky top bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10 dark:border-zinc-700/60"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)' }} />

        <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/roadmaps')}
            className="gap-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors px-2.5"
          >
            <ArrowLeft size={15} />
            <span className="text-xs font-medium">Back</span>
          </Button>

          {/* Divider */}
          <div className="h-8 w-px bg-zinc-700" />

          {/* Icon + Title + Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <Code2 size={18} className="text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                <button
                  onClick={() => navigate('/')}
                  className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight size={10} className="text-zinc-600" />
                <button
                  onClick={() => navigate('/roadmaps')}
                  className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Roadmaps
                </button>
                <ChevronRight size={10} className="text-zinc-600" />
                <button
                  onClick={() => navigate('/roadmap/frontend-react')}
                  className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Frontend
                </button>
                <ChevronRight size={10} className="text-zinc-600" />
                <span className="text-blue-400">
                  {selected ? selected.data.label : 'Interactive Diagram'}
                </span>
              </div>
              <span className="font-semibold text-white text-sm leading-tight">
                Frontend Development Roadmap
              </span>
            </div>
          </div>

          {/* Progress — pushed right */}
          <div className="ml-auto flex items-center gap-4">
            {/* Fraction */}
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <CheckSquare size={13} className="text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  {completedMain}
                  <span className="text-zinc-500 font-normal"> / {MAIN_NODE_IDS.length}</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">topics complete</span>
            </div>

            {/* Bar + percent */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="w-36 h-2 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: progressPct === 100
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      boxShadow: progressPct > 0 ? '0 0 6px rgba(139,92,246,0.6)' : 'none',
                    }}
                  />
                </div>
                <span className="text-xs font-bold min-w-[2.5rem] text-right"
                  style={{
                    color: progressPct === 100 ? '#34d399' : progressPct > 50 ? '#8b5cf6' : '#60a5fa'
                  }}
                >
                  {progressPct}%
                </span>
              </div>
              {progressPct === 100 && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Zap size={10} /> Complete!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable page body — dot pattern spans full device width ───────── */}
      <div
        className="flex-1 overflow-x-auto overflow-y-auto"
        style={{
          backgroundColor: 'var(--roadmap-bg, #f9fafb)',
          backgroundImage: 'radial-gradient(circle, var(--roadmap-dot, #d1d5db) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Fixed-size canvas — exactly the size of the roadmap content */}
        <div
          style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative', margin: '0 auto' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            // Disable all infinite-canvas behaviour
            fitView={false}
            defaultViewport={{ x: 0, y: 20, zoom: 1 }}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}   // let page scroll naturally
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ width: CANVAS_W, height: CANVAS_H, background: 'transparent' }}
          >

          </ReactFlow>
        </div>
      </div>

      {/* ── Projects Section ─────────────────────────────────────────────────── */}
      <div
        ref={projectsRef}
        className="w-full py-20 px-4"
        style={{
          background: 'linear-gradient(180deg, #09090b 0%, #0d1117 60%, #09090b 100%)',
          borderTop: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          {isProjectsLocked ? (
            /* ── Locked state ─────────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-6 py-24"
            >
              {/* Lock icon */}
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl
                              bg-gradient-to-br from-indigo-500/15 to-purple-600/10
                              border border-indigo-500/25 shadow-xl shadow-indigo-500/10">
                <Lock className="w-9 h-9 text-indigo-400" />
              </div>

              {/* Message */}
              <div className="text-center max-w-md">
                <h3 className="text-xl font-bold text-white mb-2">Projects are Locked</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Complete all{' '}
                  <span className="text-indigo-300 font-semibold">{MAIN_SECTION_IDS.length} roadmap sections</span>{' '}
                  to unlock hands-on projects and demonstrate your skills.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                  <span>Your progress</span>
                  <span className="text-indigo-300 font-medium">
                    {completedSectionCount}&nbsp;/&nbsp;{MAIN_SECTION_IDS.length} sections
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 border border-white/8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedSectionCount / MAIN_SECTION_IDS.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── Unlocked content ──────────────────────────────────────── */
            <>
              {/* Heading */}
              <div className="text-center mb-14">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-3">
                  <FolderGit2 className="w-3.5 h-3.5" />
              Hands-on Practice
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Build Real{' '}
              <span style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Projects
              </span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Reading is not enough — build something. Pick a project below, push it to GitHub, then submit your repo link to track your hands-on progress.
            </p>
          </div>

          {/* Project cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {FRONTEND_PROJECTS.map((proj, i) => {
              const isSelected = selectedProject === proj.id;
              return (
                <motion.button
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  onClick={() => setSelectedProject(proj.id as ProjectId)}
                  className={`relative text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer group
                    ${
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-600/10 shadow-lg shadow-indigo-500/10'
                        : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                    }`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400 shadow shadow-indigo-400" />
                  )}

                  {/* Difficulty badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border mb-3 ${proj.difficultyColor}`}>
                    {proj.difficulty}
                  </span>

                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{proj.description}</p>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {proj.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white/6 border border-white/10 text-[11px] text-zinc-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Submission form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#1e1b4b]/40 to-slate-900 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
                <Github className="w-4.5 h-4.5 text-indigo-400" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Submit Your Project</h3>
                <p className="text-xs text-zinc-500">Paste your public GitHub repository URL below</p>
              </div>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              {/* Project selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Selected project</label>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value as ProjectId)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white px-4 py-2.5
                             focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30
                             transition-all appearance-none"
                >
                  {FRONTEND_PROJECTS.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      [{p.difficulty}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* GitHub URL input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">GitHub repository URL</label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/your-repo"
                    value={githubUrl}
                    onChange={e => { setGithubUrl(e.target.value); setSubmitError(''); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white
                               placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60
                               focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Error / success feedback */}
              {submitError && (
                <div className="flex items-center gap-2 text-xs text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Project submitted — great work! Keep building.
                </div>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-gradient-to-r from-indigo-600 to-purple-600
                           hover:from-indigo-500 hover:to-purple-500
                           text-sm font-semibold text-white transition-all
                           shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
              >
                <Send className="w-4 h-4" />
                Submit Project
              </button>
            </form>
          </motion.div>

          {/* Submitted projects list */}
          {submissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Your Submissions</h3>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium">
                  {submissions.length}
                </span>
              </div>

              {submissions.map(sub => {
                const proj = FRONTEND_PROJECTS.find(p => p.id === sub.projectId);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-4 rounded-xl border border-white/8
                               bg-white/3 hover:bg-white/5 px-4 py-3 transition-all group"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{proj?.title ?? sub.projectId}</p>
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 truncate block transition-colors"
                      >
                        {sub.url}
                      </a>
                    </div>

                    <span className="text-[11px] text-zinc-600 shrink-0">{sub.date}</span>

                    <button
                      onClick={() => setSubmissions(prev => prev.filter(s => s.id !== sub.id))}
                      className="p-1.5 rounded-lg text-zinc-700 hover:text-rose-400 hover:bg-rose-400/10
                                 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Remove submission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
            </>
          )}

        </div>
      </div>

      {/* ── Frontend FAQ Section ─────────────────────────────────────────────── */}
      <div
        className="w-full py-16 px-4"
        style={{
          background: 'linear-gradient(180deg, #09090b 0%, #0f172a 60%, #09090b 100%)',
          borderTop: '1px solid rgba(139,92,246,0.15)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">
              Frontend Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked{' '}
              <span style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Questions
              </span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Common questions about learning frontend development — from where to start to landing your first job.
            </p>
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-3">
            {FRONTEND_FAQS.map((faq, i) => {
              const isOpen = openFaqs.includes(faq.id);
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: isOpen ? 'rgba(139,92,246,0.5)' : 'rgba(63,63,70,0.6)',
                    background: isOpen
                      ? 'linear-gradient(135deg,rgba(30,27,75,0.7),rgba(15,23,42,0.9))'
                      : 'rgba(24,24,27,0.8)',
                    boxShadow: isOpen ? '0 0 0 1px rgba(139,92,246,0.2), 0 4px 20px rgba(0,0,0,0.3)' : 'none',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className={`text-sm font-medium transition-colors ${
                      isOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    }`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-purple-400' : 'text-zinc-500'
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-zinc-700/50 pt-3">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detail panel — fixed floating overlay on the right ──────────────── */}
      {selected && NODE_DETAILS[selected.id] && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-72 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col max-h-[70vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              {selected.data.label}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
              {NODE_DETAILS[selected.id].description}
            </p>

            <div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1 mb-2">
                <BookOpen size={12} /> Resources
              </h3>
              <ul className="flex flex-col gap-2">
                {NODE_DETAILS[selected.id].resources.map(r => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      → {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              size="sm"
              variant={selected.data.completed ? 'outline' : 'default'}
              className={
                selected.data.completed
                  ? 'border-green-400 text-green-600 dark:text-green-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              onClick={() => {
                setNodes(nds =>
                  nds.map(n =>
                    n.id === selected.id
                      ? { ...n, data: { ...n.data, completed: !n.data.completed } }
                      : n,
                  ),
                );
                setSelected(prev =>
                  prev ? { ...prev, data: { ...prev.data, completed: !prev.data.completed } } : null,
                );
              }}
            >
              {selected.data.completed ? '✓ Mark Incomplete' : 'Mark as Complete'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Legend — fixed bottom-left, hidden when FAQ is in view ─────────── */}
      <div
        className={`fixed bottom-5 left-5 z-30 rounded-xl border border-zinc-700/60 px-4 py-3 flex flex-col gap-2 pointer-events-none transition-all duration-300 ${
          showLegend ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Legend</span>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-yellow-400 border border-yellow-500 shrink-0" />
            <span className="text-[11px] text-zinc-300">Core topic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm" style={{ background: 'rgba(120,53,15,0.6)', border: '1px solid #f59e0b' }} />
            <span className="text-[11px] text-zinc-300">Sub-topic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-zinc-700 border border-zinc-400 shrink-0" />
            <span className="text-[11px] text-zinc-300">Tool / Option</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-emerald-800 border border-emerald-400 shrink-0" />
            <span className="text-[11px] text-zinc-300">Completed ✓</span>
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Generic node detail sidebar ─────────────────────────────── */}
      <NodeDetailSidebar
        open={sidebar.open}
        sectionId={sidebar.sectionId}
        activeNodeId={sidebar.activeNodeId}
        onClose={() => setSidebar({ open: false, sectionId: null, activeNodeId: null })}
        onMarkComplete={(nodeId) =>
          setNodes(nds => {
            // 1. Mark the sub-node itself as completed
            const updated = nds.map(n =>
              n.id === nodeId ? { ...n, data: { ...n.data, completed: true } } : n,
            );

            // 2. If all sub-nodes of the parent section are now complete,
            //    also mark the parent section node as completed
            const sectionId = SECTION_NODE_MAP[nodeId];
            if (sectionId && sectionId !== nodeId) {
              const sectionData = ALL_NODE_DETAILS[sectionId];
              if (sectionData) {
                const subIds = sectionData.subNodes.map(sn => sn.id);
                const allDone = subIds.every(
                  id => updated.find(n => n.id === id)?.data?.completed === true,
                );
                if (allDone) {
                  return updated.map(n =>
                    n.id === sectionId
                      ? { ...n, data: { ...n.data, completed: true } }
                      : n,
                  );
                }
              }
            }

            return updated;
          })
        }
      />
    </div>
  );
}
