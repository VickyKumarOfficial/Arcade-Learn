# OpenRouter Migration - Phase 1 Baseline

## Scope
Phase 1 is only for baseline capture and guardrails. No provider replacement happens in this phase.

## Phase 1 Checklist
- [x] Lock migration scope to baseline-only changes
- [x] Capture current AI endpoint contracts from backend source
- [x] Add repeatable baseline check script
- [x] Execute baseline script and record result
- [x] Create rollback checkpoint note for this phase
- [ ] User sign-off for moving to Phase 2

## Baseline Contracts (Current)

### 1) Chat endpoint
- Route: `POST /api/ai/chat`
- Source: `backend/server.js`
- Request expectations:
  - `messages` must be a non-empty array
  - message roles allowed: `user`, `assistant`
  - message content max length: 6000 chars
  - bearer auth required
- Response contract:
  - success path: `{ success: true, response: string }`
  - failure path: `{ success: false, error: string, statusCode?: number }`

### 2) Roadmap doubt endpoint
- Route: `POST /api/roadmap/doubt`
- Source: `backend/server.js`
- Request expectations:
  - `question` required, 2..3000 chars
  - optional context fields: `roadmapKey`, `roadmapTitle`, `activeTopic`, `activeTopicDescription`
  - optional `history` array, sanitized to recent items
- Response contract:
  - success path: `{ success: true, provider: 'openrouter' | 'groq', response: string }`
  - failure path: `{ success: false, error: string, statusCode?: number }`

### 3) Survey AI roadmap endpoint
- Route: `POST /api/user/:userId/ai-roadmap`
- Source: `backend/server.js`, `backend/services/surveyService.js`
- Current provider marker: `GEMINI_API_KEY`
- Response contract:
  - success path returns recommendation payload via `surveyService.generateAIRoadmap`
  - failure path returns `{ error: string }`

## Guardrail Script Added
- Script file: `backend/scripts/phase1-baseline-check.mjs`
- NPM command: `npm --prefix backend run phase1:baseline`
- Purpose:
  - verify route markers and provider markers before migration starts
  - fail fast if baseline assumptions change unexpectedly

### Baseline Script Result
Last execution status: **PASS**

Output summary:
- PASS `route-ai-chat`
- PASS `route-roadmap-doubt`
- PASS `route-ai-roadmap`
- PASS `chat-orchestrator-source`
- PASS `survey-gemini-reference`
- PASS `chat-gemini-reference`
- PASS `roadmap-openrouter-reference`
- PASS `schema-ai-model-version`

## Rollback Checkpoint (Phase 1)
Before Phase 2 begins, create a dedicated commit for this phase and keep the hash:

```bash
git add OPENROUTER_MIGRATION_PHASE1.md backend/scripts/phase1-baseline-check.mjs backend/package.json
git commit -m "phase1 baseline contracts and guardrails"
```

If rollback is needed later:

```bash
git revert <phase1-commit-hash>
```

## Exit Criteria
- Baseline check script passes
- No runtime AI behavior changed
- Phase 1 artifacts are committed and ready for sign-off
