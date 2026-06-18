# ArcadeLearn RAG Implementation Guide

## Purpose

This document defines where and how Retrieval-Augmented Generation (RAG) should be added to ArcadeLearn’s AI chat system.

The recommended approach is **roadmap-first RAG**:

1. Add RAG to the **Roadmap Doubt Solver** first.
2. Improve the **General AI Chat** with secure backend user-progress context.
3. Later route General AI Chat queries to either normal LLM, user-context grounding, or RAG depending on intent.

This avoids overbuilding the general chat too early while still improving answer quality where ArcadeLearn-specific context matters most.

## Current AI Chat Architecture

### General AI Chat

Current path:

```text
src/services/aiService.ts
  -> POST /api/ai/chat
  -> backend/server.js
  -> buildSecureUserContext()
  -> buildUserGroundingMessage()
  -> aiOrchestratorService.getChatCompletion()
  -> OpenRouter
```

The general chat already has an important foundation: it authenticates the user and injects backend-verified user context before calling the LLM.

This means user progress/state advice does **not** require RAG as the first step. It requires stronger, structured backend context.

### Roadmap Doubt Solver

Current path:

```text
src/components/roadmap/RoadmapDoubtAssistant.tsx
  -> src/services/roadmapDoubtService.ts
  -> POST /api/roadmap/doubt
  -> backend/services/roadmapDoubtService.js
  -> OpenRouter
```

This is the best first place for RAG because it already receives:

- `roadmapKey`
- `roadmapTitle`
- `activeTopic`
- `activeTopicDescription`
- recent local chat history
- learner question

That makes retrieval narrower, cheaper, and more accurate than starting with the general chat.

## Recommended Architecture

### High-Level Flow

```text
Roadmap/curriculum content
  -> corpus builder
  -> chunking
  -> Google Gemini embeddings
  -> Supabase pgvector storage

Learner question
  -> embed query with same Google embedding model
  -> retrieve relevant Supabase pgvector chunks
  -> build grounded prompt with retrieved context
  -> call existing OpenRouter LLM flow
  -> return answer, optionally with sources
```

RAG must remain an optional context layer. If embedding, retrieval, or context assembly fails, the system should fall back to the existing LLM prompt flow instead of breaking chat.

### Surface-Specific Behavior

| Surface | First Implementation | Why |
| --- | --- | --- |
| Roadmap Doubt Solver | RAG + roadmap context | Narrow scope, high relevance, fewer hallucinations |
| General AI Chat | Secure user context grounding | Already supports authenticated backend context |
| General AI Chat later | Intent router + selective RAG | Avoids unnecessary retrieval for generic programming questions |

### Finalized Provider Choice

Use Google Gemini embeddings for quality and Supabase for vector storage/search.

Recommended configuration:

```text
RAG_EMBEDDING_PROVIDER=google
GOOGLE_EMBEDDING_API_KEY=
GOOGLE_EMBEDDING_MODEL=gemini-embedding-2
RAG_EMBEDDING_DIMENSIONS=1536
```

Why this choice:

- Keeps the existing `rag_chunks.embedding vector(1536)` schema.
- Supports higher-quality retrieval than smaller local/Supabase-only embedding models.
- Avoids hosting Ollama or managing local model infrastructure in production.
- Allows longer input support than common 384/512-token-focused small models.
- Keeps retrieval storage/search inside Supabase pgvector.

Budget guardrails:

- Use a dedicated Google AI project/API key for embeddings.
- Set Google billing budget alerts and quota limits before large book ingestion.
- Batch ingestion slowly and skip unchanged chunks using `contentHash`.
- Keep provider usage isolated behind one embedding adapter so it can be swapped later if needed.

## Implementation Plan

### Phase 1: Prepare the Database Schema

Before any schema work, follow `DB_SCHEMA_IMPLEMENTATION_GUIDE.md`.

Create a migration for:

- enabling `pgvector`
- `rag_sources`
- `rag_chunks`

Recommended table responsibilities:

- `rag_sources`: one row per source document or generated curriculum source
- `rag_chunks`: one row per searchable chunk with embedding and metadata

Important requirements:

- Use RLS.
- Use `updated_at` triggers for mutable tables.
- Use service-role-only access for RAG internals.
- Keep user-specific private progress out of the vector index.
- Store source metadata such as roadmap key, topic ID, source type, and content hash.
- Keep `rag_chunks.embedding` as `vector(1536)` for Google Gemini embeddings.

Current status:

