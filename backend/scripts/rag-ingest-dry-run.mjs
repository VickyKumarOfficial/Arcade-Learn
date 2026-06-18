import { buildRoadmapChunks, buildRoadmapCorpus } from '../services/rag/roadmapCorpusBuilder.js';

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    samples: args.has('--samples'),
  };
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

const { samples } = parseArgs(process.argv);

try {
  const sources = await buildRoadmapCorpus();
  const chunks = buildRoadmapChunks(sources);

  console.log('RAG ingestion dry run');
  console.log('No Supabase writes, no embeddings, no chat changes.');
  console.log(`Sources found: ${sources.length}`);
  console.log(`Chunks generated: ${chunks.length}`);
  console.log(`Estimated embedding requests for first full ingest: ${chunks.length}`);

  printCounts('Sources by roadmap', countBy(sources, 'roadmapKey'));
  printCounts('Chunks by roadmap', countBy(chunks, 'roadmapKey'));

  const averageChunkCharacters = chunks.length > 0
    ? Math.round(chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) / chunks.length)
    : 0;
  const averageTokenEstimate = chunks.length > 0
    ? Math.round(chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / chunks.length)
    : 0;

  console.log(`\nAverage chunk characters: ${averageChunkCharacters}`);
  console.log(`Average estimated tokens: ${averageTokenEstimate}`);

  if (samples) {
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
} catch (error) {
  console.error('RAG dry run failed:', error);
  process.exitCode = 1;
}
