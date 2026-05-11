# DB + LLM Integration Implementation Guide (Step-by-step)

## Goal
Create or modify the DB schema, verify frontend inputs, wire backend + LLM/MCP handlers, and validate end-to-end data flow without conflicts.

## Workflow (high level)
1) Schema intake
2) Frontend input audit
3) SQL migration (RLS, indexes, triggers)
4) Backend wiring (services + endpoints)
5) LLM/MCP wiring
6) End-to-end test

## Rules
- Do not change the README file.
- After I give the table name and the cols then debate with me that it satisfies everything in terms of not conflicting with other tables, code, recommendation sys and in terms of scaling as well.
- After we come on to one finalizing point then I will say to implement it only and only start with the implementation!
- Keep tracker updates minimal and only mark the table name/status in the implementation list when possible.
- Do not proceed further if something is uncleared. Debate and proceed!

---

## Implementation status (table tracker)
Update this list as we finish each table.

Legend: [x] done, [ ] pending, [~] in progress

- [x] ai_chats (prompt/response model; migration executed)
- [x] ai_messages (prompt/response model; migration executed)
- [x] ai_feedback (kept as-is; no schema changes)
- [x] parsed_resumes (kept as-is; no schema changes)
- [x] jobs (kept as-is; no schema changes)
- [x] survey_questions (kept as-is; no schema changes)
- [x] profiles (kept as-is; no schema changes)
- [x] user_details (extended profile data; new table)
- [x] roadmaps (catalog table; migration created)
- [x] ai_chats_deleted (Shows the deleted chats)
- [x] ai_messages_deleted (Shows the deleted chat's prompt and response)
- [x] roadmap_nodes (roadmap node catalog; schema added)
- [x] user_roadmap_credit_summary

---

## Step 0: Schema intake (required)
Provide the tables and columns you want. Use this template per table:

```
TABLE: <table_name>
PRIMARY KEY: <pk>
COLUMNS:
- <col_name> <type> [null|not null] [default <value>] [unique] [fk <table>(<col>)]
- ...
INDEXES:
- <index_name> (<col>[, ...])
RLS POLICIES:
- <policy name>: <select|insert|update|delete> WHERE <condition>
NOTES:
- <optional notes>
```

Do this for every table you want to add or modify.

---

## Step 1: Frontend input audit (must happen before SQL)
For each column, confirm where the value comes from:

- UI field (form input)
- Derived in frontend code (e.g., computed state)
- Derived in backend (e.g., server timestamp)
- Derived by LLM/MCP (tool output)

Checklist:
- Map each column to a source before writing SQL.
- If a column has no source, flag it and add the UI/logic first.
- Confirm which fields are required vs optional at the UI level.

Deliverable for this step:
- A mapping table: table.column -> source -> endpoint -> notes.

---

## Step 2: SQL migration plan
Rules:
- Prefer additive changes and idempotent statements.
- Avoid destructive actions unless confirmed in writing.
- Use explicit defaults for server-generated values.
- Add `updated_at` trigger when tables are mutable.

Template for SQL changes:

```sql
BEGIN;

-- 1) Create/alter table
CREATE TABLE IF NOT EXISTS public.<table_name> (
  ...
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS <index_name> ON public.<table_name> (...);

-- 3) RLS
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;

-- 4) Policies (idempotent checks if needed)
-- CREATE POLICY ...

-- 5) Triggers (updated_at)
-- CREATE TRIGGER ...

COMMIT;
```

---

## Step 3: Execute SQL in Supabase
Run SQL in this order:
1) Tables
2) Indexes
3) RLS + Policies
4) Triggers

Verification queries:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT *
FROM public.<table_name>
LIMIT 5;
```

---

## Step 4: Backend wiring
Update backend services to match the new schema (column names + table names).

Targets to review:
- backend/services/userProgressService.js
- backend/services/scoreV2Service.js
- backend/mcpServer.js
- backend/server.js

Checklist:
- Update read/write queries to match the new schema.
- Ensure server timestamps are used where appropriate.
- Confirm `supabaseAdmin` is used for server-side writes.
- If schema changed, update any row shaping/normalization logic.

Optional (low-risk) compatibility:
- Add SQL views that expose old table names to reduce code churn.

---

## Step 5: LLM/MCP wiring
If LLM tools depend on DB tables, update those tool handlers to the new schema.

Checklist:
- Identify the tool handler that reads the data.
- Update the select columns and table names.
- Confirm the LLM response format is unchanged.

---

## Step 6: Frontend wiring
Update any client-side calls that read/write the updated tables.

Targets to review:
- src/services/adaptiveRoadmapProgressService.ts
- src/services/scoreV2ApiService.ts
- src/contexts/GameTestContext.tsx
- src/contexts/AuthContext.tsx
- src/lib/supabase.ts

Checklist:
- Confirm request payloads match the new schema.
- Ensure required fields are supplied.
- Confirm the feature flags are still correct.

---

## Step 7: End-to-end test
Start backend and frontend, then validate writes and reads:

```powershell
# Terminal 1 (backend)
Set-Location d:/Arcade-Learn/backend
npm run dev
```

```powershell
# Terminal 2 (frontend)
Set-Location d:/Arcade-Learn
npm run dev
```

Verify with API calls:
```powershell
# Example: roadmap progress (adjust IDs)
Invoke-RestMethod -Method Get -Uri "http://localhost:8081/api/user/<userId>/roadmap-progress/<roadmapId>"

# Example: score summary
Invoke-RestMethod -Method Get -Uri "http://localhost:8081/api/v2/user/<userId>/score-summary"
```

Pass criteria:
- Rows are created in the expected tables.
- Frontend shows completed nodes and/or score updates.
- LLM tool reads return valid data.

---

## Step 8: Rollback (if needed)
If a migration causes issues:
- Revert the SQL changes by dropping new tables (only if confirmed).
- Restore from a Supabase backup.
- Remove compatibility views if they were temporary.

---

## What I need from you next
Paste the first table definition using the template in Step 0.
