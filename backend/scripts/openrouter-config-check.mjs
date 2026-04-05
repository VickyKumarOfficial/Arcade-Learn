import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

function toAbsolute(relativePath) {
  return path.join(workspaceRoot, ...relativePath.split('/'));
}

async function read(relativePath) {
  return readFile(toAbsolute(relativePath), 'utf8');
}

function logResult({ ok, id, description }) {
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${description}`);
}

async function run() {
  const checks = [];

  const renderYaml = await read('render.yaml');
  const requiredRenderVars = [
    'OPENROUTER_API_KEY',
    'OPENROUTER_BASE_URL',
    'OPENROUTER_MODEL',
    'OPENROUTER_ROADMAP_MODEL',
    'OPENROUTER_CHAT_MODEL',
    'OPENROUTER_QUIZ_MODEL',
    'OPENROUTER_QUIZ_MAX_TOKENS',
    'OPENROUTER_QUIZ_TEMPERATURE',
    'OPENROUTER_SURVEY_MODEL',
  ];

  for (const envVar of requiredRenderVars) {
    checks.push({
      ok: new RegExp(`\\- key: ${envVar}`).test(renderYaml),
      id: `render-has-${envVar.toLowerCase()}`,
      description: `render.yaml includes ${envVar}`,
    });
  }

  checks.push({
    ok: !/\- key: GEMINI_API_KEY/.test(renderYaml),
    id: 'render-no-gemini-key',
    description: 'render.yaml does not declare GEMINI_API_KEY',
  });

  checks.push({
    ok: !/\- key: GROQ_API_KEY/.test(renderYaml),
    id: 'render-no-groq-key',
    description: 'render.yaml does not declare GROQ_API_KEY',
  });

  const deploymentDoc = await read('RENDER_DEPLOYMENT.md');

  checks.push({
    ok: /OPENROUTER_API_KEY=/.test(deploymentDoc),
    id: 'deploy-doc-openrouter-api-key',
    description: 'Deployment guide includes OPENROUTER_API_KEY',
  });

  checks.push({
    ok: /OPENROUTER_QUIZ_MODEL=/.test(deploymentDoc),
    id: 'deploy-doc-openrouter-quiz-model',
    description: 'Deployment guide includes OPENROUTER_QUIZ_MODEL',
  });

  checks.push({
    ok: /OPENROUTER_QUIZ_MAX_TOKENS=/.test(deploymentDoc),
    id: 'deploy-doc-openrouter-quiz-max-tokens',
    description: 'Deployment guide includes OPENROUTER_QUIZ_MAX_TOKENS',
  });

  checks.push({
    ok: /OPENROUTER_QUIZ_TEMPERATURE=/.test(deploymentDoc),
    id: 'deploy-doc-openrouter-quiz-temperature',
    description: 'Deployment guide includes OPENROUTER_QUIZ_TEMPERATURE',
  });

  checks.push({
    ok: !/\bGROQ_API_KEY\s*=/.test(deploymentDoc),
    id: 'deploy-doc-no-groq-assignment',
    description: 'Deployment guide does not assign GROQ_API_KEY',
  });

  checks.push({
    ok: !/\bGEMINI_API_KEY\s*=/.test(deploymentDoc),
    id: 'deploy-doc-no-gemini-assignment',
    description: 'Deployment guide does not assign GEMINI_API_KEY',
  });

  checks.push({
    ok: !/\bVITE_GEMINI_API_KEY\s*=/.test(deploymentDoc),
    id: 'deploy-doc-no-frontend-gemini-assignment',
    description: 'Deployment guide does not assign VITE_GEMINI_API_KEY',
  });

  const mcpDoc = await read('MCP_IMPLEMENTATION.md');

  checks.push({
    ok: /OpenRouter/.test(mcpDoc),
    id: 'mcp-doc-openrouter-runtime',
    description: 'MCP implementation guide documents OpenRouter runtime',
  });

  checks.push({
    ok: /OPENROUTER_API_KEY=/.test(mcpDoc),
    id: 'mcp-doc-openrouter-env',
    description: 'MCP implementation guide includes OPENROUTER_API_KEY setup',
  });

  checks.push({
    ok: !/\bGROQ_API_KEY\s*=/.test(mcpDoc),
    id: 'mcp-doc-no-groq-assignment',
    description: 'MCP implementation guide does not assign GROQ_API_KEY',
  });

  checks.push({
    ok: !/\bGEMINI_API_KEY\s*=/.test(mcpDoc),
    id: 'mcp-doc-no-gemini-assignment',
    description: 'MCP implementation guide does not assign GEMINI_API_KEY',
  });

  checks.push({
    ok: !/\bVITE_GEMINI_API_KEY\s*=/.test(mcpDoc),
    id: 'mcp-doc-no-frontend-gemini-assignment',
    description: 'MCP implementation guide does not assign VITE_GEMINI_API_KEY',
  });

  checks.push({
    ok: !/npm install .*groq-sdk/.test(mcpDoc),
    id: 'mcp-doc-install-no-groq-sdk',
    description: 'MCP implementation install command does not include groq-sdk',
  });

  const readme = await read('README.md');

  checks.push({
    ok: /OpenRouter/.test(readme),
    id: 'readme-openrouter-reference',
    description: 'README references OpenRouter as provider',
  });

  checks.push({
    ok: !/\bVITE_GEMINI_API_KEY\s*=/.test(readme),
    id: 'readme-no-frontend-gemini-assignment',
    description: 'README does not assign VITE_GEMINI_API_KEY',
  });

  const failed = checks.filter((check) => !check.ok);

  for (const check of checks) {
    logResult(check);
  }

  if (failed.length > 0) {
    console.log(`\nOpenRouter config/docs check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nOpenRouter config/docs check passed. Deployment and docs guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running OpenRouter config/docs check:', error);
  process.exit(1);
});
