# OpenRouter Migration - Phase 6 Deployment Hardening

## Scope
Phase 6 aligns deployment configuration and deployment documentation with the new OpenRouter-first runtime architecture.

Out of scope for Phase 6:
- MCP quiz provider migration (still Groq-based)
- Frontend runtime refactors
- Infrastructure provider changes beyond Render config alignment

## Phase 6 Checklist
- [x] Define Phase 6 scope and boundaries
- [x] Update `render.yaml` with required AI runtime environment variables
- [x] Update Render deployment guide to match runtime requirements
- [x] Add Phase 6 deploy-config guardrail script
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 7

## Implementation Notes

### Render blueprint updates
- Updated file: `render.yaml`
- Added environment variable entries for:
  - Groq key (required for MCP quiz generation)
  - OpenRouter key/base URL
  - Shared/default OpenRouter model values
  - Chat and survey OpenRouter tuning variables
  - OpenRouter app attribution fields

### Deployment guide updates
- Updated file: `RENDER_DEPLOYMENT.md`
- Added explicit AI env variable block for Render setup
- Clarified that AI provider secrets are backend-only
- Added note to avoid frontend `VITE_GEMINI_API_KEY` usage

### Guardrail script
- New file: `backend/scripts/phase6-deploy-config-check.mjs`
- New command: `npm run phase6:deploy-config` (run from `backend/`)
- Checks:
  - `render.yaml` includes required OpenRouter/Groq keys
  - `render.yaml` does not include `GEMINI_API_KEY`
  - `RENDER_DEPLOYMENT.md` includes OpenRouter/Groq setup guidance
  - `RENDER_DEPLOYMENT.md` does not recommend `VITE_GEMINI_API_KEY`

## Rollback Checkpoint (Phase 6)
Commit only Phase 6 artifacts and keep hash:

```bash
git add render.yaml RENDER_DEPLOYMENT.md backend/scripts/phase6-deploy-config-check.mjs backend/package.json OPENROUTER_MIGRATION_PHASE5.md OPENROUTER_MIGRATION_PHASE6.md
git commit -m "phase6 align render deployment config with openrouter runtime"
```

Rollback command:

```bash
git revert <phase6-commit-hash>
```

## Exit Criteria
- Phase 6 deploy-config guardrail script passes
- Backend syntax checks pass for changed scripts
- Render config contains required AI runtime keys
- Deployment guide matches runtime architecture

## Validation Results
- `npm run phase6:deploy-config` (from `backend/`) - PASS
- `node --check scripts/phase6-deploy-config-check.mjs` - PASS
- VS Code diagnostics for changed files - no errors
