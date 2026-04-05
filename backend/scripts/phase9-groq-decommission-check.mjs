import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'render-no-groq-key',
    file: path.join(workspaceRoot, 'render.yaml'),
    pattern: /\- key: GROQ_API_KEY/,
    negate: true,
    description: 'render.yaml does not declare GROQ_API_KEY',
  },
  {
    id: 'deploy-doc-no-groq-assignment',
    file: path.join(workspaceRoot, 'RENDER_DEPLOYMENT.md'),
    pattern: /\bGROQ_API_KEY\s*=/,
    negate: true,
    description: 'Render deployment guide does not assign GROQ_API_KEY',
  },
  {
    id: 'backend-no-groq-dependency',
    file: path.join(workspaceRoot, 'backend', 'package.json'),
    pattern: /"groq-sdk"\s*:/,
    negate: true,
    description: 'Backend package manifest no longer includes groq-sdk',
  },
  {
    id: 'mcp-no-groq-import',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /groq-sdk/,
    negate: true,
    description: 'MCP server no longer imports groq-sdk',
  },
  {
    id: 'mcp-no-groq-env-reference',
    file: path.join(workspaceRoot, 'backend', 'mcpServer.js'),
    pattern: /process\.env\.GROQ_API_KEY/,
    negate: true,
    description: 'MCP server no longer references GROQ_API_KEY',
  },
  {
    id: 'frontend-roadmap-provider-openrouter-only',
    file: path.join(workspaceRoot, 'src', 'services', 'roadmapDoubtService.ts'),
    pattern: /provider\?:\s*'openrouter'\s*\|\s*'groq'/,
    negate: true,
    description: 'Frontend roadmap doubt provider contract no longer includes groq',
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
    console.log(`\nPhase 9 groq-decommission check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 9 groq-decommission check passed. Decommission guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase9 groq-decommission check:', error);
  process.exit(1);
});