import { BACKEND_NODE_DETAILS, BACKEND_SECTION_NODE_MAP } from '@/data/backendNodeDetails';
import {
  FULLSTACK_MERN_NODE_DETAILS,
  FULLSTACK_MERN_SECTION_NODE_MAP,
} from '@/data/fullstackMernNodeDetails';

// ─────────────────────────────────────────────────────────────────────────────
// Unified detail data for all 15 roadmap sections and their sub-nodes
// ─────────────────────────────────────────────────────────────────────────────

export type ResourceType = 'article' | 'video' | 'interactive' | 'book';

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
}

export interface SubNodeDetail {
  id: string;
  label: string;
  intro: string;
  whatYoullLearn: string[];
  resources: Resource[];
}

export interface SectionMeta {
  id: string;
  label: string;
  description: string;
}

export interface SectionData {
  section: SectionMeta;
  subNodes: SubNodeDetail[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_NODE_DETAILS: Record<string, SectionData> = {

  // ── INTERNET ───────────────────────────────────────────────────────────────
  internet: {
    section: {
      id: 'internet',
      label: 'Internet',
      description:
        'Before writing a single line of frontend code, you need to understand the infrastructure your apps run on. The internet is a global network of networks — learning how data travels, how browsers render pages, and what DNS does will make you a far better developer.',
    },
    subNodes: [
      {
        id: 'i1',
        label: 'How does the internet work?',
        intro:
          'The internet is a massive global network that allows computers to communicate with each other. Data is broken into small packets, routed across interconnected networks via routers, and reassembled at the destination — all in milliseconds.',
        whatYoullLearn: [
          'How data is split into packets and reassembled',
          'The role of routers and the global backbone',
          'What an IP address is and how it identifies devices',
          'The difference between the internet and the World Wide Web',
          'How physical infrastructure (cables, satellites) connects countries',
        ],
        resources: [
          { title: 'How the Internet Works – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work', type: 'article' },
          { title: 'How the Internet Works in 5 Minutes – YouTube', url: 'https://www.youtube.com/watch?v=7_LPdttKXPc', type: 'video' },
          { title: 'CS50 – How the Internet Works', url: 'https://www.youtube.com/watch?v=n_KghQP86Sw', type: 'video' },
          { title: 'How the Internet Works – Cloudflare', url: 'https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/', type: 'article' },
        ],
      },
      {
        id: 'i2',
        label: 'What is HTTP?',
        intro:
          'HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web. Every time you visit a webpage, your browser sends an HTTP request and the server sends back an HTTP response. HTTPS is the encrypted version using TLS.',
        whatYoullLearn: [
          'The request/response cycle between browser and server',
          'HTTP methods: GET, POST, PUT, DELETE, PATCH',
          'HTTP status codes: 200 OK, 301, 404, 500 etc.',
          'HTTP headers and what they communicate',
          'Difference between HTTP/1.1, HTTP/2, and HTTP/3',
          'How HTTPS encrypts traffic using TLS/SSL',
        ],
        resources: [
          { title: 'HTTP Overview – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'article' },
          { title: 'HTTP Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0', type: 'video' },
          { title: 'HTTP/3 Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/performance/what-is-http3/', type: 'article' },
          { title: 'HTTP Status Codes Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status', type: 'article' },
        ],
      },
      {
        id: 'i3',
        label: 'What is a Domain Name?',
        intro:
          'A domain name is the human-readable address for a website (e.g. google.com). It maps to an underlying IP address via DNS. Domain names are registered through registrars for a yearly fee and structured in a hierarchy of TLDs, domains, and subdomains.',
        whatYoullLearn: [
          'Structure of a domain name: subdomain, domain, TLD',
          'How domain registration and ownership works',
          'What a registrar is (Namecheap, GoDaddy, Google Domains)',
          'How domain names map to IP addresses via DNS records',
          'What WHOIS lookup reveals about a domain',
        ],
        resources: [
          { title: 'What is a Domain Name? – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name', type: 'article' },
          { title: 'Domain Names Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/dns/glossary/what-is-a-domain-name/', type: 'article' },
          { title: 'How Domain Names Work – YouTube', url: 'https://www.youtube.com/watch?v=Y4cRx19nhJk', type: 'video' },
        ],
      },
      {
        id: 'i4',
        label: 'What is Hosting?',
        intro:
          'Web hosting is a service that stores your website files on a server connected to the internet, making them accessible to anyone, anywhere. Choosing the right hosting type depends on your traffic, budget, and technical needs.',
        whatYoullLearn: [
          'Shared vs VPS vs Dedicated vs Cloud hosting',
          'What static hosting means (Vercel, Netlify, GitHub Pages)',
          'What a web server is (Apache, Nginx)',
          'How your domain connects to your hosting via DNS A records',
          'Concepts of uptime, bandwidth, and CDN',
        ],
        resources: [
          { title: 'What is Web Hosting? – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_web_server', type: 'article' },
          { title: 'Web Hosting Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/performance/what-is-web-hosting/', type: 'article' },
          { title: 'Types of Web Hosting – YouTube', url: 'https://www.youtube.com/watch?v=Xq_-ROm1zEQ', type: 'video' },
        ],
      },
      {
        id: 'i5',
        label: 'DNS and how it works?',
        intro:
          "DNS (Domain Name System) is the internet's phone book. It translates human-readable domain names like \"github.com\" into machine-readable IP addresses. DNS lookups happen transparently behind every web request you make.",
        whatYoullLearn: [
          'What DNS records are: A, AAAA, CNAME, MX, TXT',
          'The DNS resolution process: recursive resolver → root → TLD → authoritative',
          'What DNS caching and TTL mean',
          'How to diagnose DNS issues with tools like nslookup / dig',
          'What DNS propagation means when you update records',
        ],
        resources: [
          { title: 'DNS Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/', type: 'article' },
          { title: 'DNS Records Explained – YouTube', url: 'https://www.youtube.com/watch?v=HnUDtycXSNE', type: 'video' },
          { title: 'How DNS Works – interactive comic', url: 'https://howdns.works/', type: 'interactive' },
        ],
      },
      {
        id: 'i6',
        label: 'Browsers and how they work?',
        intro:
          'The browser is the runtime environment for your frontend code. Understanding how it parses HTML, builds the DOM, applies CSS, runs JavaScript, and paints pixels helps you write faster, bug-free code.',
        whatYoullLearn: [
          'The browser rendering pipeline: Parse → Style → Layout → Paint → Composite',
          'What the DOM and CSSOM are',
          'How JavaScript blocks rendering and why async/defer matter',
          'What reflow and repaint are (and why they are expensive)',
          'How browser caching, service workers, and storage APIs work',
        ],
        resources: [
          { title: 'How Browsers Work – web.dev', url: 'https://web.dev/articles/howbrowserswork', type: 'article' },
          { title: 'Browser Rendering Pipeline – Chrome DevRel', url: 'https://developers.google.com/web/fundamentals/performance/critical-rendering-path', type: 'article' },
          { title: 'JavaScript Engine & Runtime – Fireship', url: 'https://www.youtube.com/watch?v=oc6faXVc54E', type: 'video' },
          { title: 'Inside look at a modern web browser – Google', url: 'https://developer.chrome.com/blog/inside-browser-part1/', type: 'article' },
        ],
      },
    ],
  },

  // ── HTML ───────────────────────────────────────────────────────────────────
  html: {
    section: {
      id: 'html',
      label: 'HTML',
      description:
        'HTML is the skeleton of every webpage. It defines structure and meaning of content through elements and attributes. Mastering semantic HTML, accessible forms, and SEO fundamentals is the bedrock of every frontend career.',
    },
    subNodes: [
      {
        id: 'h1',
        label: 'Semantic HTML',
        intro:
          'Semantic HTML uses elements that carry meaning — like <article>, <nav>, <section>, and <header> — instead of generic <div> and <span> tags. This helps browsers, screen readers, and search engines understand your content.',
        whatYoullLearn: [
          'The difference between semantic and non-semantic elements',
          'When to use <article>, <section>, <aside>, <main>, <header>, <footer>',
          'How semantic markup improves accessibility and SEO',
          'Landmark roles and how they aid screen reader navigation',
          'Common mistakes developers make with divitis',
        ],
        resources: [
          { title: 'Semantic HTML – MDN', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html', type: 'article' },
          { title: 'HTML Semantic Elements – w3schools', url: 'https://www.w3schools.com/html/html5_semantic_elements.asp', type: 'article' },
          { title: 'Why Semantic HTML Matters – YouTube', url: 'https://www.youtube.com/watch?v=kGW8Al_cga4', type: 'video' },
          { title: 'Learn HTML – web.dev', url: 'https://web.dev/learn/html', type: 'interactive' },
        ],
      },
      {
        id: 'h2',
        label: 'Forms & Validations',
        intro:
          'HTML forms are the primary way users input data on the web. Modern HTML5 provides built-in validation attributes that work natively without JavaScript, reducing boilerplate and improving user experience.',
        whatYoullLearn: [
          'All form input types: text, email, number, range, date, file, etc.',
          'Native HTML5 validation: required, pattern, min, max, maxlength',
          'The <label> element and importance of proper association',
          'Fieldsets, legends, and grouping related inputs',
          'Form submission, action, method GET vs POST',
        ],
        resources: [
          { title: 'HTML Forms – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms', type: 'article' },
          { title: 'HTML Form Validation – web.dev', url: 'https://web.dev/learn/forms/validation', type: 'article' },
          { title: 'HTML Forms Full Tutorial – Kevin Powell', url: 'https://www.youtube.com/watch?v=fNcJuPIZ2WE', type: 'video' },
        ],
      },
      {
        id: 'h3',
        label: 'Accessibility (a11y)',
        intro:
          'Accessibility ensures your web app is usable by everyone, including people with visual, motor, auditory, or cognitive disabilities. It is both an ethical responsibility and increasingly a legal requirement.',
        whatYoullLearn: [
          'WCAG 2.1 guidelines and the four principles: POUR',
          'ARIA roles, properties, and states — when to use and when NOT to',
          'Keyboard navigation and focus management',
          'Colour contrast ratios and text sizing best practices',
          'Using screen readers (NVDA, VoiceOver) to test your pages',
        ],
        resources: [
          { title: 'Accessibility – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', type: 'article' },
          { title: 'A11y Checklist – a11yproject.com', url: 'https://www.a11yproject.com/checklist/', type: 'interactive' },
          { title: 'Learn Accessibility – web.dev', url: 'https://web.dev/learn/accessibility', type: 'article' },
          { title: 'ARIA Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=0hqhAIjE_8I', type: 'video' },
        ],
      },
      {
        id: 'h4',
        label: 'SEO Basics',
        intro:
          'SEO (Search Engine Optimisation) is the practice of structuring HTML so search engines can correctly crawl, index, and rank your pages. Good HTML structure directly translates to better search visibility.',
        whatYoullLearn: [
          'Title tags, meta description, and Open Graph tags',
          'Proper use of heading hierarchy (h1–h6)',
          'Canonical URLs and avoiding duplicate content',
          'Structured data with JSON-LD and schema.org',
          'Sitemaps and robots.txt basics',
        ],
        resources: [
          { title: "Google's SEO Starter Guide", url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', type: 'article' },
          { title: 'SEO for Developers – Fireship', url: 'https://www.youtube.com/watch?v=-B58GgsehKQ', type: 'video' },
          { title: 'Open Graph Protocol', url: 'https://ogp.me/', type: 'article' },
        ],
      },
    ],
  },

  // ── CSS ────────────────────────────────────────────────────────────────────
  css: {
    section: {
      id: 'css',
      label: 'CSS',
      description:
        'CSS controls the visual presentation of your HTML. From layout systems like Flexbox and Grid to animations and responsive design, CSS mastery separates good developers from great ones.',
    },
    subNodes: [
      {
        id: 'c1',
        label: 'Flexbox',
        intro:
          'Flexbox (Flexible Box Layout) is a one-dimensional layout model that lets you align and distribute items in a container with powerful control over space, direction, and order — without floats or positioning hacks.',
        whatYoullLearn: [
          'Flex container vs flex items and the flex formatting context',
          'Main axis vs cross axis, flex-direction, and flex-wrap',
          'justify-content, align-items, align-self, align-content',
          'flex-grow, flex-shrink, flex-basis and the flex shorthand',
          'Practical patterns: centering, equal columns, sticky footer',
        ],
        resources: [
          { title: 'Flexbox – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox', type: 'article' },
          { title: 'Flexbox Froggy (interactive game)', url: 'https://flexboxfroggy.com/', type: 'interactive' },
          { title: 'Flexbox Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=3YW65K6LcIA', type: 'video' },
          { title: 'A Complete Guide to Flexbox – CSS-Tricks', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'article' },
        ],
      },
      {
        id: 'c2',
        label: 'CSS Grid',
        intro:
          'CSS Grid is a two-dimensional layout system for the web. It lets you work with rows and columns simultaneously and is ideal for building complex page layouts that would be difficult to achieve with Flexbox alone.',
        whatYoullLearn: [
          'Defining grid containers and tracks with grid-template-columns/rows',
          'fr units, minmax(), auto-fill, and auto-fit',
          'Placing items with grid-column, grid-row, and grid-area',
          'Named grid areas for readable layouts',
          'When to use Grid vs Flexbox',
        ],
        resources: [
          { title: 'CSS Grid – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout', type: 'article' },
          { title: 'CSS Grid Garden (interactive game)', url: 'https://cssgridgarden.com/', type: 'interactive' },
          { title: 'CSS Grid Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=0xMQfnTU6oo', type: 'video' },
          { title: 'A Complete Guide to Grid – CSS-Tricks', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'article' },
        ],
      },
      {
        id: 'c3',
        label: 'Responsive Design',
        intro:
          'Responsive design ensures your UI looks and works great on any screen size — from a 320px phone to a 4K monitor. It combines fluid layouts, flexible images, and CSS media queries.',
        whatYoullLearn: [
          'The meta viewport tag and why it matters on mobile',
          'CSS media queries: min-width, max-width, and breakpoints',
          'Fluid typography with clamp(), rem, and vw units',
          'Mobile-first vs desktop-first design approach',
          'Container queries — the next evolution of responsive design',
        ],
        resources: [
          { title: 'Responsive Design – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design', type: 'article' },
          { title: 'Responsive Web Design – web.dev', url: 'https://web.dev/learn/design', type: 'article' },
          { title: 'Responsive Design in 30 Minutes – Traversy Media', url: 'https://www.youtube.com/watch?v=yU7jJ3NbPdA', type: 'video' },
        ],
      },
      {
        id: 'c4',
        label: 'CSS Animations',
        intro:
          'CSS animations and transitions add life to your interfaces without any JavaScript. When used tastefully they improve perceived performance and guide user attention — when overused they hurt UX.',
        whatYoullLearn: [
          'CSS transitions: property, duration, easing, delay',
          '@keyframes and the animation shorthand',
          'transform: translate, rotate, scale, skew',
          'will-change and GPU compositing for performance',
          'Accessibility: respecting prefers-reduced-motion',
        ],
        resources: [
          { title: 'CSS Animations – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations', type: 'article' },
          { title: 'CSS Animation Tutorial – Kevin Powell', url: 'https://www.youtube.com/watch?v=YszONjKpgg4', type: 'video' },
          { title: 'Animation Performance – web.dev', url: 'https://web.dev/articles/animations-guide', type: 'article' },
        ],
      },
    ],
  },

  // ── JAVASCRIPT ─────────────────────────────────────────────────────────────
  javascript: {
    section: {
      id: 'javascript',
      label: 'JavaScript',
      description:
        'JavaScript is the programming language of the web. It turns static HTML pages into dynamic, interactive applications. Mastering modern JS — especially ES6+ syntax and asynchronous patterns — is non-negotiable for any frontend developer.',
    },
    subNodes: [
      {
        id: 'js1',
        label: 'ES6+ Features',
        intro:
          'ES6 (ES2015) and beyond transformed JavaScript from a scripting toy into a serious programming language. These modern features make code more expressive, concise, and maintainable.',
        whatYoullLearn: [
          'let, const, and block scoping',
          'Arrow functions and their this binding behaviour',
          'Destructuring arrays and objects',
          'Template literals, spread/rest operator, default parameters',
          'Modules: import / export (ESM)',
          'Optional chaining (?.) and nullish coalescing (??)',
        ],
        resources: [
          { title: 'ES6+ Features – javascript.info', url: 'https://javascript.info/es-modern', type: 'article' },
          { title: 'ES6 Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=WZQc7RUAg18', type: 'video' },
          { title: 'Modern JavaScript – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'article' },
        ],
      },
      {
        id: 'js2',
        label: 'DOM Manipulation',
        intro:
          'The DOM (Document Object Model) is the tree representation of your HTML that JavaScript can read and modify. DOM manipulation is how you make pages dynamic — responding to events, updating content, and changing styles at runtime.',
        whatYoullLearn: [
          'Selecting elements: querySelector, getElementById, querySelectorAll',
          'Modifying elements: textContent, innerHTML, setAttribute',
          'Creating and inserting elements: createElement, appendChild, insertAdjacentHTML',
          'Event listeners: addEventListener, event propagation, bubbling vs capturing',
          'Event delegation pattern for dynamic elements',
        ],
        resources: [
          { title: 'DOM Manipulation – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents', type: 'article' },
          { title: 'DOM Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=0ik6X4DJKCc', type: 'video' },
          { title: 'javascript.info – The DOM', url: 'https://javascript.info/document', type: 'article' },
        ],
      },
      {
        id: 'js3',
        label: 'Fetch API / AJAX',
        intro:
          'The Fetch API is the modern way to make HTTP requests from JavaScript. It replaced older XMLHttpRequest (XHR/AJAX) patterns and pairs perfectly with async/await for clean, readable network code.',
        whatYoullLearn: [
          'Making GET and POST requests with fetch()',
          'Reading JSON responses with response.json()',
          'Sending data with headers and body',
          'Error handling: network errors vs HTTP errors',
          'The old XMLHttpRequest pattern (for context)',
        ],
        resources: [
          { title: 'Fetch API – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', type: 'article' },
          { title: 'Fetch API Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=Oive66jrwBs', type: 'video' },
          { title: 'javascript.info – Fetch', url: 'https://javascript.info/fetch', type: 'article' },
        ],
      },
      {
        id: 'js4',
        label: 'Async / Await & Promises',
        intro:
          'Asynchronous JavaScript lets you perform long-running operations (network requests, timers, file reads) without blocking the main thread. Promises and async/await are the two pillars of modern async JS.',
        whatYoullLearn: [
          'What the JavaScript event loop is and why it matters',
          'Promises: resolve, reject, .then(), .catch(), .finally()',
          'async / await syntax and how it wraps Promises',
          'Promise.all(), Promise.race(), Promise.allSettled()',
          'Common async pitfalls: unhandled rejections, sequential vs parallel',
        ],
        resources: [
          { title: 'Async/Await – javascript.info', url: 'https://javascript.info/async-await', type: 'article' },
          { title: 'JavaScript Promises – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises', type: 'article' },
          { title: 'Event Loop Explained – Jake Archibald (JSConf)', url: 'https://www.youtube.com/watch?v=cCOL7MC4Pl0', type: 'video' },
          { title: 'Async JS Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=PoRJizFvM7s', type: 'video' },
        ],
      },
    ],
  },

  // ── VERSION CONTROL ────────────────────────────────────────────────────────
  'version-control': {
    section: {
      id: 'version-control',
      label: 'Version Control',
      description:
        'Version control is how developers track changes to code over time, collaborate with teammates, and recover from mistakes. Git is the undisputed industry standard — you will use it every single day.',
    },
    subNodes: [
      {
        id: 'git',
        label: 'Git',
        intro:
          'Git is a distributed version control system created by Linus Torvalds. It tracks changes in your code, lets you branch off to work on features in isolation, and merge them back when ready — forming the backbone of modern software development.',
        whatYoullLearn: [
          'Core concepts: repository, commit, staging area, working tree',
          'Essential commands: init, add, commit, status, log, diff',
          'Branching and merging: branch, checkout, merge, rebase',
          'Remote repositories: clone, push, pull, fetch',
          'Resolving merge conflicts and understanding HEAD',
          'Git workflows: feature branching, Gitflow, trunk-based development',
        ],
        resources: [
          { title: 'Git Documentation – official', url: 'https://git-scm.com/doc', type: 'article' },
          { title: 'Git & GitHub Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc', type: 'video' },
          { title: 'Learn Git Branching (interactive)', url: 'https://learngitbranching.js.org/', type: 'interactive' },
          { title: 'Pro Git Book – free online', url: 'https://git-scm.com/book/en/v2', type: 'book' },
        ],
      },
    ],
  },

  // ── VCS HOSTING ────────────────────────────────────────────────────────────
  'vcs-hosting': {
    section: {
      id: 'vcs-hosting',
      label: 'VCS Hosting',
      description:
        'VCS hosting platforms store your Git repositories in the cloud and add layers of collaboration tooling — pull requests, code review, issues, CI/CD, and more. GitHub is the market leader; GitLab is strong in enterprise and self-hosting.',
    },
    subNodes: [
      {
        id: 'github',
        label: 'GitHub',
        intro:
          'GitHub is the world\'s most popular platform for hosting Git repositories. With over 100 million developers, it is where open source happens and where most employers expect to see your work. Learning GitHub is essential for your career.',
        whatYoullLearn: [
          'Creating repos, forking, and starring projects',
          'Pull Requests: opening, reviewing, and merging',
          'GitHub Issues and project boards',
          'GitHub Actions for automated CI/CD pipelines',
          'GitHub Pages for free static site hosting',
          'SSH keys and personal access tokens',
        ],
        resources: [
          { title: 'GitHub Docs – Getting Started', url: 'https://docs.github.com/en/get-started', type: 'article' },
          { title: 'GitHub for Beginners – YouTube', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', type: 'video' },
          { title: 'GitHub Actions Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=eB0nUzAI7M8', type: 'video' },
        ],
      },
      {
        id: 'gitlab',
        label: 'GitLab',
        intro:
          'GitLab is an all-in-one DevOps platform that can be used as a cloud SaaS or self-hosted. It has strong built-in CI/CD, container registry, and security scanning features that make it popular in enterprise environments.',
        whatYoullLearn: [
          'GitLab repos, merge requests, and code review workflow',
          'GitLab CI/CD with .gitlab-ci.yml pipelines',
          'GitLab Container Registry and package management',
          'Differences between GitHub and GitLab',
          'Self-hosting GitLab Community Edition',
        ],
        resources: [
          { title: 'GitLab Docs', url: 'https://docs.gitlab.com/', type: 'article' },
          { title: 'GitLab CI/CD Tutorial – YouTube', url: 'https://www.youtube.com/watch?v=qP8kir2GUgo', type: 'video' },
        ],
      },
    ],
  },

  // ── PACKAGE MANAGERS ───────────────────────────────────────────────────────
  'pkg-managers': {
    section: {
      id: 'pkg-managers',
      label: 'Package Managers',
      description:
        'Package managers automate the installation, updating, and removal of third-party libraries your project depends on. They also manage version locking to ensure reproducible builds across different machines.',
    },
    subNodes: [
      {
        id: 'npm',
        label: 'npm',
        intro:
          'npm (Node Package Manager) is the default package manager that ships with Node.js. With over 2 million packages in its registry, it is the largest software registry in the world.',
        whatYoullLearn: [
          'npm init, install, uninstall, update, and run',
          'package.json: dependencies, devDependencies, scripts',
          'package-lock.json and why it should be committed',
          'npx for running packages without installing them globally',
          'Semantic versioning: ^, ~, and exact versions',
        ],
        resources: [
          { title: 'npm Docs', url: 'https://docs.npmjs.com/', type: 'article' },
          { title: 'npm Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=jHDhaSSKmB0', type: 'video' },
        ],
      },
      {
        id: 'yarn',
        label: 'yarn',
        intro:
          'Yarn is a package manager built by Facebook as a faster and more reliable alternative to early npm. Yarn v2 (Berry) introduced Plug\'n\'Play, a zero-installs approach that eliminates the node_modules folder.',
        whatYoullLearn: [
          'yarn add, remove, install, and upgrade commands',
          'yarn.lock and workspace support for monorepos',
          'Yarn Workspaces for managing multi-package projects',
          'Differences between Yarn Classic (v1) and Yarn Berry (v2+)',
        ],
        resources: [
          { title: 'Yarn Docs', url: 'https://yarnpkg.com/getting-started', type: 'article' },
          { title: 'Yarn vs npm – YouTube', url: 'https://www.youtube.com/watch?v=0DGClKGNva0', type: 'video' },
        ],
      },
      {
        id: 'pnpm',
        label: 'pnpm',
        intro:
          'pnpm is a fast, disk-efficient package manager that uses a content-addressable store and hard links to avoid duplicating packages across projects. It is especially popular in monorepo setups.',
        whatYoullLearn: [
          'How pnpm\'s global store saves disk space',
          'pnpm add, install, and workspace protocol',
          'pnpm vs npm vs yarn: when to choose each',
          'Setting up a pnpm monorepo with pnpm-workspace.yaml',
        ],
        resources: [
          { title: 'pnpm Docs', url: 'https://pnpm.io/motivation', type: 'article' },
          { title: 'pnpm in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=d1E31WPR70g', type: 'video' },
        ],
      },
      {
        id: 'bun',
        label: 'Bun',
        intro:
          'Bun is an all-in-one JavaScript runtime, bundler, test runner, and package manager built for speed. Written in Zig, it is dramatically faster than Node.js + npm for many workloads and is gaining rapid adoption.',
        whatYoullLearn: [
          'bun install, add, remove commands',
          'How Bun\'s lockfile (bun.lockb) differs from npm\'s',
          'Using Bun as a runtime (bun run) and test runner (bun test)',
          'Bun\'s compatibility with Node.js and npm packages',
        ],
        resources: [
          { title: 'Bun Docs', url: 'https://bun.sh/docs', type: 'article' },
          { title: 'Bun in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=dWqNgzZwVJQ', type: 'video' },
        ],
      },
    ],
  },

  // ── PICK A FRAMEWORK ───────────────────────────────────────────────────────
  framework: {
    section: {
      id: 'framework',
      label: 'Pick a Framework',
      description:
        'JavaScript UI frameworks let you build complex, stateful interfaces with reusable components. React dominates the job market; Vue is beginner-friendly; Angular is enterprise-grade; Svelte and SolidJS represent the modern, compiler-first wave.',
    },
    subNodes: [
      {
        id: 'react',
        label: 'React',
        intro:
          'React is a JavaScript library for building user interfaces, created by Meta. It introduced the component model and virtual DOM to the mainstream and remains the most in-demand frontend skill globally.',
        whatYoullLearn: [
          'JSX syntax and how React transforms it',
          'Functional components and hooks: useState, useEffect, useContext',
          'Props, state, and the one-way data flow principle',
          'Component lifecycle through the useEffect hook',
          'React Router for client-side navigation',
          'State management patterns: Context API, Zustand, or Redux Toolkit',
        ],
        resources: [
          { title: 'React Official Docs (new)', url: 'https://react.dev/', type: 'article' },
          { title: 'React Course – freeCodeCamp (YouTube)', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', type: 'video' },
          { title: 'React in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', type: 'video' },
        ],
      },
      {
        id: 'vuejs',
        label: 'Vue.js',
        intro:
          'Vue.js is a progressive JavaScript framework known for its gentle learning curve and excellent documentation. It uses a single-file component format (.vue) and reactive data binding that many developers find intuitive.',
        whatYoullLearn: [
          'Vue 3 Composition API vs Options API',
          'Template syntax, directives (v-if, v-for, v-model)',
          'Reactivity with ref() and reactive()',
          'Vue Router and Pinia for state management',
          'Single File Components (.vue) structure',
        ],
        resources: [
          { title: 'Vue.js Official Docs', url: 'https://vuejs.org/guide/introduction.html', type: 'article' },
          { title: 'Vue 3 Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=VeNfHj6MhgA', type: 'video' },
        ],
      },
      {
        id: 'angular',
        label: 'Angular',
        intro:
          'Angular is a full-featured, opinionated framework by Google. Built with TypeScript from the ground up, it provides a complete solution including routing, forms, HTTP, and dependency injection — making it a favourite in enterprise development.',
        whatYoullLearn: [
          'Angular modules, components, and the decorator pattern',
          'Two-way data binding with ngModel',
          'Angular services and dependency injection',
          'Routing with the Angular Router',
          'RxJS observables and reactive patterns',
        ],
        resources: [
          { title: 'Angular Official Docs', url: 'https://angular.dev/', type: 'article' },
          { title: 'Angular Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=3dHNOWTI7H8', type: 'video' },
        ],
      },
      {
        id: 'svelte',
        label: 'Svelte',
        intro:
          'Svelte is a compiler-based framework that shifts work to build time, producing tiny, highly optimised vanilla JavaScript with no virtual DOM overhead. Its syntax is the most HTML-like of all major frameworks.',
        whatYoullLearn: [
          'How Svelte compiles components to vanilla JS',
          'Reactive declarations and stores',
          'Svelte\'s template syntax: {#if}, {#each}, bind:',
          'SvelteKit for full-stack Svelte apps',
          'Trade-offs vs React/Vue in bundle size and interactivity',
        ],
        resources: [
          { title: 'Svelte Official Tutorial', url: 'https://learn.svelte.dev/', type: 'interactive' },
          { title: 'Svelte in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=rv3Yq-B8qp4', type: 'video' },
        ],
      },
      {
        id: 'solidjs',
        label: 'Solid JS',
        intro:
          'SolidJS is a reactive UI library that compiles JSX to fine-grained DOM updates — no virtual DOM, no diffing. It achieves React-like DX with near-native performance, making it one of the fastest UI frameworks available.',
        whatYoullLearn: [
          'Signals: the primitive unit of reactivity',
          'createSignal, createEffect, createMemo',
          'How SolidJS differs from React in rendering model',
          'SolidStart for full-stack SolidJS applications',
          'When to consider SolidJS over React',
        ],
        resources: [
          { title: 'SolidJS Official Docs', url: 'https://www.solidjs.com/guides/getting-started', type: 'article' },
          { title: 'Solid in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=hw3Bx5vxKl0', type: 'video' },
        ],
      },
    ],
  },

  // ── CSS FRAMEWORKS ─────────────────────────────────────────────────────────
  'css-frameworks': {
    section: {
      id: 'css-frameworks',
      label: 'CSS Frameworks',
      description:
        'CSS frameworks speed up styling by providing pre-built utilities, components, or design systems. Tailwind takes a utility-first approach; Bootstrap provides pre-styled components; Material UI and Chakra bring design-system-as-code.',
    },
    subNodes: [
      {
        id: 'tailwind',
        label: 'Tailwind CSS',
        intro:
          'Tailwind CSS is a utility-first CSS framework where you compose designs by applying small, single-purpose classes directly in your HTML/JSX. It eliminates context-switching between HTML and CSS files and produces heavily optimised production CSS.',
        whatYoullLearn: [
          'Core utility classes: spacing, typography, colours, flex, grid',
          'Responsive prefixes: sm:, md:, lg:, xl:',
          'State variants: hover:, focus:, dark:, group-hover:',
          'Customising the design system in tailwind.config',
          'The @apply directive for extracting reusable styles',
        ],
        resources: [
          { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', type: 'article' },
          { title: 'Tailwind CSS Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=dFgzHOX84xQ', type: 'video' },
          { title: 'Tailwind CSS Tutorial – The Net Ninja', url: 'https://www.youtube.com/watch?v=bxmDnn7lrnk', type: 'video' },
        ],
      },
      {
        id: 'bootstrap',
        label: 'Bootstrap',
        intro:
          'Bootstrap is the most widely used CSS framework, providing a responsive grid system, pre-built UI components, and JavaScript plugins. Its class-based API is opinionated but very productive for quickly building standard interfaces.',
        whatYoullLearn: [
          'Bootstrap\'s 12-column grid system and breakpoints',
          'Pre-built components: navbar, modal, card, carousel',
          'Bootstrap utility classes for spacing and typography',
          'Overriding Bootstrap with custom CSS or Sass variables',
          'Bootstrap 5 vs older versions (no jQuery dependency)',
        ],
        resources: [
          { title: 'Bootstrap 5 Docs', url: 'https://getbootstrap.com/docs/', type: 'article' },
          { title: 'Bootstrap 5 Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=4sosXZsdy-s', type: 'video' },
        ],
      },
      {
        id: 'material-ui',
        label: 'Material UI / Chakra',
        intro:
          'Material UI (MUI) and Chakra UI are React component libraries that implement design systems (Google Material Design and a custom accessible system respectively). They let you build polished UIs extremely quickly.',
        whatYoullLearn: [
          'Installing and theming MUI or Chakra in a React app',
          'Using pre-built components: Button, Modal, Table, Form',
          'The sx prop and style system in MUI',
          'Chakra\'s useColorMode hook for dark mode',
          'When to use a component library vs custom Tailwind',
        ],
        resources: [
          { title: 'MUI Docs', url: 'https://mui.com/material-ui/getting-started/', type: 'article' },
          { title: 'Chakra UI Docs', url: 'https://chakra-ui.com/getting-started', type: 'article' },
          { title: 'MUI Crash Course – YouTube', url: 'https://www.youtube.com/watch?v=vyJU9efvUtQ', type: 'video' },
        ],
      },
    ],
  },

  // ── BUILD TOOLS ────────────────────────────────────────────────────────────
  'build-tools': {
    section: {
      id: 'build-tools',
      label: 'Build Tools / Linters',
      description:
        'Build tools transform, bundle, and optimise your source code for production. Linters and formatters enforce consistent code style and catch errors automatically — making large codebases maintainable.',
    },
    subNodes: [
      {
        id: 'vite',
        label: 'Vite',
        intro:
          'Vite is a next-generation frontend build tool by Evan You (creator of Vue). It uses native ES modules in development for instant server start and HMR, and Rollup for optimised production builds.',
        whatYoullLearn: [
          'How Vite\'s dev server differs from Webpack\'s bundle-first approach',
          'vite.config.ts: plugins, aliases, and build options',
          'Environment variables with import.meta.env',
          'Code splitting and dynamic imports with Vite',
          'Using Vite plugins for React, Vue, or legacy browser support',
        ],
        resources: [
          { title: 'Vite Official Docs', url: 'https://vitejs.dev/guide/', type: 'article' },
          { title: 'Vite Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=89NJdbYTgJ8', type: 'video' },
        ],
      },
      {
        id: 'webpack',
        label: 'Webpack',
        intro:
          'Webpack is the battle-tested module bundler that underpins many production apps and frameworks (Create React App, Next.js). Understanding Webpack helps you debug build issues and optimise bundle sizes.',
        whatYoullLearn: [
          'Webpack core concepts: entry, output, loaders, plugins',
          'Configuring webpack.config.js for a React project',
          'Code splitting with SplitChunksPlugin and dynamic import()',
          'Source maps for debugging in production',
          'Webpack Bundle Analyzer for finding bloat',
        ],
        resources: [
          { title: 'Webpack Docs', url: 'https://webpack.js.org/concepts/', type: 'article' },
          { title: 'Webpack Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=IZGNcSuwBZs', type: 'video' },
        ],
      },
      {
        id: 'eslint',
        label: 'ESLint',
        intro:
          'ESLint is a static analysis tool that finds and fixes problems in JavaScript/TypeScript code. It enforces coding standards across your entire team, catches bugs before runtime, and integrates into your editor and CI pipeline.',
        whatYoullLearn: [
          'Installing ESLint and running eslint --fix',
          'eslint.config.js (flat config) vs the old .eslintrc',
          'Essential rule sets: eslint:recommended, @typescript-eslint',
          'Writing custom ESLint rules',
          'Integrating ESLint with Prettier and VS Code',
        ],
        resources: [
          { title: 'ESLint Docs', url: 'https://eslint.org/docs/latest/', type: 'article' },
          { title: 'ESLint Tutorial – YouTube', url: 'https://www.youtube.com/watch?v=ZXW6Jn6or1w', type: 'video' },
        ],
      },
      {
        id: 'prettier',
        label: 'Prettier',
        intro:
          'Prettier is an opinionated code formatter that enforces a consistent style by reprinting your code from scratch according to its rules. It eliminates style debates and makes code reviews focus on logic, not formatting.',
        whatYoullLearn: [
          'Installing and running Prettier from the CLI',
          '.prettierrc configuration and common options',
          'Editor integration: format on save in VS Code',
          'Using prettier with ESLint via eslint-config-prettier',
          'Pre-commit formatting hooks with Husky + lint-staged',
        ],
        resources: [
          { title: 'Prettier Docs', url: 'https://prettier.io/docs/en/index.html', type: 'article' },
          { title: 'Prettier Tutorial – YouTube', url: 'https://www.youtube.com/watch?v=DqfQ4DPnRqI', type: 'video' },
        ],
      },
    ],
  },

  // ── TYPESCRIPT ─────────────────────────────────────────────────────────────
  typescript: {
    section: {
      id: 'typescript',
      label: 'TypeScript',
      description:
        'TypeScript is a statically typed superset of JavaScript developed by Microsoft. It catches type errors at compile time, improves IDE support, and makes large codebases dramatically easier to refactor and maintain.',
    },
    subNodes: [
      {
        id: 'ts1',
        label: 'Types & Interfaces',
        intro:
          'Types and interfaces are the building blocks of TypeScript. They describe the shape of data — from primitives to complex objects — and make your code self-documenting and refactor-safe.',
        whatYoullLearn: [
          'Primitive types: string, number, boolean, null, undefined',
          'Arrays, tuples, enums, and union types (A | B)',
          'interface vs type alias — similarities and differences',
          'Optional properties (?), readonly, and index signatures',
          'Function types and return type annotations',
        ],
        resources: [
          { title: 'TypeScript Handbook – Types', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html', type: 'article' },
          { title: 'TypeScript Crash Course – Traversy Media', url: 'https://www.youtube.com/watch?v=BCg4U1FzODs', type: 'video' },
          { title: 'TypeScript Playground (interactive)', url: 'https://www.typescriptlang.org/play', type: 'interactive' },
        ],
      },
      {
        id: 'ts2',
        label: 'Type Narrowing',
        intro:
          'Type narrowing is how TypeScript refines a broad type to a more specific one based on runtime checks. Mastering narrowing makes union types (the most powerful TypeScript feature) practical and safe.',
        whatYoullLearn: [
          'typeof and instanceof guards',
          'in operator narrowing for discriminated unions',
          'Truthiness narrowing and control flow analysis',
          'User-defined type guards (is keyword)',
          'The never type and exhaustiveness checking',
        ],
        resources: [
          { title: 'Narrowing – TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html', type: 'article' },
          { title: 'TypeScript Narrowing – YouTube', url: 'https://www.youtube.com/watch?v=5C7PKmFAzL8', type: 'video' },
        ],
      },
      {
        id: 'ts3',
        label: 'Generics',
        intro:
          'Generics let you write reusable, type-safe functions and data structures that work with any type — like a typed Array or Promise. They are one of TypeScript\'s most powerful features and essential for writing good utility code.',
        whatYoullLearn: [
          'Generic functions: <T>(arg: T): T syntax',
          'Generic interfaces and classes',
          'Generic constraints with extends',
          'Built-in generics: Array<T>, Promise<T>, Record<K,V>',
          'Conditional types and infer keyword',
        ],
        resources: [
          { title: 'Generics – TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', type: 'article' },
          { title: 'TypeScript Generics Explained – YouTube', url: 'https://www.youtube.com/watch?v=nViEqpgwxHE', type: 'video' },
        ],
      },
    ],
  },

  // ── TESTING ────────────────────────────────────────────────────────────────
  testing: {
    section: {
      id: 'testing',
      label: 'Testing',
      description:
        'Testing gives you confidence to refactor and ship code without breaking things. The testing pyramid guides you from fast unit tests at the base to slow end-to-end tests at the top — each layer serves a different purpose.',
    },
    subNodes: [
      {
        id: 'test1',
        label: 'Jest / Vitest',
        intro:
          'Jest and Vitest are JavaScript test runners for unit and integration tests. Vitest is the modern choice for Vite-based projects — it shares Vite\'s config and is significantly faster than Jest on large code bases.',
        whatYoullLearn: [
          'Writing describe, it/test, and expect blocks',
          'Matchers: toBe, toEqual, toBeNull, toThrow, toHaveBeenCalled',
          'Mocking modules and functions with vi.mock / jest.mock',
          'Setup and teardown hooks: beforeEach, afterAll',
          'Code coverage reports',
        ],
        resources: [
          { title: 'Vitest Docs', url: 'https://vitest.dev/guide/', type: 'article' },
          { title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started', type: 'article' },
          { title: 'Testing JavaScript – YouTube (Fireship)', url: 'https://www.youtube.com/watch?v=Jv2uxzhPFl4', type: 'video' },
        ],
      },
      {
        id: 'test2',
        label: 'React Testing Library',
        intro:
          'React Testing Library (RTL) encourages testing components from a user\'s perspective — querying by accessible roles and text rather than implementation details. This leads to tests that remain valid even when you refactor internals.',
        whatYoullLearn: [
          'render(), screen, and fireEvent / userEvent',
          'Querying: getByRole, getByText, getByLabelText',
          'Testing async components with waitFor and findBy queries',
          'Testing user interactions: click, type, submit',
          'The guiding principle: test behaviour, not implementation',
        ],
        resources: [
          { title: 'RTL Docs', url: 'https://testing-library.com/docs/react-testing-library/intro/', type: 'article' },
          { title: 'React Testing Library Tutorial – YouTube', url: 'https://www.youtube.com/watch?v=7dTTFW7yACQ', type: 'video' },
        ],
      },
      {
        id: 'test3',
        label: 'Cypress / Playwright',
        intro:
          'Cypress and Playwright are end-to-end (E2E) testing frameworks that control a real browser to simulate full user journeys. They are slower than unit tests but catch integration issues that unit tests miss.',
        whatYoullLearn: [
          'Writing E2E tests that visit pages and interact with the UI',
          'Cypress: cy.visit, cy.get, cy.click, cy.type, cy.intercept',
          'Playwright: page.goto, page.locator, expect(locator)',
          'Testing across multiple browsers with Playwright',
          'Running E2E tests in CI pipelines',
        ],
        resources: [
          { title: 'Cypress Docs', url: 'https://docs.cypress.io/guides/overview/why-cypress', type: 'article' },
          { title: 'Playwright Docs', url: 'https://playwright.dev/docs/intro', type: 'article' },
          { title: 'Cypress Crash Course – YouTube', url: 'https://www.youtube.com/watch?v=CYcdT-tOvB0', type: 'video' },
        ],
      },
    ],
  },

  // ── WEB SECURITY ───────────────────────────────────────────────────────────
  security: {
    section: {
      id: 'security',
      label: 'Web Security Basics',
      description:
        'Every frontend developer is responsible for security. Understanding how HTTPS protects data in transit, how CORS controls cross-origin access, and how CSP and OWASP vulnerabilities work is essential for shipping safe applications.',
    },
    subNodes: [
      {
        id: 'sec1',
        label: 'HTTPS & SSL/TLS',
        intro:
          'HTTPS encrypts the connection between the browser and server using TLS (Transport Layer Security). It prevents man-in-the-middle attacks, tampering, and eavesdropping — and is required by modern browsers for many APIs.',
        whatYoullLearn: [
          'How TLS handshake establishes an encrypted connection',
          'Certificates, Certificate Authorities (CAs), and trust chains',
          'HTTP Strict Transport Security (HSTS)',
          'Mixed content warnings and how to fix them',
          'Getting free SSL certificates via Let\'s Encrypt',
        ],
        resources: [
          { title: 'HTTPS Explained – Cloudflare', url: 'https://www.cloudflare.com/learning/ssl/what-is-https/', type: 'article' },
          { title: 'TLS Handshake Explained – YouTube', url: 'https://www.youtube.com/watch?v=86cQJ0MMses', type: 'video' },
        ],
      },
      {
        id: 'sec2',
        label: 'CORS',
        intro:
          'CORS (Cross-Origin Resource Sharing) is a browser security mechanism that controls which origins can access resources on a server. Misconfigured CORS is a common source of both bugs and security vulnerabilities.',
        whatYoullLearn: [
          'The same-origin policy and why browsers enforce it',
          'Simple requests vs preflight OPTIONS requests',
          'Access-Control-Allow-Origin and related response headers',
          'Credentials mode and Access-Control-Allow-Credentials',
          'Common CORS mistakes and how attackers exploit them',
        ],
        resources: [
          { title: 'CORS – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS', type: 'article' },
          { title: 'CORS in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=4KHiSt0oLJ0', type: 'video' },
        ],
      },
      {
        id: 'sec3',
        label: 'CSP & OWASP Top 10',
        intro:
          'Content Security Policy (CSP) is an HTTP header that prevents XSS attacks by whitelisting trusted sources. The OWASP Top 10 is the industry standard list of the most critical web application security risks every developer should know.',
        whatYoullLearn: [
          'What XSS (Cross-Site Scripting) is and how CSP mitigates it',
          'Writing a Content-Security-Policy header',
          'OWASP Top 10: Injection, Broken Auth, SSRF, IDOR, etc.',
          'SQL injection and why you should never trust user input',
          'CSRF attacks and SameSite cookie protection',
        ],
        resources: [
          { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'article' },
          { title: 'CSP – MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP', type: 'article' },
          { title: 'Web Security – YouTube (Fireship)', url: 'https://www.youtube.com/watch?v=bSJm8-zJTzQ', type: 'video' },
        ],
      },
    ],
  },

  // ── PERFORMANCE ────────────────────────────────────────────────────────────
  performance: {
    section: {
      id: 'performance',
      label: 'Performance',
      description:
        'Web performance directly impacts user experience, SEO rankings, and revenue. Understanding Core Web Vitals, deferring resources, and measuring with Lighthouse gives you the toolkit to build fast, delightful experiences.',
    },
    subNodes: [
      {
        id: 'perf1',
        label: 'Core Web Vitals',
        intro:
          'Core Web Vitals are Google\'s set of real-world performance metrics that measure loading, interactivity, and visual stability. They directly influence Google Search rankings and are the industry benchmark for web performance.',
        whatYoullLearn: [
          'LCP (Largest Contentful Paint) — loading performance',
          'INP (Interaction to Next Paint) — interactivity',
          'CLS (Cumulative Layout Shift) — visual stability',
          'How to measure vitals with CrUX, Search Console, and DevTools',
          'Common causes and fixes for each metric',
        ],
        resources: [
          { title: 'Core Web Vitals – web.dev', url: 'https://web.dev/explore/vitals', type: 'article' },
          { title: 'Core Web Vitals – YouTube (Google)', url: 'https://www.youtube.com/watch?v=AQqFZ5t8uNc', type: 'video' },
        ],
      },
      {
        id: 'perf2',
        label: 'Lazy Loading & Code Splitting',
        intro:
          'Lazy loading defers loading of non-critical resources until they are needed. Code splitting breaks your JavaScript bundle into smaller chunks loaded on demand. Together they dramatically improve initial page load time.',
        whatYoullLearn: [
          'Native lazy loading of images with loading="lazy"',
          'Dynamic import() for JavaScript code splitting',
          'React.lazy() and Suspense for component-level splitting',
          'Route-based code splitting with React Router',
          'Intersection Observer for custom lazy loading',
        ],
        resources: [
          { title: 'Lazy Loading – web.dev', url: 'https://web.dev/articles/lazy-loading', type: 'article' },
          { title: 'Code Splitting – React Docs', url: 'https://react.dev/reference/react/lazy', type: 'article' },
          { title: 'Lazy Loading – YouTube', url: 'https://www.youtube.com/watch?v=AActXSWxsRo', type: 'video' },
        ],
      },
      {
        id: 'perf3',
        label: 'Lighthouse Audits',
        intro:
          'Google Lighthouse is an open-source automated tool for measuring performance, accessibility, SEO, and best practices. Running it regularly in DevTools or CI helps you catch regressions before they reach users.',
        whatYoullLearn: [
          'Running Lighthouse in Chrome DevTools and PageSpeed Insights',
          'Understanding Lighthouse\'s scoring methodology',
          'Performance opportunities vs diagnostics',
          'Integrating Lighthouse CI into your GitHub Actions pipeline',
          'Reading and acting on accessibility and SEO audit results',
        ],
        resources: [
          { title: 'Lighthouse Docs – Google', url: 'https://developer.chrome.com/docs/lighthouse/overview/', type: 'article' },
          { title: 'PageSpeed Insights', url: 'https://pagespeed.web.dev/', type: 'interactive' },
          { title: 'Lighthouse CI – YouTube', url: 'https://www.youtube.com/watch?v=C0UEnkCzPz4', type: 'video' },
        ],
      },
    ],
  },

  // ── DEPLOYMENT ─────────────────────────────────────────────────────────────
  deployment: {
    section: {
      id: 'deployment',
      label: 'Deployment',
      description:
        'Deployment is the process of making your app available to users. Modern frontend deployment ranges from push-to-deploy static hosting (Vercel, Netlify) to containerised apps on major cloud platforms and automated CI/CD pipelines.',
    },
    subNodes: [
      {
        id: 'dep1',
        label: 'Vercel / Netlify',
        intro:
          'Vercel and Netlify are the go-to platforms for deploying frontend apps and full-stack serverless applications. They offer git-based deployments, preview URLs for every PR, global CDNs, and generous free tiers.',
        whatYoullLearn: [
          'Connecting a GitHub repo for automatic deployments on push',
          'Environment variables and build settings in the dashboard',
          'Preview deployments for pull requests',
          'Serverless functions / Edge Functions',
          'Custom domains, HTTPS certificates, and redirect rules',
        ],
        resources: [
          { title: 'Vercel Docs', url: 'https://vercel.com/docs', type: 'article' },
          { title: 'Netlify Docs', url: 'https://docs.netlify.com/', type: 'article' },
          { title: 'Deploy React to Vercel – YouTube', url: 'https://www.youtube.com/watch?v=M338G9dPZj8', type: 'video' },
        ],
      },
      {
        id: 'dep2',
        label: 'AWS / Azure / GCP',
        intro:
          'The three major cloud platforms offer infrastructure for hosting anything from static sites to globally distributed, auto-scaling applications. Understanding the basics opens the door to back-end and DevOps roles.',
        whatYoullLearn: [
          'AWS S3 + CloudFront for static site hosting',
          'Azure Static Web Apps and App Service',
          'GCP Firebase Hosting and Cloud Run',
          'IAM roles and the principle of least privilege',
          'Basic cloud cost estimation and free tier limits',
        ],
        resources: [
          { title: 'AWS Static Hosting – Docs', url: 'https://aws.amazon.com/getting-started/hands-on/host-static-website/', type: 'article' },
          { title: 'Cloud Providers Compared – Fireship', url: 'https://www.youtube.com/watch?v=M988_fsOSWo', type: 'video' },
        ],
      },
      {
        id: 'dep3',
        label: 'Docker & CI/CD',
        intro:
          'Docker packages your app and its dependencies into a portable container. CI/CD pipelines automate building, testing, and deploying that container whenever you push code — eliminating manual deployment steps and human error.',
        whatYoullLearn: [
          'Writing a Dockerfile for a Node.js / frontend app',
          'Docker images, containers, layers, and registries',
          'docker build, run, push, and docker-compose',
          'GitHub Actions: building and deploying on push',
          'The CI/CD pipeline stages: build → test → lint → deploy',
        ],
        resources: [
          { title: 'Docker Docs – Get Started', url: 'https://docs.docker.com/get-started/', type: 'article' },
          { title: 'Docker in 100 Seconds – Fireship', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', type: 'video' },
          { title: 'GitHub Actions Full Tutorial – YouTube', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'video' },
        ],
      },
    ],
  },

  ...BACKEND_NODE_DETAILS,
  ...FULLSTACK_MERN_NODE_DETAILS,
};

// ─────────────────────────────────────────────────────────────────────────────
// Map every sub-node id → its parent section id
// Used in FrontendRoadmapFlow to determine which sidebar to open on click
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_NODE_MAP: Record<string, string> = {
  // internet
  internet: 'internet', i1: 'internet', i2: 'internet', i3: 'internet', i4: 'internet', i5: 'internet', i6: 'internet',
  // html
  html: 'html', h1: 'html', h2: 'html', h3: 'html', h4: 'html',
  // css
  css: 'css', c1: 'css', c2: 'css', c3: 'css', c4: 'css',
  // javascript
  javascript: 'javascript', js1: 'javascript', js2: 'javascript', js3: 'javascript', js4: 'javascript',
  // version-control
  'version-control': 'version-control', git: 'version-control',
  // vcs-hosting
  'vcs-hosting': 'vcs-hosting', github: 'vcs-hosting', gitlab: 'vcs-hosting',
  // pkg-managers
  'pkg-managers': 'pkg-managers', npm: 'pkg-managers', yarn: 'pkg-managers', pnpm: 'pkg-managers', bun: 'pkg-managers',
  // framework
  framework: 'framework', react: 'framework', vuejs: 'framework', angular: 'framework', svelte: 'framework', solidjs: 'framework',
  // css-frameworks
  'css-frameworks': 'css-frameworks', tailwind: 'css-frameworks', bootstrap: 'css-frameworks', 'material-ui': 'css-frameworks',
  // build-tools
  'build-tools': 'build-tools', vite: 'build-tools', webpack: 'build-tools', eslint: 'build-tools', prettier: 'build-tools',
  // typescript
  typescript: 'typescript', ts1: 'typescript', ts2: 'typescript', ts3: 'typescript',
  // testing
  testing: 'testing', test1: 'testing', test2: 'testing', test3: 'testing',
  // security
  security: 'security', sec1: 'security', sec2: 'security', sec3: 'security',
  // performance
  performance: 'performance', perf1: 'performance', perf2: 'performance', perf3: 'performance',
  // deployment
  deployment: 'deployment', dep1: 'deployment', dep2: 'deployment', dep3: 'deployment',

  ...BACKEND_SECTION_NODE_MAP,
  ...FULLSTACK_MERN_SECTION_NODE_MAP,
};
