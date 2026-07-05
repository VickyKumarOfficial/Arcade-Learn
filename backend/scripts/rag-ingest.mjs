import { buildRoadmapChunks, buildRoadmapCorpus } from '../services/rag/roadmapCorpusBuilder.js';

function parseArgs(argv) {
  const args = argv.slice(2);
  const limitIndex = args.findIndex((arg) => arg === '--limit');
  const limitValue = limitIndex >= 0 ? Number(args[limitIndex + 1]) : null;
  const delayIndex = args.findIndex((arg) => arg === '--delay-ms');
  const delayValue = delayIndex >= 0 ? Number(args[delayIndex + 1]) : null;

  return {
    write: args.includes('--write'),
    samples: args.includes('--samples'),
    limit: Number.isFinite(limitValue) && limitValue > 0 ? Math.floor(limitValue) : null,
    delayMs: Number.isFinite(delayValue) && delayValue >= 0 ? Math.floor(delayValue) : 1200,
  };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function printCounts(title, counts) {
  console.log(`\n${title}`);
  for (const [key, count] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`- ${key}: ${count}`);
  }
}

function printSummary({ sources, chunks, mode, chunksToEmbed = [] }) {
  console.log(`RAG ingestion ${mode}`);
  console.log(mode === 'write' ? 'Supabase writes are enabled.' : 'Dry run only. No Supabase writes, no embeddings.');
  console.log(`Sources found: ${sources.length}`);
  console.log(`Chunks generated: ${chunks.length}`);
  console.log(`Chunks needing embeddings/write: ${chunksToEmbed.length}`);

  printCounts('Sources by roadmap', countBy(sources, 'roadmapKey'));
  printCounts('Chunks by roadmap', countBy(chunks, 'roadmapKey'));
}

function printSamples(chunks) {
  console.log('\nSample chunks');
  for (const chunk of chunks.slice(0, 5)) {
    console.log('\n---');
    console.log(`Chunk key: ${chunk.chunkKey}`);
    console.log(`Roadmap: ${chunk.roadmapKey}`);
    console.log(`Section: ${chunk.sectionTitle}`);
    console.log(`Topic: ${chunk.topicTitle}`);
    console.log(chunk.content.slice(0, 700));
  }
}

async function planWrite({ sources, chunks, repository }) {
  const [existingSources, existingChunks] = await Promise.all([
    repository.getSourcesByKeys(sources.map((source) => source.sourceKey)),
    repository.getChunksByKeys(chunks.map((chunk) => chunk.chunkKey)),
  ]);

  const sourcesToUpsert = sources.filter((source) => {
    const existing = existingSources.get(source.sourceKey);
    return !existing || existing.content_hash !== source.contentHash || existing.is_active === false;
  });

  const chunksToEmbed = chunks.filter((chunk) => {
    const existing = existingChunks.get(chunk.chunkKey);
    return !existing || existing.content_hash !== chunk.contentHash || existing.is_active === false;
  });

  return {
    sourcesToUpsert,
    chunksToEmbed,
  };
}

function isQuotaError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('quota') || message.includes('rate limit') || message.includes('429');
}

async function embedWithRetry({ provider, chunk, index, total }) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`Embedding chunk ${index + 1}/${total}: ${chunk.chunkKey}`);
      return await provider.embedDocument({
        title: chunk.metadata?.sourceTitle || chunk.topicTitle || chunk.chunkKey,
        content: chunk.content,
      });
    } catch (error) {
      if (!isQuotaError(error) || attempt === maxAttempts) {
        throw error;
      }

      const waitMs = 65_000;
      console.warn(`Embedding quota hit. Waiting ${Math.round(waitMs / 1000)}s before retry ${attempt + 1}/${maxAttempts}.`);
      await sleep(waitMs);
    }
  }

  throw new Error('Embedding retry failed unexpectedly.');
}

async function runWrite({ sources, chunks, limit, delayMs }) {
  const [{ ragRepository }, { googleEmbeddingProvider }] = await Promise.all([
    import('../services/rag/ragRepository.js'),
    import('../services/rag/googleEmbeddingProvider.js'),
  ]);

  const { sourcesToUpsert, chunksToEmbed } = await planWrite({
    sources,
    chunks,
    repository: ragRepository,
  });

  const limitedChunksToEmbed = limit ? chunksToEmbed.slice(0, limit) : chunksToEmbed;
  printSummary({
    sources,
    chunks,
    mode: 'write',
    chunksToEmbed: limitedChunksToEmbed,
  });

  if (limit && chunksToEmbed.length > limit) {
    console.log(`\nLimit active: embedding/writing first ${limit} of ${chunksToEmbed.length} changed chunks.`);
  }

  if (delayMs > 0) {
    console.log(`Embedding throttle: ${delayMs}ms between chunks.`);
  }

  const sourceWriteSet = new Map();
  for (const source of sourcesToUpsert) {
    sourceWriteSet.set(source.sourceKey, source);
  }
  for (const chunk of limitedChunksToEmbed) {
    const source = sources.find((item) => item.sourceKey === chunk.sourceKey);
    if (source) {
      sourceWriteSet.set(source.sourceKey, source);
    }
  }

  const sourceResult = await ragRepository.upsertSources([...sourceWriteSet.values()]);
  const existingSources = await ragRepository.getSourcesByKeys(sources.map((source) => source.sourceKey));
  const sourcesByKey = new Map([...existingSources, ...sourceResult.sourcesByKey]);

  for (const [index, chunk] of limitedChunksToEmbed.entries()) {
    if (index > 0 && delayMs > 0) {
      await sleep(delayMs);
    }

    const embedding = await embedWithRetry({
      provider: googleEmbeddingProvider,
      chunk,
      index,
      total: limitedChunksToEmbed.length,
    });

    await ragRepository.upsertChunks([{
      ...chunk,
      embedding: embedding.values,
    }], sourcesByKey);
  }

  console.log('\nWrite complete');
  console.log(`Sources upserted: ${sourceResult.upserted}`);
  console.log(`Chunks upserted: ${limitedChunksToEmbed.length}`);
}

async function main() {
  const options = parseArgs(process.argv);
  const sources = await buildRoadmapCorpus();
  const chunks = buildRoadmapChunks(sources);

  if (!options.write) {
    printSummary({
      sources,
      chunks,
      mode: 'dry run',
      chunksToEmbed: chunks,
    });

    if (options.samples) {
      printSamples(chunks);
    }

    console.log('\nTo write to Supabase, rerun with --write.');
    console.log('Use --limit <number> for a cautious first ingestion batch.');
    return;
  }

  await runWrite({
    sources,
    chunks,
    limit: options.limit,
    delayMs: options.delayMs,
  });
}

main().catch((error) => {
  console.error('RAG ingestion failed:', error);
  process.exitCode = 1;
});
