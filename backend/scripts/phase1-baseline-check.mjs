import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'route-ai-chat',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/ai\/chat'/,
    description: 'AI chat route exists',
  },
  {
    id: 'route-roadmap-doubt',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/roadmap\/doubt'/,
    description: 'Roadmap doubt route exists',
  },
  {
    id: 'route-ai-roadmap',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/user\/:userId\/ai-roadmap'/,
    description: 'Survey AI roadmap route exists',
  },
  {
    id: 'chat-orchestrator-source',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /aiOrchestratorService\.fallback\.js/,
    description: 'Chat route is wired to fallback orchestrator',
  },
  {
    id: 'survey-gemini-reference',
    file: path.join(workspaceRoot, 'backend', 'services', 'surveyService.js'),
    pattern: /process\.env\.GEMINI_API_KEY/,
    description: 'Survey roadmap generation still references Gemini key (baseline marker)',
  },
  {
    id: 'chat-gemini-reference',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /process\.env\.GEMINI_API_KEY/,
    description: 'Chat orchestrator still references Gemini key (baseline marker)',
  },
  {
    id: 'roadmap-openrouter-reference',
    file: path.join(workspaceRoot, 'backend', 'services', 'roadmapDoubtService.js'),
    pattern: /process\.env\.OPENROUTER_API_KEY/,
    description: 'Roadmap doubt service references OpenRouter key',
  },
  {
    id: 'schema-ai-model-version',
    file: path.join(workspaceRoot, 'database', 'survey_schema.sql'),
    pattern: /ai_model_version\s+VARCHAR\(20\)/i,
    description: 'Current schema model-version width marker exists',
  },
];

async function run() {
  const failed = [];

  for (const check of checks) {
    const content = await readFile(check.file, 'utf8');
    const ok = check.pattern.test(content);
    const prefix = ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} [${check.id}] ${check.description}`);

    if (!ok) {
      failed.push(check);
    }
  }

  if (failed.length > 0) {
    console.log(`\nPhase 1 baseline check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 1 baseline check passed. Contract markers captured.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase1 baseline check:', error);
  process.exit(1);
});
