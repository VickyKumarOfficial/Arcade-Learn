# OpenRouter Migration - Phase 5 Gemini Cleanup

## Scope
Phase 5 performs runtime cleanup after OpenRouter cutover by removing legacy Gemini code paths and Gemini package dependencies.

Out of scope for Phase 5:
- Groq removal (still used by MCP quiz generation path)
- Frontend architecture refactors unrelated to AI provider migration
- Database schema changes

## Phase 5 Checklist
- [x] Define Phase 5 scope and boundaries
- [x] Remove legacy Gemini runtime service file
- [x] Remove Gemini package dependencies from backend and root package manifests
- [x] Add Phase 5 no-gemini runtime guardrail script
- [x] Update migration/public docs for OpenRouter-only runtime guidance
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 6

## Implementation Notes

### Runtime cleanup
- Deleted unused file: `backend/services/aiOrchestratorService.js`
- Active chat route remains wired to `backend/services/aiOrchestratorService.fallback.js` (already OpenRouter-based)

### Dependency cleanup
- Removed backend dependency: `@google/generative-ai`
- Removed root dependencies:
  - `@google/genai`
  - `@google/generative-ai`

### Guardrail script
- New file: `backend/scripts/phase5-no-gemini-check.mjs`
- New command: `npm run phase5:no-gemini` (run from `backend/`)
- Checks:
  - legacy Gemini service file is removed
  - backend/root package.json no longer include Gemini SDK dependencies
  - chat and survey AI routes still exist
  - no Gemini runtime references remain in backend services
  - `.env.example` no longer recommends `GEMINI_API_KEY`

### Docs/config updates
- Updated `.env.example` to remove `GEMINI_API_KEY` template hint
- Updated README provider references to OpenRouter-focused wording

## Rollback Checkpoint (Phase 5)
Commit only Phase 5 artifacts and keep hash:

```bash
git add backend/services/aiOrchestratorService.js backend/scripts/phase5-no-gemini-check.mjs backend/package.json backend/package-lock.json package.json package-lock.json .env.example README.md OPENROUTER_MIGRATION_PHASE4.md OPENROUTER_MIGRATION_PHASE5.md
git commit -m "phase5 remove gemini runtime remnants and dependencies"
```

Rollback command:

```bash
git revert <phase5-commit-hash>
```

## Exit Criteria
- Phase 5 no-gemini guardrail script passes
- Backend syntax checks pass for changed files
- Runtime chat and survey routes remain present
- No Gemini dependencies remain in root/backend package manifests

## Validation Results
- `npm run phase5:no-gemini` (from `backend/`) - PASS
- `node --check services/aiOrchestratorService.fallback.js` - PASS
- `node --check services/surveyService.js` - PASS
- `node --check scripts/phase5-no-gemini-check.mjs` - PASS
- `npm run build` (from project root) - PASS
- VS Code diagnostics for changed files - no errors
