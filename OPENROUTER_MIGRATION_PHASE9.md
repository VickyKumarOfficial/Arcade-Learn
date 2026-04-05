# OpenRouter Migration - Phase 9 Groq Decommission Cleanup

## Scope
Phase 9 removes stale Groq deployment/config guidance and aligns active contracts with the OpenRouter-only runtime established by Phase 8.

Out of scope for Phase 9:
- Historical migration runbooks from earlier phases
- Full rewrite of long-form architecture narrative docs
- Frontend feature changes unrelated to provider contract typing

## Phase 9 Checklist
- [x] Define Phase 9 scope and boundaries
- [x] Mark Phase 8 sign-off and handoff
- [x] Remove stale GROQ deployment variable requirements
- [x] Align frontend roadmap doubt provider contract with OpenRouter-only backend behavior
- [x] Add Phase 9 groq-decommission guardrail script
- [x] Run validations and record results
- [x] User sign-off for moving to Phase 10

## Implementation Notes

### Deployment config cleanup
- Updated file: `render.yaml`
  - Removed `GROQ_API_KEY` declaration from Render blueprint env vars

### Deployment guide cleanup
- Updated file: `RENDER_DEPLOYMENT.md`
  - Removed `GROQ_API_KEY` assignment from required env block
  - Removed note claiming `GROQ_API_KEY` is required for MCP quiz generation

### Frontend contract alignment
- Updated file: `src/services/roadmapDoubtService.ts`
  - Narrowed `provider` response union to `'openrouter'`

### Guardrail script
- New file: `backend/scripts/phase9-groq-decommission-check.mjs`
- New command: `npm run phase9:groq-decommission` (run from `backend/`)
- Checks:
  - `render.yaml` does not declare `GROQ_API_KEY`
  - `RENDER_DEPLOYMENT.md` does not assign `GROQ_API_KEY`
  - backend package manifest no longer includes `groq-sdk`
  - MCP server has no Groq SDK import or `GROQ_API_KEY` reference
  - frontend roadmap doubt provider type does not include `groq`

## Rollback Checkpoint (Phase 9)
Commit only Phase 9 artifacts and keep hash:

```bash
git add OPENROUTER_MIGRATION_PHASE8.md OPENROUTER_MIGRATION_PHASE9.md render.yaml RENDER_DEPLOYMENT.md src/services/roadmapDoubtService.ts backend/scripts/phase9-groq-decommission-check.mjs backend/package.json
git commit -m "phase9 remove stale groq deployment requirements"
```

Rollback command:

```bash
git revert <phase9-commit-hash>
```

## Exit Criteria
- Phase 9 groq-decommission guardrail script passes
- Backend syntax checks pass for changed scripts
- Deployment config/docs no longer require Groq runtime secrets

## Validation Results
- `npm run phase9:groq-decommission` (from `backend/`) - PASS
- `node --check scripts/phase9-groq-decommission-check.mjs` - PASS
- VS Code diagnostics for changed files - no errors