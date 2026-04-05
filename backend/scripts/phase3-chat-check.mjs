import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'chat-route-exists',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/ai\/chat'/,
    description: 'AI chat route still exists',
  },
  {
    id: 'chat-orchestrator-import-stable',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /from '\.\/services\/aiOrchestratorService\.fallback\.js'/,
    description: 'Server still imports active chat orchestrator entrypoint',
  },
  {
    id: 'chat-service-imports-openrouter-provider',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /from '\.\/openRouterProvider\.js'/,
    description: 'Chat orchestrator imports shared OpenRouter provider',
  },
  {
    id: 'chat-service-calls-openrouter',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /openRouterProvider\.chatCompletion\(/,
    description: 'Chat orchestrator uses OpenRouter chat completion',
  },
  {
    id: 'chat-service-no-gemini-import',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /@google\/generative-ai/,
    negate: true,
    description: 'Chat orchestrator no longer imports Gemini SDK',
  },
  {
    id: 'chat-service-no-groq-import',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /groq-sdk/,
    negate: true,
    description: 'Chat orchestrator no longer imports Groq SDK',
  },
  {
    id: 'chat-service-no-gemini-env-reference',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /process\.env\.GEMINI_API_KEY/,
    negate: true,
    description: 'Chat orchestrator no longer references GEMINI_API_KEY',
  },
  {
    id: 'chat-service-no-groq-env-reference',
    file: path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.fallback.js'),
    pattern: /process\.env\.GROQ_API_KEY/,
    negate: true,
    description: 'Chat orchestrator no longer references GROQ_API_KEY',
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
    console.log(`\nPhase 3 chat check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 3 chat check passed. Chat cutover guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase3 chat check:', error);
  process.exit(1);
});
