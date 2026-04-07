## Plan: Adaptive Roadmap Cutover

Implement your updated architecture from Dynamic_Roadmap.md line 338 onward in a low-risk sequence: database foundation first, backend contracts second, frontend API cutover behind fallback flags third, then staged rollout with strict verification.

### Master plan status
- This file is the single source of truth for implementation scope, sequencing, and acceptance criteria.
- All new requirements must be added here before implementation begins for that requirement.
- If a requirement conflicts with an existing rule in this file, update the rule first, then implement.

### Implementation operating rules
1. Sequence discipline
- Execute phases in order unless explicitly marked parallel-safe in this file.
- Do not skip schema and contract validation before frontend integration.

2. Change-control protocol
- For every newly proposed idea, classify as: implement-now, implement-later, or not-feasible-currently.
- Record the reason and impacted sections before coding.

3. Definition of done per step
- Code implemented.
- Endpoint/schema/type contracts aligned.
- Verification checks for that step passed.
- No regression in fallback behavior.

4. Rollback readiness
- Feature flags must remain available until rollout reaches 100% and verification stays stable.
- Any critical consistency or auth issue triggers immediate rollback to fallback mode.

5. Tracking format
- Maintain each step state as: not-started, in-progress, blocked, done.
- Blocked items require blocker reason and next action.

### Steps
1. Freeze API contracts and node-state semantics.
Define exact response/request shapes for:
- GET user roadmap graph
- GET module by id
- POST topic completion
- POST quiz attempt
Include mandatory progression fields:
- locked
- unlockRequirements
- remediationRequired
- remediationTags
Dependency: none.

2. Add migration safety guardrails.
Introduce rollout flags so static roadmap remains default until API path is stable.
Dependency: step 1.

3. Create roadmap/module/topic catalog tables.
Design normalized content source for sidebar and graph generation.
Dependency: step 1.

4. Create topic-level user progress table.
Store attempts, best score, completion, time spent, last activity.
Dependency: step 3.

5. Add optional insights storage.
Store weak areas and pace summaries, but keep adaptation rule-based first.
Dependency: step 4.
Parallel: can run with step 6.

6. Add RLS, uniqueness, and idempotency constraints.
Prevent duplicate completion/attempt writes and enforce user isolation.
Dependency: steps 3 and 4.

7. Seed catalog from current static roadmap data.
Backfill module/topic records from existing node details and configs.
Dependency: steps 3 and 6.

8. Implement backend module service.
Serve module payload for sidebar by module id.
Dependency: steps 3 and 7.

9. Implement backend roadmap graph service.
Generate nodes and edges from catalog + user progress + adaptation rules.
Enforce strict progression: all roadmap nodes remain locked until predecessor module completion criteria are satisfied.
Dependency: steps 4 and 7.
Parallel: can run with step 8.

10. Implement adaptation service (rule engine v1).
Start with deterministic rules:
- low score -> weak area
- repeated failure -> revision/practice insertion
- sustained high score -> optional skip
Never replace a blocked node silently; attach visible tagged remediation nodes and gate unlock on remediation completion.
Dependency: steps 4 and 9.

11. Add backend endpoints.
Wire routes in server for graph fetch, module fetch, topic completion, and quiz attempt submission.
Dependency: steps 8, 9, 10.

12. Integrate scoring and activity signals.
Reuse existing score/event and activity patterns to feed adaptation.
All completion/adaptation calculations must be filtered by current roadmap_id; do not use global stars, total score, or cross-roadmap aggregates.
Dependency: step 11.

13. Add frontend roadmap API client and hook.
Fetch graph + user node states with robust loading/error handling.
Dependency: step 11.

14. Update roadmap flow page to API-first with static fallback.
If flag off or API fails, preserve current config-based behavior.
Dependency: step 13.

15. Update sidebar and quiz write path.
On module open -> fetch module payload.
On topic/quiz action -> submit progress update and refresh graph.
Dependency: steps 11 and 14.

16. Reconcile client state with backend truth.
Keep optimistic UI, but backend node state is authoritative after refresh.
Dependency: step 15.

17. Run verification gates.
Schema, auth, idempotency, API contracts, frontend regressions, performance.
Dependency: steps 11 to 16.

18. Rollout by cohorts with rollback switch.
Internal -> 10% -> 50% -> 100%, stop on error/latency/consistency threshold breaches.
Dependency: step 17.

### Mandatory progression and remediation behavior
1. Initial lock state
- All roadmap nodes are locked by default.
- Only the current actionable start node is unlocked for first interaction.

2. Unlock rule
- A parent node is considered complete only after all required sub-nodes are completed.
- The next sequential node unlocks only after parent completion criteria are met.

3. Stuck/difficulty rule
- If a user is stuck on a node, do not replace the node invisibly.
- Keep the original node visible and attach additional remediation nodes.

4. Remediation node types and tags
- Allowed remediation tags: recommended-practice, recommended-assignment, recommended-revision.
- Remediation nodes must be visually distinguishable and auditable in the graph response.

5. Unlock gating with remediation
- When remediationRequired is true, the next primary node remains locked.
- Unlock is granted only after required remediation nodes are completed.

6. Transparency requirement
- Graph payload must include unlockReason and remediationReason so users understand why a node is locked or why extra nodes appeared.

