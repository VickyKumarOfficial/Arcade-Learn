# OpenRouter Migration - Phase 8 MCP Quiz Provider Cutover

## Scope
Phase 8 migrates MCP quiz generation (`generate_quiz` tool and `/api/quiz/generate` route path) from Groq SDK usage to the shared OpenRouter provider.

Out of scope for Phase 8:
- Frontend quiz UX changes
- Deployment blueprint/env pruning
- Non-quiz MCP tool behavior changes

## Phase 8 Checklist
- [x] Define Phase 8 scope and boundaries
- [x] Mark Phase 7 sign-off and handoff
- [x] Refactor MCP quiz handler to use shared OpenRouter provider
- [x] Remove Groq SDK dependency from backend package manifest
- [x] Add Phase 8 quiz-provider guardrail script
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 9

## Implementation Notes

### MCP quiz cutover
- Updated file: `backend/mcpServer.js`
- Replaced direct Groq client call with `openRouterProvider.chatCompletion(...)`
- Added quiz-specific OpenRouter tuning variables:
  - `OPENROUTER_QUIZ_MODEL`
  - `OPENROUTER_QUIZ_MAX_TOKENS`
  - `OPENROUTER_QUIZ_TEMPERATURE`
- Added robust JSON extraction logic for quiz payload parsing
- Preserved quiz response contract (`{ success, questions, cached }`)

### API error mapping behavior
- Updated file: `backend/server.js`
- `/api/quiz/generate` now propagates mapped provider `statusCode` where available (for example, 429/401)

### Dependency and env template updates
- Updated file: `backend/package.json`
  - Removed `groq-sdk`
  - Added `phase8:quiz-provider` script
- Updated file: `backend/.env.example`
  - Replaced Groq fallback template with OpenRouter quiz configuration template
- Updated file: `.env.example`
  - Added OpenRouter quiz tuning variable examples

### Guardrail script
- New file: `backend/scripts/phase8-quiz-provider-check.mjs`
- New command: `npm run phase8:quiz-provider` (run from `backend/`)
- Checks:
  - quiz route and MCP tool registration still exist
  - MCP quiz path uses shared OpenRouter provider
  - MCP quiz path has no Groq SDK import or `GROQ_API_KEY` reference
  - backend package manifest no longer includes `groq-sdk`

## Rollback Checkpoint (Phase 8)
Commit only Phase 8 artifacts and keep hash:

```bash
git add OPENROUTER_MIGRATION_PHASE7.md OPENROUTER_MIGRATION_PHASE8.md backend/mcpServer.js backend/server.js backend/scripts/phase8-quiz-provider-check.mjs backend/package.json backend/package-lock.json backend/.env.example .env.example
git commit -m "phase8 migrate mcp quiz provider to openrouter"
```

Rollback command:

```bash
git revert <phase8-commit-hash>
```

## Exit Criteria
- Phase 8 quiz-provider guardrail script passes
- Backend syntax checks pass for changed files
- MCP quiz generation no longer depends on Groq SDK

## Validation Results
- `npm run phase8:quiz-provider` (from `backend/`) - PASS
- `node --check mcpServer.js` - PASS
- `node --check scripts/phase8-quiz-provider-check.mjs` - PASS
- VS Code diagnostics for changed files - no errors