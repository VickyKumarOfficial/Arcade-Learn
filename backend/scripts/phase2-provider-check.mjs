import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'provider-file-exists',
    file: path.join(workspaceRoot, 'backend', 'services', 'openRouterProvider.js'),
    pattern: /export const openRouterProvider/,
    description: 'Shared OpenRouter provider module exists',
  },
  {
    id: 'provider-map-error-export',
    file: path.join(workspaceRoot, 'backend', 'services', 'openRouterProvider.js'),
    pattern: /export function mapOpenRouterError/,
    description: 'Shared OpenRouter error mapper is exported',
  },
  {
    id: 'roadmap-imports-provider',
    file: path.join(workspaceRoot, 'backend', 'services', 'roadmapDoubtService.js'),
    pattern: /from '\.\/openRouterProvider\.js'/,
    description: 'Roadmap doubt service imports shared provider',
  },
  {
    id: 'roadmap-no-groq-import',
    file: path.join(workspaceRoot, 'backend', 'services', 'roadmapDoubtService.js'),
    pattern: /import\s+Groq\s+from\s+'groq-sdk'/,
    negate: true,
    description: 'Roadmap doubt service no longer imports Groq',
  },
  {
    id: 'roadmap-no-groq-provider-branch',
    file: path.join(workspaceRoot, 'backend', 'services', 'roadmapDoubtService.js'),
    pattern: /provider:\s*'groq'/,
    negate: true,
    description: 'Roadmap doubt service no longer returns groq provider path',
  },
  {
    id: 'roadmap-route-still-available',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/roadmap\/doubt'/,
    description: 'Roadmap doubt API route is still available',
  },
];

async function run() {
  const failed = [];

  for (const check of checks) {
    const content = await readFile(check.file, 'utf8');
    const matched = check.pattern.test(content);
    const ok = check.negate ? !matched : matched;

    const prefix = ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} [${check.id}] ${check.description}`);

    if (!ok) {
      failed.push(check);
    }
  }

  if (failed.length > 0) {
    console.log(`\nPhase 2 provider check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 2 provider check passed. Shared provider guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase2 provider check:', error);
  process.exit(1);
});
