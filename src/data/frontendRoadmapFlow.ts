import { Node, Edge, MarkerType } from 'reactflow';

export type RoadmapNodeData = {
  label: string;
  completed?: boolean;
  description?: string;
  optional?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main column x = 380  (node width 170 → center at 465)
// Right branches x = 680  (node width 200)
// Left branches  x = 80   (node width 180)
// Option pills   x varies  (node width 85)
// ─────────────────────────────────────────────────────────────────────────────

export const initialNodes: Node<RoadmapNodeData>[] = [

  // ── START ─────────────────────────────────────────────────────────────────
  {
    id: 'start',
    type: 'startNode',
    position: { x: 380, y: 0 },
    data: { label: 'Frontend Development' },
  },

  // ── INTERNET (6 → 3 right / 3 left) ──────────────────────────────────────
  {
    id: 'internet',
    type: 'mainNode',
    position: { x: 380, y: 130 },
    data: { label: 'Internet' },
  },
  { id: 'i1', type: 'branchNode',     position: { x: 680, y: 65  }, data: { label: 'How does the internet work?' } },
  { id: 'i2', type: 'branchNode',     position: { x: 680, y: 130 }, data: { label: 'What is HTTP?' } },
  { id: 'i3', type: 'branchNode',     position: { x: 680, y: 195 }, data: { label: 'What is a Domain Name?' } },
  { id: 'i4', type: 'leftBranchNode', position: { x: 80,  y: 65  }, data: { label: 'What is Hosting?' } },
  { id: 'i5', type: 'leftBranchNode', position: { x: 80,  y: 130 }, data: { label: 'DNS and how it works?' } },
  { id: 'i6', type: 'leftBranchNode', position: { x: 80,  y: 195 }, data: { label: 'Browsers and how they work?' } },

  // ── HTML (4 → 2 right / 2 left) ───────────────────────────────────────────
  {
    id: 'html',
    type: 'mainNode',
    position: { x: 380, y: 340 },
    data: { label: 'HTML' },
  },
  { id: 'h1', type: 'branchNode',     position: { x: 680, y: 308 }, data: { label: 'Semantic HTML' } },
  { id: 'h2', type: 'branchNode',     position: { x: 680, y: 373 }, data: { label: 'Forms & Validations' } },
  { id: 'h3', type: 'leftBranchNode', position: { x: 80,  y: 308 }, data: { label: 'Accessibility (a11y)' } },
  { id: 'h4', type: 'leftBranchNode', position: { x: 80,  y: 373 }, data: { label: 'SEO Basics' } },

  // ── CSS (4 → 2 right / 2 left) ────────────────────────────────────────────
  {
    id: 'css',
    type: 'mainNode',
    position: { x: 380, y: 510 },
    data: { label: 'CSS' },
  },
  { id: 'c1', type: 'branchNode',     position: { x: 680, y: 478 }, data: { label: 'Flexbox' } },
  { id: 'c2', type: 'branchNode',     position: { x: 680, y: 543 }, data: { label: 'CSS Grid' } },
  { id: 'c3', type: 'leftBranchNode', position: { x: 80,  y: 478 }, data: { label: 'Responsive Design' } },
  { id: 'c4', type: 'leftBranchNode', position: { x: 80,  y: 543 }, data: { label: 'CSS Animations' } },

  // ── JAVASCRIPT (4 → 2 right / 2 left) ─────────────────────────────────────
  {
    id: 'javascript',
    type: 'mainNode',
    position: { x: 380, y: 680 },
    data: { label: 'JavaScript' },
  },
  { id: 'js1', type: 'branchNode',     position: { x: 680, y: 648 }, data: { label: 'ES6+ Features' } },
  { id: 'js2', type: 'branchNode',     position: { x: 680, y: 713 }, data: { label: 'DOM Manipulation' } },
  { id: 'js3', type: 'leftBranchNode', position: { x: 80,  y: 648 }, data: { label: 'Fetch API / AJAX' } },
  { id: 'js4', type: 'leftBranchNode', position: { x: 80,  y: 713 }, data: { label: 'Async / Await & Promises' } },

  // ── VERSION CONTROL (1 left) ───────────────────────────────────────────────
  {
    id: 'version-control',
    type: 'mainNode',
    position: { x: 380, y: 850 },
    data: { label: 'Version Control' },
  },
  { id: 'git', type: 'leftBranchNode', position: { x: 80, y: 850 }, data: { label: 'Git' } },

  // ── VCS HOSTING (2 → 1 right / 1 left) ────────────────────────────────────
  {
    id: 'vcs-hosting',
    type: 'mainNode',
    position: { x: 380, y: 990 },
    data: { label: 'VCS Hosting' },
  },
  { id: 'github', type: 'branchNode',     position: { x: 680, y: 990 }, data: { label: 'GitHub' } },
  { id: 'gitlab', type: 'leftBranchNode', position: { x: 80,  y: 990 }, data: { label: 'GitLab' } },

  // ── PACKAGE MANAGERS (4 → 2 right / 2 left) ───────────────────────────────
  {
    id: 'pkg-managers',
    type: 'mainNode',
    position: { x: 380, y: 1150 },
    data: { label: 'Package Managers' },
  },
  { id: 'npm',  type: 'optionNode',     position: { x: 680, y: 1118 }, data: { label: 'npm' } },
  { id: 'yarn', type: 'optionNode',     position: { x: 680, y: 1183 }, data: { label: 'yarn' } },
  { id: 'pnpm', type: 'leftBranchNode', position: { x: 80,  y: 1118 }, data: { label: 'pnpm' } },
  { id: 'bun',  type: 'leftBranchNode', position: { x: 80,  y: 1183 }, data: { label: 'Bun' } },

  // ── PICK A FRAMEWORK (5 → 3 left / 2 right) ───────────────────────────────
  {
    id: 'framework',
    type: 'mainNode',
    position: { x: 380, y: 1360 },
    data: { label: 'Pick a Framework' },
  },
  { id: 'react',   type: 'leftBranchNode', position: { x: 80,  y: 1295 }, data: { label: 'React' } },
  { id: 'vuejs',   type: 'leftBranchNode', position: { x: 80,  y: 1360 }, data: { label: 'Vue.js' } },
  { id: 'angular', type: 'leftBranchNode', position: { x: 80,  y: 1425 }, data: { label: 'Angular' } },
  { id: 'svelte',  type: 'branchNode',     position: { x: 680, y: 1328 }, data: { label: 'Svelte' } },
  { id: 'solidjs', type: 'branchNode',     position: { x: 680, y: 1393 }, data: { label: 'Solid JS' } },


  // ── CSS FRAMEWORKS (3 → 2 right / 1 left) ─────────────────────────────────
  {
    id: 'css-frameworks',
    type: 'mainNode',
    position: { x: 380, y: 1570 },
    data: { label: 'CSS Frameworks' },
  },
  { id: 'tailwind',    type: 'branchNode',     position: { x: 680, y: 1538 }, data: { label: 'Tailwind CSS' } },
  { id: 'bootstrap',   type: 'branchNode',     position: { x: 680, y: 1603 }, data: { label: 'Bootstrap' } },
  { id: 'material-ui', type: 'leftBranchNode', position: { x: 80,  y: 1570 }, data: { label: 'Material UI / Chakra' } },

  // ── BUILD TOOLS (4 → 2 right / 2 left) ────────────────────────────────────
  {
    id: 'build-tools',
    type: 'mainNode',
    position: { x: 380, y: 1730 },
    data: { label: 'Build Tools / Linters' },
  },
  { id: 'vite',     type: 'optionNode',     position: { x: 680, y: 1698 }, data: { label: 'Vite' } },
  { id: 'webpack',  type: 'optionNode',     position: { x: 680, y: 1763 }, data: { label: 'Webpack' } },
  { id: 'eslint',   type: 'leftBranchNode', position: { x: 80,  y: 1698 }, data: { label: 'ESLint' } },
  { id: 'prettier', type: 'leftBranchNode', position: { x: 80,  y: 1763 }, data: { label: 'Prettier' } },

  // ── TYPESCRIPT (3 → 2 right / 1 left) ─────────────────────────────────────
  {
    id: 'typescript',
    type: 'mainNode',
    position: { x: 380, y: 1900 },
    data: { label: 'TypeScript' },
  },
  { id: 'ts1', type: 'branchNode',     position: { x: 680, y: 1868 }, data: { label: 'Types & Interfaces' } },
  { id: 'ts2', type: 'branchNode',     position: { x: 680, y: 1933 }, data: { label: 'Type Narrowing' } },
  { id: 'ts3', type: 'leftBranchNode', position: { x: 80,  y: 1900 }, data: { label: 'Generics' } },

  // ── TESTING (3 → 2 right / 1 left) ────────────────────────────────────────
  {
    id: 'testing',
    type: 'mainNode',
    position: { x: 380, y: 2060 },
    data: { label: 'Testing' },
  },
  { id: 'test1', type: 'branchNode',     position: { x: 680, y: 2028 }, data: { label: 'Jest / Vitest' } },
  { id: 'test2', type: 'branchNode',     position: { x: 680, y: 2093 }, data: { label: 'React Testing Library' } },
  { id: 'test3', type: 'leftBranchNode', position: { x: 80,  y: 2060 }, data: { label: 'Cypress / Playwright' } },

  // ── WEB SECURITY (3 → 2 right / 1 left) ───────────────────────────────────
  {
    id: 'security',
    type: 'mainNode',
    position: { x: 380, y: 2220 },
    data: { label: 'Web Security Basics' },
  },
  { id: 'sec1', type: 'branchNode',     position: { x: 680, y: 2188 }, data: { label: 'HTTPS & SSL/TLS' } },
  { id: 'sec2', type: 'branchNode',     position: { x: 680, y: 2253 }, data: { label: 'CORS' } },
  { id: 'sec3', type: 'leftBranchNode', position: { x: 80,  y: 2220 }, data: { label: 'CSP & OWASP Top 10' } },

  // ── PERFORMANCE (3 → 2 right / 1 left) ────────────────────────────────────
  {
    id: 'performance',
    type: 'mainNode',
    position: { x: 380, y: 2380 },
    data: { label: 'Performance' },
  },
  { id: 'perf1', type: 'branchNode',     position: { x: 680, y: 2348 }, data: { label: 'Core Web Vitals' } },
  { id: 'perf2', type: 'branchNode',     position: { x: 680, y: 2413 }, data: { label: 'Lazy Loading & Code Splitting' } },
  { id: 'perf3', type: 'leftBranchNode', position: { x: 80,  y: 2380 }, data: { label: 'Lighthouse Audits' } },

  // ── DEPLOYMENT (3 → 2 right / 1 left) ─────────────────────────────────────
  {
    id: 'deployment',
    type: 'mainNode',
    position: { x: 380, y: 2540 },
    data: { label: 'Deployment' },
  },
  { id: 'dep1', type: 'branchNode',     position: { x: 680, y: 2508 }, data: { label: 'Vercel / Netlify' } },
  { id: 'dep2', type: 'branchNode',     position: { x: 680, y: 2573 }, data: { label: 'AWS / Azure / GCP' } },
  { id: 'dep3', type: 'leftBranchNode', position: { x: 80,  y: 2540 }, data: { label: 'Docker & CI / CD' } },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDGES
// ─────────────────────────────────────────────────────────────────────────────

const mainEdgeStyle  = { stroke: '#3b82f6', strokeWidth: 2 };
const branchEdgeStyle = { stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '5 5' };
const leftEdgeStyle   = { stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '5 5' };

const mkMain = (id: string, src: string, tgt: string): Edge => ({
  id,
  source: src,
  target: tgt,
  type: 'straight',
  style: mainEdgeStyle,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 18, height: 18 },
});

const mkBranch = (id: string, src: string, tgt: string, srcHandle = 'right'): Edge => ({
  id,
  source: src,
  target: tgt,
  sourceHandle: srcHandle,
  targetHandle: 'left',
  type: 'default',
  style: branchEdgeStyle,
});

const mkLeft = (id: string, src: string, tgt: string, srcHandle = 'left'): Edge => ({
  id,
  source: src,
  target: tgt,
  sourceHandle: srcHandle,
  targetHandle: 'right',
  type: 'default',
  style: leftEdgeStyle,
});

export const initialEdges: Edge[] = [
  // ── Main vertical flow ────────────────────────────────────────────────────
  mkMain('e-start-internet',    'start',          'internet'),
  mkMain('e-internet-html',     'internet',       'html'),
  mkMain('e-html-css',          'html',           'css'),
  mkMain('e-css-js',            'css',            'javascript'),
  mkMain('e-js-vc',             'javascript',     'version-control'),
  mkMain('e-vc-vcs',            'version-control','vcs-hosting'),
  mkMain('e-vcs-pkg',           'vcs-hosting',    'pkg-managers'),
  mkMain('e-pkg-fw',            'pkg-managers',   'framework'),
  mkMain('e-fw-cssFW',          'framework',      'css-frameworks'),
  mkMain('e-cssFW-build',       'css-frameworks', 'build-tools'),
  mkMain('e-build-ts',          'build-tools',    'typescript'),
  mkMain('e-ts-test',           'typescript',     'testing'),
  mkMain('e-test-sec',          'testing',        'security'),
  mkMain('e-sec-perf',          'security',       'performance'),
  mkMain('e-perf-deploy',       'performance',    'deployment'),

  // ── Internet (3R / 3L) ────────────────────────────────────────────────────
  mkBranch('e-i-i1', 'internet', 'i1', 'r1'),
  mkBranch('e-i-i2', 'internet', 'i2', 'right'),
  mkBranch('e-i-i3', 'internet', 'i3', 'r5'),
  mkLeft('e-i-i4',   'internet', 'i4', 'l1'),
  mkLeft('e-i-i5',   'internet', 'i5', 'left'),
  mkLeft('e-i-i6',   'internet', 'i6', 'l5'),

  // ── HTML (2R / 2L) ────────────────────────────────────────────────────────
  mkBranch('e-h-h1', 'html', 'h1', 'r2'),
  mkBranch('e-h-h2', 'html', 'h2', 'r4'),
  mkLeft('e-h-h3',   'html', 'h3', 'l2'),
  mkLeft('e-h-h4',   'html', 'h4', 'l4'),

  // ── CSS (2R / 2L) ─────────────────────────────────────────────────────────
  mkBranch('e-c-c1', 'css', 'c1', 'r2'),
  mkBranch('e-c-c2', 'css', 'c2', 'r4'),
  mkLeft('e-c-c3',   'css', 'c3', 'l2'),
  mkLeft('e-c-c4',   'css', 'c4', 'l4'),

  // ── JS (2R / 2L) ──────────────────────────────────────────────────────────
  mkBranch('e-js-js1', 'javascript', 'js1', 'r2'),
  mkBranch('e-js-js2', 'javascript', 'js2', 'r4'),
  mkLeft('e-js-js3',   'javascript', 'js3', 'l2'),
  mkLeft('e-js-js4',   'javascript', 'js4', 'l4'),

  // ── Version Control / VCS ────────────────────────────────────────────────
  mkLeft('e-vc-git',      'version-control', 'git'),
  mkBranch('e-vcs-github','vcs-hosting',     'github'),
  mkLeft('e-vcs-gitlab',  'vcs-hosting',     'gitlab'),

  // ── Package Managers (2R / 2L) ────────────────────────────────────────────
  mkBranch('e-pkg-npm',  'pkg-managers', 'npm',  'r2'),
  mkBranch('e-pkg-yarn', 'pkg-managers', 'yarn', 'r4'),
  mkLeft('e-pkg-pnpm',   'pkg-managers', 'pnpm', 'l2'),
  mkLeft('e-pkg-bun',    'pkg-managers', 'bun',  'l4'),

  // ── Framework (3L / 2R) ───────────────────────────────────────────────────
  mkLeft('e-fw-react',    'framework', 'react',   'l1'),
  mkLeft('e-fw-vuejs',    'framework', 'vuejs',   'left'),
  mkLeft('e-fw-angular',  'framework', 'angular', 'l5'),
  mkBranch('e-fw-svelte', 'framework', 'svelte',  'r2'),
  mkBranch('e-fw-solid',  'framework', 'solidjs', 'r4'),

  // ── CSS Frameworks (2R / 1L) ──────────────────────────────────────────────
  mkBranch('e-cssFW-tailwind',  'css-frameworks', 'tailwind',   'r2'),
  mkBranch('e-cssFW-bootstrap', 'css-frameworks', 'bootstrap',  'r4'),
  mkLeft('e-cssFW-mui',         'css-frameworks', 'material-ui'),

  // ── Build Tools (2R / 2L) ─────────────────────────────────────────────────
  mkBranch('e-bt-vite',    'build-tools', 'vite',    'r2'),
  mkBranch('e-bt-webpack', 'build-tools', 'webpack', 'r4'),
  mkLeft('e-bt-eslint',    'build-tools', 'eslint',  'l2'),
  mkLeft('e-bt-prettier',  'build-tools', 'prettier','l4'),

  // ── TypeScript (2R / 1L) ──────────────────────────────────────────────────
  mkBranch('e-ts-ts1', 'typescript', 'ts1', 'r2'),
  mkBranch('e-ts-ts2', 'typescript', 'ts2', 'r4'),
  mkLeft('e-ts-ts3',   'typescript', 'ts3'),

  // ── Testing (2R / 1L) ─────────────────────────────────────────────────────
  mkBranch('e-test-test1', 'testing', 'test1', 'r2'),
  mkBranch('e-test-test2', 'testing', 'test2', 'r4'),
  mkLeft('e-test-test3',   'testing', 'test3'),

  // ── Security (2R / 1L) ────────────────────────────────────────────────────
  mkBranch('e-sec-sec1', 'security', 'sec1', 'r2'),
  mkBranch('e-sec-sec2', 'security', 'sec2', 'r4'),
  mkLeft('e-sec-sec3',   'security', 'sec3'),

  // ── Performance (2R / 1L) ─────────────────────────────────────────────────
  mkBranch('e-perf-perf1', 'performance', 'perf1', 'r2'),
  mkBranch('e-perf-perf2', 'performance', 'perf2', 'r4'),
  mkLeft('e-perf-perf3',   'performance', 'perf3'),

  // ── Deployment (2R / 1L) ──────────────────────────────────────────────────
  mkBranch('e-dep-dep1', 'deployment', 'dep1', 'r2'),
  mkBranch('e-dep-dep2', 'deployment', 'dep2', 'r4'),
  mkLeft('e-dep-dep3',   'deployment', 'dep3'),
];
