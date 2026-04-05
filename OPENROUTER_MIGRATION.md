# OpenRouter Migration Summary

## Purpose
This file is the single source of truth for the completed AI provider migration to OpenRouter.

## Current Runtime Status
As of 2026-04-05, backend AI paths are OpenRouter-based:
- `POST /api/ai/chat` -> shared OpenRouter provider
- `POST /api/roadmap/doubt` -> shared OpenRouter provider
- `POST /api/user/:userId/ai-roadmap` -> shared OpenRouter provider
- `POST /api/quiz/generate` -> MCP quiz path via shared OpenRouter provider

## Migration Outcome by Phase
1. Phase 1: Baseline contract capture and guardrails
2. Phase 2: Shared provider abstraction added and roadmap doubt aligned
3. Phase 3: Chat route cut over to shared provider
4. Phase 4: Survey roadmap generation cut over
5. Phase 5: Gemini runtime/dependency cleanup
6. Phase 6: Deployment hardening and env guidance alignment
7. Phase 7: Documentation consistency pass
8. Phase 8: MCP quiz provider cutover from Groq to OpenRouter
9. Phase 9: Groq deployment guidance decommission cleanup
10. Phase 10: Post-cutover guardrail/doc refresh

## Validation Commands
Run from repository root unless noted:

```bash
npm run build
npm --prefix backend run openrouter:runtime-check
npm --prefix backend run openrouter:config-check
npm --prefix backend run openrouter:check
```

## Deployment Variables (Backend)
Keep these configured for production/runtime:
- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MODEL`
- `OPENROUTER_CHAT_MODEL`
- `OPENROUTER_SURVEY_MODEL`
- `OPENROUTER_QUIZ_MODEL`
- Optional tuning values for chat/survey/quiz max tokens and temperature

Reference deployment docs:
- `render.yaml`
- `RENDER_DEPLOYMENT.md`

## Known Operational Notes
- Chat route is auth-gated and returns 401 without a bearer token.
- Roadmap doubt route currently allows unauthenticated usage.
- Survey AI roadmap endpoint enforces survey preconditions before generating output.

## Remaining Cleanup Items (Non-Blocking)
- Ensure MCP version strings are synchronized across:
  - `backend/server.js`
  - `backend/mcpServer.js`
- If needed, add auth gating policy alignment for roadmap doubt and survey routes.
