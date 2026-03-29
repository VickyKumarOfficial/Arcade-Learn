import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle2 } from 'lucide-react';
import { RoadmapNodeData } from '@/data/frontendRoadmapFlow';
import { Tooltip } from '@/components/ui/tooltip-card';

const SUBNODE_FADE_CLASS = import.meta.env.PROD ? 'roadmap-subnode-fade' : '';

// ─── Tooltip descriptions for every node label ────────────────────────────────
const TOOLTIP_MAP: Record<string, string> = {
  // Start
  'Frontend Development': 'Your complete guide to becoming a modern frontend developer — follow the path from the top.',

  // Internet
  'Internet':                      'The global network of networks. Understanding how data travels across the internet is foundational to web development.',
  'How does the internet work?':   'Data travels in packets through routers and cables. Requests leave your browser, pass through ISPs and DNS, and reach web servers globally.',
  'What is HTTP?':                 'HyperText Transfer Protocol is the set of rules browsers and servers use to communicate. HTTPS is its encrypted version using TLS.',
  'What is a Domain Name?':       'A human-readable address (e.g. google.com) that maps to an IP address via DNS, so you don\'t need to memorise numbers.',
  'What is Hosting?':              'A web host stores your site\'s files on a server connected to the internet, making them accessible to anyone with a browser.',
  'DNS and how it works?':        'Domain Name System translates domain names to IP addresses — like a phone book for the internet. Queries flow through recursive resolvers and authoritative nameservers.',
  'Browsers and how they work?':  'Browsers parse HTML/CSS/JS, build the DOM and CSSOM, lay out elements, and paint pixels through a multi-stage rendering pipeline.',

  // HTML
  'HTML':                    'HyperText Markup Language gives web pages structure and meaning using elements and attributes parsed by the browser into a DOM tree.',
  'Semantic HTML':           'Using elements like <article>, <nav>, <main> and <header> that describe meaning, not just appearance — improves SEO and accessibility.',
  'Forms & Validations':     'HTML forms collect user input. Native validation attributes (required, type="email") provide zero-JS client-side checks before submission.',
  'Accessibility (a11y)':    'Ensures your site is usable by people with disabilities. Key practices: semantic markup, ARIA labels, keyboard nav, sufficient contrast.',
  'SEO Basics':              'Meta tags, semantic elements, correct heading hierarchy, and fast load times help search engines index and rank your pages higher.',

  // CSS
  'CSS':                     'Cascading Style Sheets controls the visual presentation of HTML — layout, colour, typography, animations and responsive behaviour.',
  'Flexbox':                 'A one-dimensional layout model. Items lay out in a row or column; flex properties control growth, shrink, alignment and order.',
  'CSS Grid':                'A two-dimensional layout system for both rows and columns simultaneously. Ideal for complex page structures and design systems.',
  'Responsive Design':       'CSS techniques (media queries, fluid units, flexible images) that make layouts adapt gracefully to any screen size.',
  'CSS Animations':          'The @keyframes rule and animation property lets you smoothly transition elements between states without JavaScript.',

  // JavaScript
  'JavaScript':              'The programming language of the web. Runs in the browser to make pages dynamic — events, DOM updates, API calls and more.',
  'ES6+ Features':           'Modern JS syntax: arrow functions, destructuring, template literals, spread/rest, modules, optional chaining, nullish coalescing.',
  'DOM Manipulation':        'The Document Object Model is a JS-accessible tree of HTML nodes. You can query, create, modify and delete nodes to update the UI.',
  'Fetch API / AJAX':        'Fetch lets you make HTTP requests from JS without a page reload. Returns Promises, supports JSON and FormData out of the box.',
  'Async / Await & Promises':'Promises represent future values. async/await is syntactic sugar that makes async code read like synchronous code, simplifying error handling.',

  // Version Control
  'Version Control':         'Tracking changes to code over time so you can revert mistakes, collaborate, and maintain a history of your project.',
  'Git':                     'The most popular distributed version control system. Core commands: init, clone, add, commit, push, pull, merge, rebase, branch.',

  // VCS Hosting
  'VCS Hosting':             'Cloud platforms that host your Git repositories and add collaboration features like PRs, code review, and CI/CD pipelines.',
  'GitHub':                  'The world\'s largest code hosting platform. Home to millions of open-source projects; integrates with nearly every dev tool.',
  'GitLab':                  'A DevOps platform combining Git hosting, CI/CD pipelines, container registry and security scanning in one product.',

  // Package Managers
  'Package Managers':        'Tools that install, update, and manage third-party libraries (packages) your project depends on, tracking them in package.json.',
  'npm':                     'Node Package Manager — ships with Node.js, the default package manager for the JS ecosystem with the largest registry of packages.',
  'yarn':                    'Faster alternative to npm by Facebook. Introduced parallel installs and a lock file; now supports Plug\'n\'Play (PnP) for zero-installs.',
  'pnpm':                    'Performant npm. Uses a content-addressable store and hard links to save disk space and speed up installs — great monorepo support.',
  'Bun':                     'Ultra-fast all-in-one JS runtime and package manager. Installs packages ~25× faster than npm and can run TS natively.',

  // Frameworks
  'Pick a Framework':        'JavaScript frameworks provide structure, component models, and state management for building complex, maintainable UIs.',
  'React':                   'Facebook\'s UI library built on a virtual DOM and component model. The most widely used framework with a huge ecosystem.',
  'Vue.js':                  'Progressive framework with a gentle learning curve. Single File Components keep template, script and style co-located.',
  'Angular':                 'Google\'s opinionated full framework with built-in DI, routing, forms and HTTP. Uses TypeScript by default; great for enterprise.',
  'Svelte':                  'Compiler-based framework with no virtual DOM. Transforms components to vanilla JS at build time — tiny bundle, fast runtime.',
  'Solid JS':                'Fine-grained reactive framework. No virtual DOM; re-renders only the exact DOM nodes that depend on changed state.',

  // CSS Frameworks
  'CSS Frameworks':          'Pre-built CSS systems that speed up styling with consistent design tokens, utility classes, or ready-made components.',
  'Tailwind CSS':            'Utility-first CSS framework. Compose designs in markup with atomic classes. Excellent DX with IntelliSense; purges unused styles.',
  'Bootstrap':               'Component-based framework with a responsive grid, pre-styled components (buttons, modals, navbars) and JS helpers.',
  'Material UI / Chakra':    'React component libraries implementing Material Design (MUI) or a custom accessible design system (Chakra UI) out of the box.',

  // Build Tools
  'Build Tools / Linters':   'Tools that bundle, transform, and optimise your source files for production, and enforce code quality standards automatically.',
  'Vite':                    'Lightning-fast dev server using native ES modules. Production builds via Rollup. The modern standard for React/Vue/Svelte.',
  'Webpack':                 'Highly configurable module bundler. The long-standing industry standard; powerful for complex custom build pipelines.',
  'ESLint':                  'Static analysis tool that finds and fixes JS/TS problems — unused variables, security issues, style violations — as you type.',
  'Prettier':                'Opinionated code formatter. Auto-formats on save to ensure consistent code style across your entire team with zero config.',

  // TypeScript
  'TypeScript':              'Typed superset of JavaScript compiled to JS. Catches type errors at build time, improves IDE autocomplete and refactoring.',
  'Types & Interfaces':      'type aliases and interface declarations describe the shape of data. Both support object types; interfaces are extendable via declaration merging.',
  'Type Narrowing':          'TypeScript narrows union types within conditionals using typeof, instanceof, in checks and discriminated unions.',
  'Generics':                'Generic type parameters make components and functions reusable over multiple types while preserving full type safety.',

  // Testing
  'Testing':                 'Automated tests verify your code works correctly and prevents regressions when you change it later.',
  'Jest / Vitest':           'Unit test runners. Jest is the classic choice; Vitest is a Vite-native drop-in replacement that is dramatically faster.',
  'React Testing Library':   'Encourages testing components the way users use them — query by role/label/text rather than implementation details.',
  'Cypress / Playwright':    'End-to-end test frameworks that automate a real browser — click, type, assert on a running app as if you were a real user.',

  // Security
  'Web Security Basics':     'Core browser security concepts that protect users and your application from common attack vectors.',
  'HTTPS & SSL/TLS':         'HTTPS encrypts traffic between browser and server using TLS. Essential for auth, payment, and preventing MITM attacks.',
  'CORS':                    'Cross-Origin Resource Sharing controls which domains can make requests to your API using HTTP headers on the server.',
  'CSP & OWASP Top 10':     'Content Security Policy prevents XSS by whitelisting script sources. OWASP Top 10 lists the most critical web security risks.',

  // Performance
  'Performance':             'Optimising how fast your site loads and responds to user interactions — directly impacts SEO and user retention.',
  'Core Web Vitals':         'Google\'s metrics: LCP (load), INP (interactivity), CLS (layout stability). Scores affect search ranking and real user experience.',
  'Lazy Loading & Code Splitting': 'Defer loading off-screen images and split JS bundles so initial load only delivers what\'s needed. Dramatically reduces time-to-interactive.',
  'Lighthouse Audits':       'Chrome DevTools tool that grades your page on Performance, Accessibility, Best Practices and SEO, with actionable recommendations.',

  // Deployment
  'Deployment':              'Publishing your application to a server or CDN so real users can access it on the internet.',
  'Vercel / Netlify':        'Zero-config deployment platforms. Connect your Git repo, push code, and get a live URL with CDN and CI/CD automatically.',
  'AWS / Azure / GCP':       'Major cloud providers offering compute, storage, CDN, databases and more. More control but higher complexity than Vercel/Netlify.',
  'Docker & CI / CD':        'Docker containers package your app with its dependencies for consistent deployments. CI/CD pipelines automate testing and releasing on every push.',
};


