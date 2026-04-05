# OpenRouter Migration - Phase 2 Provider Layer

## Scope
Phase 2 builds the shared OpenRouter provider layer and applies it only to the already-migrated roadmap doubt flow.

Out of scope for Phase 2:
- Chat endpoint provider cutover (`/api/ai/chat`)
- Survey roadmap generation provider cutover (`/api/user/:userId/ai-roadmap`)
- Gemini dependency removal
- Schema/backfill changes

## Phase 2 Checklist
- [x] Define Phase 2 scope and boundaries
- [x] Create shared OpenRouter provider module
- [x] Refactor roadmap doubt service to shared provider
- [x] Remove roadmap Groq fallback path
- [x] Add Phase 2 provider guardrail script
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 3

## Implementation Notes

### Added shared provider
- New file: `backend/services/openRouterProvider.js`
- Exposes:
  - `openRouterProvider.chatCompletion(...)`
  - `mapOpenRouterError(...)`

### Refactored roadmap doubt service
- Updated: `backend/services/roadmapDoubtService.js`
- Now imports shared provider module
- Removed direct Groq dependency and fallback branch for roadmap doubt endpoint
- Returns OpenRouter-only provider result for this endpoint

### Added guardrail script
- New file: `backend/scripts/phase2-provider-check.mjs`
- New backend command: `npm --prefix backend run phase2:provider`
- Checks:
  - provider module exists and exports expected symbols
  - roadmap doubt service imports shared provider
  - roadmap doubt service no longer imports Groq
  - roadmap doubt service has no Groq provider branch
  - roadmap doubt route still exists in server

## Rollback Checkpoint (Phase 2)
Commit only Phase 2 artifacts and keep hash:

```bash
git add backend/services/openRouterProvider.js backend/services/roadmapDoubtService.js backend/scripts/phase2-provider-check.mjs backend/package.json OPENROUTER_MIGRATION_PHASE2.md
git commit -m "phase2 shared openrouter provider layer"
```

Rollback command:

```bash
git revert <phase2-commit-hash>
```

## Exit Criteria
- Phase 2 guardrail script passes
- Backend syntax checks pass for changed files
- Roadmap doubt flow still functional
- No chat/survey provider cutover performed in this phase

## Validation Results
- `npm run phase2:provider` (from `backend/`) - PASS
- `node --check services/openRouterProvider.js` - PASS
- `node --check services/roadmapDoubtService.js` - PASS
- VS Code diagnostics for changed files - no errors