- Migration file exists at `database/rag_pipeline_schema.sql`.
- The migration has been run manually in Supabase SQL Editor.
- No existing app/chat/progress tables are modified by this schema.

### Phase 2: Add Embedding Provider Adapter

Add a backend embedding adapter under a dedicated RAG service folder, for example:

```text
backend/services/rag/
```

Recommended environment variables:

```text
RAG_EMBEDDING_PROVIDER=google
GOOGLE_EMBEDDING_API_KEY=
GOOGLE_EMBEDDING_MODEL=gemini-embedding-2
RAG_EMBEDDING_DIMENSIONS=1536
```

The adapter should:

- validate required env vars
- accept document text and query text
- format document/query inputs consistently for retrieval
- return numeric embedding arrays
- verify the returned vector length is exactly `1536`
- fail clearly when provider config is missing
- remain provider-agnostic at the service boundary so retrieval does not depend on Google-specific code

Important consistency rule:

- Corpus chunks and user queries must be embedded with the same model family and compatible formatting.
- Do not mix Supabase `gte-small`, Ollama, Hugging Face, and Google vectors in the same `embedding` column.

### Phase 3: Build the Roadmap Knowledge Corpus

Create backend-readable RAG corpus data from current roadmap content.

Good source candidates:

- roadmap titles
- section descriptions
- topic introductions
- what-you-will-learn bullets
- resources
- project guidance
- roadmap job-keyword mappings

Each chunk should include stable metadata:

```text
roadmapKey
roadmapTitle
sectionId
sectionTitle
topicId
topicTitle
sourceType
sourceTitle
contentHash
```

Chunking guidance:

- Use small chunks, roughly 300–700 tokens.
- Keep one topic or one subtopic per chunk where possible.
- Do not mix unrelated roadmap sections in the same chunk.
- Preserve source title and roadmap key for filtering.
- For books later, split by book -> chapter -> section -> chunk and store page/chapter metadata.
- Avoid embedding private user progress; inject user context at request time instead.

Current status:

- Dry-run corpus builder exists at `backend/services/rag/roadmapCorpusBuilder.js`.
- Dry-run script exists at `backend/scripts/rag-ingest-dry-run.mjs`.
- Current dry-run output: 141 roadmap topic sources/chunks.
- Roadmap counts: frontend 52, backend 44, fullstack-mern 45.

### Phase 4: Add Ingestion Script

Add a backend ingestion script, for example:

```text
npm --prefix backend run rag:ingest
```

The ingestion script should:

- read the generated roadmap corpus
- chunk content
- hash each chunk
- skip unchanged chunks
- embed only new or changed chunks
- upsert into Supabase using the service role key
- deactivate removed chunks instead of silently orphaning them

Also add a dry-run mode:

```text
npm --prefix backend run rag:ingest -- --dry-run
```

Dry-run should show:

- number of sources found
- number of chunks generated
- number of chunks unchanged
- number of chunks needing embeddings
- number of chunks to deactivate

Current dry-run command:

```text
npm --prefix backend run rag:ingest:dry-run
```

For samples, run from `backend/`:

```text
node scripts/rag-ingest-dry-run.mjs --samples
```

Next ingestion step:

- Add Google embedding adapter.
- Add Supabase RAG repository service.
- Add real `rag:ingest` command that defaults to dry-run unless `--write` is explicitly passed.
- Upsert `rag_sources` first, then `rag_chunks`.
- Only generate embeddings for chunks whose `contentHash` changed or whose embedding is missing.

### Phase 5: Add Retrieval Service

Add a retrieval service that accepts:

```text
query
roadmapKey
activeTopic
limit
```

Retrieval behavior:

- filter by `roadmapKey` for roadmap-specific chats
- boost chunks matching `activeTopic`
- retrieve top relevant chunks by vector similarity
- ignore inactive chunks
- return source metadata with each result
- embed the query using the same Google embedding adapter
- if query embedding fails, return no RAG context and let the caller use LLM fallback

Recommended default:

```text
limit = 5
```

The service should return both:

- context text for prompt assembly
- source metadata for optional frontend display

### Phase 6: Integrate RAG into Roadmap Doubt Solver

Update the backend roadmap doubt flow internally:

```text
POST /api/roadmap/doubt
  -> validate payload
  -> retrieve roadmap chunks
  -> build grounded prompt
  -> call OpenRouter
  -> return response and optional sources
```

Keep the frontend request shape unchanged.

Prompt requirements:

