# Roadmap Flow Implementation Guide

> **Goal:** Replicate the interactive `FrontendRoadmapFlow` experience — ReactFlow canvas, node detail sidebar, quiz integration, project submission, comments, career modules, FAQ accordion, lock gate, and completion tracking — for all remaining roadmaps, with minimal UI duplication and maximum automation.

> **Document Mode:** This is a **target-state implementation blueprint** for scaling. Treat it as the execution playbook for future roadmap expansion, not as a changelog of current implementation state.

---

## Table of Contents

1. [How the Frontend Flow Currently Works (Full Architecture)](#1-how-the-frontend-flow-currently-works)
2. [The Problem with Copy-Pasting](#2-the-problem-with-copy-pasting)
3. [The Solution Architecture](#3-the-solution-architecture)
4. [Phase 0 — One-Time Refactor (Do This First)](#4-phase-0--one-time-refactor-do-this-first)
5. [Phase 1 — Per-Roadmap Work (Repeat × 14)](#5-phase-1--per-roadmap-work-repeat--14)
6. [Node ID & Naming Conventions](#6-node-id--naming-conventions)
7. [Reusable Shared Sections (Write Once)](#7-reusable-shared-sections-write-once)
8. [Canvas Layout System](#8-canvas-layout-system)
9. [All 14 Roadmaps — Section Maps & Node IDs](#9-all-14-roadmaps--section-maps--node-ids)
10. [SECTION_NODE_MAP — Complete Update Required](#10-section_node_map--complete-update-required)
11. [Feature Modules Matrix (Optional but Reusable)](#11-feature-modules-matrix-optional-but-reusable)
12. [Exact File Templates](#12-exact-file-templates)
13. [Quality Gates — Validation Checklist Per Roadmap](#13-quality-gates--validation-checklist-per-roadmap)
14. [Execution Order — Fastest Path](#14-execution-order--fastest-path)
15. [Time Estimates](#15-time-estimates)

---

## 1. How the Frontend Flow Currently Works

Every roadmap flow page is composed of **5 distinct layers**. Understanding each layer is critical before making any changes.

### Layer 1 — Graph Layout Data
**File:** `src/data/frontendRoadmapFlow.ts`

Contains the ReactFlow `initialNodes` and `initialEdges` arrays. This is **pure positioning data** — x/y coordinates, node types, and labels. It has NO content (no descriptions, no resources). It exports:
- `initialNodes: Node<RoadmapNodeData>[]`
- `initialEdges: Edge[]`
- `RoadmapNodeData` type

### Layer 2 — Rich Content Data
**File:** `src/data/allNodeDetails/index.ts` (aggregates roadmap detail modules)

The single source of truth for all detailed content (merged from modular files). Organized as `Record<string, SectionData>` where each key is a section ID (e.g. `'html'`, `'css'`). Each `SectionData` contains:
```ts
{
  section: { id, label, description },
  subNodes: [{
    id,           // matches node id in the layout (e.g. 'h1', 'h2')
    label,
    intro,        // 2-3 sentence explanation shown in sidebar
    whatYoullLearn: string[],  // bullet list
    resources: [{ title, url, type: 'article'|'video'|'interactive'|'book' }]
  }]
}
```

### Layer 3 — Page-Level Data
**Location:** Currently inline in `src/pages/FrontendRoadmapFlow.tsx`

Page-level roadmap configuration contains these roadmap-specific blocks:
- `NODE_DETAILS` — `Record<sectionId, { description, resources[] }>` — the quick-look panel that shows when you click a main (yellow) node. Contains 5–6 resource links per section.
- `FRONTEND_PROJECTS` — 3 capstone projects (Beginner / Intermediate / Advanced). Each has `id, title, description, skills[], difficulty, difficultyColor`.
- `FRONTEND_FAQS` — 10–12 Q&A pairs specific to the roadmap's skill.
- `CAREER_SUPPORT_FEATURES` — feature cards for 1:1 mentorship, roadmap-based job recommendations, and interview prep actions.
- `MAIN_SECTION_IDS` — array of main node IDs used by the lock gate.
- `CANVAS_H` — total pixel height of the canvas (number).

Reusable optional UI modules that should be controlled by config (not hardcoded):
- Project comments module (`ProjectComments`) for public submissions.
- Privacy visibility confirmation module (`PrivacyWarningModal`).
- Career launchpad module (mentor, jobs, interview prep) with roadmap-specific actions.

### Layer 4 — Page Component (The Reusable Logic)
**File:** `src/pages/FrontendRoadmapFlow.tsx` (large monolithic page)

Contains ALL the interactive logic that is **identical** for every roadmap:
- ReactFlow setup (`useNodesState`, `useEdgesState`)
- Node click handler → opens `NodeDetailSidebar` or quick-look panel
- Sub-node completion toggling and parent auto-complete logic
- Lock gate: projects section locked until all main sections completed
- `IntersectionObserver` to hide legend when projects section scrolls into view
- Project submission form with GitHub URL validation
- FAQ accordion (toggle open/close)
- `NodeDetailSidebar` wiring

### Layer 5 — Route Registration
**File:** `src/App.tsx`

One line per roadmap:
```tsx
<Route path="/roadmap/frontend-react/flow" element={<FrontendRoadmapFlow />} />
```

### Supporting Components (Already Built — Do NOT Modify)
- `src/components/roadmap/RoadmapFlowNodes.tsx` — defines `nodeTypes` (startNode, mainNode, branchNode, leftBranchNode, optionNode, infoCard)
- `src/components/roadmap/NodeDetailSidebar.tsx` — the sliding sidebar panel (reads from `ALL_NODE_DETAILS`)
- `src/components/roadmap/QuizModal.tsx` — AI quiz triggered from the sidebar
- `src/data/allNodeDetails/index.ts` — exports merged `ALL_NODE_DETAILS` and `SECTION_NODE_MAP`

### How Node Clicks Route to the Sidebar
`SECTION_NODE_MAP` (exported from `allNodeDetails/index.ts`) maps every node ID to its parent section ID:
```ts
// src/data/allNodeDetails/index.ts (merged output)
export const SECTION_NODE_MAP: Record<string, string> = {
  // internet section
  'i1': 'internet', 'i2': 'internet', 'i3': 'internet',
  'i4': 'internet', 'i5': 'internet', 'i6': 'internet',
  // html section
  'h1': 'html', 'h2': 'html', 'h3': 'html', 'h4': 'html',
  // ... and so on for ALL nodes
};
```

The snippet above is the **merged output shape**. In practice, edit roadmap-specific map fragments and merge them in `allNodeDetails/index.ts`.
When a node is clicked, `SECTION_NODE_MAP[node.id]` is looked up. If it returns a value, the `NodeDetailSidebar` opens for that section. If it returns `undefined` (e.g. for a main/yellow node like `'html'`), the quick-look panel opens instead — showing description + resources from `NODE_DETAILS`.

---

## 2. The Problem with Copy-Pasting

If you copy `FrontendRoadmapFlow.tsx` 14 times:
- ~600 lines of identical logic exist in 15 files
- Any bug fix or UI improvement must be applied 15 times
- Any new feature (e.g. progress persistence to Supabase) must be added 15 times
- File sizes balloon unnecessarily
- Merge conflicts become frequent

**This is the wrong approach. Do Phase 0 first.**

---

## 3. The Solution Architecture

After refactoring, each roadmap flow is just **3 data files + 1 six-line wrapper page + 1 route line**.

```
[Config file]          [Wrapper page]            [Route]
{key}RoadmapConfig.ts → {Key}RoadmapFlowPage.tsx  → App.tsx
      +
allNodeDetails/ (modular sections, re-exported)
      +
{key}RoadmapFlow.ts (node layout)
```

Recommended content data structure:

```
src/data/allNodeDetails/
├── index.ts                // exports merged ALL_NODE_DETAILS + SECTION_NODE_MAP
├── shared.ts               // shared reusable sections (git/testing/security/etc.)
├── frontend.ts
├── backendNode.ts
├── fullstack.ts
└── ...one file per roadmap domain
```

The 600-line logic lives exactly once in:
```
src/components/roadmap/GenericRoadmapFlowPage.tsx
```

---

## 4. Phase 0 — One-Time Refactor (Do This First)

**Do not start on any new roadmap until this phase is complete and the frontend roadmap validates identically.**

### Step 4.1 — Create the Shared Type

Create **`src/types/roadmapFlow.ts`**:

```typescript
import type { Node, Edge } from 'reactflow';

export type ResourceType = 'article' | 'video' | 'interactive' | 'book';

export interface NodeDetail {
  description: string;
  resources: { title: string; url: string }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skills: readonly string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyColor: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface CareerSupportFeature {
  id: string;
  title: string;
  highlights: readonly string[];
  action: string;
  actionType: 'navigate' | 'jobs-expand' | 'custom';
  navigateTo?: string;
}

export interface FeatureModules {
  comments?: {
    enabled: boolean;
    requiresPublicSubmission?: boolean;
  };
  privacyVisibility?: {
    enabled: boolean;
  };
  careerLaunchpad?: {
    enabled: boolean;
    features: readonly CareerSupportFeature[];
    jobsRoadmapParam?: string;
    jobsLimit?: number;
  };
}

export interface RoadmapFlowConfig {
  /** Must match the roadmap id in roadmaps.ts (e.g. 'frontend-react') */
  roadmapId: string;
  /** Display title shown at the top of the page */
  title: string;
  /** ReactFlow nodes array from the layout data file */
  initialNodes: Node[];
  /** ReactFlow edges array from the layout data file */
  initialEdges: Edge[];
  /** IDs of all main (yellow) section nodes — used by lock gate */
  mainSectionIds: readonly string[];
  /** Quick-look panel data. Key = section node ID (e.g. 'html') */
  nodeDetails: Record<string, NodeDetail>;
  /** 3 capstone projects: Beginner, Intermediate, Advanced */
  projects: readonly Project[];
  /** 10-12 FAQs specific to this roadmap */
  faqs: readonly FAQ[];
  /** Optional reusable modules (comments, career launchpad, privacy modal) */
  modules?: FeatureModules;
  /** Total pixel height of the canvas (determines scroll length) */
  canvasHeight: number;
  /** Total pixel width of the canvas */
  canvasWidth: number;
}
```

### Step 4.2 — Extract GenericRoadmapFlowPage

Create **`src/components/roadmap/GenericRoadmapFlowPage.tsx`**.

This component receives a single `config: RoadmapFlowConfig` prop and contains ALL the logic currently in `FrontendRoadmapFlow.tsx`:

```tsx
import type { RoadmapFlowConfig } from '@/types/roadmapFlow';

interface Props {
  config: RoadmapFlowConfig;
}

export default function GenericRoadmapFlowPage({ config }: Props) {
  // move ALL the state, handlers, effects, and JSX here
  // replace every FRONTEND_* / MAIN_SECTION_IDS / CANVAS_H / NODE_DETAILS
  // reference with config.projects / config.mainSectionIds / config.canvasHeight / config.nodeDetails
}
```

**Critical substitutions to make when extracting:**

| Old (hardcoded) | New (from config) |
|---|---|
| `CANVAS_W` | `config.canvasWidth` |
| `CANVAS_H` | `config.canvasHeight` |
| `initialNodes` (import) | `config.initialNodes` |
| `initialEdges` (import) | `config.initialEdges` |
| `NODE_DETAILS` | `config.nodeDetails` |
| `FRONTEND_PROJECTS` | `config.projects` |
| `FRONTEND_FAQS` | `config.faqs` |
| `CAREER_SUPPORT_FEATURES` | `config.modules.careerLaunchpad.features` |
| `MAIN_SECTION_IDS` | `config.mainSectionIds` |
| `'Frontend Development'` (back button label) | `config.title` |
| `ProjectId` type | `string` (or derive from `config.projects`) |

**Important:** The `SECTION_NODE_MAP` and `ALL_NODE_DETAILS` imports remain at the top of `GenericRoadmapFlowPage.tsx` — these are shared global data, not per-roadmap config.

```tsx
import { SECTION_NODE_MAP, ALL_NODE_DETAILS } from '@/data/allNodeDetails';
import { nodeTypes } from '@/components/roadmap/RoadmapFlowNodes';
import NodeDetailSidebar from '@/components/roadmap/NodeDetailSidebar';
```

### Step 4.3 — Create the Frontend Config File

Create **`src/data/frontendRoadmapConfig.ts`**:

```typescript
import type { RoadmapFlowConfig } from '@/types/roadmapFlow';
import { initialNodes, initialEdges } from './frontendRoadmapFlow';

const config: RoadmapFlowConfig = {
  roadmapId: 'frontend-react',
  title: 'Frontend Development',
  initialNodes,
  initialEdges,
  canvasWidth: 1040,
  canvasHeight: 2700,
  mainSectionIds: [
    'internet', 'html', 'css', 'javascript', 'version-control',
    'vcs-hosting', 'pkg-managers', 'framework', 'css-frameworks',
    'build-tools', 'typescript', 'testing', 'security', 'performance', 'deployment',
  ],
  nodeDetails: {
    // Move the entire NODE_DETAILS object from FrontendRoadmapFlow.tsx here verbatim
    internet: { ... },
    html: { ... },
    // ... all 15 sections
  },
  projects: [
    // Move FRONTEND_PROJECTS here verbatim
  ],
  faqs: [
    // Move FRONTEND_FAQS here verbatim
  ],
  modules: {
    comments: {
      enabled: true,
      requiresPublicSubmission: true,
    },
    privacyVisibility: {
      enabled: true,
    },
    careerLaunchpad: {
      enabled: true,
      jobsRoadmapParam: 'frontend',
      jobsLimit: 18,
      features: [
        {
          id: 'mentor-sessions',
          title: '1:1 Mentor-Mentee Sessions',
          highlights: ['Human + AI guidance', 'Weekly goal tracking', 'Code and portfolio feedback'],
          action: 'Open Mentorship',
          actionType: 'navigate',
          navigateTo: '/roadmap/frontend-react/mentor',
        },
        {
          id: 'recommended-jobs',
          title: 'Roadmap-Based Job Recommendations',
          highlights: ['Frontend-focused listings', 'Skill-gap indicators', 'Smart role prioritization'],
          action: 'View Job Matches',
          actionType: 'jobs-expand',
        },
        {
          id: 'interview-prep',
          title: 'Placement & Interview Preparation',
          highlights: ['Timed coding tests', 'Question bank + patterns', 'Mock interview tracks'],
          action: 'Start Prep Track',
          actionType: 'navigate',
          navigateTo: '/practice',
        },
      ] as const,
    },
  },
};

export default config;
```

### Step 4.4 — Shrink FrontendRoadmapFlow.tsx to a Thin Wrapper

Replace the entire contents of `src/pages/FrontendRoadmapFlow.tsx` with:

```tsx
import GenericRoadmapFlowPage from '@/components/roadmap/GenericRoadmapFlowPage';
import config from '@/data/frontendRoadmapConfig';

export default function FrontendRoadmapFlow() {
  return <GenericRoadmapFlowPage config={config} />;
}
```

### Step 4.5 — Validate Before Proceeding

Run the app and verify the frontend roadmap at `/roadmap/frontend-react/flow`:
- [ ] Canvas renders with all nodes and edges
- [ ] Clicking a main node opens the quick-look panel with description and resources
- [ ] Clicking a sub-node opens the `NodeDetailSidebar` with intro, whatYoullLearn, resources
- [ ] Marking a sub-node complete turns it green
- [ ] When all sub-nodes of a section are complete, the parent section turns green
- [ ] When all sections are complete, the Projects section unlocks
- [ ] Project submission validates GitHub URL and adds to the list
- [ ] If `modules.comments.enabled=true`, public submissions render comments UI
- [ ] If `modules.privacyVisibility.enabled=true`, privacy confirmation modal appears on visibility changes
- [ ] If `modules.careerLaunchpad.enabled=true`, feature cards render and actions route/expand correctly
- [ ] FAQ items toggle open/close
- [ ] Legend hides when Projects section scrolls into view
- [ ] Back button navigates correctly

**Only proceed to Phase 1 after all boxes are checked.**

---

## 5. Phase 1 — Per-Roadmap Work (Repeat × 14)

For each new roadmap, create exactly these artifacts:

| # | Artifact | Path | Est. Lines | Effort |
|---|---|---|---|---|
| A | Layout data | `src/data/{key}RoadmapFlow.ts` | ~250 | Mechanical |
| B | Rich content | `src/data/allNodeDetails/{domainOrRoadmap}.ts` | ~900 | Content work |
| C | Config file | `src/data/{key}RoadmapConfig.ts` | ~200 | Semi-mechanical |
| D | Wrapper page | `src/pages/{Key}RoadmapFlow.tsx` | ~6 | Trivial |
| E | Route | `src/App.tsx` | 1 line | Trivial |
| F | Manifest entry | `scripts/roadmap/roadmaps.manifest.json` | ~30 | Mechanical |

---

## 6. Node ID & Naming Conventions

**Critical rule:** All node IDs must be globally unique across ALL roadmaps because `SECTION_NODE_MAP` is a flat dictionary. Use a roadmap-specific prefix for sub-nodes.

### ID Format Rules

| Node Type | Format | Example |
|---|---|---|
| Start node | `'start'` | `'start'` (same for all, not in SECTION_NODE_MAP) |
| Main section node | descriptive slug | `'nodejs'`, `'databases'`, `'docker'` |
| Branch node (right) | `{prefix}{n}` | `'nd1'`, `'nd2'` (Node.js sub-nodes) |
| Left branch node | `{prefix}{n}` | `'nd3'`, `'nd4'` |
| Option node (pill) | full label slug | `'express'`, `'fastify'` |

### Prefix Assignments Per Roadmap

| Roadmap Key | Prefix | Example sub-IDs |
|---|---|---|
| `frontend-react` | `i`, `h`, `c`, `js`, etc. | `i1`–`i6`, `h1`–`h4` (**already used**) |
| `backend-nodejs` | `bn` | `bn1`, `bn2`, `bn3` |
| `fullstack-mern` | `fs` | `fs1`, `fs2` |
| `data-science` | `ds` | `ds1`, `ds2` |
| `devops-cloud` | `dv` | `dv1`, `dv2` |
| `mobile-flutter` | `fl` | `fl1`, `fl2` |
| `cybersecurity` | `cy` | `cy1`, `cy2` |
| `blockchain-web3` | `bc` | `bc1`, `bc2` |
| `ai-ml-engineering` | `ai` | `ai1`, `ai2` |
| `game-development-unity` | `gm` | `gm1`, `gm2` |
| `cloud-architecture` | `ca` | `ca1`, `ca2` |
| `product-management` | `pm` | `pm1`, `pm2` |
| `qa-automation` | `qa` | `qa1`, `qa2` |
| `ux-ui-design` | `ux` | `ux1`, `ux2` |
| `iot-embedded` | `iot` | `iot1`, `iot2` |

### Shared Section IDs (No Prefix Needed — Already in allNodeDetails/shared.ts)

These section IDs and their sub-node IDs are **already defined** in `allNodeDetails/shared.ts`. Do NOT redefine them. Reference them directly in any roadmap's `mainSectionIds` and layout nodes. Just use the same IDs in the layout file:

```
version-control  →  sub-nodes: git
vcs-hosting      →  sub-nodes: github, gitlab
pkg-managers     →  sub-nodes: npm, yarn, pnpm, bun
typescript       →  sub-nodes: ts1, ts2, ts3
testing          →  sub-nodes: test1, test2, test3
security         →  sub-nodes: sec1, sec2, sec3
deployment       →  sub-nodes: dep1, dep2, dep3
```

---

## 7. Reusable Shared Sections (Write Once)

The following sections are **already fully defined** in `allNodeDetails/shared.ts`. They can be included in any roadmap's layout file and `mainSectionIds` array without adding anything to roadmap-specific content files.

| Section ID | Label | Sub-nodes | Applicable Roadmaps |
|---|---|---|---|
| `version-control` | Version Control | `git` | All 15 |
| `vcs-hosting` | VCS Hosting | `github`, `gitlab` | All 15 |
| `pkg-managers` | Package Managers | `npm`, `yarn`, `pnpm`, `bun` | All JS/TS roadmaps |
| `typescript` | TypeScript | `ts1`, `ts2`, `ts3` | Frontend, Backend, Fullstack, AI, QA, Game |
| `testing` | Testing | `test1`, `test2`, `test3` | All software roadmaps |
| `security` | Web Security | `sec1`, `sec2`, `sec3` | Frontend, Backend, Fullstack, Cyber, Cloud |
| `deployment` | Deployment | `dep1`, `dep2`, `dep3` | All software roadmaps |

**When a layout file includes `version-control` as a main node, all its sub-nodes (`git`) must also appear as nodes in the layout file with the exact same IDs.** The SECTION_NODE_MAP already maps `git` → `version-control`, so the sidebar will work automatically.

---

## 8. Canvas Layout System

All roadmaps use the same fixed column layout. Never deviate from this grid.

```
Left branch  x=80   (node width: 180px)
Main column  x=380  (node width: 170px, center at 465)
Right branch x=680  (node width: 200px)
Option pills x=680 or x=760 (node width: 85px)
```

### Vertical Spacing Rules

```
Start node:             y=0
First main section:     y=130
Vertical gap between
  sections with 2 sub-nodes each side: y+=170
  sections with 3 sub-nodes each side: y+=220
  sections with 1 sub-node:            y+=140
  sections with 4+ option pills:       y+=240
```

### Sub-node Positioning (relative to parent section y)

For a section at y=340 with 2 branches per side:
```
Right branch 1:  y = 340 - 32 = 308
Right branch 2:  y = 340 + 33 = 373
Left branch 1:   y = 340 - 32 = 308
Left branch 2:   y = 340 + 33 = 373
```
Formula: sub-nodes are centered around the parent's y value, spaced 65px apart.

### Calculating CANVAS_H

`canvasHeight = last node's y + 150 (padding)`

Count your sections and sum up their y-spacings to get the total.

### Edge Rules

- Main section nodes connect to each other with a straight or bezier edge
- Sub-nodes connect from their parent section node
- Use `MarkerType.ArrowClosed` for directional edges
- Edge IDs: `{source}-{target}` (e.g. `'internet-html'`, `'internet-i1'`)

---

## 9. All 14 Roadmaps — Section Maps & Node IDs

### 9.1 Backend Node.js (`backend-nodejs`)
Route: `/roadmap/backend-nodejs/flow`

| Section ID | Label | Sub-node IDs | Node Type |
|---|---|---|---|
| `nodejs` | Node.js Basics | `bn1`, `bn2`, `bn3`, `bn4` | main → branch/left |
| `express` | Express.js | `bn5`, `bn6`, `bn7` | main → branch/left |
| `rest-api` | RESTful APIs | `bn8`, `bn9`, `bn10` | main → branch/left |
| `databases` | Databases | `postgresql`, `mongodb`, `redis` | main → options |
| `orm-odm` | ORM / ODM | `prisma`, `mongoose`, `drizzle` | main → options |
| `authentication` | Authentication | `bn11`, `bn12`, `bn13` | main → branch/left |
| `caching` | Caching | `bn14`, `bn15` | main → branch/left |
| `message-queues` | Message Queues | `bn16`, `bn17` | main → branch/left |
| `version-control` | Version Control | `git` | *(reuse)* |
| `typescript` | TypeScript | `ts1`, `ts2`, `ts3` | *(reuse)* |
| `testing` | Testing | `test1`, `test2`, `test3` | *(reuse)* |
| `security` | Web Security | `sec1`, `sec2`, `sec3` | *(reuse)* |
| `deployment` | Deployment | `dep1`, `dep2`, `dep3` | *(reuse)* |

**Projects:** REST API for a blog, Authentication microservice, Full CRUD API with DB + tests
**FAQs:** 10–12 Q&A about Node.js event loop, Express vs Fastify, SQL vs NoSQL, ORMs, JWT, etc.

---

### 9.2 Fullstack MERN (`fullstack-mern`)
Route: `/roadmap/fullstack-mern/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `internet` | Internet | `i1`–`i6` | *(reuse)* |
| `html` | HTML | `h1`–`h4` | *(reuse)* |
| `css` | CSS | `c1`–`c4` | *(reuse)* |
| `javascript` | JavaScript | `js1`–`js4` | *(reuse)* |
| `react-fullstack` | React | `fs1`, `fs2`, `fs3`, `fs4` |
| `nodejs` | Node.js | `bn1`–`bn4` | *(reuse from backend if added)* |
| `express` | Express.js | `bn5`–`bn7` | *(reuse)* |
| `mongodb-mern` | MongoDB | `fs5`, `fs6`, `fs7` |
| `rest-api` | REST API Design | `bn8`–`bn10` | *(reuse)* |
| `authentication` | Auth & JWT | `bn11`–`bn13` | *(reuse)* |
| `version-control` | Version Control | `git` | *(reuse)* |
| `deployment` | Deployment | `dep1`–`dep3` | *(reuse)* |
| `typescript` | TypeScript | `ts1`–`ts3` | *(reuse)* |

**Note:** Fullstack reuses many section IDs from both Frontend and Backend. The layout file simply references the same IDs. The SECTION_NODE_MAP already handles them.

---

### 9.3 Data Science (`data-science`)
Route: `/roadmap/data-science/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `python-ds` | Python for Data | `ds1`, `ds2`, `ds3`, `ds4` |
| `numpy-pandas` | NumPy & Pandas | `ds5`, `ds6`, `ds7` |
| `sql-ds` | SQL for Data | `ds8`, `ds9`, `ds10` |
| `statistics` | Statistics & Probability | `ds11`, `ds12`, `ds13` |
| `visualization` | Data Visualization | `ds14`, `ds15`, `matplotlib`, `seaborn` |
| `machine-learning` | Machine Learning | `ds16`, `ds17`, `ds18`, `ds19` |
| `deep-learning` | Deep Learning | `ds20`, `ds21`, `ds22` |
| `nlp-ds` | NLP | `ds23`, `ds24` |
| `feature-engineering` | Feature Engineering | `ds25`, `ds26` |
| `model-evaluation` | Model Evaluation | `ds27`, `ds28` |
| `mlops` | MLOps | `ds29`, `ds30` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `deployment` | Deployment | `dep1`–`dep3` | *(reuse)* |

---

### 9.4 DevOps & Cloud (`devops-cloud`)
Route: `/roadmap/devops-cloud/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `linux` | Linux & Shell | `dv1`, `dv2`, `dv3`, `dv4` |
| `networking-devops` | Networking | `dv5`, `dv6`, `dv7` |
| `version-control` | VCS & Git | `git` | *(reuse)* |
| `ci-cd` | CI/CD | `dv8`, `dv9`, `dv10` |
| `docker-devops` | Docker | `dv11`, `dv12`, `dv13` |
| `kubernetes` | Kubernetes | `dv14`, `dv15`, `dv16` |
| `cloud-providers` | Cloud Platforms | `dv17`, `dv18`, `dv19` |
| `iac` | IaC (Terraform/Ansible) | `dv20`, `dv21` |
| `monitoring` | Monitoring & Logging | `dv22`, `dv23`, `dv24` |
| `security` | Security | `sec1`–`sec3` | *(reuse)* |
| `sre` | SRE Principles | `dv25`, `dv26` |
| `deployment` | Deployment | `dep1`–`dep3` | *(reuse)* |

---

### 9.5 Mobile Flutter (`mobile-flutter`)
Route: `/roadmap/mobile-flutter/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `dart` | Dart Language | `fl1`, `fl2`, `fl3`, `fl4` |
| `flutter-basics` | Flutter Basics | `fl5`, `fl6`, `fl7` |
| `widgets` | Widgets & Layouts | `fl8`, `fl9`, `fl10` |
| `state-management-fl` | State Management | `fl11`, `fl12`, `fl13` |
| `navigation-fl` | Navigation | `fl14`, `fl15` |
| `networking-fl` | Networking & APIs | `fl16`, `fl17` |
| `storage-fl` | Local Storage | `fl18`, `fl19` |
| `animations-fl` | Animations | `fl20`, `fl21` |
| `native-integration` | Native Integration | `fl22`, `fl23` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `testing` | Testing | `test1`–`test3` | *(reuse)* |
| `deployment` | App Deployment | `dep1`–`dep3` | *(reuse)* |

---

### 9.6 Cybersecurity (`cybersecurity`)
Route: `/roadmap/cybersecurity/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `networking-cyber` | Networking Fundamentals | `cy1`, `cy2`, `cy3`, `cy4` |
| `linux-cyber` | Linux & CLI | `cy5`, `cy6`, `cy7` |
| `protocols` | Security Protocols | `cy8`, `cy9`, `cy10` |
| `web-security-cyber` | Web Security | `cy11`, `cy12`, `cy13` |
| `cryptography` | Cryptography | `cy14`, `cy15`, `cy16` |
| `pentesting` | Penetration Testing | `cy17`, `cy18`, `cy19` |
| `osint` | OSINT | `cy20`, `cy21` |
| `incident-response` | Incident Response | `cy22`, `cy23` |
| `cloud-security` | Cloud Security | `cy24`, `cy25` |
| `compliance` | Compliance & GRC | `cy26`, `cy27` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `security` | OWASP & Web Vulns | `sec1`–`sec3` | *(reuse)* |

---

### 9.7 Blockchain / Web3 (`blockchain-web3`)
Route: `/roadmap/blockchain-web3/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `blockchain-basics` | Blockchain Fundamentals | `bc1`, `bc2`, `bc3`, `bc4` |
| `ethereum` | Ethereum | `bc5`, `bc6`, `bc7` |
| `solidity` | Solidity | `bc8`, `bc9`, `bc10` |
| `smart-contracts` | Smart Contracts | `bc11`, `bc12`, `bc13` |
| `web3-js` | Web3.js / Ethers.js | `bc14`, `bc15` |
| `defi` | DeFi Concepts | `bc16`, `bc17` |
| `nfts` | NFTs & Token Standards | `bc18`, `bc19` |
| `ipfs` | IPFS & Decentralized Storage | `bc20`, `bc21` |
| `hardhat` | Hardhat / Foundry | `bc22`, `bc23` |
| `auditing` | Smart Contract Auditing | `bc24`, `bc25` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `testing` | Contract Testing | `test1`–`test3` | *(reuse)* |

---

### 9.8 AI / ML Engineering (`ai-ml-engineering`)
Route: `/roadmap/ai-ml-engineering/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `python-ai` | Python for AI | `ai1`, `ai2`, `ai3`, `ai4` |
| `math-ai` | Math & Statistics | `ai5`, `ai6`, `ai7` |
| `data-prep` | Data Preparation | `ai8`, `ai9`, `ai10` |
| `classical-ml` | Classical ML | `ai11`, `ai12`, `ai13`, `ai14` |
| `deep-learning-ai` | Deep Learning | `ai15`, `ai16`, `ai17` |
| `nlp-ai` | NLP & LLMs | `ai18`, `ai19`, `ai20` |
| `computer-vision` | Computer Vision | `ai21`, `ai22` |
| `mlops-ai` | MLOps | `ai23`, `ai24`, `ai25` |
| `rag` | RAG & Vector DBs | `ai26`, `ai27` |
| `finetuning` | Fine-tuning LLMs | `ai28`, `ai29` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `deployment` | Model Deployment | `dep1`–`dep3` | *(reuse)* |

---

### 9.9 Game Development Unity (`game-development-unity`)
Route: `/roadmap/game-development-unity/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `csharp` | C# Fundamentals | `gm1`, `gm2`, `gm3`, `gm4` |
| `unity-basics` | Unity Basics | `gm5`, `gm6`, `gm7` |
| `physics-unity` | Physics & Collision | `gm8`, `gm9`, `gm10` |
| `rendering` | Rendering & Shaders | `gm11`, `gm12` |
| `animation-unity` | Animation System | `gm13`, `gm14` |
| `ui-unity` | UI Development | `gm15`, `gm16` |
| `audio-unity` | Audio | `gm17`, `gm18` |
| `multiplayer` | Multiplayer Networking | `gm19`, `gm20` |
| `optimization-unity` | Optimization | `gm21`, `gm22` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `testing` | Game Testing | `test1`–`test3` | *(reuse)* |
| `deployment` | Publishing | `dep1`–`dep3` | *(reuse)* |

---

### 9.10 Cloud Architecture (`cloud-architecture`)
Route: `/roadmap/cloud-architecture/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `cloud-foundations` | Cloud Foundations | `ca1`, `ca2`, `ca3`, `ca4` |
| `compute` | Compute Services | `ca5`, `ca6`, `ca7` |
| `storage-cloud` | Storage | `ca8`, `ca9`, `ca10` |
| `networking-cloud` | Networking & VPC | `ca11`, `ca12`, `ca13` |
| `iam` | IAM & Security | `ca14`, `ca15`, `ca16` |
| `databases-cloud` | Managed Databases | `ca17`, `ca18`, `ca19` |
| `serverless` | Serverless | `ca20`, `ca21` |
| `containers-cloud` | Containers & K8s | `ca22`, `ca23` |
| `cost-optimization` | Cost Optimization | `ca24`, `ca25` |
| `well-architected` | Well-Architected Framework | `ca26`, `ca27` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `deployment` | Deployment & CI/CD | `dep1`–`dep3` | *(reuse)* |

---

### 9.11 Product Management (`product-management`)
Route: `/roadmap/product-management/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `pm-fundamentals` | PM Fundamentals | `pm1`, `pm2`, `pm3`, `pm4` |
| `user-research` | User Research | `pm5`, `pm6`, `pm7` |
| `roadmapping` | Product Roadmapping | `pm8`, `pm9`, `pm10` |
| `metrics` | Metrics & Analytics | `pm11`, `pm12`, `pm13` |
| `agile` | Agile & Scrum | `pm14`, `pm15`, `pm16` |
| `stakeholders` | Stakeholder Management | `pm17`, `pm18` |
| `prd` | PRDs & Specs | `pm19`, `pm20` |
| `gtm` | Go-to-Market | `pm21`, `pm22` |
| `pricing` | Pricing Strategy | `pm23`, `pm24` |
| `data-pm` | Data-Informed Decisions | `pm25`, `pm26` |
| `okrs` | OKRs & Strategy | `pm27`, `pm28` |

**Note:** Product Management does not use the standard shared sections (version-control, typescript, testing, deployment). Include only PM-specific sections.

---

### 9.12 QA Automation (`qa-automation`)
Route: `/roadmap/qa-automation/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `test-fundamentals` | Testing Fundamentals | `qa1`, `qa2`, `qa3`, `qa4` |
| `manual-testing` | Manual Testing | `qa5`, `qa6`, `qa7` |
| `api-testing` | API Testing | `qa8`, `qa9`, `qa10` |
| `ui-automation` | UI Automation | `qa11`, `qa12`, `qa13` |
| `performance-testing` | Performance Testing | `qa14`, `qa15` |
| `security-testing` | Security Testing | `qa16`, `qa17` |
| `mobile-testing` | Mobile Testing | `qa18`, `qa19` |
| `bdd` | BDD & TDD | `qa20`, `qa21` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `testing` | Test Frameworks | `test1`–`test3` | *(reuse)* |
| `security` | Security Basics | `sec1`–`sec3` | *(reuse)* |
| `deployment` | CI/CD Integration | `dep1`–`dep3` | *(reuse)* |

---

### 9.13 UX / UI Design (`ux-ui-design`)
Route: `/roadmap/ux-ui-design/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `design-principles` | Design Principles | `ux1`, `ux2`, `ux3`, `ux4` |
| `typography` | Typography | `ux5`, `ux6`, `ux7` |
| `color-theory` | Color Theory | `ux8`, `ux9`, `ux10` |
| `user-research-ux` | User Research | `ux11`, `ux12`, `ux13` |
| `wireframing` | Wireframing | `ux14`, `ux15` |
| `prototyping` | Prototyping | `ux16`, `ux17` |
| `figma` | Figma | `ux18`, `ux19`, `ux20` |
| `design-systems` | Design Systems | `ux21`, `ux22` |
| `accessibility-ux` | Accessibility | `ux23`, `ux24` |
| `motion-design` | Motion Design | `ux25`, `ux26` |
| `portfolio-ux` | Portfolio & Case Studies | `ux27`, `ux28` |

**Note:** UX/UI is also non-technical. No shared dev sections needed.

---

### 9.14 IoT / Embedded (`iot-embedded`)
Route: `/roadmap/iot-embedded/flow`

| Section ID | Label | Sub-node IDs |
|---|---|---|
| `c-cpp` | C / C++ Fundamentals | `iot1`, `iot2`, `iot3`, `iot4` |
| `electronics` | Electronics Basics | `iot5`, `iot6`, `iot7` |
| `arduino` | Arduino | `iot8`, `iot9`, `iot10` |
| `raspberry-pi` | Raspberry Pi | `iot11`, `iot12` |
| `sensors` | Sensors & Actuators | `iot13`, `iot14`, `iot15` |
| `rtos` | RTOS | `iot16`, `iot17` |
| `protocols-iot` | IoT Protocols | `iot18`, `iot19`, `iot20` |
| `networking-iot` | IoT Networking | `iot21`, `iot22` |
| `cloud-iot` | Cloud IoT Platforms | `iot23`, `iot24` |
| `edge-computing` | Edge Computing | `iot25`, `iot26` |
| `version-control` | Version Control | `git` | *(reuse)* |
| `security` | IoT Security | `sec1`–`sec3` | *(reuse)* |

---

## 10. SECTION_NODE_MAP — Complete Update Required

`SECTION_NODE_MAP` should be exported from **`src/data/allNodeDetails/index.ts`** and composed from roadmap-specific map fragments. Update the fragment for each roadmap as new sub-nodes are added.

### How to Update

After adding new section data, add matching entries to that roadmap's section-map fragment:

```typescript
export const SECTION_NODE_MAP: Record<string, string> = {
  // ── FRONTEND (existing) ──────────────────────────────────────────────────
  'i1': 'internet', 'i2': 'internet', /* ... all frontend entries */

  // ── BACKEND NODE.JS (add when implementing backend) ─────────────────────
  'bn1': 'nodejs', 'bn2': 'nodejs', 'bn3': 'nodejs', 'bn4': 'nodejs',
  'bn5': 'express', 'bn6': 'express', 'bn7': 'express',
  'bn8': 'rest-api', 'bn9': 'rest-api', 'bn10': 'rest-api',
  'bn11': 'authentication', 'bn12': 'authentication', 'bn13': 'authentication',
  'bn14': 'caching', 'bn15': 'caching',
  'bn16': 'message-queues', 'bn17': 'message-queues',
  'postgresql': 'databases', 'mongodb': 'databases', 'redis': 'databases',
  'prisma': 'orm-odm', 'mongoose': 'orm-odm', 'drizzle': 'orm-odm',

  // ── DATA SCIENCE (add when implementing) ────────────────────────────────
  'ds1': 'python-ds', /* ... */

  // ── (and so on for every roadmap as you implement it) ───────────────────
};
```

**Rule:** Every sub-node that should open the `NodeDetailSidebar` MUST have an entry here. Main section nodes (yellow nodes) should NOT have entries here — clicking them opens the quick-look panel from `nodeDetails` in the config instead.

**Deterministic click resolver (recommended):**
1. If `node.id` is in `config.mainSectionIds` → open quick-look panel.
2. Else if `SECTION_NODE_MAP[node.id]` exists → open `NodeDetailSidebar`.
3. Else → no-op or fallback handler.

This avoids accidental behavior changes if `SECTION_NODE_MAP` is edited later.

---

## 11. Feature Modules Matrix (Optional but Reusable)

Core roadmap flow should stay identical across all pages. Extra UX blocks should be enabled by config modules, not copied per page.

| Module | Purpose | Typical Config Key | Default |
|---|---|---|---|
| Comments | Community discussion on public project submissions | `modules.comments` | disabled |
| Privacy Visibility | Confirmation dialog for making submissions public/private | `modules.privacyVisibility` | enabled |
| Career Launchpad | Mentor, roadmap job matches, interview prep actions | `modules.careerLaunchpad` | disabled |

### Module Rules

1. Modules are optional and must degrade gracefully when disabled.
2. Module UI should not require separate page implementations.
3. Module behavior should be fully driven by `RoadmapFlowConfig`.
4. If a roadmap omits a module, generic page logic should skip both rendering and handlers for that block.

### Recommended Rendering Guard Pattern

```tsx
const commentsEnabled = Boolean(config.modules?.comments?.enabled);
const privacyEnabled = Boolean(config.modules?.privacyVisibility?.enabled);
const careerEnabled = Boolean(config.modules?.careerLaunchpad?.enabled);
```

### Recommended Action Pattern for Career Cards

```tsx
if (feature.actionType === 'navigate' && feature.navigateTo) {
  navigate(feature.navigateTo);
} else if (feature.actionType === 'jobs-expand') {
  // expand + fetch jobs using config.modules.careerLaunchpad.jobsRoadmapParam/jobsLimit
}
```

This keeps roadmap-specific behavior in config and preserves one generic codepath.

---

## 12. Exact File Templates

### Template A — Layout File (`src/data/{key}RoadmapFlow.ts`)

```typescript
import { Node, Edge, MarkerType } from 'reactflow';
import type { RoadmapNodeData } from './frontendRoadmapFlow'; // reuse the type

// ─────────────────────────────────────────────────────────────────────────────
// Main column x = 380  (node width 170)
// Right branch x = 680  (node width 200)
// Left branch  x = 80   (node width 180)
// Option pills x = 680  (node width 85)
// Vertical gap between sections: ~170px
// ─────────────────────────────────────────────────────────────────────────────

export const initialNodes: Node<RoadmapNodeData>[] = [
  {
    id: 'start',
    type: 'startNode',
    position: { x: 380, y: 0 },
    data: { label: '{Roadmap Title}' },
  },

  // ── SECTION 1 ─────────────────────────────────────────────────────────────
  {
    id: '{section-id}',
    type: 'mainNode',
    position: { x: 380, y: 130 },
    data: { label: '{Section Label}' },
  },
  { id: '{prefix}1', type: 'branchNode',     position: { x: 680, y: 98  }, data: { label: '{Sub-topic 1}' } },
  { id: '{prefix}2', type: 'branchNode',     position: { x: 680, y: 163 }, data: { label: '{Sub-topic 2}' } },
  { id: '{prefix}3', type: 'leftBranchNode', position: { x: 80,  y: 98  }, data: { label: '{Sub-topic 3}' } },
  { id: '{prefix}4', type: 'leftBranchNode', position: { x: 80,  y: 163 }, data: { label: '{Sub-topic 4}' } },

  // ── SECTION 2 ─────────────────────────────────────────────────────────────
  // (continue pattern, incrementing y by ~170 per section)
];

export const initialEdges: Edge[] = [
  // Main spine
  { id: 'start-{s1}', source: 'start', target: '{section-1-id}', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: '{s1}-{s2}',  source: '{section-1-id}', target: '{section-2-id}', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

  // Sub-node edges for section 1
  { id: '{s1}-{prefix}1', source: '{section-1-id}', target: '{prefix}1', type: 'smoothstep' },
  { id: '{s1}-{prefix}2', source: '{section-1-id}', target: '{prefix}2', type: 'smoothstep' },
  { id: '{s1}-{prefix}3', source: '{section-1-id}', target: '{prefix}3', type: 'smoothstep' },
  { id: '{s1}-{prefix}4', source: '{section-1-id}', target: '{prefix}4', type: 'smoothstep' },
  // ... repeat for all sections
];
```

---

### Template B — Rich Content (`src/data/allNodeDetails/{domainOrRoadmap}.ts`)

```typescript
// ── {ROADMAP NAME}: {SECTION LABEL} ──────────────────────────────────────────
'{section-id}': {
  section: {
    id: '{section-id}',
    label: '{Section Label}',
    description:
      '{2–3 sentence overview of why this topic matters in this roadmap context.}',
  },
  subNodes: [
    {
      id: '{prefix}1',
      label: '{Sub-topic Label}',
      intro:
        '{2–3 sentence explanation of what this sub-topic is and why it matters.}',
      whatYoullLearn: [
        '{Concrete skill or concept 1}',
        '{Concrete skill or concept 2}',
        '{Concrete skill or concept 3}',
        '{Concrete skill or concept 4}',
        '{Concrete skill or concept 5}',
      ],
      resources: [
        { title: '{Resource Title 1}', url: '{URL}', type: 'article' },
        { title: '{Resource Title 2}', url: '{URL}', type: 'video' },
        { title: '{Resource Title 3}', url: '{URL}', type: 'interactive' },
        { title: '{Resource Title 4}', url: '{URL}', type: 'book' },
      ],
    },
    // ... repeat for each sub-node
  ],
},
```

**Content rules:**
- `intro` must be 2–3 sentences. Never a single sentence.
- `whatYoullLearn` must contain 4–6 items minimum. Each item is a concrete, actionable learning outcome.
- `resources` must contain at least 3 entries. Aim for 1 video + 2 articles minimum per sub-node.
- Resource types: `'article'` (docs/text), `'video'` (YouTube/course), `'interactive'` (hands-on tool), `'book'` (free book/guide).
- All resource URLs must be real, stable, publicly accessible links.

---

### Template C — Config File (`src/data/{key}RoadmapConfig.ts`)

```typescript
import type { RoadmapFlowConfig } from '@/types/roadmapFlow';
import { initialNodes, initialEdges } from './{key}RoadmapFlow';

const config: RoadmapFlowConfig = {
  roadmapId: '{roadmap-id}',   // e.g. 'backend-nodejs'
  title: '{Display Title}',     // e.g. 'Backend Development'
  initialNodes,
  initialEdges,
  canvasWidth: 1040,
  canvasHeight: {calculated height},  // last node y + 150

  mainSectionIds: [
    '{section-1-id}',
    '{section-2-id}',
    // ... all main (yellow) node IDs
  ],

  nodeDetails: {
    '{section-1-id}': {
      description: '{1–2 sentence summary of the section shown in quick-look panel}',
      resources: [
        { title: '{Title 1}', url: '{URL}' },
        { title: '{Title 2}', url: '{URL}' },
        { title: '{Title 3}', url: '{URL}' },
        { title: '{Title 4}', url: '{URL}' },
        { title: '{Title 5}', url: '{URL}' },
      ],
    },
    // ... repeat for every section in mainSectionIds
  },

  projects: [
    {
      id: '{project-slug-1}',
      title: '{Beginner Project Title}',
      description: '{Clear description of what to build, what APIs/tools to use, end state.}',
      skills: ['{Skill 1}', '{Skill 2}', '{Skill 3}'],
      difficulty: 'Beginner',
      difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    },
    {
      id: '{project-slug-2}',
      title: '{Intermediate Project Title}',
      description: '{Description.}',
      skills: ['{Skill 1}', '{Skill 2}', '{Skill 3}', '{Skill 4}'],
      difficulty: 'Intermediate',
      difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    {
      id: '{project-slug-3}',
      title: '{Advanced Project Title}',
      description: '{Description — should be a meaningful, portfolio-worthy project.}',
      skills: ['{Skill 1}', '{Skill 2}', '{Skill 3}', '{Skill 4}', '{Skill 5}'],
      difficulty: 'Advanced',
      difficultyColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    },
  ] as const,

  faqs: [
    {
      id: 'fq1',
      question: '{Specific, common question a beginner of this skill would ask}',
      answer: '{Direct, honest, 2–4 sentence answer}',
    },
    // ... 9–11 more FAQs
  ] as const,

  modules: {
    comments: {
      enabled: false,
      requiresPublicSubmission: true,
    },
    privacyVisibility: {
      enabled: true,
    },
    careerLaunchpad: {
      enabled: false,
      jobsRoadmapParam: '{roadmap-query-param}',
      jobsLimit: 18,
      features: [],
    },
  },
};

export default config;
```

---

### Template D — Wrapper Page (`src/pages/{Key}RoadmapFlow.tsx`)

```tsx
import GenericRoadmapFlowPage from '@/components/roadmap/GenericRoadmapFlowPage';
import config from '@/data/{key}RoadmapConfig';

export default function {Key}RoadmapFlow() {
  return <GenericRoadmapFlowPage config={config} />;
}
```

**File naming:**
- Key: `backend-nodejs` → filename `BackendRoadmapFlow.tsx`, function `BackendRoadmapFlow`
- Key: `data-science` → filename `DataScienceRoadmapFlow.tsx`, function `DataScienceRoadmapFlow`
- Key: `ai-ml-engineering` → filename `AiMlRoadmapFlow.tsx`, function `AiMlRoadmapFlow`

---

### Template E — Route Entry (`src/App.tsx`)

Add inside the routes block in `src/App.tsx`, alongside the existing frontend route:

```tsx
// Already existing:
<Route path="/roadmap/frontend-react/flow" element={<FrontendRoadmapFlow />} />

// Add one per roadmap:
<Route path="/roadmap/backend-nodejs/flow"       element={<BackendRoadmapFlow />} />
<Route path="/roadmap/fullstack-mern/flow"        element={<FullstackRoadmapFlow />} />
<Route path="/roadmap/data-science/flow"          element={<DataScienceRoadmapFlow />} />
<Route path="/roadmap/devops-cloud/flow"          element={<DevOpsRoadmapFlow />} />
<Route path="/roadmap/mobile-flutter/flow"        element={<MobileFlutterRoadmapFlow />} />
<Route path="/roadmap/cybersecurity/flow"         element={<CybersecurityRoadmapFlow />} />
<Route path="/roadmap/blockchain-web3/flow"       element={<BlockchainRoadmapFlow />} />
<Route path="/roadmap/ai-ml-engineering/flow"     element={<AiMlRoadmapFlow />} />
<Route path="/roadmap/game-development-unity/flow" element={<GameDevRoadmapFlow />} />
<Route path="/roadmap/cloud-architecture/flow"    element={<CloudArchRoadmapFlow />} />
<Route path="/roadmap/product-management/flow"    element={<ProductMgmtRoadmapFlow />} />
<Route path="/roadmap/qa-automation/flow"         element={<QaRoadmapFlow />} />
<Route path="/roadmap/ux-ui-design/flow"          element={<UxUiRoadmapFlow />} />
<Route path="/roadmap/iot-embedded/flow"          element={<IotRoadmapFlow />} />
```

---

### Template F — Manifest Entry (`scripts/roadmap/roadmaps.manifest.json`)

```json
{
  "roadmapId": "backend-nodejs",
  "displayTitle": "Backend Development",
  "route": "/roadmap/backend-nodejs/flow",
  "layoutKey": "backendRoadmapFlow",
  "configKey": "backendRoadmapConfig",
  "pageName": "BackendRoadmapFlow",
  "jobsRoadmapParam": "backend",
  "modules": {
    "comments": true,
    "privacyVisibility": true,
    "careerLaunchpad": true
  }
}
```

### Template G — `package.json` Script Hooks

```json
{
  "scripts": {
    "generate:roadmap": "tsx scripts/roadmap/generateRoadmapScaffold.ts",
    "validate:roadmap-ids": "tsx scripts/roadmap/validateRoadmapIds.ts",
    "validate:section-map": "tsx scripts/roadmap/validateSectionMap.ts",
    "validate:config": "tsx scripts/roadmap/validateRoadmapConfig.ts",
    "validate:links": "tsx scripts/roadmap/validateResourceLinks.ts",
    "validate:roadmap": "npm run validate:roadmap-ids && npm run validate:section-map && npm run validate:config && npm run validate:links"
  }
}
```

These scripts are the primary mechanism that removes repetitive manual work at scale.

---

## 13. Quality Gates — Validation Checklist Per Roadmap

Run through this checklist for **every** roadmap after implementing it.

### A. Data Integrity
- [ ] Every sub-node ID in the layout file has a matching entry in `SECTION_NODE_MAP`
- [ ] Every sub-node ID in `SECTION_NODE_MAP` has a matching sub-node in `ALL_NODE_DETAILS`
- [ ] Every section ID in `mainSectionIds` has a matching entry in `nodeDetails`
- [ ] Every section ID in `mainSectionIds` appears as a node in the layout file
- [ ] No two nodes in ANY roadmap share the same ID (global uniqueness)
- [ ] All 3 projects have different `difficulty` values ('Beginner', 'Intermediate', 'Advanced')

### B. Layout
- [ ] Canvas renders without overlapping nodes at any zoom level
- [ ] All edges connect correctly (no dangling or missing edges)
- [ ] Start node is rendered at the top and connected to the first section
- [ ] Last section node connects to nothing (no outgoing edge needed)

### C. Sidebar Functionality
- [ ] Clicking any sub-node opens `NodeDetailSidebar` with correct data
- [ ] Sidebar shows correct `intro`, `whatYoullLearn` list, and `resources`
- [ ] Resource type badges render correctly (article/video/interactive/book)
- [ ] "Mark Complete" button marks the sub-node green on the canvas
- [ ] When all sub-nodes of a section are marked complete, parent turns green
- [ ] Closing sidebar works (X button and clicking outside)

### D. Quick-Look Panel
- [ ] Clicking a main (yellow) section node opens the quick-look panel
- [ ] Panel shows description and resource list from `nodeDetails` in config
- [ ] All resource links open in a new tab

### E. Lock Gate
- [ ] Projects section shows locked state when sections are incomplete
- [ ] Lock gate counts completed sections correctly
- [ ] Projects unlock when ALL `mainSectionIds` nodes are green

### F. Projects Section
- [ ] All 3 project cards render with correct title, description, skills, and difficulty badge
- [ ] Project selector tabs work (switches active project)
- [ ] GitHub URL validation: rejects empty, non-URL, non-github.com inputs
- [ ] Valid submission adds to list with project title and date
- [ ] Success toast shows and disappears after 3.5 seconds
- [ ] Submissions persist within the session (not cleared on re-click)
- [ ] If comments module is enabled: comments render only for public submissions
- [ ] If privacy module is enabled: visibility toggle triggers confirmation modal before applying change

### G. FAQ Section
- [ ] All FAQ items render
- [ ] Clicking a question toggles the answer open/closed
- [ ] Multiple FAQs can be open simultaneously
- [ ] Chevron icon rotates correctly on open/close

### H. Legend & Scroll Behaviour
- [ ] Legend is visible when canvas is in view
- [ ] Legend hides when the Projects section scrolls into view
- [ ] Legend reappears when scrolling back up

### I. Navigation
- [ ] Back button navigates to `/roadmaps`
- [ ] Page title in the browser tab is correct

### J. Career Module (Optional)
- [ ] If career module is enabled: all configured feature cards render from config
- [ ] `navigate` actions route to the configured destination
- [ ] `jobs-expand` action opens jobs panel and fetches with roadmap param + limit from config
- [ ] Career module disabled state renders no career block and causes no runtime errors

### K. Automation Gates (Required for Scale)
- [ ] `validate:roadmap-ids` passes (global node-id uniqueness)
- [ ] `validate:section-map` passes (every sub-node in layouts maps to SECTION_NODE_MAP)
- [ ] `validate:config` passes (required config keys + module schema)
- [ ] `validate:links` passes (resource URL health check)
- [ ] CI blocks merge on any validator failure

---

## 14. Execution Order — Fastest Path

Work **layer by layer** across all roadmaps rather than completing one roadmap fully before starting the next. This minimises context-switching and lets you batch similar work.

```
STEP 0 ─ Automation Foundations (do once, before scaling)
│
│   0a. Create roadmap manifest format (json/ts) for scaffold generation
│   0b. Add generators: layout/config/wrapper/route scaffold
│   0c. Add validators: node-id uniqueness, section-map coverage, config schema, link health
│   0d. Wire validators into CI (fail build on violations)
│
STEP 1 ─ Phase 0 Refactor (do once, validate completely)
│
│   1a. Create src/types/roadmapFlow.ts
│   1b. Create src/components/roadmap/GenericRoadmapFlowPage.tsx (move logic from Frontend page)
│   1c. Create src/data/frontendRoadmapConfig.ts (move data from Frontend page)
│   1d. Extract optional feature modules (comments, privacy modal, career launchpad) behind config flags
│   1e. Shrink src/pages/FrontendRoadmapFlow.tsx to wrapper
│   1f. Run app → validate quality gates (including optional module checks) on frontend roadmap
│
STEP 2 ─ Layout Files (all 14 at once — generated, not hand-copied)
│
│   Generate all 14 src/data/{key}RoadmapFlow.ts files from manifest
│   Use the canvas system (Section 8) to calculate y positions
│   For roadmaps reusing shared section IDs, copy those node definitions exactly
│
STEP 3 ─ SECTION_NODE_MAP updates (do alongside Step 2)
│
│   Generate/append sub-node → section mappings from manifest
│   Run `validate:section-map` after each roadmap batch
│
STEP 4 ─ Rich Content (one roadmap at a time — this is the intellectual work)
│
│   Priority order (highest user demand first):
│   4a. backend-nodejs
│   4b. fullstack-mern
│   4c. data-science
│   4d. devops-cloud
│   4e. ai-ml-engineering
│   4f. cybersecurity
│   4g. mobile-flutter
│   4h. cloud-architecture
│   4i. qa-automation
│   4j. blockchain-web3
│   4k. game-development-unity
│   4l. ux-ui-design
│   4m. product-management
│   4n. iot-embedded
│
│   For each roadmap: write ALL sections in its own `allNodeDetails/{roadmapOrDomain}.ts` module
│   Re-export from `allNodeDetails/index.ts`
│   Do NOT leave stubs — write complete content with all sub-nodes
│
STEP 5 ─ Config Files (all 14)
│
│   Generate src/data/{key}RoadmapConfig.ts for each roadmap
│   Fill nodeDetails, projects, faqs, and module toggles
│
STEP 6 ─ Wrapper Pages + Routes (30 minutes total)
│
│   Generate 14 wrapper pages in src/pages/
│   Generate/add 14 route lines to src/App.tsx
│
STEP 7 ─ Validate Each Roadmap
│
│   Run validators + quality gate checklist (Section 13) for each roadmap
│   Fix issues before moving to the next
```

---

## 15. Time Estimates

| Step | Task | Estimated Time |
|---|---|---|
| Step 0 | Automation foundations (generators + validators + CI) | 4–8 hours |
| Step 1 | Phase 0 refactor + module extraction | 4–8 hours |
| Steps 2/3/5/6 | Scaffold generation for 14 roadmaps | 2–4 hours |
| Step 4 | Rich content authoring (major effort driver) | 28–70 hours |
| Step 7 | Validation, visual QA, bug fixes | 6–12 hours |
| **Total (14 roadmaps)** | | **~44–102 hours** |

### Breakdown of Step 4 (Rich Content per Roadmap)

Each roadmap typically has ~7–13 unique sections. Shared sections reduce duplication, but content authoring still dominates.

Per sub-node:
- 2–3 sentences for `intro` (~3–5 min)
- 4–6 `whatYoullLearn` bullets (~4–8 min)
- 3–4 verified `resources` with real URLs (~8–15 min)

Per section: ~20–40 min for 2–4 sub-nodes plus section description.
Per roadmap: ~2–5 hours depending on number of unique sections and research depth.

### Scaling Formula (Use This for 50+ Roadmaps)

`totalHours ≈ oneTimeSetup + (roadmapCount × avgContentHoursPerRoadmap) + qaBuffer`

Example: `8 + (50 × 3) + 25 ≈ 183 hours`

---

## Edge Cases & Common Mistakes

### 1. Shared section IDs in multiple roadmaps
If both `backend-nodejs` and `fullstack-mern` include `version-control`, both layouts can reference the same shared node IDs (`version-control`, `git`) and same edges. Keep shared mappings (like `'git': 'version-control'`) in `allNodeDetails/shared.ts` and import once into `allNodeDetails/index.ts`.

### 2. Option nodes (pill nodes) for alternatives
Use `type: 'optionNode'` for nodes representing tool choices (e.g. PostgreSQL vs MongoDB). These have a smaller, rounded appearance. They should still be in `allNodeDetails` if you want sidebar content, or omit from `SECTION_NODE_MAP` if you want them to be display-only.

### 3. canvasHeight miscalculation
If `canvasHeight` is too small, nodes will be clipped. Always set it to `(last node's y position) + 150`. Calculate by summing all your y-spacing values.

### 4. FAQ IDs collide across roadmaps
FAQ IDs (`fq1`, `fq2`, etc.) are local to each config file's `faqs` array — they are only used as React keys within that page. They do NOT need global uniqueness.

### 5. Main section nodes appearing in SECTION_NODE_MAP
Do not rely on map presence alone for click behavior. Use deterministic resolver order:
1. If node is in `mainSectionIds` → quick-look panel.
2. Else if node exists in `SECTION_NODE_MAP` → sidebar.

This prevents accidental routing bugs even if map content changes.

### 6. RoadmapNodeData type
The `RoadmapNodeData` type is defined in `src/data/frontendRoadmapFlow.ts` and re-exported. All layout files import it from there:
```ts
import type { RoadmapNodeData } from './frontendRoadmapFlow';
```
Do not redefine it in each layout file.

### 7. `as const` on projects and faqs arrays
The `projects` and `faqs` arrays in config files must use `as const` so TypeScript can narrow the `difficulty` field to a literal type (`'Beginner'` not `string`). This is already shown in Template C.

### 8. Connecting to the RoadmapDetail page
The flow page is accessed via `/roadmap/{id}/flow`. The `RoadmapDetail.tsx` page (the existing one with component cards) already has a "View Roadmap Flow" or similar button. Verify the `href` on that button matches the route pattern exactly.

### 9. Progress not persisting on refresh
The current implementation stores node completion state in React state (in-memory). If Supabase persistence is added in the future, `GenericRoadmapFlowPage` is the only file that needs updating — all 15 roadmaps get the feature automatically. This is the main benefit of the generic component.

### 10. Optional modules causing runtime checks everywhere
Avoid scattered `if` checks in JSX. Compute module flags once at top-level from config (`commentsEnabled`, `careerEnabled`, `privacyEnabled`) and use guarded render blocks. This keeps the generic component readable as modules grow.

---

## File Summary — Complete List of Files to Create Per Roadmap

```
src/
├── types/
│   └── roadmapFlow.ts                        ← Phase 0 (one-time)
├── components/roadmap/
│   └── GenericRoadmapFlowPage.tsx             ← Phase 0 (one-time)
├── data/
│   ├── frontendRoadmapConfig.ts               ← Phase 0 (extract from Frontend page)
│   ├── backendRoadmapFlow.ts                  ← Phase 1 per roadmap
│   ├── backendRoadmapConfig.ts                ← Phase 1 per roadmap
│   ├── fullstackRoadmapFlow.ts
│   ├── fullstackRoadmapConfig.ts
│   ├── dataScienceRoadmapFlow.ts
│   ├── dataScienceRoadmapConfig.ts
│   ├── devopsRoadmapFlow.ts
│   ├── devopsRoadmapConfig.ts
│   ├── mobileFlutterRoadmapFlow.ts
│   ├── mobileFlutterRoadmapConfig.ts
│   ├── cybersecurityRoadmapFlow.ts
│   ├── cybersecurityRoadmapConfig.ts
│   ├── blockchainRoadmapFlow.ts
│   ├── blockchainRoadmapConfig.ts
│   ├── aiMlRoadmapFlow.ts
│   ├── aiMlRoadmapConfig.ts
│   ├── gameDevRoadmapFlow.ts
│   ├── gameDevRoadmapConfig.ts
│   ├── cloudArchRoadmapFlow.ts
│   ├── cloudArchRoadmapConfig.ts
│   ├── productMgmtRoadmapFlow.ts
│   ├── productMgmtRoadmapConfig.ts
│   ├── qaRoadmapFlow.ts
│   ├── qaRoadmapConfig.ts
│   ├── uxUiRoadmapFlow.ts
│   ├── uxUiRoadmapConfig.ts
│   ├── iotRoadmapFlow.ts
│   └── iotRoadmapConfig.ts
└── pages/
    ├── FrontendRoadmapFlow.tsx                ← Phase 0 (shrunk to wrapper)
    ├── BackendRoadmapFlow.tsx                 ← Phase 1 per roadmap
    ├── FullstackRoadmapFlow.tsx
    ├── DataScienceRoadmapFlow.tsx
    ├── DevOpsRoadmapFlow.tsx
    ├── MobileFlutterRoadmapFlow.tsx
    ├── CybersecurityRoadmapFlow.tsx
    ├── BlockchainRoadmapFlow.tsx
    ├── AiMlRoadmapFlow.tsx
    ├── GameDevRoadmapFlow.tsx
    ├── CloudArchRoadmapFlow.tsx
    ├── ProductMgmtRoadmapFlow.tsx
    ├── QaRoadmapFlow.tsx
    ├── UxUiRoadmapFlow.tsx
    └── IotRoadmapFlow.tsx

  scripts/
  └── roadmap/
    ├── generateRoadmapScaffold.ts            ← Step 0 automation
    ├── validateRoadmapIds.ts                 ← global node-id uniqueness
    ├── validateSectionMap.ts                 ← SECTION_NODE_MAP coverage
    ├── validateRoadmapConfig.ts              ← config schema validation
    └── validateResourceLinks.ts              ← URL health checks
```

**Modified files (not created):**
- `src/data/allNodeDetails/index.ts` — merge exports for section data and section maps
- `src/data/allNodeDetails/{domainOrRoadmap}.ts` — add roadmap section data + section map fragment
- `src/App.tsx` — add 14 route lines
  - `package.json` — add roadmap generation/validation scripts

---

  *This document is the single source of truth for implementing roadmap flows. Follow it top to bottom, do not skip Phase 0, and do not start Phase 1 until validators and frontend quality gates pass.*
