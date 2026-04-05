import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'survey-route-exists',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/user\/:userId\/ai-roadmap'/,
    description: 'Survey AI roadmap route still exists',
  },
  {
    id: 'survey-service-imports-openrouter-provider',
    file: path.join(workspaceRoot, 'backend', 'services', 'surveyService.js'),
    pattern: /from '\.\/openRouterProvider\.js'/,
    description: 'Survey service imports shared OpenRouter provider',
  },
  {
    id: 'survey-service-calls-openrouter',
    file: path.join(workspaceRoot, 'backend', 'services', 'surveyService.js'),
    pattern: /openRouterProvider\.chatCompletion\(/,
    description: 'Survey service uses OpenRouter chat completion',
  },
  {
    id: 'survey-service-no-gemini-sdk-import',
    file: path.join(workspaceRoot, 'backend', 'services', 'surveyService.js'),
    pattern: /@google\/generative-ai/,
    negate: true,
    description: 'Survey service no longer imports Gemini SDK',
  },
  {
    id: 'survey-service-no-gemini-env-reference',
    file: path.join(workspaceRoot, 'backend', 'services', 'surveyService.js'),
    pattern: /process\.env\.GEMINI_API_KEY/,
    negate: true,
    description: 'Survey service no longer references GEMINI_API_KEY',
  },
  {
    id: 'survey-model-version-no-gemini-label',
    file: path.join(workspaceRoot, 'backend', 'services', 'surveyService.js'),
    pattern: /gemini-1\.5-flash/,
    negate: true,
    description: 'Survey DB model version value is no longer hardcoded to gemini label',
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
    console.log(`\nPhase 4 survey check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 4 survey check passed. Survey cutover guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase4 survey check:', error);
  process.exit(1);
});