// ─── Invisible handle helper ─────────────────────────────────────────────────
const H = ({
  type,
  pos,
  id,
  top,
}: {
  type: 'source' | 'target';
  pos: Position;
  id?: string;
  top?: string;
}) => (
  <Handle
    type={type}
    position={pos}
    id={id}
    style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1, top }}
  />
);

// ─── Completion badge ─────────────────────────────────────────────────────────
const CompletedBadge = () => (
  <span className="absolute -top-2 -right-2 text-purple-600 bg-white rounded-full">
    <CheckCircle2 size={15} fill="white" />
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// START NODE  – dark header at the top
// ─────────────────────────────────────────────────────────────────────────────
export const StartNode = memo(({ data }: NodeProps<RoadmapNodeData>) => (
  <div className="relative px-6 py-3 rounded-lg border-2 border-gray-800 bg-gray-900 text-white text-center font-bold text-base shadow-lg w-[200px]">
    <H type="source" pos={Position.Bottom} />
    <Tooltip content={TOOLTIP_MAP[data.label] ?? data.label} containerClassName="text-white cursor-default">
      <span>{data.label}</span>
    </Tooltip>
  </div>
));

StartNode.displayName = 'StartNode';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN NODE  – solid yellow, bold – central learning path
// ─────────────────────────────────────────────────────────────────────────────
export const MainNode = memo(({ data }: NodeProps<RoadmapNodeData>) => (
  <div
    className={`
      relative px-4 py-2.5 rounded-md border-2 w-[200px] text-center font-semibold text-sm
      shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5
      ${
        data.completed
          ? 'bg-green-100 border-green-400 text-green-900 dark:bg-green-900/30 dark:border-green-500 dark:text-green-300'
          : 'bg-yellow-300 border-yellow-500 text-gray-900 dark:bg-yellow-400 dark:border-yellow-600'
      }
    `}
  >
    {/* Handles – all four sides */}
    <H type="target" pos={Position.Top} />
    <H type="source" pos={Position.Bottom} />
    {/* Right handles – 5 spread positions */}
    <H type="source" pos={Position.Right} id="r1" top="10%" />
    <H type="source" pos={Position.Right} id="r2" top="28%" />
    <H type="source" pos={Position.Right} id="right" top="50%" />
    <H type="source" pos={Position.Right} id="r4" top="72%" />
    <H type="source" pos={Position.Right} id="r5" top="90%" />
    {/* Left handles – 5 spread positions */}
    <H type="source" pos={Position.Left} id="l1" top="10%" />
    <H type="source" pos={Position.Left} id="l2" top="28%" />
    <H type="source" pos={Position.Left} id="left" top="50%" />
    <H type="source" pos={Position.Left} id="l4" top="72%" />
    <H type="source" pos={Position.Left} id="l5" top="90%" />

    {data.completed && <CompletedBadge />}
    <Tooltip content={TOOLTIP_MAP[data.label] ?? data.label} containerClassName="cursor-pointer">
      <span>{data.label}</span>
    </Tooltip>
  </div>
));

MainNode.displayName = 'MainNode';

// ─────────────────────────────────────────────────────────────────────────────
// BRANCH NODE (right)  – cream/amber box, sub-topic
// ─────────────────────────────────────────────────────────────────────────────
export const BranchNode = memo(({ data }: NodeProps<RoadmapNodeData>) => (
  <div
    className={`
      relative ${SUBNODE_FADE_CLASS} px-3 py-2 rounded-md border min-w-[190px] text-center text-xs font-medium
      shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5
      ${
        data.completed
          ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'
          : 'bg-amber-50 border-amber-300 text-gray-800 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-200'
      }
    `}
  >
    <H type="target" pos={Position.Left}  id="left" />
    <H type="source" pos={Position.Right} id="right" />
    {data.completed && <CompletedBadge />}
    <Tooltip content={TOOLTIP_MAP[data.label] ?? data.label} containerClassName="cursor-pointer">
      <span>{data.label}</span>
    </Tooltip>
  </div>
));

BranchNode.displayName = 'BranchNode';

// ─────────────────────────────────────────────────────────────────────────────
// LEFT BRANCH NODE  – same style but flipped handles (appears on left column)
// ─────────────────────────────────────────────────────────────────────────────
export const LeftBranchNode = memo(({ data }: NodeProps<RoadmapNodeData>) => (
  <div
    className={`
      relative ${SUBNODE_FADE_CLASS} px-3 py-2 rounded-md border min-w-[190px] text-center text-xs font-medium
      shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5
      ${
        data.completed
          ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'
          : 'bg-amber-50 border-amber-300 text-gray-800 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-200'
      }
    `}
  >
    <H type="source" pos={Position.Left}  id="left" />
    <H type="target" pos={Position.Right} id="right" />
    {data.completed && <CompletedBadge />}
    <Tooltip content={TOOLTIP_MAP[data.label] ?? data.label} containerClassName="cursor-pointer">
      <span>{data.label}</span>
    </Tooltip>
  </div>
));

LeftBranchNode.displayName = 'LeftBranchNode';

// ─────────────────────────────────────────────────────────────────────────────
// OPTION NODE  – small pill, for npm/yarn/pnpm/Bun etc.
// ─────────────────────────────────────────────────────────────────────────────
export const OptionNode = memo(({ data }: NodeProps<RoadmapNodeData>) => (
  <div
    className={`
      relative ${SUBNODE_FADE_CLASS} px-3 py-1.5 rounded-full border text-center text-xs font-semibold
      shadow-sm cursor-pointer transition-all hover:shadow-md
      ${
        data.completed
          ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-300'
          : 'bg-amber-50 border-gray-400 text-gray-700 dark:bg-zinc-800 dark:border-zinc-500 dark:text-zinc-200'
      }
      min-w-[70px]
    `}
  >
    <H type="target" pos={Position.Left}  id="left" />
    <H type="target" pos={Position.Top}   id="top" />
    {data.completed && <CompletedBadge />}
    <Tooltip content={TOOLTIP_MAP[data.label] ?? data.label} containerClassName="cursor-pointer">
      <span>{data.label}</span>
    </Tooltip>
  </div>
));

OptionNode.displayName = 'OptionNode';

// ─────────────────────────────────────────────────────────────────────────────
// INFO CARD  – text hint block, no connection handles needed
// ─────────────────────────────────────────────────────────────────────────────
export const InfoCard = memo(({ data }: NodeProps<RoadmapNodeData>) => (
  <div className="max-w-[220px] rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-sm p-3 text-xs text-gray-600 dark:text-zinc-300 italic leading-relaxed text-center pointer-events-none">
    {data.label}
  </div>
));

InfoCard.displayName = 'InfoCard';

// ─────────────────────────────────────────────────────────────────────────────
// nodeTypes map – import this into the ReactFlow page
// ─────────────────────────────────────────────────────────────────────────────
export const nodeTypes = {
  startNode:      StartNode,
  mainNode:       MainNode,
  branchNode:     BranchNode,
  leftBranchNode: LeftBranchNode,
  optionNode:     OptionNode,
  infoCard:       InfoCard,
};