- Use retrieved ArcadeLearn context for roadmap-specific claims.
- If context is missing, say the ArcadeLearn-specific material is unavailable.
- Still answer general conceptual questions when safe.
- Keep responses concise and practical.
- Do not expose raw internal IDs, JSON, or tool names.

Fallback behavior:

- If retrieval fails, log the retrieval error.
- Continue with the existing non-RAG roadmap prompt.
- Tell the LLM not to invent ArcadeLearn-specific curriculum facts.
- If Google embedding fails, do not fail the chat request; skip RAG and continue with current OpenRouter flow.
- If Supabase vector search fails, do not fail the chat request; skip RAG and continue with current OpenRouter flow.

### Phase 7: Improve General AI Chat User Context

General chat should first become better at authenticated progress advice without requiring RAG.

Move user context logic out of `backend/server.js` into a dedicated service, for example:

```text
backend/services/userContextService.js
```

Include:

- total points/score
- stars
- streaks
- achievements
- recommended roadmaps
- active roadmap summaries
- completed roadmap components
- incomplete roadmap components
- credit summary from `user_roadmap_credit_summary`
- recent activity stats

Rules:

- Never trust frontend-sent progress.
- Only use backend-authenticated user ID.
- Clearly say when data is unavailable.
- Keep prompt context compact and structured.

### Phase 8: Add General Chat Intent Router

After roadmap RAG is stable, add an internal router for `POST /api/ai/chat`.

Recommended intent categories:

```text
general_programming
user_progress_advice
roadmap_learning
platform_help
```

Routing behavior:

- `general_programming`: normal LLM call, no RAG
- `user_progress_advice`: LLM + secure user context
- `roadmap_learning`: LLM + secure user context + RAG
- `platform_help`: LLM + platform/ArcadeLearn documentation context if available

Start with deterministic keyword/rule heuristics before using an LLM classifier.

Example:

- “How many points do I have?” -> `user_progress_advice`
- “What should I study next?” -> `user_progress_advice` plus roadmap context if active roadmap exists
- “Explain React hooks” -> `general_programming`
- “Explain this roadmap topic” -> `roadmap_learning`

## Response Shape

Keep existing responses backward compatible.

Current shape:

```json
{
  "success": true,
  "provider": "openrouter",
  "response": "..."
}
```

Extended optional shape:

```json
{
  "success": true,
  "provider": "openrouter",
  "response": "...",
  "sources": [
    {
      "title": "HTTP Request Lifecycle",
      "sourceType": "roadmap_topic",
      "roadmapKey": "backend",
      "topicTitle": "Request/Response Basics"
    }
  ]
}
```

The frontend should not require `sources` initially.

## Testing Checklist

### Roadmap RAG

- Roadmap chat retrieves chunks only for the current roadmap.
- Active topic boosts relevant chunks.
- Empty retrieval falls back safely.
- Retrieval failure does not break chat.
- Answers do not invent ArcadeLearn-specific curriculum when context is missing.
- Optional sources are returned but not required by the UI.

### General Chat

- Generic coding questions do not trigger RAG.
- Progress questions use backend-authenticated user context.
- Missing progress data is reported as unavailable.
- Roadmap learning questions can use RAG after the router is added.
- Existing chat history save/load behavior remains unchanged.

### Validation Commands

Run from the repo root unless noted:

```text
npm run build
npm --prefix backend run openrouter:runtime-check
npm --prefix backend run openrouter:config-check
npm --prefix backend run openrouter:check
npm --prefix backend run rag:ingest:dry-run
```

## Important Guardrails

- Do not replace normal LLM calls with RAG everywhere.
- Do not put private user progress into vector storage.
- Do not retrieve unrelated roadmap content for roadmap-specific chats.
- Do not break existing frontend request/response contracts.
- Do not expose internal metadata, tool names, raw JSON, or internal IDs to learners.
- Do not edit `README.md`; use this file as the RAG-specific implementation guide.
- Do not change `rag_chunks.embedding` dimensions unless all stored/query embeddings are regenerated with the new dimension.
- Do not mix embedding providers in one vector column.
- Do not let RAG failure block normal OpenRouter answers.

## Final Recommendation

The cleanest implementation path is:

```text
Google embedding adapter
  -> Supabase RAG ingestion
  -> Supabase retrieval service
  -> Roadmap Doubt Solver RAG
  -> Better General Chat user context
  -> General Chat intent router
  -> Selective General Chat RAG
```

This gives ArcadeLearn a strong first RAG win without making the general AI chat overly complex too early.
