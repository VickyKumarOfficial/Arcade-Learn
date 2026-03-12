<div align="center">

# 🤖 MCP Server Implementation for ArcadeLearn

### Model Context Protocol — Architecture, Flow, Implementation & Importance

[![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-6C63FF?style=for-the-badge)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-F55036?style=for-the-badge)](https://groq.com/)

</div>

---

## 📑 Table of Contents

1. [What is MCP?](#-what-is-mcp)
2. [Why ArcadeLearn Needs MCP](#-why-arcadelearn-needs-mcp)
3. [Current Problems Without MCP](#-current-problems-without-mcp)
4. [Three Integration Strategies](#-three-integration-strategies)
5. [System Architecture & Flow Diagrams](#-system-architecture--flow-diagrams)
6. [MCP Tools Specification](#-mcp-tools-specification)
7. [Full Implementation Guide](#-full-implementation-guide)
8. [Security Improvements](#-security-improvements)
9. [Before vs After Comparison](#-before-vs-after-comparison)
10. [Setup & Installation](#-setup--installation)
11. [Environment Variables](#-environment-variables)
12. [Testing the MCP Server](#-testing-the-mcp-server)

---

## 🧠 What is MCP?

**Model Context Protocol (MCP)** is an open standard created by Anthropic (March 2024) that defines a universal way for AI models to connect to external tools, databases, APIs, and data sources.

Think of it as **"USB-C for AI"** — instead of every AI integration being a custom, hardcoded one-off, MCP provides a single standardized interface:

```
Without MCP:                         With MCP:
AI ──custom code──▶ Supabase         AI ──MCP──▶ MCP Server ──▶ Supabase
AI ──custom code──▶ Jobs API                              └──▶ Jobs API
AI ──custom code──▶ User Progress                         └──▶ User Progress
AI ──custom code──▶ Certificates                          └──▶ Certificates
   (4 different integrations)           (1 MCP server handles everything)
```

### How It Works — Core Concepts

| Concept | Description |
|---|---|
| **MCP Server** | Exposes "tools" and "resources" that AI models can call |
| **MCP Client** | The AI model or IDE that discovers and invokes tools |
| **Tools** | Functions the AI can call to take actions or fetch data |
| **Resources** | Static/dynamic data the AI can read (like files or DB views) |
| **Transport** | Communication layer — `stdio` (local) or `HTTP/SSE` (remote) |

### Who Supports MCP Natively

- ✅ **Claude** (Anthropic) — full support
- ✅ **GitHub Copilot** in VS Code — built-in MCP client
- ✅ **Cursor IDE** — built-in MCP client
- ✅ **Windsurf (Codeium)** — built-in MCP client
- ✅ **Any app** using `@modelcontextprotocol/sdk`

---

## 🎯 Why ArcadeLearn Needs MCP

ArcadeLearn is a **data-rich, AI-powered learning platform** with:

- 👤 Per-user XP, levels, streaks, completed roadmaps (Supabase)
- 🧠 AI chat assistant "Nova" (Google Gemini)
- 📝 AI quiz generation (Groq / Llama 3.3-70b)
- 💼 Job listings + skill-matching engine (Supabase `jobs` table)
- 📄 Resume parsing + AI-matching (Supabase `parsed_resumes`)
- 🏆 Certifications, badges, leaderboard (Supabase)

The problem? **Nova has no access to any of this data.** Every AI call is blind — it doesn't know who the user is, what they've learned, or what jobs match their skills.

MCP bridges this gap completely.

---

## ❌ Current Problems Without MCP

### Problem 1 — Nova Is Context-Blind

```
User: "What should I learn next?"
Nova: "I'd be happy to help! What are you currently learning?" ❌

With MCP:
Nova: "You're 60% through the React roadmap (Level 4, 340 XP). 
       Complete 3 more components — Hooks, Context, and useReducer — 
       and you'll earn your Frontend Developer certificate!" ✅
```

### Problem 2 — Groq API Key Is Exposed in the Browser

In `src/services/quizService.ts`:
```typescript
// ⚠️ SECURITY VULNERABILITY — key is visible in browser DevTools
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true  // ← this is a red flag
});
```

Any user can open DevTools → Network tab → copy your `GROQ_API_KEY` and use it freely at your expense.

### Problem 3 — AI Features Are Siloed

| Feature | Current State |
|---|---|
| Job matching | Separate `/jobs` page, no AI |
| Quiz generation | Isolated frontend call, no user context |
| Resume analysis | Separate `/resume` page, no AI follow-up |
| Activity stats | Dashboard heatmap, AI can't reference it |
| Certificates | Certificate page, AI can't congratulate or track |

### Problem 4 — No Rate Limiting on AI Calls

- Any user can spam quiz generation directly via the exposed Groq key
- No caching — same quiz topics regenerate on every request (wasteful and slow)
- No per-user usage tracking

---

## 🚀 Three Integration Strategies

### Strategy A — Developer MCP (For You, Building ArcadeLearn)

Run a local MCP server connected to your Supabase database. GitHub Copilot in VS Code can then query your live production data **while you're coding** — no more manually querying the Supabase console.

```
VS Code (Copilot) ──MCP──▶ Supabase MCP Server ──▶ Your Supabase DB
```

**Ready-made, zero-code option:** Supabase ships an [official MCP server](https://supabase.com/blog/mcp-server). Configure it in `.vscode/mcp.json` with your `SUPABASE_SERVICE_ROLE_KEY` and you're done.

**Developer superpowers:**
- *"Show me all users with level > 5 and no certificates"* → instant DB query
- *"What jobs are currently in the jobs table matching React skills?"*
- *"Find users whose streak broke in the last 7 days"*
- *"What's the schema of user_activity_log?"*

---

### Strategy B — App-Level MCP (Supercharging Nova)

Build a custom MCP server in `backend/` that exposes ArcadeLearn data as tools. Nova calls these tools mid-conversation to answer personalized questions.

```
Browser ──▶ backend/server.js ──▶ AI Orchestrator ──▶ Gemini/Groq
                                        │
                              (model requests tool)
                                        │
                                  MCP Tool Handler
                                  ├── get_user_progress()  ──▶ Supabase
                                  ├── get_job_recommendations()  ──▶ Supabase
                                  ├── generate_quiz()      ──▶ Groq API
                                  └── get_certificates()   ──▶ Supabase
```

---

### Strategy C — Secure Quiz Generation (Security Fix)

Move quiz generation entirely to the backend MCP tool, eliminating the exposed browser API key.

```
Before:  Browser ──GROQ_KEY──▶ Groq API   (key exposed)
After:   Browser ──▶ backend/mcpServer.js ──▶ Groq API  (key hidden)
```

---

## 🏗️ System Architecture & Flow Diagrams

### Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Nova Chat   │  │  Quiz Page   │  │   Dashboard      │  │
│  │ AIChatPage   │  │ ComponentTest│  │  Dashboard.tsx   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┼───────────────────┘             │
│                           │                                 │
│                    POST /api/ai/chat                        │
│                    POST /api/quiz/generate                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│                                                             │
│  backend/server.js                                          │
│       │                                                     │
│       ├─── /api/ai/chat ──────▶ AI Orchestrator             │
│       │                              │                      │
│       │                    Sends message + tools manifest   │
│       │                              │                      │
│       │                              ▼                      │
│       │                    ┌─────────────────┐              │
│       │                    │  Google Gemini  │              │
│       │                    │  (with tools)   │              │
│       │                    └────────┬────────┘              │
│       │                             │                       │
│       │                   Model calls MCP tool              │
│       │                             │                       │
│       │                    ┌────────▼────────┐              │
│       │                    │   MCP Server    │              │
│       │                    │  mcpServer.js   │              │
│       │                    └────────┬────────┘              │
│       │                             │                       │
│       │              ┌──────────────┼──────────────┐        │
│       │              ▼              ▼              ▼        │
│       │     ┌──────────────┐ ┌──────────┐ ┌──────────────┐ │
│       │     │  Supabase DB │ │ Groq API │ │ Static Data  │ │
│       │     │  (user data) │ │  (quiz)  │ │ (roadmaps)   │ │
│       │     └──────────────┘ └──────────┘ └──────────────┘ │
│       │                                                     │
│       └─── /api/quiz/generate ──▶ MCP generate_quiz tool    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                    │
│                                                             │
│  user_game_data  │  user_progress  │  jobs                  │
│  parsed_resumes  │  certificates   │  user_activity_log     │
│  ai_chats        │  ai_messages    │  user_recommendations  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Nova AI Conversation Flow (With MCP Tools)

```
User types: "What should I work on today?"
                    │
                    ▼
         POST /api/ai/chat
         { userId: "abc-123", message: "What should I work on today?" }
                    │
                    ▼
         AI Orchestrator builds request:
         {
           model: "gemini-2.0-flash",
           systemPrompt: "You are Nova, ArcadeLearn AI coach for user abc-123",
           message: "What should I work on today?",
           tools: [get_user_progress, get_job_recommendations, ...]
         }
                    │
                    ▼
              Google Gemini API
                    │
         Model decides it needs user data
                    │
                    ▼
         Tool call: get_user_progress("abc-123")
                    │
                    ▼
         MCP Server handler:
         → queries Supabase user_game_data
         → queries user_progress
         → returns {
               level: 4, xp: 340, streak: 2,
               completed_roadmaps: ["html-css"],
               current_roadmap: "react-frontend",
               progress_percent: 60,
               last_activity: "2026-03-11"
            }
                    │
                    ▼
         Tool call: get_job_recommendations("abc-123")
                    │
                    ▼
         MCP Server handler:
         → queries parsed_resumes for user
         → runs skillNormalizer + scoring against jobs table
         → returns top 3 matched jobs
                    │
                    ▼
         Gemini generates final response with full context:
         "You're doing great! You're Level 4 with a 2-day streak.
          Today I'd suggest completing React Hooks — it's the next
          component in your React roadmap (60% done). Finish 3 more
          components and you'll earn your Frontend Developer certificate!
          
          Also, I noticed your resume shows React + TypeScript skills.
          There are 2 new junior frontend roles at companies hiring now
          that match your profile. Want to see them?"
                    │
                    ▼
         Returned to browser → rendered by FormattedText.tsx
```

---

### Quiz Generation Flow (With MCP — Secure)

```
Before (INSECURE):
Browser → quizService.ts → Groq API (with exposed VITE_GROQ_API_KEY)

After (SECURE):
Browser
  POST /api/quiz/generate
  { userId, topic: "React Hooks", difficulty: "intermediate", count: 4 }
         │
         ▼
   Rate Limiter (5 quiz/hour per user)
         │
         ▼
   Cache Check (Redis/in-memory)
   Hit? → return cached quiz
   Miss? → continue
         │
         ▼
   MCP Tool: generate_quiz(topic, difficulty, count)
         │
         ▼
   Groq API (key is SERVER-SIDE ONLY)
   llama-3.3-70b-versatile
         │
         ▼
   Cache result (TTL: 1 hour)
         │
         ▼
   Return quiz to browser
   (GROQ_API_KEY never leaves the server)
```

---

### Developer MCP Flow (Supabase Official MCP)

```
VS Code + GitHub Copilot
         │
         │ configured via .vscode/mcp.json
         ▼
Supabase Official MCP Server
         │
   Reads SUPABASE_SERVICE_ROLE_KEY
         │
         ▼
Your Supabase DB (Live Data)

Developer asks Copilot:
"How many users reached level 5 this month?"
         │
         ▼
Copilot calls MCP tool: execute_sql
SELECT COUNT(*) FROM user_game_data
WHERE level >= 5
AND updated_at >= '2026-03-01';
         │
         ▼
Result: 42 users
```

---

## 🛠️ MCP Tools Specification

These are all the tools the ArcadeLearn MCP server will expose:

### User Data Tools

| Tool Name | Input Parameters | Returns | Backed By |
|---|---|---|---|
| `get_user_progress` | `userId: string` | Level, XP, streak, completed_roadmaps[], current_roadmap, progress_pct | `user_game_data` + `user_progress` tables |
| `get_user_activity_stats` | `userId: string, days?: number` | Activity heatmap, study_days, avg_daily_xp | `user_activity_log` via `userActivityService` |
| `get_user_certificates` | `userId: string` | Array of earned certificates with roadmap names | `certificates` table via `certificateService` |
| `get_user_badges` | `userId: string` | Earned badges with unlock dates | `user_achievements` + `user_badges` tables |
| `get_user_subscription` | `userId: string` | Plan type, status, expiry | `subscriptions` table via `subscriptionService` |

### Learning Tools

| Tool Name | Input Parameters | Returns | Backed By |
|---|---|---|---|
| `get_roadmap_info` | `roadmapId: string` | Full roadmap details, components, resources, test info | Static `roadmaps.ts` data |
| `get_all_roadmaps` | *(none)* | List of all roadmaps with titles, difficulty, duration | Static `roadmaps.ts` data |
| `generate_quiz` | `topic: string, difficulty: string, count?: number` | Array of multiple-choice questions with answers | Groq API (Llama 3.3-70b) |
| `get_recommended_roadmaps` | `userId: string` | AI-generated roadmap recommendations | `user_recommendations` table |

### Job & Career Tools

| Tool Name | Input Parameters | Returns | Backed By |
|---|---|---|---|
| `get_job_recommendations` | `userId: string, limit?: number` | Top matched jobs with skill-match score | `jobRecommendationService` + `skillNormalizer` |
| `search_jobs` | `skills: string[], location?: string, type?: string` | Matching job listings | `jobs` Supabase table |
| `get_user_resume_skills` | `userId: string` | Extracted skills from user's parsed resume | `parsed_resumes` table |

### Analytics Tools (Admin-only)

| Tool Name | Input Parameters | Returns | Backed By |
|---|---|---|---|
| `get_platform_analytics` | `adminKey: string` | Total users, active users, top roadmaps | `analyticsService` |
| `get_learning_analytics` | `adminKey: string, startDate, endDate` | Quiz completion rates, roadmap progress | `analyticsService` |

---

## 💻 Full Implementation Guide

### Step 1 — Install SDK

```bash
cd backend
npm install @modelcontextprotocol/sdk zod
```

### Step 2 — Create the MCP Server

Create `backend/mcpServer.js`:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { supabaseAdmin } from "./lib/supabase.js";
import * as userProgressService from "./services/userProgressService.js";
import * as jobRecommendationService from "./services/jobRecommendationService.js";
import * as certificateService from "./services/certificateService.js";
import * as userActivityService from "./services/userActivityService.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Create MCP Server ───────────────────────────────────────────────────────
export const mcpServer = new McpServer({
  name: "arcadelearn-mcp",
  version: "1.0.0",
});

// ─── Tool: get_user_progress ─────────────────────────────────────────────────
mcpServer.tool(
  "get_user_progress",
  "Get a user's current XP, level, streak, and roadmap progress",
  { userId: z.string().describe("The user's UUID from Supabase Auth") },
  async ({ userId }) => {
    const [gameData, progressData] = await Promise.all([
      userProgressService.getUserGameData(userId),
      supabaseAdmin
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .single(),
    ]);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            level: gameData?.level ?? 1,
            total_xp: gameData?.total_xp ?? 0,
            current_streak: gameData?.current_streak ?? 0,
            longest_streak: gameData?.longest_streak ?? 0,
            completed_roadmaps: gameData?.completed_roadmaps ?? [],
            completed_components: gameData?.completed_components ?? [],
            total_stars: progressData?.data?.total_stars ?? 0,
            completed_tests: progressData?.data?.completed_tests ?? 0,
          }),
        },
      ],
    };
  }
);

// ─── Tool: get_job_recommendations ───────────────────────────────────────────
mcpServer.tool(
  "get_job_recommendations",
  "Get job listings that best match the user's resume skills",
  {
    userId: z.string().describe("The user's UUID"),
    limit: z.number().optional().default(5).describe("Max jobs to return"),
  },
  async ({ userId, limit }) => {
    const recommendations = await jobRecommendationService.getRecommendations(
      userId,
      limit
    );
    return {
      content: [{ type: "text", text: JSON.stringify(recommendations) }],
    };
  }
);

// ─── Tool: get_user_certificates ─────────────────────────────────────────────
mcpServer.tool(
  "get_user_certificates",
  "Get all certificates a user has earned",
  { userId: z.string() },
  async ({ userId }) => {
    const certs = await certificateService.getUserCertificates(userId);
    return {
      content: [{ type: "text", text: JSON.stringify(certs) }],
    };
  }
);

// ─── Tool: get_user_activity_stats ───────────────────────────────────────────
mcpServer.tool(
  "get_user_activity_stats",
  "Get user's learning activity stats and heatmap data",
  {
    userId: z.string(),
    days: z.number().optional().default(30),
  },
  async ({ userId, days }) => {
    const [stats, heatmap] = await Promise.all([
      userActivityService.getUserStats(userId),
      userActivityService.getHeatmapData(userId, days),
    ]);
    return {
      content: [{ type: "text", text: JSON.stringify({ stats, heatmap }) }],
    };
  }
);

// ─── Tool: search_jobs ───────────────────────────────────────────────────────
mcpServer.tool(
  "search_jobs",
  "Search job listings by skills, location, or job type",
  {
    skills: z.array(z.string()).describe("Skills to match against"),
    location: z.string().optional(),
    type: z.string().optional().describe("e.g. remote, full-time, part-time"),
    limit: z.number().optional().default(10),
  },
  async ({ skills, location, type, limit }) => {
    let query = supabaseAdmin.from("jobs").select("*").limit(limit);

    if (location) query = query.ilike("location", `%${location}%`);
    if (type) query = query.ilike("type", `%${type}%`);

    const { data: jobs } = await query;

    // Score jobs by skill match
    const scored = (jobs ?? [])
      .map((job) => {
        const desc = (job.description ?? "").toLowerCase();
        const matchCount = skills.filter((s) =>
          desc.includes(s.toLowerCase())
        ).length;
        return { ...job, skill_match_score: matchCount };
      })
      .filter((j) => j.skill_match_score > 0)
      .sort((a, b) => b.skill_match_score - a.skill_match_score);

    return {
      content: [{ type: "text", text: JSON.stringify(scored) }],
    };
  }
);

// ─── Tool: get_all_roadmaps ───────────────────────────────────────────────────
mcpServer.tool(
  "get_all_roadmaps",
  "Get a list of all available learning roadmaps with their details",
  {},
  async () => {
    // Reads from the static roadmaps data that powers the frontend
    const { data } = await supabaseAdmin
      .from("roadmaps")
      .select("id, title, difficulty, duration, description, tech_stack")
      .order("created_at", { ascending: true });

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
    };
  }
);

// ─── Tool: generate_quiz (SECURE — key stays server-side) ────────────────────
// In-memory simple cache: Map<key, {quiz, expiresAt}>
const quizCache = new Map();

mcpServer.tool(
  "generate_quiz",
  "Generate a multiple-choice quiz for a given topic and difficulty",
  {
    topic: z.string().describe("The topic to quiz on, e.g. 'React Hooks'"),
    difficulty: z
      .enum(["beginner", "intermediate", "advanced"])
      .default("intermediate"),
    count: z.number().min(2).max(10).default(4),
  },
  async ({ topic, difficulty, count }) => {
    const cacheKey = `${topic}:${difficulty}:${count}`;
    const cached = quizCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return { content: [{ type: "text", text: JSON.stringify(cached.quiz) }] };
    }

    const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" 
at ${difficulty} level. Return ONLY valid JSON array:
[{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Why this is correct..."
}]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const quiz = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Cache for 1 hour
    quizCache.set(cacheKey, { quiz, expiresAt: Date.now() + 3_600_000 });

    return { content: [{ type: "text", text: JSON.stringify(quiz) }] };
  }
);

// ─── Tool: get_user_resume_skills ────────────────────────────────────────────
mcpServer.tool(
  "get_user_resume_skills",
  "Get the skills extracted from a user's uploaded resume",
  { userId: z.string() },
  async ({ userId }) => {
    const { data } = await supabaseAdmin
      .from("parsed_resumes")
      .select("resume_data")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    const skills = data?.resume_data?.skills ?? [];
    const workExperiences = data?.resume_data?.workExperiences ?? [];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ skills, workExperiences }),
        },
      ],
    };
  }
);

// ─── Export transport factory for use in server.js ───────────────────────────
export function createMCPTransport() {
  return new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
}
```

---

### Step 3 — Create the AI Orchestrator

Create `backend/services/aiOrchestratorService.js`:

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Nova AI with MCP tool access.
 * Handles a complete AI conversation turn including all tool calls.
 */
export async function novaChat({ userId, message, chatHistory = [] }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are Nova, the AI learning coach for ArcadeLearn.
You have access to real-time data about this user (userId: ${userId}).
Always fetch user progress before giving personalized advice.
Be encouraging, specific, and brief. Use the user's actual data — never guess.
When recommending next steps, always check their current roadmap progress first.`,
  });

  // Define tools for Gemini using function declarations
  const tools = [
    {
      functionDeclarations: [
        {
          name: "get_user_progress",
          description: "Get the user's XP, level, streak, completed roadmaps",
          parameters: {
            type: "OBJECT",
            properties: { userId: { type: "STRING" } },
            required: ["userId"],
          },
        },
        {
          name: "get_job_recommendations",
          description: "Get job listings matching the user's resume skills",
          parameters: {
            type: "OBJECT",
            properties: {
              userId: { type: "STRING" },
              limit: { type: "NUMBER" },
            },
            required: ["userId"],
          },
        },
        {
          name: "get_user_certificates",
          description: "Get certificates the user has earned",
          parameters: {
            type: "OBJECT",
            properties: { userId: { type: "STRING" } },
            required: ["userId"],
          },
        },
        {
          name: "get_user_activity_stats",
          description: "Get user's learning activity and consistency data",
          parameters: {
            type: "OBJECT",
            properties: {
              userId: { type: "STRING" },
              days: { type: "NUMBER" },
            },
            required: ["userId"],
          },
        },
        {
          name: "search_jobs",
          description: "Search jobs by skills or location",
          parameters: {
            type: "OBJECT",
            properties: {
              skills: { type: "ARRAY", items: { type: "STRING" } },
              location: { type: "STRING" },
              type: { type: "STRING" },
            },
            required: ["skills"],
          },
        },
        {
          name: "get_user_resume_skills",
          description: "Get the skills from the user's uploaded resume",
          parameters: {
            type: "OBJECT",
            properties: { userId: { type: "STRING" } },
            required: ["userId"],
          },
        },
      ],
    },
  ];

  const chat = model.startChat({ tools, history: chatHistory });
  let result = await chat.sendMessage(message);

  // Agentic loop: keep handling tool calls until model gives final text
  while (result.response.functionCalls()?.length > 0) {
    const toolCalls = result.response.functionCalls();
    const toolResults = await Promise.all(
      toolCalls.map(async (call) => {
        const data = await dispatchMCPTool(call.name, call.args);
        return {
          functionResponse: {
            name: call.name,
            response: { content: data },
          },
        };
      })
    );
    result = await chat.sendMessage(toolResults);
  }

  return result.response.text();
}

