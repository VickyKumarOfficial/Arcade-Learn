import type { SectionData } from '@/data/allNodeDetails';

export const BACKEND_NODE_DETAILS: Record<string, SectionData> = {
  'be-internet': {
    section: {
      id: 'be-internet',
      label: 'Internet & Web Foundations',
      description:
        'Backend systems run behind every request. Learn the transport basics and request lifecycle to design reliable server APIs.',
    },
    subNodes: [
      {
        id: 'be-i1',
        label: 'Request / Response Lifecycle',
        intro:
          'Every backend service starts by receiving a request and returning a response. Understanding this lifecycle is mandatory.',
        whatYoullLearn: [
          'How request parsing and response serialization work',
          'Route matching and middleware execution order',
          'How latency and timeouts affect user experience',
        ],
        resources: [
          { title: 'MDN HTTP Request Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods', type: 'article' },
          { title: 'How REST APIs Work', url: 'https://www.youtube.com/watch?v=Q-BpqyOT3a8', type: 'video' },
        ],
      },
      {
        id: 'be-i2',
        label: 'HTTP Methods & Status Codes',
        intro: 'Use HTTP semantics correctly so clients can integrate and debug your API confidently.',
        whatYoullLearn: [
          'GET, POST, PUT, PATCH, DELETE semantics',
          '2xx, 4xx, and 5xx response categories',
          'Designing consistent error payloads',
        ],
        resources: [
          { title: 'MDN HTTP Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'article' },
          { title: 'HTTP Status Code Guide', url: 'https://restfulapi.net/http-status-codes/', type: 'article' },
        ],
      },
      {
        id: 'be-i3',
        label: 'DNS, Ports, and Protocols',
        intro: 'Backend services depend on DNS resolution, TCP ports, and secure transport protocols.',
        whatYoullLearn: [
          'How DNS resolves service domains',
          'Common backend ports and reverse proxy routing',
          'TLS basics and why HTTPS is mandatory',
        ],
        resources: [
          { title: 'Cloudflare DNS Basics', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/', type: 'article' },
          { title: 'Networking Fundamentals for Developers', url: 'https://www.youtube.com/watch?v=qiQR5rTSshw', type: 'video' },
        ],
      },
      {
        id: 'be-i4',
        label: 'Client-Server Architecture',
        intro: 'Model your backend as a service consumed by clients through contracts and stable interfaces.',
        whatYoullLearn: [
          'Service boundaries and separation of concerns',
          'Stateless servers and horizontal scaling',
          'Backend contracts and API evolution',
        ],
        resources: [
          { title: 'Client-Server Architecture', url: 'https://www.cloudflare.com/learning/ddos/glossary/client-server-model/', type: 'article' },
          { title: 'System Design Basics', url: 'https://www.youtube.com/watch?v=UzLMhqg3_Wc', type: 'video' },
        ],
      },
    ],
  },
  'be-os-terminal': {
    section: {
      id: 'be-os-terminal',
      label: 'OS and Terminal',
      description:
        'Backend work is impossible without command-line fluency. You need shell skills for local development, servers, and CI runners.',
    },
    subNodes: [
      {
        id: 'be-os1',
        label: 'Shell Commands',
        intro: 'Navigate, inspect, and automate backend workflows from the terminal.',
        whatYoullLearn: [
          'File system navigation and search commands',
          'Pipes, redirects, and command chaining',
          'Portable scripts for local + CI environments',
        ],
        resources: [
          { title: 'Linux Command Line Basics', url: 'https://ubuntu.com/tutorials/command-line-for-beginners', type: 'article' },
          { title: 'Command Line Crash Course', url: 'https://www.youtube.com/watch?v=yz7nYlnXLfE', type: 'video' },
        ],
      },
      {
        id: 'be-os2',
        label: 'Processes and Environment',
        intro: 'Server apps are process-based. Understand runtime processes, env vars, and signals.',
        whatYoullLearn: [
          'Environment variable management',
          'Process lifecycle and graceful shutdown',
          'Debugging memory and CPU usage',
        ],
        resources: [
          { title: 'Node Process API', url: 'https://nodejs.org/api/process.html', type: 'article' },
          { title: 'Environment Variables in Node', url: 'https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/', type: 'article' },
        ],
      },
      {
        id: 'be-os3',
        label: 'Networking Tools',
        intro: 'Use networking utilities to diagnose API failures and connectivity issues fast.',
        whatYoullLearn: [
          'curl for request inspection',
          'netstat and lsof for port diagnosis',
          'ping, traceroute, and DNS lookups',
        ],
        resources: [
          { title: 'curl Documentation', url: 'https://curl.se/docs/manual.html', type: 'article' },
          { title: 'Linux Networking Commands', url: 'https://www.tecmint.com/linux-networking-commands/', type: 'article' },
        ],
      },
    ],
  },
  'be-javascript': {
    section: {
      id: 'be-javascript',
      label: 'JavaScript for Backend',
      description:
        'Node.js runs JavaScript on the server. You need async mastery and runtime awareness to build stable APIs.',
    },
    subNodes: [
      {
        id: 'be-js1',
        label: 'Event Loop & Async Model',
        intro: 'Backend throughput depends on non-blocking execution and proper async orchestration.',
        whatYoullLearn: [
          'Event loop phases and microtasks',
          'Promise concurrency patterns',
          'Avoiding blocking CPU-heavy tasks',
        ],
        resources: [
          { title: 'Node Event Loop Explained', url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick', type: 'article' },
          { title: 'Event Loop Visualized', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ', type: 'video' },
        ],
      },
      {
        id: 'be-js2',
        label: 'Modules and Runtime APIs',
        intro: 'Backend code organization depends on modules and standard runtime capabilities.',
        whatYoullLearn: [
          'ESM vs CommonJS interoperability',
          'Native modules for path, fs, and crypto',
          'Structured project architecture patterns',
        ],
        resources: [
          { title: 'Node ECMAScript Modules', url: 'https://nodejs.org/api/esm.html', type: 'article' },
          { title: 'Node.js Modules Guide', url: 'https://www.youtube.com/watch?v=9eU7QfM4k0c', type: 'video' },
        ],
      },
      {
        id: 'be-js3',
        label: 'Errors, Logging, and Debugging',
        intro: 'Observability starts in code: handle errors intentionally and produce meaningful logs.',
        whatYoullLearn: [
          'Operational vs programmer errors',
          'Structured logs with context',
          'Debugger and stack trace workflows',
        ],
        resources: [
          { title: 'Node Error Handling Best Practices', url: 'https://nodejs.dev/en/learn/error-handling-in-nodejs/', type: 'article' },
          { title: 'Debugging Node.js', url: 'https://www.youtube.com/watch?v=2-89Xq6w4YQ', type: 'video' },
        ],
      },
    ],
  },
  'be-version-control': {
    section: {
      id: 'be-version-control',
      label: 'Version Control',
      description:
        'Backend teams ship continuously. Strong Git hygiene keeps deployments safe and collaboration predictable.',
    },
    subNodes: [
      {
        id: 'be-git',
        label: 'Git Branching Workflow',
        intro: 'Adopt a branch strategy that supports reliable releases and code review quality.',
        whatYoullLearn: [
          'Feature branches and pull request flow',
          'Conflict resolution and rebasing',
          'Release and hotfix branch practices',
        ],
        resources: [
          { title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', type: 'book' },
          { title: 'Atlassian Git Workflow', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows', type: 'article' },
        ],
      },
    ],
  },
  'be-nodejs': {
    section: {
      id: 'be-nodejs',
      label: 'Node.js Core',
      description:
        'Node runtime knowledge lets you write faster services and avoid common production bottlenecks.',
    },
    subNodes: [
      {
        id: 'be-n1',
        label: 'Node Runtime Internals',
        intro: 'Understand how libuv and V8 impact scaling behavior and I/O throughput.',
        whatYoullLearn: [
          'libuv thread pool fundamentals',
          'V8 performance implications',
          'Choosing async APIs over sync APIs',
        ],
        resources: [
          { title: 'Node Architecture Overview', url: 'https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production', type: 'article' },
          { title: 'Node Internals Talk', url: 'https://www.youtube.com/watch?v=P9csgxBgaZ8', type: 'video' },
        ],
      },
      {
        id: 'be-n2',
        label: 'Streams and Buffers',
        intro: 'Streams are core for scalable file and network processing without high memory usage.',
        whatYoullLearn: [
          'Readable, writable, and transform streams',
          'Backpressure handling',
          'Buffer usage and binary data patterns',
        ],
        resources: [
          { title: 'Node Streams Documentation', url: 'https://nodejs.org/api/stream.html', type: 'article' },
          { title: 'Node Streams Explained', url: 'https://www.youtube.com/watch?v=GlyhCw5Aqq0', type: 'video' },
        ],
      },
      {
        id: 'be-n3',
        label: 'FS, Path, and Process APIs',
        intro: 'Core Node APIs solve daily backend tasks from file ops to process orchestration.',
        whatYoullLearn: [
          'File IO patterns with fs promises',
          'Safe cross-platform path handling',
          'Child process execution patterns',
        ],
        resources: [
          { title: 'Node File System API', url: 'https://nodejs.org/api/fs.html', type: 'article' },
          { title: 'Node Child Process API', url: 'https://nodejs.org/api/child_process.html', type: 'article' },
        ],
      },
    ],
  },
  'be-package-managers': {
    section: {
      id: 'be-package-managers',
      label: 'Package Management',
      description:
        'Dependency discipline is critical in backend services where version drift can break runtime behavior and security.',
    },
    subNodes: [
      {
        id: 'be-pm1',
        label: 'npm scripts',
        intro: 'Use npm scripts as a lightweight task runner for build, lint, test, and migration commands.',
        whatYoullLearn: [
          'Script conventions for dev and production',
          'Script composition and argument forwarding',
          'Standardizing commands across teams',
        ],
        resources: [
          { title: 'npm Scripts Documentation', url: 'https://docs.npmjs.com/cli/v10/using-npm/scripts', type: 'article' },
          { title: 'npm Scripts Best Practices', url: 'https://www.youtube.com/watch?v=hHUB3jX7iX8', type: 'video' },
        ],
      },
      {
        id: 'be-pm2',
        label: 'pnpm workspaces',
        intro: 'Workspaces help you scale shared backend packages in monorepos.',
        whatYoullLearn: [
          'Workspace linking and hoisting behavior',
          'Multi-package backend architecture',
          'Fast installs and deterministic lockfiles',
        ],
        resources: [
          { title: 'pnpm Workspaces', url: 'https://pnpm.io/workspaces', type: 'article' },
          { title: 'Monorepo with pnpm', url: 'https://www.youtube.com/watch?v=UQkx0w8Qfjo', type: 'video' },
        ],
      },
      {
        id: 'be-pm3',
        label: 'SemVer and lockfiles',
        intro: 'Stable production deployments require strict version policies and lockfile discipline.',
        whatYoullLearn: [
          'Semantic version ranges and risk levels',
          'Lockfile role in reproducible builds',
          'Dependency update strategies',
        ],
        resources: [
          { title: 'Semantic Versioning', url: 'https://semver.org/', type: 'article' },
          { title: 'Understanding package-lock', url: 'https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json', type: 'article' },
        ],
      },
    ],
  },
  'be-express': {
    section: {
      id: 'be-express',
      label: 'Express.js',
      description:
        'Express is the most common Node web framework. Build APIs with layered architecture and clean request pipelines.',
    },
    subNodes: [
      {
        id: 'be-ex1',
        label: 'Routing and Middleware',
        intro: 'Middleware is the backbone of request handling, auth, validation, and error management.',
        whatYoullLearn: [
          'Router organization by feature domain',
          'Request lifecycle with middleware chains',
          'Global vs route-specific middleware',
        ],
        resources: [
          { title: 'Express Routing Guide', url: 'https://expressjs.com/en/guide/routing.html', type: 'article' },
          { title: 'Express Middleware Guide', url: 'https://expressjs.com/en/guide/using-middleware.html', type: 'article' },
        ],
      },
      {
        id: 'be-ex2',
        label: 'Controller-Service Pattern',
        intro: 'Separate HTTP concerns from business logic to keep code testable and maintainable.',
        whatYoullLearn: [
          'Thin controllers and service layers',
          'Dependency boundaries and composition',
          'Refactoring toward domain modules',
        ],
        resources: [
          { title: 'Node.js Architecture Patterns', url: 'https://www.oreilly.com/library/view/nodejs-design-patterns/9781839214110/', type: 'book' },
          { title: 'Clean Node API Structure', url: 'https://www.youtube.com/watch?v=btM9N3hQ4xQ', type: 'video' },
        ],
      },
      {
        id: 'be-ex3',
        label: 'Validation with Zod',
        intro: 'Schema validation prevents malformed input from reaching your business logic.',
        whatYoullLearn: [
          'Request body and query validation',
          'Type-safe schemas and inference',
          'Reusable validation middleware',
        ],
        resources: [
          { title: 'Zod Documentation', url: 'https://zod.dev/', type: 'article' },
          { title: 'Runtime Validation in Node', url: 'https://www.youtube.com/watch?v=9UVPk0Ulm6U', type: 'video' },
        ],
      },
    ],
  },
  'be-api-design': {
    section: {
      id: 'be-api-design',
      label: 'API Design',
      description:
        'Good API design reduces support load and improves integration speed for frontend and third-party consumers.',
    },
    subNodes: [
      {
        id: 'be-api1',
        label: 'REST and Resource Modeling',
        intro: 'Model domain entities as resources with clear URI and method semantics.',
        whatYoullLearn: [
          'Resource naming conventions',
          'Idempotency and safe methods',
          'Versioning strategies for APIs',
        ],
        resources: [
          { title: 'REST API Tutorial', url: 'https://restfulapi.net/', type: 'article' },
          { title: 'Richardson Maturity Model', url: 'https://martinfowler.com/articles/richardsonMaturityModel.html', type: 'article' },
        ],
      },
      {
        id: 'be-api2',
        label: 'Pagination, Filter, Sorting',
        intro: 'Production APIs need predictable querying patterns for large datasets and client performance.',
        whatYoullLearn: [
          'Offset vs cursor pagination',
          'Filtering conventions and validation',
          'Sorting and field selection patterns',
        ],
        resources: [
          { title: 'API Pagination Best Practices', url: 'https://www.merge.dev/blog/api-pagination-best-practices', type: 'article' },
          { title: 'Designing Queryable APIs', url: 'https://www.youtube.com/watch?v=elvcVHQxYHQ', type: 'video' },
        ],
      },
      {
        id: 'be-api3',
        label: 'OpenAPI and API Docs',
        intro: 'Documentation is part of the product. OpenAPI enables discoverability and contract consistency.',
        whatYoullLearn: [
          'OpenAPI spec structure',
          'Generating docs with Swagger UI',
          'Contract-first API workflow',
        ],
        resources: [
          { title: 'OpenAPI Specification', url: 'https://spec.openapis.org/oas/latest.html', type: 'article' },
          { title: 'Swagger Docs', url: 'https://swagger.io/docs/', type: 'article' },
        ],
      },
    ],
  },
  'be-databases': {
    section: {
      id: 'be-databases',
      label: 'Databases',
      description:
        'Backend services persist business state. Learn relational design, query performance, and migration safety.',
    },
    subNodes: [
      {
        id: 'be-db1',
        label: 'SQL and PostgreSQL Basics',
        intro: 'Relational databases remain the default for many production APIs and transactional systems.',
        whatYoullLearn: [
          'Schema design and normalization basics',
          'JOINs, aggregation, and constraints',
          'Connection and transaction fundamentals',
        ],
        resources: [
          { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'article' },
          { title: 'SQL Fundamentals', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', type: 'video' },
        ],
      },
      {
        id: 'be-db2',
        label: 'Queries, ORM, and Migrations',
        intro: 'Balance ORM productivity with SQL understanding to avoid hidden performance issues.',
        whatYoullLearn: [
          'ORM model design patterns',
          'Migration lifecycle and rollback plans',
          'Query analysis and optimization',
        ],
        resources: [
          { title: 'Prisma Docs', url: 'https://www.prisma.io/docs', type: 'article' },
          { title: 'TypeORM Docs', url: 'https://typeorm.io/', type: 'article' },
        ],
      },
      {
        id: 'be-db3',
        label: 'Indexes and Transactions',
        intro: 'Indexes and transactions are central to both performance and data integrity.',
        whatYoullLearn: [
          'When and where to add indexes',
          'Transaction isolation and consistency',
          'Deadlock prevention strategies',
        ],
        resources: [
          { title: 'PostgreSQL Indexes', url: 'https://www.postgresql.org/docs/current/indexes.html', type: 'article' },
          { title: 'Transaction Isolation Levels', url: 'https://www.postgresql.org/docs/current/transaction-iso.html', type: 'article' },
        ],
      },
    ],
  },
  'be-auth': {
    section: {
      id: 'be-auth',
      label: 'Authentication and Authorization',
      description:
        'Identity is a core backend responsibility. Implement secure login, token handling, and access control from day one.',
    },
    subNodes: [
      {
        id: 'be-auth1',
        label: 'Sessions and JWT',
        intro: 'Understand token-based auth and session-based auth tradeoffs for different product needs.',
        whatYoullLearn: [
          'Session cookies vs stateless JWT',
          'Refresh token rotation patterns',
          'Secure token storage and expiry handling',
        ],
        resources: [
          { title: 'JWT Introduction', url: 'https://jwt.io/introduction', type: 'article' },
          { title: 'OWASP Session Management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html', type: 'article' },
        ],
      },
      {
        id: 'be-auth2',
        label: 'OAuth and Social Login',
        intro: 'OAuth reduces credential handling risk and improves onboarding speed for users.',
        whatYoullLearn: [
          'OAuth roles and authorization code flow',
          'Secure callback and state validation',
          'Provider integrations and account linking',
        ],
        resources: [
          { title: 'OAuth 2.0 Simplified', url: 'https://www.oauth.com/', type: 'article' },
          { title: 'OAuth Flow Explained', url: 'https://www.youtube.com/watch?v=CPbvxxslDTU', type: 'video' },
        ],
      },
      {
        id: 'be-auth3',
        label: 'RBAC and Permissions',
        intro: 'Authorization ensures authenticated users can only access allowed resources and actions.',
        whatYoullLearn: [
          'Role-based access control models',
          'Policy checks at route and service layers',
          'Auditing and permission traceability',
        ],
        resources: [
          { title: 'Authorization Concepts', url: 'https://auth0.com/docs/get-started/authorization', type: 'article' },
          { title: 'RBAC Design Guide', url: 'https://www.permit.io/blog/role-based-access-control-rbac', type: 'article' },
        ],
      },
    ],
  },
  'be-caching-queues': {
    section: {
      id: 'be-caching-queues',
      label: 'Caching and Queues',
      description:
        'As traffic grows, you need caches and async workers to protect latency and keep APIs responsive.',
    },
    subNodes: [
      {
        id: 'be-cq1',
        label: 'Redis Caching',
        intro: 'Cache hot paths and expensive queries to reduce database load and improve p95 latency.',
        whatYoullLearn: [
          'Cache-aside strategy basics',
          'TTL and invalidation techniques',
          'Distributed cache pitfalls',
        ],
        resources: [
          { title: 'Redis Docs', url: 'https://redis.io/docs/latest/', type: 'article' },
          { title: 'Caching Strategies', url: 'https://www.youtube.com/watch?v=H0pCP7Q7qQ0', type: 'video' },
        ],
      },
      {
        id: 'be-cq2',
        label: 'Background Jobs and Queues',
        intro: 'Offload expensive work from request paths using workers and message queues.',
        whatYoullLearn: [
          'Queue producers and consumers',
          'Retries, dead-letter queues, and idempotency',
          'Scheduling and throughput tuning',
        ],
        resources: [
          { title: 'BullMQ Documentation', url: 'https://docs.bullmq.io/', type: 'article' },
          { title: 'Message Queue Fundamentals', url: 'https://www.youtube.com/watch?v=oUJbuFMyBDk', type: 'video' },
        ],
      },
      {
        id: 'be-cq3',
        label: 'Rate Limiting and Throttling',
        intro: 'Protect backend availability by controlling abusive or accidental traffic spikes.',
        whatYoullLearn: [
          'Token bucket and sliding window models',
          'Per-user and per-IP limit strategies',
          'Graceful degradation responses',
        ],
        resources: [
          { title: 'Rate Limiting Strategies', url: 'https://cloud.google.com/architecture/rate-limiting-strategies-techniques', type: 'article' },
          { title: 'Express Rate Limit', url: 'https://www.npmjs.com/package/express-rate-limit', type: 'article' },
        ],
      },
    ],
  },
  'be-testing': {
    section: {
      id: 'be-testing',
      label: 'Backend Testing',
      description:
        'Reliable APIs require robust tests for business logic, integrations, and contract stability.',
    },
    subNodes: [
      {
        id: 'be-test1',
        label: 'Unit and Integration Tests',
        intro: 'Test service logic in isolation and then validate end-to-end behavior of modules together.',
        whatYoullLearn: [
          'Jest/Vitest test organization',
          'Testing service and repository layers',
          'Test data management patterns',
        ],
        resources: [
          { title: 'Jest Getting Started', url: 'https://jestjs.io/docs/getting-started', type: 'article' },
          { title: 'Vitest Guide', url: 'https://vitest.dev/guide/', type: 'article' },
        ],
      },
      {
        id: 'be-test2',
        label: 'API Contract Testing',
        intro: 'Contract tests prevent breaking changes between providers and consumers.',
        whatYoullLearn: [
          'Schema validation in response tests',
          'Consumer-driven contract approaches',
          'Version compatibility checks in CI',
        ],
        resources: [
          { title: 'Pact Contract Testing', url: 'https://docs.pact.io/', type: 'article' },
          { title: 'OpenAPI-based Testing', url: 'https://www.youtube.com/watch?v=IN8f6fhy6FQ', type: 'video' },
        ],
      },
      {
        id: 'be-test3',
        label: 'Mocks and Test Data',
        intro: 'Good fixtures and controlled mocks make tests deterministic and maintainable.',
        whatYoullLearn: [
          'When to mock dependencies and when not to',
          'Factory patterns for test data',
          'Database test isolation techniques',
        ],
        resources: [
          { title: 'Testing Best Practices for Node', url: 'https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices', type: 'article' },
          { title: 'Effective Test Fixtures', url: 'https://www.youtube.com/watch?v=Q8dY0T4f5lY', type: 'video' },
        ],
      },
    ],
  },
  'be-security': {
    section: {
      id: 'be-security',
      label: 'Backend Security',
      description:
        'Backend security is non-negotiable. Harden inputs, secrets, and deployment posture to reduce exploit risk.',
    },
    subNodes: [
      {
        id: 'be-sec1',
        label: 'Input Sanitization',
        intro: 'Treat all external input as untrusted and validate aggressively at boundaries.',
        whatYoullLearn: [
          'Validation and sanitization strategies',
          'Preventing injection vulnerabilities',
          'Safe serialization and parsing practices',
        ],
        resources: [
          { title: 'OWASP Input Validation', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', type: 'article' },
          { title: 'Node Security Guide', url: 'https://nodejs.org/en/learn/getting-started/security-best-practices', type: 'article' },
        ],
      },
      {
        id: 'be-sec2',
        label: 'Secrets and Env Management',
        intro: 'Keep credentials out of source control and rotate secrets with clear operational playbooks.',
        whatYoullLearn: [
          'Environment variable hygiene',
          'Secret managers and encrypted storage',
          'Rotation and revocation workflows',
        ],
        resources: [
          { title: '12-Factor Config', url: 'https://12factor.net/config', type: 'article' },
          { title: 'OWASP Secrets Management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html', type: 'article' },
        ],
      },
      {
        id: 'be-sec3',
        label: 'OWASP API Top 10',
        intro: 'Use OWASP API Top 10 as a baseline threat model for endpoint and auth design.',
        whatYoullLearn: [
          'Broken auth and authorization weaknesses',
          'Excessive data exposure patterns',
          'Rate limits, logging, and detection controls',
        ],
        resources: [
          { title: 'OWASP API Security Top 10', url: 'https://owasp.org/www-project-api-security/', type: 'article' },
          { title: 'API Security Fundamentals', url: 'https://www.youtube.com/watch?v=8jQ8srQ6Jf8', type: 'video' },
        ],
      },
    ],
  },
  'be-deployment': {
    section: {
      id: 'be-deployment',
      label: 'Deployment and DevOps',
      description:
        'Shipping backend code means packaging, deploying, and observing runtime health in production.',
    },
    subNodes: [
      {
        id: 'be-dep1',
        label: 'Docker and Containers',
        intro: 'Containers standardize runtime environments and reduce deployment drift across stages.',
        whatYoullLearn: [
          'Writing efficient Dockerfiles',
          'Multi-stage builds and image minimization',
          'Container runtime debugging basics',
        ],
        resources: [
          { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'article' },
          { title: 'Docker for Node.js', url: 'https://www.youtube.com/watch?v=9zUHg7xjIqQ', type: 'video' },
        ],
      },
      {
        id: 'be-dep2',
        label: 'CI/CD Pipelines',
        intro: 'Automate test and deployment stages so releases are fast, repeatable, and low-risk.',
        whatYoullLearn: [
          'Pipeline stages: lint, test, build, deploy',
          'Environment promotion strategies',
          'Rollback and release safety controls',
        ],
        resources: [
          { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', type: 'article' },
          { title: 'CI/CD Explained', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', type: 'video' },
        ],
      },
      {
        id: 'be-dep3',
        label: 'Monitoring and Logging',
        intro: 'Observability lets you detect issues early and debug incidents quickly after deployment.',
        whatYoullLearn: [
          'Application logs and correlation IDs',
          'Metrics, alerts, and SLO dashboards',
          'Incident response fundamentals',
        ],
        resources: [
          { title: 'Google SRE Workbook', url: 'https://sre.google/workbook/table-of-contents/', type: 'book' },
          { title: 'OpenTelemetry Docs', url: 'https://opentelemetry.io/docs/', type: 'article' },
        ],
      },
    ],
  },
  'be-system-design': {
    section: {
      id: 'be-system-design',
      label: 'System Design Basics',
      description:
        'Once fundamentals are strong, learn high-level design tradeoffs for scalable and resilient backend systems.',
    },
    subNodes: [
      {
        id: 'be-sd1',
        label: 'Scalability and Load Balancing',
        intro: 'Design services that scale horizontally and survive traffic spikes without downtime.',
        whatYoullLearn: [
          'Horizontal vs vertical scaling tradeoffs',
          'Stateless service design',
          'Load balancing and service discovery basics',
        ],
        resources: [
          { title: 'Scalability Basics', url: 'https://www.nginx.com/resources/glossary/scalability/', type: 'article' },
          { title: 'System Design Crash Course', url: 'https://www.youtube.com/watch?v=bUHFg8CZFws', type: 'video' },
        ],
      },
      {
        id: 'be-sd2',
        label: 'Observability and SLOs',
        intro: 'Define measurable reliability targets and instrument services to track health continuously.',
        whatYoullLearn: [
          'SLIs, SLOs, and error budgets',
          'Tracing, metrics, and structured logging',
          'Alert tuning and noise reduction',
        ],
        resources: [
          { title: 'SRE Fundamentals', url: 'https://sre.google/sre-book/service-level-objectives/', type: 'article' },
          { title: 'Observability Fundamentals', url: 'https://www.youtube.com/watch?v=6nM6jZ9w3tA', type: 'video' },
        ],
      },
      {
        id: 'be-sd3',
        label: 'Reliability Patterns',
        intro: 'Use resilience patterns to limit blast radius and maintain service continuity.',
        whatYoullLearn: [
          'Circuit breakers and retries with backoff',
          'Bulkheads and isolation patterns',
          'Graceful degradation and fallback paths',
        ],
        resources: [
          { title: 'Resilience Patterns', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/', type: 'article' },
          { title: 'Building Resilient Systems', url: 'https://www.youtube.com/watch?v=x0X6F5fQh2A', type: 'video' },
        ],
      },
    ],
  },
};

export const BACKEND_SECTION_NODE_MAP: Record<string, string> = {
  'be-internet': 'be-internet',
  'be-i1': 'be-internet',
  'be-i2': 'be-internet',
  'be-i3': 'be-internet',
  'be-i4': 'be-internet',
  'be-os-terminal': 'be-os-terminal',
  'be-os1': 'be-os-terminal',
  'be-os2': 'be-os-terminal',
  'be-os3': 'be-os-terminal',
  'be-javascript': 'be-javascript',
  'be-js1': 'be-javascript',
  'be-js2': 'be-javascript',
  'be-js3': 'be-javascript',
  'be-version-control': 'be-version-control',
  'be-git': 'be-version-control',
  'be-nodejs': 'be-nodejs',
  'be-n1': 'be-nodejs',
  'be-n2': 'be-nodejs',
  'be-n3': 'be-nodejs',
  'be-package-managers': 'be-package-managers',
  'be-pm1': 'be-package-managers',
  'be-pm2': 'be-package-managers',
  'be-pm3': 'be-package-managers',
  'be-express': 'be-express',
  'be-ex1': 'be-express',
  'be-ex2': 'be-express',
  'be-ex3': 'be-express',
  'be-api-design': 'be-api-design',
  'be-api1': 'be-api-design',
  'be-api2': 'be-api-design',
  'be-api3': 'be-api-design',
  'be-databases': 'be-databases',
  'be-db1': 'be-databases',
  'be-db2': 'be-databases',
  'be-db3': 'be-databases',
  'be-auth': 'be-auth',
  'be-auth1': 'be-auth',
  'be-auth2': 'be-auth',
  'be-auth3': 'be-auth',
  'be-caching-queues': 'be-caching-queues',
  'be-cq1': 'be-caching-queues',
  'be-cq2': 'be-caching-queues',
  'be-cq3': 'be-caching-queues',
  'be-testing': 'be-testing',
  'be-test1': 'be-testing',
  'be-test2': 'be-testing',
  'be-test3': 'be-testing',
  'be-security': 'be-security',
  'be-sec1': 'be-security',
  'be-sec2': 'be-security',
  'be-sec3': 'be-security',
  'be-deployment': 'be-deployment',
  'be-dep1': 'be-deployment',
  'be-dep2': 'be-deployment',
  'be-dep3': 'be-deployment',
  'be-system-design': 'be-system-design',
  'be-sd1': 'be-system-design',
  'be-sd2': 'be-system-design',
  'be-sd3': 'be-system-design',
};
