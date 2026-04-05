import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    id: 'phase6-script-no-groq-required-var',
    file: path.join(workspaceRoot, 'backend', 'scripts', 'phase6-deploy-config-check.mjs'),
    pattern: /'GROQ_API_KEY'/,
    negate: true,
    description: 'Phase 6 guardrail no longer requires GROQ_API_KEY',
  },
  {
    id: 'phase7-script-no-groq-env-check',
    file: path.join(workspaceRoot, 'backend', 'scripts', 'phase7-docs-consistency-check.mjs'),
    pattern: /mcp-doc-has-groq-env|GROQ_API_KEY=\/.test/,
    negate: true,
    description: 'Phase 7 guardrail no longer requires GROQ_API_KEY assignment in docs',
  },
  {
    id: 'mcp-doc-quiz-runtime-openrouter',
    file: path.join(workspaceRoot, 'MCP_IMPLEMENTATION.md'),
    pattern: /MCP quiz generation now runs server-side through OpenRouter\./,
    description: 'MCP implementation runtime status reflects OpenRouter quiz provider',
  },
  {
    id: 'mcp-doc-no-groq-env-assignment',
    file: path.join(workspaceRoot, 'MCP_IMPLEMENTATION.md'),
    pattern: /\bGROQ_API_KEY\s*=/,
    negate: true,
    description: 'MCP implementation doc does not assign GROQ_API_KEY',
  },
  {
    id: 'mcp-doc-install-no-groq-sdk',
    file: path.join(workspaceRoot, 'MCP_IMPLEMENTATION.md'),
    pattern: /npm install .*groq-sdk/,
    negate: true,
    description: 'MCP implementation install command no longer includes groq-sdk',
  },
  {
    id: 'render-has-openrouter-quiz-vars',
    file: path.join(workspaceRoot, 'render.yaml'),
    pattern: /OPENROUTER_QUIZ_MODEL[\s\S]*OPENROUTER_QUIZ_MAX_TOKENS[\s\S]*OPENROUTER_QUIZ_TEMPERATURE/,
    description: 'render.yaml includes OpenRouter quiz tuning variables',
  },
  {
    id: 'deploy-doc-has-openrouter-quiz-model',
    file: path.join(workspaceRoot, 'RENDER_DEPLOYMENT.md'),
    pattern: /OPENROUTER_QUIZ_MODEL=/,
    description: 'Render deployment guide includes OPENROUTER_QUIZ_MODEL',
  },
  {
    id: 'deploy-doc-has-openrouter-quiz-max-tokens',
    file: path.join(workspaceRoot, 'RENDER_DEPLOYMENT.md'),
    pattern: /OPENROUTER_QUIZ_MAX_TOKENS=/,
    description: 'Render deployment guide includes OPENROUTER_QUIZ_MAX_TOKENS',
  },
  {
    id: 'deploy-doc-has-openrouter-quiz-temperature',
    file: path.join(workspaceRoot, 'RENDER_DEPLOYMENT.md'),
    pattern: /OPENROUTER_QUIZ_TEMPERATURE=/,
    description: 'Render deployment guide includes OPENROUTER_QUIZ_TEMPERATURE',
  },
  {
    id: 'render-no-groq-key',
    file: path.join(workspaceRoot, 'render.yaml'),
    pattern: /\- key: GROQ_API_KEY/,
    negate: true,
    description: 'render.yaml does not include GROQ_API_KEY',
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
    console.log(`\nPhase 10 postcutover-consistency check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 10 postcutover-consistency check passed. Guardrail refresh is satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase10 postcutover-consistency check:', error);
  process.exit(1);
});