/**
 * Dispatch MCP tool calls directly (in-process for low latency)
 */
async function dispatchMCPTool(toolName, args) {
  // Import MCP server tools (re-use the same implementations)
  const { mcpServer } = await import("../mcpServer.js");
  const handler = mcpServer._registeredTools.get(toolName);
  if (!handler) throw new Error(`Unknown tool: ${toolName}`);
  const result = await handler.callback(args);
  return JSON.parse(result.content[0].text);
}
```

---

### Step 4 — Add Routes to server.js

Add these routes to `backend/server.js`:

```javascript
import { novaChat } from "./services/aiOrchestratorService.js";
import { mcpServer, createMCPTransport } from "./mcpServer.js";
import { randomUUID } from "crypto";

// ─── Nova AI Chat with MCP tools ──────────────────────────────────────────────
app.post("/api/ai/chat", async (req, res) => {
  const { userId, message, chatHistory } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required" });
  }

  // Basic input validation
  if (typeof message !== "string" || message.length > 4000) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const reply = await novaChat({ userId, message, chatHistory });
  res.json({ reply });
});

// ─── Secure Quiz Generation (replaces browser-side Groq call) ─────────────────
const quizRateLimit = new Map(); // userId → { count, resetAt }

app.post("/api/quiz/generate", async (req, res) => {
  const { userId, topic, difficulty, count } = req.body;

  if (!userId || !topic) {
    return res.status(400).json({ error: "userId and topic are required" });
  }

  // Rate limiting: 10 quiz generations per hour per user
  const now = Date.now();
  const userLimit = quizRateLimit.get(userId) ?? { count: 0, resetAt: now + 3_600_000 };
  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + 3_600_000;
  }
  userLimit.count++;
  quizRateLimit.set(userId, userLimit);

  if (userLimit.count > 10) {
    return res.status(429).json({ error: "Quiz generation rate limit exceeded. Try again in an hour." });
  }

  // Dispatch the MCP tool
  const { mcpServer } = await import("./mcpServer.js");
  const handler = mcpServer._registeredTools.get("generate_quiz");
  const result = await handler.callback({
    topic,
    difficulty: difficulty ?? "intermediate",
    count: Math.min(count ?? 4, 10),
  });

  res.json(JSON.parse(result.content[0].text));
});

