# OpenRouter Migration - Phase 4 Survey Roadmap Cutover

## Scope
Phase 4 migrates survey-based AI roadmap generation (`/api/user/:userId/ai-roadmap`) to the shared OpenRouter provider.

Out of scope for Phase 4:
- Global Gemini package removal from backend/package.json
- Frontend URL fallback cleanup
- Schema/backfill migrations

## Phase 4 Checklist
- [x] Define Phase 4 scope and boundaries
- [x] Refactor survey roadmap generation to shared OpenRouter provider
- [x] Remove Gemini-specific logic from survey service
- [x] Preserve survey endpoint response contract
- [x] Add Phase 4 survey guardrail script
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 5

## Implementation Notes

### Survey service cutover
- Updated: `backend/services/surveyService.js`
- Replaced Gemini SDK usage with shared provider:
  - imports `openRouterProvider` and `mapOpenRouterError`
  - calls `openRouterProvider.chatCompletion(...)`
- Retained existing parsing and fallback behavior for AI roadmap JSON output

### Model/version handling
- Added survey-specific OpenRouter tuning variables:
  - `OPENROUTER_SURVEY_MODEL`
  - `OPENROUTER_SURVEY_MAX_TOKENS`
  - `OPENROUTER_SURVEY_TEMPERATURE`
  - `OPENROUTER_SURVEY_MODEL_VERSION`
- `ai_model_version` now uses `getSurveyModelVersion()` and is capped to 20 characters to stay schema-compatible.

### Added guardrail script
- New file: `backend/scripts/phase4-survey-check.mjs`
- New backend command: `npm run phase4:survey` (run from `backend/`)
- Checks:
  - survey AI roadmap route still exists
  - survey service imports shared OpenRouter provider and calls it
  - survey service has no Gemini SDK import
  - survey service has no GEMINI env reference
  - survey service no longer hardcodes gemini model version label

## Rollback Checkpoint (Phase 4)
Commit only Phase 4 artifacts and keep hash:

```bash
git add backend/services/surveyService.js backend/scripts/phase4-survey-check.mjs backend/package.json OPENROUTER_MIGRATION_PHASE3.md OPENROUTER_MIGRATION_PHASE4.md .env.example
git commit -m "phase4 cut over survey roadmap generation to openrouter provider"
```

Rollback command:

```bash
git revert <phase4-commit-hash>
```

## Exit Criteria
- Phase 4 guardrail script passes
- Backend syntax checks pass for changed files
- Survey roadmap endpoint remains operational with same response contract
- No schema migration performed in this phase

## Validation Results
- `npm run phase4:survey` (from `backend/`) - PASS
- `node --check services/surveyService.js` - PASS
- `node --check scripts/phase4-survey-check.mjs` - PASS
- `node --check services/openRouterProvider.js` - PASS
- VS Code diagnostics for changed files - no errors