7. Roadmap-scoped scoring rule
- Completion and remediation decisions are computed only from the active roadmap's module/topic attempts.
- Global gamification metrics (stars, overall points, total XP, cross-roadmap scores) are excluded from unlocking and adaptation decisions.
- Every decision query must be filtered by roadmap_id and module_id context.

### Signal tracking and diagnosis engine
1. Raw signals to track (roadmap-scoped)
- Performance signals: quiz score, attempts per question, accuracy percentage.
- Time signals: time spent versus expected, idle time, drop-offs.
- Interaction signals: re-reading content, skipping topics, clicking hints.
- Progress signals: completion rate, drop-off points.

2. Derived diagnosis outputs
- conceptNotUnderstood
- cannotApplyConcept
- slowLearner
- fastLearner
- inconsistentLearner
- disengaged
- overconfidence

3. Diagnosis engine rules and actions
- Case 1: Concept not understood.
	Detection: score < 50%, high time spent, multiple re-reads.
	Meaning: user is confused, not only weak.
	Action: add revision module, simplified explanation, and visual/video resources.

- Case 2: Cannot solve problems.
	Detection: score between 50% and 70%, fails application questions, multiple attempts.
	Meaning: concept known but not applied.
	Action: add practice module, guided problem-solving, and step-by-step examples.

- Case 3: Slow learner.
	Detection: time taken > 1.5x expected and eventually completes correctly.
	Meaning: needs more time, not weak.
	Action: extend timeline, reduce daily load, and add optional reinforcement.

- Case 4: Fast learner.
	Detection: score > 85% and time taken < expected.
	Meaning: user is ahead of roadmap pace.
	Action: skip only optional basics, add advanced topics and project nodes.

- Case 5: Inconsistent learner.
	Detection: alternating good and poor scores with irregular activity.
	Meaning: consistency issue.
	Action: add checkpoint modules, mini assessments, and reminder hooks (future feature).

- Case 6: Drop-off or disengagement.
	Detection: stops mid-module or long inactivity.
	Meaning: overwhelmed or bored.
	Action: add quick-win easy nodes, interactive content, and temporary difficulty reduction.

- Case 7: Overconfidence.
	Detection: skips content and then fails quizzes on skipped areas.
	Meaning: hidden weakness despite confidence.
	Action: enforce assessment gates and mandatory quizzes before unlock.

4. Engine constraints
- Do not silently replace original nodes; attach remediation nodes with visible tags.
- Unlock decisions remain roadmap-scoped and node-sequential.
- Every diagnosis result must include reason fields in graph payload for transparency.

### Relevant files
- backend/server.js — Add adaptive roadmap/module/progress endpoints and auth checks.
- backend/services/userProgressService.js — Extend from aggregate to topic-level compatibility.
- backend/services/scoreV2Service.js — Reuse attempt idempotency and score summarization.
- backend/services/surveyService.js — Reuse user profile/time/skill signals.
- backend/services/userActivityService.js — Reuse pace and activity metrics.
- backend/mcpServer.js — Reuse roadmap/user context extraction patterns where useful.
- database/score_v2_phase2_schema.sql — Reference pattern for constraints, RLS, indexes.
- database/survey_schema.sql — Reference pattern for profile/latest-response semantics.
- database/activity_tracking_schema.sql — Reference for activity-derived adaptation signals.
- database/resume_schema.sql — Resume signals for personalization.
- src/components/roadmap/GenericRoadmapFlowPage.tsx — API-first graph hydration with fallback.
- src/components/roadmap/NodeDetailSidebar.tsx — Dynamic module payload rendering.
- src/components/roadmap/QuizModal.tsx — Persisted quiz attempt and completion updates.
- src/services/quizService.ts — Extend generate path with submit path.
- src/contexts/GameTestContext.tsx — Transition-state sync during cutover.
- src/types/roadmapFlow.ts — Extend node/graph contract types.
- src/data/allNodeDetails.ts — Source for initial catalog seeding.
- src/data/frontendRoadmapConfig.ts — Keep as fallback until full cutover.
- src/data/backendRoadmapConfig.ts — Keep as fallback until full cutover.
- src/data/fullstackMernRoadmapConfig.ts — Keep as fallback until full cutover.

### Verification
1. Schema integrity check: new tables, indexes, constraints, policies created and queryable.
2. Seed integrity check: expected roadmap/module/topic counts and relationships.
3. Auth check: user cannot read/write another user’s roadmap progress.
4. Idempotency check: repeated topic/quiz submissions do not duplicate awards/completions.
5. API contract check: payload shape matches frozen contract for all new endpoints.
6. Frontend regression check: static fallback and API path both render correctly.
7. Consistency check: node states remain correct after reload and cross-device sync.
8. Performance check: roadmap graph and progress-write latency within thresholds under concurrent load.
9. Progression check: next node does not unlock until required sub-nodes complete.
10. Remediation check: stuck-node flow shows tagged additional nodes and does not silently replace the original node.
11. Scope check: adaptation decisions for one roadmap do not change because of performance in other roadmaps.

### Decisions
- Use Supabase PostgreSQL as primary store (no datastore migration in this scope).
- Rule-based adaptation first; AI optimization later.
- Do not store full per-user roadmap JSON blob; derive graph from catalog + user state.
- Keep static configs as a controlled fallback until rollout completion.
- Use roadmap-scoped mastery as the only decision input for node completion/unlock/remediation inside that roadmap.
