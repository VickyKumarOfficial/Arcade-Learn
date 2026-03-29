import type { SectionData } from '@/data/allNodeDetails';

export const FULLSTACK_MERN_NODE_DETAILS: Record<string, SectionData> = {
  'fs-internet': {
    section: {
      id: 'fs-internet',
      label: 'Internet and Web Foundations',
      description:
        'Full stack development starts with transport fundamentals. Understand how requests move from browser to API and back.',
    },
    subNodes: [
      {
        id: 'fs-i1',
        label: 'HTTP Request Lifecycle',
        intro: 'A full stack app depends on predictable request-response behavior across client and server.',
        whatYoullLearn: [
          'How browsers construct requests and parse responses',
          'How status codes and headers shape frontend behavior',
          'Timeout, retry, and failure expectations in UX',
        ],
        resources: [
          { title: 'HTTP Overview - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'article' },
          { title: 'HTTP Crash Course', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0', type: 'video' },
        ],
      },
      {
        id: 'fs-i2',
        label: 'Client-Server Contracts',
        intro: 'Your frontend and backend communicate via contracts that must remain stable over time.',
        whatYoullLearn: [
          'Payload structure conventions',
          'Error response schema consistency',
          'Versioning and compatibility strategy',
        ],
        resources: [
          { title: 'REST API Design Best Practices', url: 'https://restfulapi.net/', type: 'article' },
          { title: 'API Design for Beginners', url: 'https://www.youtube.com/watch?v=lsMQRaeKNDk', type: 'video' },
        ],
      },
      {
        id: 'fs-i3',
        label: 'DNS, SSL, and Hosting Basics',
        intro: 'Production apps require DNS routing, TLS certificates, and hosting awareness.',
        whatYoullLearn: [
          'How DNS records point to deployed apps',
          'How HTTPS works with TLS certificates',
          'How hosting providers expose your app publicly',
        ],
        resources: [
          { title: 'DNS Explained', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/', type: 'article' },
          { title: 'HTTPS Explained', url: 'https://www.youtube.com/watch?v=hExRDVZHhig', type: 'video' },
        ],
      },
    ],
  },
  'fs-frontend-foundations': {
    section: {
      id: 'fs-frontend-foundations',
      label: 'Frontend Foundations',
      description:
        'Clean UI foundations are mandatory in MERN. Strong HTML/CSS/JS fundamentals prevent scaling pain later.',
    },
    subNodes: [
      {
        id: 'fs-f1',
        label: 'Semantic HTML and A11y',
        intro: 'Accessible markup improves usability and SEO while reducing future rework.',
        whatYoullLearn: [
          'Semantic sectioning elements',
          'Keyboard and focus accessibility basics',
          'ARIA usage only when necessary',
        ],
        resources: [
          { title: 'Semantic HTML - MDN', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html', type: 'article' },
          { title: 'Accessibility Checklist', url: 'https://www.a11yproject.com/checklist/', type: 'interactive' },
        ],
      },
      {
        id: 'fs-f2',
        label: 'Responsive CSS and Layouts',
        intro: 'Responsive layouts keep a single codebase usable across phones, tablets, and desktop.',
        whatYoullLearn: [
          'Flexbox and Grid usage patterns',
          'Mobile-first breakpoint strategy',
          'Fluid typography and spacing',
        ],
        resources: [
          { title: 'Responsive Design - MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design', type: 'article' },
          { title: 'CSS Grid Guide', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'article' },
        ],
      },
      {
        id: 'fs-f3',
        label: 'Modern JavaScript Essentials',
        intro: 'MERN requires strong async JavaScript and clean module-level code organization.',
        whatYoullLearn: [
          'ES6 modules and syntax',
          'Promises, async/await, and error handling',
          'Immutable update and array/object transforms',
        ],
        resources: [
          { title: 'JavaScript Guide', url: 'https://javascript.info/', type: 'article' },
          { title: 'Modern JS Fundamentals', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', type: 'video' },
        ],
      },
    ],
  },
  'fs-react-core': {
    section: {
      id: 'fs-react-core',
      label: 'React Core',
      description:
        'React is the frontend engine in MERN. Build component-driven UIs with maintainable state and routing.',
    },
    subNodes: [
      {
        id: 'fs-r1',
        label: 'Components and Hooks',
        intro: 'Hooks and component composition are the core primitives for scalable React apps.',
        whatYoullLearn: [
          'Functional component architecture',
          'Core hooks and custom hooks',
          'Prop drilling vs composition tradeoffs',
        ],
        resources: [
          { title: 'React Learn', url: 'https://react.dev/learn', type: 'article' },
          { title: 'React Hooks Explained', url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', type: 'video' },
        ],
      },
      {
        id: 'fs-r2',
        label: 'Routing and UI Architecture',
        intro: 'Route design controls navigation, data loading boundaries, and user flow clarity.',
        whatYoullLearn: [
          'Route nesting and layout routes',
          'Protected routes for auth flows',
          'Shared shell patterns for dashboards',
        ],
        resources: [
          { title: 'React Router Docs', url: 'https://reactrouter.com/en/main', type: 'article' },
          { title: 'React Router Tutorial', url: 'https://www.youtube.com/watch?v=Ul3y1LXxzdU', type: 'video' },
        ],
      },
      {
        id: 'fs-r3',
        label: 'Forms and Data Fetching',
        intro: 'Form UX and server-state fetching are where most product complexity emerges.',
        whatYoullLearn: [
          'Form validation patterns',
          'Optimistic updates and loading states',
          'Error and retry handling in UI',
        ],
        resources: [
          { title: 'React Hook Form', url: 'https://react-hook-form.com/get-started', type: 'article' },
          { title: 'TanStack Query Docs', url: 'https://tanstack.com/query/latest', type: 'article' },
        ],
      },
    ],
  },
  'fs-typescript-state': {
    section: {
      id: 'fs-typescript-state',
      label: 'TypeScript and State Management',
      description:
        'Type safety and predictable state transitions are critical for long-lived full stack products.',
    },
    subNodes: [
      {
        id: 'fs-ts1',
        label: 'Type-safe Components',
        intro: 'Strong typing reduces runtime bugs and makes refactors faster and safer.',
        whatYoullLearn: [
          'Component prop and event typing',
          'API response and DTO type modeling',
          'Narrowing and guard-based safety',
        ],
        resources: [
          { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'article' },
          { title: 'React TypeScript Cheatsheet', url: 'https://react-typescript-cheatsheet.netlify.app/', type: 'article' },
        ],
      },
      {
        id: 'fs-ts2',
        label: 'State Patterns (Context/Redux)',
        intro: 'State tools should be selected by complexity, not by trend.',
        whatYoullLearn: [
          'Local vs shared vs global state decisions',
          'Reducer and action model basics',
          'Scalable store organization patterns',
        ],
        resources: [
          { title: 'Redux Toolkit Quick Start', url: 'https://redux-toolkit.js.org/tutorials/quick-start', type: 'article' },
          { title: 'Context API Guide', url: 'https://react.dev/learn/passing-data-deeply-with-context', type: 'article' },
        ],
      },
      {
        id: 'fs-ts3',
        label: 'Async State and Caching',
        intro: 'Server state is not UI state. Caching avoids duplicate requests and jittery UX.',
        whatYoullLearn: [
          'Cache keys and invalidation strategy',
          'Prefetch and background refresh flows',
          'Suspense-ready async boundaries',
        ],
        resources: [
          { title: 'React Query Caching', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/caching', type: 'article' },
          { title: 'Server State Management', url: 'https://www.youtube.com/watch?v=novnyCaa7To', type: 'video' },
        ],
      },
    ],
  },
  'fs-nodejs-core': {
    section: {
      id: 'fs-nodejs-core',
      label: 'Node.js Core',
      description:
        'Node powers the backend runtime in MERN. Deep runtime understanding improves reliability and throughput.',
    },
    subNodes: [
      {
        id: 'fs-n1',
        label: 'Runtime and Event Loop',
        intro: 'Node performance depends on non-blocking event-loop behavior and smart concurrency.',
        whatYoullLearn: [
          'Event loop phases',
          'Async task scheduling semantics',
          'Avoiding blocking operations',
        ],
        resources: [
          { title: 'Node Event Loop Guide', url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick', type: 'article' },
          { title: 'Event Loop Visual Guide', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', type: 'video' },
        ],
      },
      {
        id: 'fs-n2',
        label: 'Modules and Project Structure',
        intro: 'A clean backend folder architecture makes features easy to iterate and test.',
        whatYoullLearn: [
          'Layered route/service/repository split',
          'Dependency boundaries',
          'Feature-folder organization',
        ],
        resources: [
          { title: 'Node ESM Docs', url: 'https://nodejs.org/api/esm.html', type: 'article' },
          { title: 'Node Architecture Patterns', url: 'https://www.youtube.com/watch?v=JLGtF4Y4M2o', type: 'video' },
        ],
      },
      {
        id: 'fs-n3',
        label: 'Environment and Config Management',
        intro: 'Configuration controls behavior across development, staging, and production.',
        whatYoullLearn: [
          'Environment-specific config strategy',
          'Secrets handling basics',
          'Startup validation of required config',
        ],
        resources: [
          { title: '12-Factor Config', url: 'https://12factor.net/config', type: 'article' },
          { title: 'dotenv Package', url: 'https://www.npmjs.com/package/dotenv', type: 'article' },
        ],
      },
    ],
  },
  'fs-express-api': {
    section: {
      id: 'fs-express-api',
      label: 'Express API Development',
      description:
        'Express turns Node runtime into production APIs with middleware, validation, and response contracts.',
    },
    subNodes: [
      {
        id: 'fs-e1',
        label: 'Routing and Middleware',
        intro: 'Middleware design determines how auth, validation, logging, and errors are handled.',
        whatYoullLearn: [
          'Middleware chaining order',
          'Feature routers and composition',
          'Request context propagation',
        ],
        resources: [
          { title: 'Express Routing', url: 'https://expressjs.com/en/guide/routing.html', type: 'article' },
          { title: 'Express Middleware', url: 'https://expressjs.com/en/guide/using-middleware.html', type: 'article' },
        ],
      },
      {
        id: 'fs-e2',
        label: 'Controllers and Services',
        intro: 'Separate transport concerns from business logic so APIs stay testable.',
        whatYoullLearn: [
          'Thin controller boundaries',
          'Reusable service-layer logic',
          'Dependency injection-ready code paths',
        ],
        resources: [
          { title: 'Node.js Design Patterns', url: 'https://www.oreilly.com/library/view/nodejs-design-patterns/9781839214110/', type: 'book' },
          { title: 'Express Architecture Guide', url: 'https://www.youtube.com/watch?v=0M8AYU_hPas', type: 'video' },
        ],
      },
      {
        id: 'fs-e3',
        label: 'Validation and Error Handling',
        intro: 'Input validation and centralized error handling are required for production-grade APIs.',
        whatYoullLearn: [
          'Schema validation middleware',
          'Custom error classes and mapping',
          'Safe, consistent client error responses',
        ],
        resources: [
          { title: 'Zod Documentation', url: 'https://zod.dev/', type: 'article' },
          { title: 'Express Error Handling', url: 'https://expressjs.com/en/guide/error-handling.html', type: 'article' },
        ],
      },
    ],
  },
  'fs-mongodb-data': {
    section: {
      id: 'fs-mongodb-data',
      label: 'MongoDB and Data Modeling',
      description:
        'MongoDB is the data layer in MERN. Model entities and queries for both flexibility and performance.',
    },
    subNodes: [
      {
        id: 'fs-db1',
        label: 'Schema Design with Mongoose',
        intro: 'Mongoose schemas provide structure, validation, and modeling conventions for MongoDB.',
        whatYoullLearn: [
          'Schema and model definitions',
          'Reference vs embedded patterns',
          'Validation and middleware hooks',
        ],
        resources: [
          { title: 'Mongoose Docs', url: 'https://mongoosejs.com/docs/', type: 'article' },
          { title: 'MongoDB Data Modeling', url: 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/', type: 'article' },
        ],
      },
      {
        id: 'fs-db2',
        label: 'CRUD, Aggregation, and Indexes',
        intro: 'Real apps require complex querying, index strategy, and aggregation pipelines.',
        whatYoullLearn: [
          'CRUD operation patterns',
          'Aggregation framework basics',
          'Index tuning for query hotspots',
        ],
        resources: [
          { title: 'MongoDB Aggregation', url: 'https://www.mongodb.com/docs/manual/aggregation/', type: 'article' },
          { title: 'MongoDB Indexing', url: 'https://www.mongodb.com/docs/manual/indexes/', type: 'article' },
        ],
      },
      {
        id: 'fs-db3',
        label: 'Transactions and Data Consistency',
        intro: 'Consistency boundaries become important when workflows span multiple operations.',
        whatYoullLearn: [
          'Multi-document transaction use cases',
          'Atomic operation choices',
          'Failure rollback strategy basics',
        ],
        resources: [
          { title: 'MongoDB Transactions', url: 'https://www.mongodb.com/docs/manual/core/transactions/', type: 'article' },
          { title: 'Consistency in NoSQL Systems', url: 'https://www.youtube.com/watch?v=CZ3wIuvmHeM', type: 'video' },
        ],
      },
    ],
  },
  'fs-auth-security': {
    section: {
      id: 'fs-auth-security',
      label: 'Authentication and Security',
      description:
        'Security in MERN spans both frontend and backend. Handle identity, authorization, and input trust boundaries carefully.',
    },
    subNodes: [
      {
        id: 'fs-a1',
        label: 'JWT and Refresh Tokens',
        intro: 'Token flows define login persistence and API access boundaries.',
        whatYoullLearn: [
          'Access token lifecycle',
          'Refresh token rotation',
          'Secure token storage choices',
        ],
        resources: [
          { title: 'JWT Introduction', url: 'https://jwt.io/introduction', type: 'article' },
          { title: 'Token Auth Deep Dive', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', type: 'video' },
        ],
      },
      {
        id: 'fs-a2',
        label: 'RBAC and Protected Routes',
        intro: 'Authentication answers who; authorization answers what they can do.',
        whatYoullLearn: [
          'Role-based permission checks',
          'Protected frontend routes and guards',
          'Server-side authorization enforcement',
        ],
        resources: [
          { title: 'Auth0 Authorization Concepts', url: 'https://auth0.com/docs/get-started/authorization', type: 'article' },
          { title: 'RBAC Explained', url: 'https://www.permit.io/blog/role-based-access-control-rbac', type: 'article' },
        ],
      },
      {
        id: 'fs-a3',
        label: 'Input Sanitization and OWASP',
        intro: 'Every request boundary is a potential attack surface unless validated and sanitized.',
        whatYoullLearn: [
          'Validation vs sanitization',
          'Injection and payload abuse prevention',
          'OWASP API Top 10 risk awareness',
        ],
        resources: [
          { title: 'OWASP API Security', url: 'https://owasp.org/www-project-api-security/', type: 'article' },
          { title: 'Input Validation Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', type: 'article' },
        ],
      },
    ],
  },
  'fs-fullstack-integration': {
    section: {
      id: 'fs-fullstack-integration',
      label: 'Frontend-Backend Integration',
      description:
        'Integration is where MERN value appears. Align API contracts, auth, and error states across the stack.',
    },
    subNodes: [
      {
        id: 'fs-int1',
        label: 'API Client Layer and DTOs',
        intro: 'A dedicated API client layer keeps frontend code testable and decoupled from transport details.',
        whatYoullLearn: [
          'API service abstraction patterns',
          'Request/response DTO typing',
          'Centralized error transformation',
        ],
        resources: [
          { title: 'Axios Documentation', url: 'https://axios-http.com/docs/intro', type: 'article' },
          { title: 'API Layer Design', url: 'https://www.youtube.com/watch?v=K5N2Li8m4FY', type: 'video' },
        ],
      },
      {
        id: 'fs-int2',
        label: 'Auth Flow Across Stack',
        intro: 'Login, refresh, logout, and guarded calls must remain consistent across frontend and backend.',
        whatYoullLearn: [
          'Auth state hydration on app load',
          'Token refresh race handling',
          'Unauthorized flow handling and redirects',
        ],
        resources: [
          { title: 'SPA Auth Best Practices', url: 'https://auth0.com/docs/secure/security-guidance/data-security/token-storage', type: 'article' },
          { title: 'JWT Refresh Patterns', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM', type: 'video' },
        ],
      },
      {
        id: 'fs-int3',
        label: 'Error States and UX Resilience',
        intro: 'Robust products degrade gracefully through partial failures and slow network conditions.',
        whatYoullLearn: [
          'User-friendly error messaging',
          'Retry and fallback UX patterns',
          'Offline and slow-network considerations',
        ],
        resources: [
          { title: 'Resilient UX Design', url: 'https://web.dev/articles/resilient-web-design', type: 'article' },
          { title: 'Designing Error States', url: 'https://www.youtube.com/watch?v=4Y-rS6n1f2M', type: 'video' },
        ],
      },
    ],
  },
  'fs-testing-quality': {
    section: {
      id: 'fs-testing-quality',
      label: 'Testing and Quality',
      description:
        'Quality in MERN means confidence in frontend behavior, API contracts, and release stability.',
    },
    subNodes: [
      {
        id: 'fs-t1',
        label: 'Frontend Unit and E2E Tests',
        intro: 'Frontend testing validates component logic and full user journeys.',
        whatYoullLearn: [
          'Component-level unit test patterns',
          'DOM querying best practices',
          'E2E flow coverage for critical paths',
        ],
        resources: [
          { title: 'Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro/', type: 'article' },
          { title: 'Cypress Docs', url: 'https://docs.cypress.io/', type: 'article' },
        ],
      },
      {
        id: 'fs-t2',
        label: 'API and Integration Tests',
        intro: 'API tests catch regressions where controller logic, services, and data access meet.',
        whatYoullLearn: [
          'Route contract tests',
          'Service integration test setup',
          'Mocking external dependencies safely',
        ],
        resources: [
          { title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started', type: 'article' },
          { title: 'Supertest with Express', url: 'https://www.npmjs.com/package/supertest', type: 'article' },
        ],
      },
      {
        id: 'fs-t3',
        label: 'Linting and Code Quality Gates',
        intro: 'Automated checks enforce consistency and prevent low-value defects from reaching production.',
        whatYoullLearn: [
          'Lint and formatting baselines',
          'Pre-commit quality hooks',
          'CI quality gates before deploy',
        ],
        resources: [
          { title: 'ESLint Documentation', url: 'https://eslint.org/docs/latest/', type: 'article' },
          { title: 'Prettier Documentation', url: 'https://prettier.io/docs/en/', type: 'article' },
        ],
      },
    ],
  },
  'fs-performance': {
    section: {
      id: 'fs-performance',
      label: 'Performance Optimization',
      description:
        'Performance is an end-to-end concern in MERN: UI render speed, API response latency, and database efficiency.',
    },
    subNodes: [
      {
        id: 'fs-p1',
        label: 'Frontend Performance Tuning',
        intro: 'Fast interfaces require minimizing bundle cost and unnecessary re-renders.',
        whatYoullLearn: [
          'Code splitting and lazy loading',
          'Memoization patterns and tradeoffs',
          'Core Web Vitals optimization',
        ],
        resources: [
          { title: 'Web Performance - web.dev', url: 'https://web.dev/learn/performance', type: 'article' },
          { title: 'Core Web Vitals', url: 'https://web.dev/articles/vitals', type: 'article' },
        ],
      },
      {
        id: 'fs-p2',
        label: 'API and DB Performance',
        intro: 'Backend latency is often dominated by query design and payload size choices.',
        whatYoullLearn: [
          'Slow query investigation',
          'Pagination and response shaping',
          'N+1-like query anti-patterns',
        ],
        resources: [
          { title: 'MongoDB Query Optimization', url: 'https://www.mongodb.com/docs/manual/core/query-optimization/', type: 'article' },
          { title: 'Node.js Performance Guide', url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop', type: 'article' },
        ],
      },
      {
        id: 'fs-p3',
        label: 'Caching Strategies',
        intro: 'Caching lowers response times and reduces repeated expensive operations.',
        whatYoullLearn: [
          'Client cache vs server cache boundaries',
          'Redis-backed API caching patterns',
          'Cache invalidation fundamentals',
        ],
        resources: [
          { title: 'Redis Docs', url: 'https://redis.io/docs/latest/', type: 'article' },
          { title: 'Caching Strategy Patterns', url: 'https://www.youtube.com/watch?v=H0pCP7Q7qQ0', type: 'video' },
        ],
      },
    ],
  },
  'fs-devops-cicd': {
    section: {
      id: 'fs-devops-cicd',
      label: 'DevOps and CI/CD',
      description:
        'MERN delivery speed depends on repeatable builds, test automation, and predictable release workflows.',
    },
    subNodes: [
      {
        id: 'fs-d1',
        label: 'Docker for Full Stack Apps',
        intro: 'Containerization ensures consistent runtime behavior across local and production environments.',
        whatYoullLearn: [
          'Multi-stage Dockerfile patterns',
          'Containerized API + frontend setup',
          'Image size and startup optimization',
        ],
        resources: [
          { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'article' },
          { title: 'Docker for Developers', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', type: 'video' },
        ],
      },
      {
        id: 'fs-d2',
        label: 'Pipeline Automation',
        intro: 'CI/CD pipelines reduce deployment risk by automating checks and release steps.',
        whatYoullLearn: [
          'Build-test-lint pipeline stages',
          'Deployment job orchestration',
          'Safe rollback strategy basics',
        ],
        resources: [
          { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', type: 'article' },
          { title: 'CI/CD Fundamentals', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'video' },
        ],
      },
      {
        id: 'fs-d3',
        label: 'Environment Promotions',
        intro: 'Promoting builds through dev, staging, and production improves release safety.',
        whatYoullLearn: [
          'Environment configuration strategy',
          'Release gates and approvals',
          'Deployment observability checkpoints',
        ],
        resources: [
          { title: 'Deployment Environments Strategy', url: 'https://martinfowler.com/bliki/DeploymentPipeline.html', type: 'article' },
          { title: 'Release Management Basics', url: 'https://www.youtube.com/watch?v=oa3kgmYQ6jQ', type: 'video' },
        ],
      },
    ],
  },
  'fs-deployment-cloud': {
    section: {
      id: 'fs-deployment-cloud',
      label: 'Deployment and Cloud',
      description:
        'Full stack MERN apps need production deployment strategy for frontend, backend, and data-layer connectivity.',
    },
    subNodes: [
      {
        id: 'fs-dep1',
        label: 'Deploy Frontend and API',
        intro: 'Deploy each tier correctly and verify network connectivity and CORS behavior.',
        whatYoullLearn: [
          'Separate vs unified deployment models',
          'CORS and domain coordination',
          'Health checks and startup probes',
        ],
        resources: [
          { title: 'Vercel Docs', url: 'https://vercel.com/docs', type: 'article' },
          { title: 'Render Docs', url: 'https://render.com/docs', type: 'article' },
        ],
      },
      {
        id: 'fs-dep2',
        label: 'Secrets and Runtime Config',
        intro: 'Runtime secrets and environment separation are central to production safety.',
        whatYoullLearn: [
          'Secret injection in hosting platforms',
          'Runtime config validation',
          'Rotation and incident response basics',
        ],
        resources: [
          { title: 'OWASP Secrets Management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html', type: 'article' },
          { title: '12-Factor App', url: 'https://12factor.net/', type: 'article' },
        ],
      },
      {
        id: 'fs-dep3',
        label: 'Custom Domains and SSL',
        intro: 'Production-grade apps require trusted domains and HTTPS end-to-end.',
        whatYoullLearn: [
          'DNS setup and verification',
          'Certificate provisioning basics',
          'Redirect and canonical URL setup',
        ],
        resources: [
          { title: 'Cloudflare SSL/TLS', url: 'https://www.cloudflare.com/learning/ssl/what-is-ssl/', type: 'article' },
          { title: 'DNS Setup Basics', url: 'https://www.youtube.com/watch?v=Y4cRx19nhJk', type: 'video' },
        ],
      },
    ],
  },
  'fs-monitoring': {
    section: {
      id: 'fs-monitoring',
      label: 'Monitoring and Observability',
      description:
        'Observability makes full stack systems operable at scale through logs, metrics, traces, and alerting.',
    },
    subNodes: [
      {
        id: 'fs-m1',
        label: 'Structured Logging',
        intro: 'Structured logs make searching incidents and correlating requests significantly easier.',
        whatYoullLearn: [
          'Context-rich log format conventions',
          'Correlation IDs across requests',
          'PII-safe logging practices',
        ],
        resources: [
          { title: 'Node.js Logging Best Practices', url: 'https://betterstack.com/community/guides/logging/nodejs-logging-best-practices/', type: 'article' },
          { title: 'Observability Basics', url: 'https://www.youtube.com/watch?v=6nM6jZ9w3tA', type: 'video' },
        ],
      },
      {
        id: 'fs-m2',
        label: 'Metrics and Alerting',
        intro: 'Metrics and alerts help teams detect and respond to regression early.',
        whatYoullLearn: [
          'Latency, error rate, and throughput metrics',
          'Alert threshold design',
          'SLO-driven reliability monitoring',
        ],
        resources: [
          { title: 'SRE Book - SLOs', url: 'https://sre.google/sre-book/service-level-objectives/', type: 'article' },
          { title: 'Prometheus Concepts', url: 'https://prometheus.io/docs/introduction/overview/', type: 'article' },
        ],
      },
      {
        id: 'fs-m3',
        label: 'Incident Debugging Workflow',
        intro: 'A structured incident workflow minimizes recovery time and avoids repeated failure classes.',
        whatYoullLearn: [
          'Incident triage checklist',
          'Root-cause analysis habits',
          'Postmortem and action-item process',
        ],
        resources: [
          { title: 'Incident Response Playbooks', url: 'https://www.atlassian.com/incident-management/incident-response', type: 'article' },
          { title: 'Debugging Production Issues', url: 'https://www.youtube.com/watch?v=4lM5Qx5F6Sw', type: 'video' },
        ],
      },
    ],
  },
  'fs-capstone': {
    section: {
      id: 'fs-capstone',
      label: 'Capstone Production Project',
      description:
        'Your capstone demonstrates end-to-end MERN proficiency: architecture, implementation, deployment, and presentation.',
    },
    subNodes: [
      {
        id: 'fs-c1',
        label: 'Architecture and Scope',
        intro: 'Define a realistic project scope with domain model, API contracts, and system boundaries.',
        whatYoullLearn: [
          'Functional and technical requirements',
          'Domain entities and API planning',
          'Milestone-based execution roadmap',
        ],
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'article' },
          { title: 'Product Scope Planning', url: 'https://www.youtube.com/watch?v=K4TOrB7at0Y', type: 'video' },
        ],
      },
      {
        id: 'fs-c2',
        label: 'Delivery and Portfolio Story',
        intro: 'Hiring outcomes depend on how clearly you explain tradeoffs, architecture, and impact.',
        whatYoullLearn: [
          'README and technical documentation quality',
          'Demo narrative and walkthrough structure',
          'Portfolio positioning for interviews',
        ],
        resources: [
          { title: 'How to Write a Great README', url: 'https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/', type: 'article' },
          { title: 'Portfolio Project Presentation', url: 'https://www.youtube.com/watch?v=2A4wM0Y4D3o', type: 'video' },
        ],
      },
      {
        id: 'fs-c3',
        label: 'Reliability and Scale Checklist',
        intro: 'Before final submission, validate reliability, security, and maintainability concerns.',
        whatYoullLearn: [
          'Pre-release QA checklist',
          'Security and performance verification',
          'Scale-readiness and observability basics',
        ],
        resources: [
          { title: 'Production Readiness Checklist', url: 'https://learn.microsoft.com/en-us/azure/architecture/framework/devops/checklist', type: 'article' },
          { title: 'Release Readiness Review', url: 'https://www.youtube.com/watch?v=QjM5vQvCw7M', type: 'video' },
        ],
      },
    ],
  },
};

export const FULLSTACK_MERN_SECTION_NODE_MAP: Record<string, string> = {
  'fs-internet': 'fs-internet',
  'fs-i1': 'fs-internet',
  'fs-i2': 'fs-internet',
  'fs-i3': 'fs-internet',

  'fs-frontend-foundations': 'fs-frontend-foundations',
  'fs-f1': 'fs-frontend-foundations',
  'fs-f2': 'fs-frontend-foundations',
  'fs-f3': 'fs-frontend-foundations',

  'fs-react-core': 'fs-react-core',
  'fs-r1': 'fs-react-core',
  'fs-r2': 'fs-react-core',
  'fs-r3': 'fs-react-core',

  'fs-typescript-state': 'fs-typescript-state',
  'fs-ts1': 'fs-typescript-state',
  'fs-ts2': 'fs-typescript-state',
  'fs-ts3': 'fs-typescript-state',

  'fs-nodejs-core': 'fs-nodejs-core',
  'fs-n1': 'fs-nodejs-core',
  'fs-n2': 'fs-nodejs-core',
  'fs-n3': 'fs-nodejs-core',

  'fs-express-api': 'fs-express-api',
  'fs-e1': 'fs-express-api',
  'fs-e2': 'fs-express-api',
  'fs-e3': 'fs-express-api',

  'fs-mongodb-data': 'fs-mongodb-data',
  'fs-db1': 'fs-mongodb-data',
  'fs-db2': 'fs-mongodb-data',
  'fs-db3': 'fs-mongodb-data',

  'fs-auth-security': 'fs-auth-security',
  'fs-a1': 'fs-auth-security',
  'fs-a2': 'fs-auth-security',
  'fs-a3': 'fs-auth-security',

  'fs-fullstack-integration': 'fs-fullstack-integration',
  'fs-int1': 'fs-fullstack-integration',
  'fs-int2': 'fs-fullstack-integration',
  'fs-int3': 'fs-fullstack-integration',

  'fs-testing-quality': 'fs-testing-quality',
  'fs-t1': 'fs-testing-quality',
  'fs-t2': 'fs-testing-quality',
  'fs-t3': 'fs-testing-quality',

  'fs-performance': 'fs-performance',
  'fs-p1': 'fs-performance',
  'fs-p2': 'fs-performance',
  'fs-p3': 'fs-performance',

  'fs-devops-cicd': 'fs-devops-cicd',
  'fs-d1': 'fs-devops-cicd',
  'fs-d2': 'fs-devops-cicd',
  'fs-d3': 'fs-devops-cicd',

  'fs-deployment-cloud': 'fs-deployment-cloud',
  'fs-dep1': 'fs-deployment-cloud',
  'fs-dep2': 'fs-deployment-cloud',
  'fs-dep3': 'fs-deployment-cloud',

  'fs-monitoring': 'fs-monitoring',
  'fs-m1': 'fs-monitoring',
  'fs-m2': 'fs-monitoring',
  'fs-m3': 'fs-monitoring',

  'fs-capstone': 'fs-capstone',
  'fs-c1': 'fs-capstone',
  'fs-c2': 'fs-capstone',
  'fs-c3': 'fs-capstone',
};
