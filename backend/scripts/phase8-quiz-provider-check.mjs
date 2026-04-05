import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'quiz-route-exists',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /app\.post\('\/api\/quiz\/generate'/,
    description: 'Quiz generation API route still exists',
  },
  {
    id: 'quiz-route-invokes-mcp-tool',
    file: path.join(workspaceRoot, 'backend', 'server.js'),
    pattern: /invokeMcpTool\('generate_quiz'/,
    description: 'Quiz route still invokes MCP generate_quiz tool',
  },
  {
    id: 'mcp-quiz-tool-registered',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /registerTool\(\s*'generate_quiz'/,
    description: 'MCP generate_quiz tool registration exists',
  },
  {
    id: 'mcp-imports-openrouter-provider',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /from '\.\/services\/openRouterProvider\.js'/,
    description: 'MCP server imports shared OpenRouter provider',
  },
  {
    id: 'mcp-quiz-uses-openrouter',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /openRouterProvider\.chatCompletion\(/,
    description: 'MCP quiz handler uses OpenRouter chat completion',
  },
  {
    id: 'mcp-no-groq-sdk-import',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /groq-sdk/,
    negate: true,
    description: 'MCP server no longer imports Groq SDK',
  },
  {
    id: 'mcp-no-groq-env-reference',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /process\.env\.GROQ_API_KEY/,
    negate: true,
    description: 'MCP server no longer references GROQ_API_KEY',
  },
  {
    id: 'backend-no-groq-dependency',
    file: path.join(workspaceRoot, 'backend', 'package.json'),
    pattern: /"groq-sdk"\s*:/,
    negate: true,
    description: 'Backend package no longer depends on groq-sdk',
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
    console.log(`\nPhase 8 quiz-provider check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 8 quiz-provider check passed. MCP quiz cutover guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase8 quiz-provider check:', error);
  process.exit(1);
});