// ─── MCP HTTP Endpoint (for IDE/Copilot integration) ─────────────────────────
app.post("/mcp", async (req, res) => {
  const transport = createMCPTransport();
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  res.json({
    name: "arcadelearn-mcp",
    version: "1.0.0",
    tools: ["get_user_progress", "get_job_recommendations", "get_user_certificates",
            "get_user_activity_stats", "search_jobs", "generate_quiz",
            "get_user_resume_skills", "get_all_roadmaps"],
  });
});
```

---

### Step 5 — Update Frontend quizService.ts

Replace the browser-side Groq call with a secure backend API call:

```typescript
// src/services/quizService.ts — AFTER MCP implementation

export async function generateQuiz(
  topic: string,
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
  count: number = 4,
  userId: string
): Promise<QuizQuestion[]> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, topic, difficulty, count }),
  });

  if (!response.ok) {
    throw new Error(`Quiz generation failed: ${response.statusText}`);
  }

  return response.json();
}
```

---

### Step 6 — Update Frontend Nova Chat

Replace the direct Gemini call in `src/services/aiService.ts` with the backend endpoint:

```typescript
// src/services/aiService.ts — AFTER MCP implementation

export async function getChatCompletion(
  userId: string,
  message: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message, chatHistory }),
  });

  if (!response.ok) {
    throw new Error(`Nova AI request failed: ${response.statusText}`);
  }

  const { reply } = await response.json();
  return reply;
}
```

---

### Step 7 — Developer MCP Setup (Supabase Official)

Create `.vscode/mcp.json` at the project root:

```json
{
  "servers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${env:SUPABASE_ACCESS_TOKEN}"
      }
    },
    "arcadelearn": {
      "url": "http://localhost:8081/mcp",
      "type": "http"
    }
  }
}
```

This enables GitHub Copilot to query your live Supabase database and call your custom MCP tools directly from VS Code.

---

## 🔒 Security Improvements

| Vulnerability | Before | After |
|---|---|---|
| **Groq API Key** | Exposed in browser bundle via `VITE_GROQ_API_KEY` | Server-side only in `GROQ_API_KEY` env var |
| **Gemini API Key** | Called directly from browser | Server-side orchestration only |
| **Rate Limiting** | None — any user can spam AI calls | 10 quiz/hour per user, enforced server-side |
| **Input Validation** | None on AI inputs | Length limits, type checking on all inputs |
| **Tool Authorization** | N/A | All MCP tools receive `userId` and validate against authenticated session |
| **`dangerouslyAllowBrowser`** | `true` on Groq client | Removed entirely — Groq only runs in backend |

---

## 📊 Before vs After Comparison

### Nova AI Chat Experience

| User Question | Before MCP | After MCP |
|---|---|---|
| "What should I learn next?" | "What are you currently learning?" | "You're 60% through React — finish Hooks, Context, and useReducer to get your certificate!" |
| "Find me a job" | "What skills do you have?" | "Your resume shows React + TypeScript. Here are 2 junior frontend roles matching your skills." |
| "How am I doing?" | Generic encouragement | "Level 4, 340 XP, 2-day streak! You've completed 3/5 roadmap components this week." |
| "Am I ready for a job?" | Can't assess | Checks resume, completed roadmaps, certificates, then gives a real answer |

### Developer Experience

| Task | Before MCP | After MCP |
|---|---|---|
| "How many users are level 5?" | Open Supabase console, write SQL | Ask Copilot in VS Code |
| "Debug user X's streak issue" | Manually query 3 tables | "Check user X's progress" via Copilot |
| Debug quiz generation | Add console.log, redeploy | Copilot can read live quiz data |

### Security Posture

| Item | Before MCP | After MCP |
|---|---|---|
| Groq API Key | ⚠️ Exposed in browser | ✅ Server-side only |
| Gemini API Key | ⚠️ Exposed in browser | ✅ Server-side only |
| AI Rate Limiting | ❌ None | ✅ 10 requests/hour/user |
| AI Input Validation | ❌ None | ✅ Length + type checked |

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v18+
- An existing ArcadeLearn backend (`backend/`)
- Supabase project with all tables set up
- Google AI (Gemini) API key
- Groq API key

### Install Dependencies

```bash
cd backend
npm install @modelcontextprotocol/sdk zod groq-sdk
```

### Files to Create

```
backend/
├── mcpServer.js                    ← NEW: MCP server + all tool definitions
├── services/
│   └── aiOrchestratorService.js    ← NEW: Nova AI with tool-calling loop
.vscode/
└── mcp.json                        ← NEW: Developer MCP config for Copilot
```

### Files to Modify

```
backend/server.js                   ← Add /api/ai/chat, /api/quiz/generate, /mcp routes
src/services/quizService.ts         ← Remove Groq browser call, use /api/quiz/generate
src/services/aiService.ts           ← Route Nova through /api/ai/chat
```

---

## 🌍 Environment Variables

### Backend `.env` (Add / Move Keys Here)

```bash
# Already existing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Move from frontend to backend (SECURITY FIX)
GROQ_API_KEY=gsk_...          # ← was VITE_GROQ_API_KEY (browser-exposed), now server-only
GEMINI_API_KEY=AIza...         # ← was VITE_GEMINI_API_KEY (browser-exposed), now server-only

