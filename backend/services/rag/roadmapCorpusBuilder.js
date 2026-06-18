import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';

const ROADMAP_SOURCES = [
  {
    roadmapKey: 'frontend',
    roadmapTitle: 'Frontend Development Roadmap',
    filePath: path.resolve(process.cwd(), '..', 'src', 'data', 'allNodeDetails.ts'),
    exportName: 'ALL_NODE_DETAILS',
    globals: {
      BACKEND_NODE_DETAILS: {},
      FULLSTACK_MERN_NODE_DETAILS: {},
      BACKEND_SECTION_NODE_MAP: {},
      FULLSTACK_MERN_SECTION_NODE_MAP: {},
    },
  },
  {
    roadmapKey: 'backend',
    roadmapTitle: 'Backend Development Roadmap',
    filePath: path.resolve(process.cwd(), '..', 'src', 'data', 'backendNodeDetails.ts'),
    exportName: 'BACKEND_NODE_DETAILS',
  },
  {
    roadmapKey: 'fullstack-mern',
    roadmapTitle: 'Full Stack MERN Development Roadmap',
    filePath: path.resolve(process.cwd(), '..', 'src', 'data', 'fullstackMernNodeDetails.ts'),
    exportName: 'FULLSTACK_MERN_NODE_DETAILS',
  },
];

function stripImportBlocks(source) {
  const lines = source.split(/\r?\n/);
  const kept = [];
  let skippingImport = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!skippingImport && trimmed.startsWith('import ')) {
      if (!trimmed.endsWith(';')) {
        skippingImport = true;
      }
      continue;
    }

    if (skippingImport) {
      if (trimmed.endsWith(';')) {
        skippingImport = false;
      }
      continue;
    }

    kept.push(line);
  }

  return kept.join('\n');
}

function hashContent(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeResources(resources) {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources
    .filter((resource) => resource && typeof resource.title === 'string')
    .map((resource) => ({
      title: resource.title,
      url: typeof resource.url === 'string' ? resource.url : null,
      type: typeof resource.type === 'string' ? resource.type : null,
    }));
}

function buildSourceContent({ roadmapTitle, section, topic }) {
  const learnItems = Array.isArray(topic.whatYoullLearn) ? topic.whatYoullLearn : [];
  const resources = normalizeResources(topic.resources);

  const lines = [
    `Roadmap: ${roadmapTitle}`,
    `Section: ${section.label}`,
    section.description ? `Section summary: ${section.description}` : null,
    `Topic: ${topic.label}`,
    topic.intro ? `Topic summary: ${topic.intro}` : null,
    learnItems.length > 0 ? 'What you will learn:' : null,
    ...learnItems.map((item) => `- ${item}`),
    resources.length > 0 ? 'Resources:' : null,
    ...resources.map((resource) => {
      const parts = [resource.title];
      if (resource.type) parts.push(`type: ${resource.type}`);
      if (resource.url) parts.push(`url: ${resource.url}`);
      return `- ${parts.join(' | ')}`;
    }),
  ];

  return lines.filter(Boolean).join('\n');
}

function chunkSourceContent(source, maxCharacters = 2200) {
  if (source.content.length <= maxCharacters) {
    return [
      {
        chunkIndex: 0,
        content: source.content,
      },
    ];
  }

  const paragraphs = source.content.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > maxCharacters && current) {
      chunks.push({ chunkIndex: chunks.length, content: current });
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push({ chunkIndex: chunks.length, content: current });
  }

  return chunks;
}

async function loadTsExport(filePath, exportName, globals = {}) {
  const rawSource = await fs.readFile(filePath, 'utf8');
  const sourceWithoutImports = stripImportBlocks(rawSource);
  const compiled = ts.transpileModule(sourceWithoutImports, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: filePath,
  }).outputText;

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: () => ({}),
    ...globals,
  };

  vm.runInNewContext(compiled, sandbox, { filename: filePath });

  return sandbox.exports[exportName] || sandbox.module.exports[exportName];
}

export async function buildRoadmapCorpus() {
  const sources = [];

  for (const sourceConfig of ROADMAP_SOURCES) {
    const nodeDetails = await loadTsExport(
      sourceConfig.filePath,
      sourceConfig.exportName,
      sourceConfig.globals || {},
    );

    for (const [sectionId, sectionData] of Object.entries(nodeDetails || {})) {
      const section = sectionData?.section;
      const subNodes = Array.isArray(sectionData?.subNodes) ? sectionData.subNodes : [];

      if (!section?.id || !section?.label) {
        continue;
      }

      for (const topic of subNodes) {
        if (!topic?.id || !topic?.label) {
          continue;
        }

        const sourceKey = [
          sourceConfig.roadmapKey,
          stableKey(section.id || sectionId),
          stableKey(topic.id),
        ].join(':');

        const content = buildSourceContent({
          roadmapTitle: sourceConfig.roadmapTitle,
          section,
          topic,
        });

        sources.push({
          sourceKey,
          sourceType: 'roadmap_topic',
          roadmapKey: sourceConfig.roadmapKey,
          roadmapTitle: sourceConfig.roadmapTitle,
          sourceTitle: `${section.label}: ${topic.label}`,
          sourcePath: path.relative(path.resolve(process.cwd(), '..'), sourceConfig.filePath),
          content,
          contentHash: hashContent(content),
          metadata: {
            sectionId: section.id || sectionId,
            sectionTitle: section.label,
            topicId: topic.id,
            topicTitle: topic.label,
            resourceCount: normalizeResources(topic.resources).length,
          },
        });
      }
    }
  }

  return sources;
}

export function buildRoadmapChunks(sources, options = {}) {
  const maxCharacters = Number.isFinite(Number(options.maxCharacters))
    ? Math.max(500, Number(options.maxCharacters))
    : 2200;

  return sources.flatMap((source) =>
    chunkSourceContent(source, maxCharacters).map((chunk) => ({
      chunkKey: `${source.sourceKey}:chunk-${chunk.chunkIndex}`,
      sourceKey: source.sourceKey,
      sourceType: source.sourceType,
      roadmapKey: source.roadmapKey,
      sectionId: source.metadata.sectionId,
      sectionTitle: source.metadata.sectionTitle,
      topicId: source.metadata.topicId,
      topicTitle: source.metadata.topicTitle,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      contentHash: hashContent(chunk.content),
      tokenCount: Math.ceil(chunk.content.length / 4),
      metadata: {
        sourceTitle: source.sourceTitle,
        sourcePath: source.sourcePath,
      },
    })),
  );
}
