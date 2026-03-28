import { Node, Edge, MarkerType } from 'reactflow';
import type { RoadmapNodeData } from '@/types/roadmapFlow';

export const initialNodes: Node<RoadmapNodeData>[] = [
  {
    id: 'start-backend',
    type: 'startNode',
    position: { x: 380, y: 0 },
    data: { label: 'Backend Development' },
  },

  {
    id: 'be-internet',
    type: 'mainNode',
    position: { x: 380, y: 130 },
    data: { label: 'Internet & Web Foundations' },
  },
  { id: 'be-i1', type: 'branchNode', position: { x: 680, y: 98 }, data: { label: 'Request / Response Lifecycle' } },
  { id: 'be-i2', type: 'branchNode', position: { x: 680, y: 163 }, data: { label: 'HTTP Methods & Status Codes' } },
  { id: 'be-i3', type: 'leftBranchNode', position: { x: 80, y: 98 }, data: { label: 'DNS, Ports, and Protocols' } },
  { id: 'be-i4', type: 'leftBranchNode', position: { x: 80, y: 163 }, data: { label: 'Client-Server Architecture' } },

  {
    id: 'be-os-terminal',
    type: 'mainNode',
    position: { x: 380, y: 300 },
    data: { label: 'OS and Terminal' },
  },
  { id: 'be-os1', type: 'branchNode', position: { x: 680, y: 268 }, data: { label: 'Shell Commands' } },
  { id: 'be-os2', type: 'branchNode', position: { x: 680, y: 333 }, data: { label: 'Processes and Environment' } },
  { id: 'be-os3', type: 'leftBranchNode', position: { x: 80, y: 300 }, data: { label: 'Networking Tools' } },

  {
    id: 'be-javascript',
    type: 'mainNode',
    position: { x: 380, y: 470 },
    data: { label: 'JavaScript for Backend' },
  },
  { id: 'be-js1', type: 'branchNode', position: { x: 680, y: 438 }, data: { label: 'Event Loop & Async Model' } },
  { id: 'be-js2', type: 'branchNode', position: { x: 680, y: 503 }, data: { label: 'Modules and Runtime APIs' } },
  { id: 'be-js3', type: 'leftBranchNode', position: { x: 80, y: 470 }, data: { label: 'Errors, Logging, and Debugging' } },

  {
    id: 'be-version-control',
    type: 'mainNode',
    position: { x: 380, y: 640 },
    data: { label: 'Version Control' },
  },
  { id: 'be-git', type: 'leftBranchNode', position: { x: 80, y: 640 }, data: { label: 'Git Branching Workflow' } },

  {
    id: 'be-nodejs',
    type: 'mainNode',
    position: { x: 380, y: 810 },
    data: { label: 'Node.js Core' },
  },
  { id: 'be-n1', type: 'branchNode', position: { x: 680, y: 778 }, data: { label: 'Node Runtime Internals' } },
  { id: 'be-n2', type: 'branchNode', position: { x: 680, y: 843 }, data: { label: 'Streams and Buffers' } },
  { id: 'be-n3', type: 'leftBranchNode', position: { x: 80, y: 810 }, data: { label: 'FS, Path, and Process APIs' } },

  {
    id: 'be-package-managers',
    type: 'mainNode',
    position: { x: 380, y: 980 },
    data: { label: 'Package Management' },
  },
  { id: 'be-pm1', type: 'optionNode', position: { x: 680, y: 948 }, data: { label: 'npm scripts' } },
  { id: 'be-pm2', type: 'optionNode', position: { x: 680, y: 1013 }, data: { label: 'pnpm workspaces' } },
  { id: 'be-pm3', type: 'leftBranchNode', position: { x: 80, y: 980 }, data: { label: 'SemVer and lockfiles' } },

  {
    id: 'be-express',
    type: 'mainNode',
    position: { x: 380, y: 1150 },
    data: { label: 'Express.js' },
  },
  { id: 'be-ex1', type: 'branchNode', position: { x: 680, y: 1118 }, data: { label: 'Routing and Middleware' } },
  { id: 'be-ex2', type: 'branchNode', position: { x: 680, y: 1183 }, data: { label: 'Controller-Service Pattern' } },
  { id: 'be-ex3', type: 'leftBranchNode', position: { x: 80, y: 1150 }, data: { label: 'Validation with Zod' } },

  {
    id: 'be-api-design',
    type: 'mainNode',
    position: { x: 380, y: 1320 },
    data: { label: 'API Design' },
  },
  { id: 'be-api1', type: 'branchNode', position: { x: 680, y: 1288 }, data: { label: 'REST and Resource Modeling' } },
  { id: 'be-api2', type: 'branchNode', position: { x: 680, y: 1353 }, data: { label: 'Pagination, Filter, Sorting' } },
  { id: 'be-api3', type: 'leftBranchNode', position: { x: 80, y: 1320 }, data: { label: 'OpenAPI and API Docs' } },

  {
    id: 'be-databases',
    type: 'mainNode',
    position: { x: 380, y: 1490 },
    data: { label: 'Databases' },
  },
  { id: 'be-db1', type: 'branchNode', position: { x: 680, y: 1458 }, data: { label: 'SQL and PostgreSQL Basics' } },
  { id: 'be-db2', type: 'branchNode', position: { x: 680, y: 1523 }, data: { label: 'Queries, ORM, and Migrations' } },
  { id: 'be-db3', type: 'leftBranchNode', position: { x: 80, y: 1490 }, data: { label: 'Indexes and Transactions' } },

  {
    id: 'be-auth',
    type: 'mainNode',
    position: { x: 380, y: 1660 },
    data: { label: 'Authentication and Authorization' },
  },
  { id: 'be-auth1', type: 'branchNode', position: { x: 680, y: 1628 }, data: { label: 'Sessions and JWT' } },
  { id: 'be-auth2', type: 'branchNode', position: { x: 680, y: 1693 }, data: { label: 'OAuth and Social Login' } },
  { id: 'be-auth3', type: 'leftBranchNode', position: { x: 80, y: 1660 }, data: { label: 'RBAC and Permissions' } },

  {
    id: 'be-caching-queues',
    type: 'mainNode',
    position: { x: 380, y: 1830 },
    data: { label: 'Caching and Queues' },
  },
  { id: 'be-cq1', type: 'branchNode', position: { x: 680, y: 1798 }, data: { label: 'Redis Caching' } },
  { id: 'be-cq2', type: 'branchNode', position: { x: 680, y: 1863 }, data: { label: 'Background Jobs and Queues' } },
  { id: 'be-cq3', type: 'leftBranchNode', position: { x: 80, y: 1830 }, data: { label: 'Rate Limiting and Throttling' } },

  {
    id: 'be-testing',
    type: 'mainNode',
    position: { x: 380, y: 2000 },
    data: { label: 'Backend Testing' },
  },
  { id: 'be-test1', type: 'branchNode', position: { x: 680, y: 1968 }, data: { label: 'Unit and Integration Tests' } },
  { id: 'be-test2', type: 'branchNode', position: { x: 680, y: 2033 }, data: { label: 'API Contract Testing' } },
  { id: 'be-test3', type: 'leftBranchNode', position: { x: 80, y: 2000 }, data: { label: 'Mocks and Test Data' } },

  {
    id: 'be-security',
    type: 'mainNode',
    position: { x: 380, y: 2170 },
    data: { label: 'Backend Security' },
  },
  { id: 'be-sec1', type: 'branchNode', position: { x: 680, y: 2138 }, data: { label: 'Input Sanitization' } },
  { id: 'be-sec2', type: 'branchNode', position: { x: 680, y: 2203 }, data: { label: 'Secrets and Env Management' } },
  { id: 'be-sec3', type: 'leftBranchNode', position: { x: 80, y: 2170 }, data: { label: 'OWASP API Top 10' } },

  {
    id: 'be-deployment',
    type: 'mainNode',
    position: { x: 380, y: 2340 },
    data: { label: 'Deployment and DevOps' },
  },
  { id: 'be-dep1', type: 'branchNode', position: { x: 680, y: 2308 }, data: { label: 'Docker and Containers' } },
  { id: 'be-dep2', type: 'branchNode', position: { x: 680, y: 2373 }, data: { label: 'CI/CD Pipelines' } },
  { id: 'be-dep3', type: 'leftBranchNode', position: { x: 80, y: 2340 }, data: { label: 'Monitoring and Logging' } },

  {
    id: 'be-system-design',
    type: 'mainNode',
    position: { x: 380, y: 2510 },
    data: { label: 'System Design Basics' },
  },
  { id: 'be-sd1', type: 'branchNode', position: { x: 680, y: 2478 }, data: { label: 'Scalability and Load Balancing' } },
  { id: 'be-sd2', type: 'branchNode', position: { x: 680, y: 2543 }, data: { label: 'Observability and SLOs' } },
  { id: 'be-sd3', type: 'leftBranchNode', position: { x: 80, y: 2510 }, data: { label: 'Reliability Patterns' } },
];

