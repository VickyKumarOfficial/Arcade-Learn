# OpenRouter Migration - Phase 3 Chat Cutover

## Scope
Phase 3 migrates the active backend chat orchestrator (`/api/ai/chat`) to the shared OpenRouter provider.

Out of scope for Phase 3:
- Survey roadmap generation cutover (`/api/user/:userId/ai-roadmap`)
- Gemini dependency removal from survey service
- Schema/backfill changes
- Frontend route behavior changes

## Phase 3 Checklist
- [x] Define Phase 3 scope and boundaries
- [x] Refactor active chat orchestrator to shared OpenRouter provider
- [x] Remove Gemini/Groq fallback logic from active chat orchestrator
- [x] Add Phase 3 chat guardrail script
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 4

## Implementation Notes

### Chat orchestrator cutover
- Updated: `backend/services/aiOrchestratorService.fallback.js`
- Migrated active chat path from Gemini+Groq fallback to OpenRouter-only provider usage via shared module
- Preserved response contract shape (`success`, `response`, and error with `statusCode`)
- Kept server route and auth/grounding flow unchanged in `backend/server.js`

### New/updated environment knobs for chat
- `OPENROUTER_CHAT_MODEL`
- `OPENROUTER_CHAT_MAX_TOKENS`
- `OPENROUTER_CHAT_TEMPERATURE`

Fallback behavior:
- `OPENROUTER_CHAT_MODEL` falls back to `OPENROUTER_MODEL`, then `OPENROUTER_ROADMAP_MODEL`, then Nemotron default.

### Added guardrail script
- New file: `backend/scripts/phase3-chat-check.mjs`
- New backend command: `npm run phase3:chat` (run from `backend/`)
- Checks:
  - chat route still exists
  - server still imports active chat orchestrator entrypoint
  - chat orchestrator imports shared OpenRouter provider and calls it
  - chat orchestrator has no Gemini/Groq SDK imports
  - chat orchestrator has no GEMINI/GROQ env references

## Rollback Checkpoint (Phase 3)
Commit only Phase 3 artifacts and keep hash:

```bash
git add backend/services/aiOrchestratorService.fallback.js backend/scripts/phase3-chat-check.mjs backend/package.json OPENROUTER_MIGRATION_PHASE2.md OPENROUTER_MIGRATION_PHASE3.md
git commit -m "phase3 cut over ai chat to shared openrouter provider"
```

Rollback command:

```bash
git revert <phase3-commit-hash>
```

## Exit Criteria
- Phase 3 guardrail script passes
- Backend syntax checks pass for changed files
- `/api/ai/chat` contract remains stable
- Survey AI roadmap route not migrated in this phase

## Validation Results
- `npm run phase3:chat` (from `backend/`) - PASS
- `node --check services/aiOrchestratorService.fallback.js` - PASS
- `node --check scripts/phase3-chat-check.mjs` - PASS
- `node --check services/openRouterProvider.js` - PASS
- VS Code diagnostics for changed files - no errors