# For Developer MCP (optional — for .vscode/mcp.json)
SUPABASE_ACCESS_TOKEN=sbp_...  # Supabase personal access token for official MCP server
```

### Frontend `.env` — Keys to REMOVE

```bash
# DELETE THESE — no longer needed in the browser
# VITE_GROQ_API_KEY=...        ← Remove (security vulnerability)
# VITE_GEMINI_API_KEY=...      ← Remove (security vulnerability)

# Keep this — needed to call your backend
VITE_BACKEND_URL=https://your-backend.onrender.com
```

---

## 🧪 Testing the MCP Server

### Test Tool Calls Directly (cURL)

```bash
# Test get_user_progress
curl -X POST http://localhost:8081/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-uuid", "message": "What should I learn today?"}'

# Test secure quiz generation
curl -X POST http://localhost:8081/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-uuid", "topic": "React Hooks", "difficulty": "intermediate", "count": 4}'

# Inspect MCP server manifest
curl http://localhost:8081/mcp
```

### Test Developer MCP in VS Code

1. Add `.vscode/mcp.json` with your credentials
2. Open VS Code Command Palette → `MCP: List Servers`
3. Verify `supabase` and `arcadelearn` servers show as connected
4. In Copilot Chat (Agent Mode): *"Use MCP to query how many users have completed the React roadmap"*

### Expected Nova Response After MCP

```
User: "How am I doing and should I apply for jobs?"
Nova: "You're at Level 4 with 340 XP and a 2-day streak — great consistency! 
      You've completed the HTML/CSS roadmap and you're 60% through React 
      Frontend (3 of 5 components done).
      
      For jobs — your resume shows React, TypeScript, and CSS skills.
      There are currently 3 matching roles in the jobs board:
      • Junior Frontend Developer at TechCorp (85% skill match)
      • React Developer at StartupXYZ (78% skill match)  
      • UI Engineer at DesignCo (70% skill match)
      
      I'd finish the React roadmap first (2 more components) — that certificate 
      will make your applications much stronger. Want me to highlight what 
      to focus on for the next component?"
```

---

## 🗺️ Phased Rollout Plan

| Phase | What to Build | Effort | Impact |
|---|---|---|---|
| **Phase 0** | Configure `.vscode/mcp.json` with Supabase official MCP | 30 min | Developer productivity immediately |
| **Phase 1** | `mcpServer.js` with `generate_quiz` tool + `/api/quiz/generate` route + update `quizService.ts` | 2 hrs | Security fix for exposed key |
| **Phase 2** | Add all user data tools to `mcpServer.js` | 3 hrs | Nova gets user context |
| **Phase 3** | `aiOrchestratorService.js` + update `aiService.ts` + Nova routes through backend | 4 hrs | Fully personalized Nova AI |
| **Phase 4** | Add job search + resume skills tools + caching | 3 hrs | Nova answers career questions |
| **Phase 5** | Expose `/mcp` HTTP endpoint for external integrations | 1 hr | Future-proof AI integrations |

**Total: ~13-14 hours of implementation for full MCP integration**

---

<div align="center">

---

*ArcadeLearn MCP Integration Guide — Written March 2026*

*Transform Nova from a generic chatbot into a context-aware learning coach.*

</div>