const mainEdgeStyle = { stroke: '#3b82f6', strokeWidth: 2 };
const branchEdgeStyle = { stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '5 5' };
const leftEdgeStyle = { stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '5 5' };

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
  mkMain('e-be-start-internet', 'start-backend', 'be-internet'),
  mkMain('e-be-internet-os', 'be-internet', 'be-os-terminal'),
  mkMain('e-be-os-js', 'be-os-terminal', 'be-javascript'),
  mkMain('e-be-js-vc', 'be-javascript', 'be-version-control'),
  mkMain('e-be-vc-node', 'be-version-control', 'be-nodejs'),
  mkMain('e-be-node-pkg', 'be-nodejs', 'be-package-managers'),
  mkMain('e-be-pkg-express', 'be-package-managers', 'be-express'),
  mkMain('e-be-express-api', 'be-express', 'be-api-design'),
  mkMain('e-be-api-db', 'be-api-design', 'be-databases'),
  mkMain('e-be-db-auth', 'be-databases', 'be-auth'),
  mkMain('e-be-auth-cq', 'be-auth', 'be-caching-queues'),
  mkMain('e-be-cq-test', 'be-caching-queues', 'be-testing'),
  mkMain('e-be-test-sec', 'be-testing', 'be-security'),
  mkMain('e-be-sec-deploy', 'be-security', 'be-deployment'),
  mkMain('e-be-deploy-sd', 'be-deployment', 'be-system-design'),

  mkBranch('e-be-internet-1', 'be-internet', 'be-i1', 'r2'),
  mkBranch('e-be-internet-2', 'be-internet', 'be-i2', 'r4'),
  mkLeft('e-be-internet-3', 'be-internet', 'be-i3', 'l2'),
  mkLeft('e-be-internet-4', 'be-internet', 'be-i4', 'l4'),

  mkBranch('e-be-os-1', 'be-os-terminal', 'be-os1', 'r2'),
  mkBranch('e-be-os-2', 'be-os-terminal', 'be-os2', 'r4'),
  mkLeft('e-be-os-3', 'be-os-terminal', 'be-os3'),

  mkBranch('e-be-js-1', 'be-javascript', 'be-js1', 'r2'),
  mkBranch('e-be-js-2', 'be-javascript', 'be-js2', 'r4'),
  mkLeft('e-be-js-3', 'be-javascript', 'be-js3'),

  mkLeft('e-be-vc-git', 'be-version-control', 'be-git'),

  mkBranch('e-be-node-1', 'be-nodejs', 'be-n1', 'r2'),
  mkBranch('e-be-node-2', 'be-nodejs', 'be-n2', 'r4'),
  mkLeft('e-be-node-3', 'be-nodejs', 'be-n3'),

  mkBranch('e-be-pkg-1', 'be-package-managers', 'be-pm1', 'r2'),
  mkBranch('e-be-pkg-2', 'be-package-managers', 'be-pm2', 'r4'),
  mkLeft('e-be-pkg-3', 'be-package-managers', 'be-pm3'),

  mkBranch('e-be-ex-1', 'be-express', 'be-ex1', 'r2'),
  mkBranch('e-be-ex-2', 'be-express', 'be-ex2', 'r4'),
  mkLeft('e-be-ex-3', 'be-express', 'be-ex3'),

  mkBranch('e-be-api-1', 'be-api-design', 'be-api1', 'r2'),
  mkBranch('e-be-api-2', 'be-api-design', 'be-api2', 'r4'),
  mkLeft('e-be-api-3', 'be-api-design', 'be-api3'),

  mkBranch('e-be-db-1', 'be-databases', 'be-db1', 'r2'),
  mkBranch('e-be-db-2', 'be-databases', 'be-db2', 'r4'),
  mkLeft('e-be-db-3', 'be-databases', 'be-db3'),

  mkBranch('e-be-auth-1', 'be-auth', 'be-auth1', 'r2'),
  mkBranch('e-be-auth-2', 'be-auth', 'be-auth2', 'r4'),
  mkLeft('e-be-auth-3', 'be-auth', 'be-auth3'),

  mkBranch('e-be-cq-1', 'be-caching-queues', 'be-cq1', 'r2'),
  mkBranch('e-be-cq-2', 'be-caching-queues', 'be-cq2', 'r4'),
  mkLeft('e-be-cq-3', 'be-caching-queues', 'be-cq3'),

  mkBranch('e-be-test-1', 'be-testing', 'be-test1', 'r2'),
  mkBranch('e-be-test-2', 'be-testing', 'be-test2', 'r4'),
  mkLeft('e-be-test-3', 'be-testing', 'be-test3'),

  mkBranch('e-be-sec-1', 'be-security', 'be-sec1', 'r2'),
  mkBranch('e-be-sec-2', 'be-security', 'be-sec2', 'r4'),
  mkLeft('e-be-sec-3', 'be-security', 'be-sec3'),

  mkBranch('e-be-dep-1', 'be-deployment', 'be-dep1', 'r2'),
  mkBranch('e-be-dep-2', 'be-deployment', 'be-dep2', 'r4'),
  mkLeft('e-be-dep-3', 'be-deployment', 'be-dep3'),

  mkBranch('e-be-sd-1', 'be-system-design', 'be-sd1', 'r2'),
  mkBranch('e-be-sd-2', 'be-system-design', 'be-sd2', 'r4'),
  mkLeft('e-be-sd-3', 'be-system-design', 'be-sd3'),
];
