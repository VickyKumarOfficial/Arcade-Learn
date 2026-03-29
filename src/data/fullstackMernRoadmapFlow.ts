import { Node, Edge, MarkerType } from 'reactflow';
import type { RoadmapNodeData } from '@/types/roadmapFlow';

export const initialNodes: Node<RoadmapNodeData>[] = [
  {
    id: 'start-fullstack-mern',
    type: 'startNode',
    position: { x: 380, y: 0 },
    data: { label: 'Full Stack MERN Development' },
  },

  {
    id: 'fs-internet',
    type: 'mainNode',
    position: { x: 380, y: 130 },
    data: { label: 'Internet and Web Foundations' },
  },
  { id: 'fs-i1', type: 'branchNode', position: { x: 680, y: 98 }, data: { label: 'HTTP Request Lifecycle' } },
  { id: 'fs-i2', type: 'branchNode', position: { x: 680, y: 163 }, data: { label: 'Client-Server Contracts' } },
  { id: 'fs-i3', type: 'leftBranchNode', position: { x: 80, y: 130 }, data: { label: 'DNS, SSL, and Hosting Basics' } },

  {
    id: 'fs-frontend-foundations',
    type: 'mainNode',
    position: { x: 380, y: 300 },
    data: { label: 'Frontend Foundations' },
  },
  { id: 'fs-f1', type: 'branchNode', position: { x: 680, y: 268 }, data: { label: 'Semantic HTML and A11y' } },
  { id: 'fs-f2', type: 'branchNode', position: { x: 680, y: 333 }, data: { label: 'Responsive CSS and Layouts' } },
  { id: 'fs-f3', type: 'leftBranchNode', position: { x: 80, y: 300 }, data: { label: 'Modern JavaScript Essentials' } },

  {
    id: 'fs-react-core',
    type: 'mainNode',
    position: { x: 380, y: 470 },
    data: { label: 'React Core' },
  },
  { id: 'fs-r1', type: 'branchNode', position: { x: 680, y: 438 }, data: { label: 'Components and Hooks' } },
  { id: 'fs-r2', type: 'branchNode', position: { x: 680, y: 503 }, data: { label: 'Routing and UI Architecture' } },
  { id: 'fs-r3', type: 'leftBranchNode', position: { x: 80, y: 470 }, data: { label: 'Forms and Data Fetching' } },

  {
    id: 'fs-typescript-state',
    type: 'mainNode',
    position: { x: 380, y: 640 },
    data: { label: 'TypeScript and State Management' },
  },
  { id: 'fs-ts1', type: 'branchNode', position: { x: 680, y: 608 }, data: { label: 'Type-safe Components' } },
  { id: 'fs-ts2', type: 'branchNode', position: { x: 680, y: 673 }, data: { label: 'State Patterns (Context/Redux)' } },
  { id: 'fs-ts3', type: 'leftBranchNode', position: { x: 80, y: 640 }, data: { label: 'Async State and Caching' } },

  {
    id: 'fs-nodejs-core',
    type: 'mainNode',
    position: { x: 380, y: 810 },
    data: { label: 'Node.js Core' },
  },
  { id: 'fs-n1', type: 'branchNode', position: { x: 680, y: 778 }, data: { label: 'Runtime and Event Loop' } },
  { id: 'fs-n2', type: 'branchNode', position: { x: 680, y: 843 }, data: { label: 'Modules and Project Structure' } },
  { id: 'fs-n3', type: 'leftBranchNode', position: { x: 80, y: 810 }, data: { label: 'Environment and Config Management' } },

  {
    id: 'fs-express-api',
    type: 'mainNode',
    position: { x: 380, y: 980 },
    data: { label: 'Express API Development' },
  },
  { id: 'fs-e1', type: 'branchNode', position: { x: 680, y: 948 }, data: { label: 'Routing and Middleware' } },
  { id: 'fs-e2', type: 'branchNode', position: { x: 680, y: 1013 }, data: { label: 'Controllers and Services' } },
  { id: 'fs-e3', type: 'leftBranchNode', position: { x: 80, y: 980 }, data: { label: 'Validation and Error Handling' } },

  {
    id: 'fs-mongodb-data',
    type: 'mainNode',
    position: { x: 380, y: 1150 },
    data: { label: 'MongoDB and Data Modeling' },
  },
  { id: 'fs-db1', type: 'branchNode', position: { x: 680, y: 1118 }, data: { label: 'Schema Design with Mongoose' } },
  { id: 'fs-db2', type: 'branchNode', position: { x: 680, y: 1183 }, data: { label: 'CRUD, Aggregation, and Indexes' } },
  { id: 'fs-db3', type: 'leftBranchNode', position: { x: 80, y: 1150 }, data: { label: 'Transactions and Data Consistency' } },

  {
    id: 'fs-auth-security',
    type: 'mainNode',
    position: { x: 380, y: 1320 },
    data: { label: 'Authentication and Security' },
  },
  { id: 'fs-a1', type: 'branchNode', position: { x: 680, y: 1288 }, data: { label: 'JWT and Refresh Tokens' } },
  { id: 'fs-a2', type: 'branchNode', position: { x: 680, y: 1353 }, data: { label: 'RBAC and Protected Routes' } },
  { id: 'fs-a3', type: 'leftBranchNode', position: { x: 80, y: 1320 }, data: { label: 'Input Sanitization and OWASP' } },

  {
    id: 'fs-fullstack-integration',
    type: 'mainNode',
    position: { x: 380, y: 1490 },
    data: { label: 'Frontend-Backend Integration' },
  },
  { id: 'fs-int1', type: 'branchNode', position: { x: 680, y: 1458 }, data: { label: 'API Client Layer and DTOs' } },
  { id: 'fs-int2', type: 'branchNode', position: { x: 680, y: 1523 }, data: { label: 'Auth Flow Across Stack' } },
  { id: 'fs-int3', type: 'leftBranchNode', position: { x: 80, y: 1490 }, data: { label: 'Error States and UX Resilience' } },

  {
    id: 'fs-testing-quality',
    type: 'mainNode',
    position: { x: 380, y: 1660 },
    data: { label: 'Testing and Quality' },
  },
  { id: 'fs-t1', type: 'branchNode', position: { x: 680, y: 1628 }, data: { label: 'Frontend Unit and E2E Tests' } },
  { id: 'fs-t2', type: 'branchNode', position: { x: 680, y: 1693 }, data: { label: 'API and Integration Tests' } },
  { id: 'fs-t3', type: 'leftBranchNode', position: { x: 80, y: 1660 }, data: { label: 'Linting and Code Quality Gates' } },

  {
    id: 'fs-performance',
    type: 'mainNode',
    position: { x: 380, y: 1830 },
    data: { label: 'Performance Optimization' },
  },
  { id: 'fs-p1', type: 'branchNode', position: { x: 680, y: 1798 }, data: { label: 'Frontend Performance Tuning' } },
  { id: 'fs-p2', type: 'branchNode', position: { x: 680, y: 1863 }, data: { label: 'API and DB Performance' } },
  { id: 'fs-p3', type: 'leftBranchNode', position: { x: 80, y: 1830 }, data: { label: 'Caching Strategies' } },

  {
    id: 'fs-devops-cicd',
    type: 'mainNode',
    position: { x: 380, y: 2000 },
    data: { label: 'DevOps and CI/CD' },
  },
  { id: 'fs-d1', type: 'branchNode', position: { x: 680, y: 1968 }, data: { label: 'Docker for Full Stack Apps' } },
  { id: 'fs-d2', type: 'branchNode', position: { x: 680, y: 2033 }, data: { label: 'Pipeline Automation' } },
  { id: 'fs-d3', type: 'leftBranchNode', position: { x: 80, y: 2000 }, data: { label: 'Environment Promotions' } },

  {
    id: 'fs-deployment-cloud',
    type: 'mainNode',
    position: { x: 380, y: 2170 },
    data: { label: 'Deployment and Cloud' },
  },
  { id: 'fs-dep1', type: 'branchNode', position: { x: 680, y: 2138 }, data: { label: 'Deploy Frontend and API' } },
  { id: 'fs-dep2', type: 'branchNode', position: { x: 680, y: 2203 }, data: { label: 'Secrets and Runtime Config' } },
  { id: 'fs-dep3', type: 'leftBranchNode', position: { x: 80, y: 2170 }, data: { label: 'Custom Domains and SSL' } },

  {
    id: 'fs-monitoring',
    type: 'mainNode',
    position: { x: 380, y: 2340 },
    data: { label: 'Monitoring and Observability' },
  },
  { id: 'fs-m1', type: 'branchNode', position: { x: 680, y: 2308 }, data: { label: 'Structured Logging' } },
  { id: 'fs-m2', type: 'branchNode', position: { x: 680, y: 2373 }, data: { label: 'Metrics and Alerting' } },
  { id: 'fs-m3', type: 'leftBranchNode', position: { x: 80, y: 2340 }, data: { label: 'Incident Debugging Workflow' } },

  {
    id: 'fs-capstone',
    type: 'mainNode',
    position: { x: 380, y: 2510 },
    data: { label: 'Capstone Production Project' },
  },
  { id: 'fs-c1', type: 'branchNode', position: { x: 680, y: 2478 }, data: { label: 'Architecture and Scope' } },
  { id: 'fs-c2', type: 'branchNode', position: { x: 680, y: 2543 }, data: { label: 'Delivery and Portfolio Story' } },
  { id: 'fs-c3', type: 'leftBranchNode', position: { x: 80, y: 2510 }, data: { label: 'Reliability and Scale Checklist' } },
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
  mkMain('e-fs-start-internet', 'start-fullstack-mern', 'fs-internet'),
  mkMain('e-fs-internet-foundations', 'fs-internet', 'fs-frontend-foundations'),
  mkMain('e-fs-foundations-react', 'fs-frontend-foundations', 'fs-react-core'),
  mkMain('e-fs-react-ts', 'fs-react-core', 'fs-typescript-state'),
  mkMain('e-fs-ts-node', 'fs-typescript-state', 'fs-nodejs-core'),
  mkMain('e-fs-node-express', 'fs-nodejs-core', 'fs-express-api'),
  mkMain('e-fs-express-db', 'fs-express-api', 'fs-mongodb-data'),
  mkMain('e-fs-db-auth', 'fs-mongodb-data', 'fs-auth-security'),
  mkMain('e-fs-auth-integration', 'fs-auth-security', 'fs-fullstack-integration'),
  mkMain('e-fs-integration-testing', 'fs-fullstack-integration', 'fs-testing-quality'),
  mkMain('e-fs-testing-performance', 'fs-testing-quality', 'fs-performance'),
  mkMain('e-fs-performance-devops', 'fs-performance', 'fs-devops-cicd'),
  mkMain('e-fs-devops-deploy', 'fs-devops-cicd', 'fs-deployment-cloud'),
  mkMain('e-fs-deploy-monitoring', 'fs-deployment-cloud', 'fs-monitoring'),
  mkMain('e-fs-monitoring-capstone', 'fs-monitoring', 'fs-capstone'),

  mkBranch('e-fs-internet-1', 'fs-internet', 'fs-i1', 'r2'),
  mkBranch('e-fs-internet-2', 'fs-internet', 'fs-i2', 'r4'),
  mkLeft('e-fs-internet-3', 'fs-internet', 'fs-i3', 'left'),

  mkBranch('e-fs-foundations-1', 'fs-frontend-foundations', 'fs-f1', 'r2'),
  mkBranch('e-fs-foundations-2', 'fs-frontend-foundations', 'fs-f2', 'r4'),
  mkLeft('e-fs-foundations-3', 'fs-frontend-foundations', 'fs-f3', 'left'),

  mkBranch('e-fs-react-1', 'fs-react-core', 'fs-r1', 'r2'),
  mkBranch('e-fs-react-2', 'fs-react-core', 'fs-r2', 'r4'),
  mkLeft('e-fs-react-3', 'fs-react-core', 'fs-r3', 'left'),

  mkBranch('e-fs-ts-1', 'fs-typescript-state', 'fs-ts1', 'r2'),
  mkBranch('e-fs-ts-2', 'fs-typescript-state', 'fs-ts2', 'r4'),
  mkLeft('e-fs-ts-3', 'fs-typescript-state', 'fs-ts3', 'left'),

  mkBranch('e-fs-node-1', 'fs-nodejs-core', 'fs-n1', 'r2'),
  mkBranch('e-fs-node-2', 'fs-nodejs-core', 'fs-n2', 'r4'),
  mkLeft('e-fs-node-3', 'fs-nodejs-core', 'fs-n3', 'left'),

  mkBranch('e-fs-express-1', 'fs-express-api', 'fs-e1', 'r2'),
  mkBranch('e-fs-express-2', 'fs-express-api', 'fs-e2', 'r4'),
  mkLeft('e-fs-express-3', 'fs-express-api', 'fs-e3', 'left'),

  mkBranch('e-fs-db-1', 'fs-mongodb-data', 'fs-db1', 'r2'),
  mkBranch('e-fs-db-2', 'fs-mongodb-data', 'fs-db2', 'r4'),
  mkLeft('e-fs-db-3', 'fs-mongodb-data', 'fs-db3', 'left'),

  mkBranch('e-fs-auth-1', 'fs-auth-security', 'fs-a1', 'r2'),
  mkBranch('e-fs-auth-2', 'fs-auth-security', 'fs-a2', 'r4'),
  mkLeft('e-fs-auth-3', 'fs-auth-security', 'fs-a3', 'left'),

  mkBranch('e-fs-integration-1', 'fs-fullstack-integration', 'fs-int1', 'r2'),
  mkBranch('e-fs-integration-2', 'fs-fullstack-integration', 'fs-int2', 'r4'),
  mkLeft('e-fs-integration-3', 'fs-fullstack-integration', 'fs-int3', 'left'),

  mkBranch('e-fs-testing-1', 'fs-testing-quality', 'fs-t1', 'r2'),
  mkBranch('e-fs-testing-2', 'fs-testing-quality', 'fs-t2', 'r4'),
  mkLeft('e-fs-testing-3', 'fs-testing-quality', 'fs-t3', 'left'),

  mkBranch('e-fs-performance-1', 'fs-performance', 'fs-p1', 'r2'),
  mkBranch('e-fs-performance-2', 'fs-performance', 'fs-p2', 'r4'),
  mkLeft('e-fs-performance-3', 'fs-performance', 'fs-p3', 'left'),

  mkBranch('e-fs-devops-1', 'fs-devops-cicd', 'fs-d1', 'r2'),
  mkBranch('e-fs-devops-2', 'fs-devops-cicd', 'fs-d2', 'r4'),
  mkLeft('e-fs-devops-3', 'fs-devops-cicd', 'fs-d3', 'left'),

  mkBranch('e-fs-deployment-1', 'fs-deployment-cloud', 'fs-dep1', 'r2'),
  mkBranch('e-fs-deployment-2', 'fs-deployment-cloud', 'fs-dep2', 'r4'),
  mkLeft('e-fs-deployment-3', 'fs-deployment-cloud', 'fs-dep3', 'left'),

  mkBranch('e-fs-monitoring-1', 'fs-monitoring', 'fs-m1', 'r2'),
  mkBranch('e-fs-monitoring-2', 'fs-monitoring', 'fs-m2', 'r4'),
  mkLeft('e-fs-monitoring-3', 'fs-monitoring', 'fs-m3', 'left'),

  mkBranch('e-fs-capstone-1', 'fs-capstone', 'fs-c1', 'r2'),
  mkBranch('e-fs-capstone-2', 'fs-capstone', 'fs-c2', 'r4'),
  mkLeft('e-fs-capstone-3', 'fs-capstone', 'fs-c3', 'left'),
];
