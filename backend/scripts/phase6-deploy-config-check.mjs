import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

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

async function run() {
  const checks = [];

  const renderYamlPath = path.join(workspaceRoot, 'render.yaml');
  const renderYaml = await readFile(renderYamlPath, 'utf8');

  for (const envVar of requiredRenderVars) {
    checks.push({
      id: `render-has-${envVar.toLowerCase()}`,
      description: `render.yaml includes ${envVar}`,
      ok: new RegExp(`\\- key: ${envVar}`).test(renderYaml),
    });
  }

  checks.push({
    id: 'render-no-gemini-key',
    description: 'render.yaml does not declare GEMINI_API_KEY',
    ok: !/\- key: GEMINI_API_KEY/.test(renderYaml),
  });

  checks.push({
    id: 'render-no-groq-key',
    description: 'render.yaml does not declare GROQ_API_KEY',
    ok: !/\- key: GROQ_API_KEY/.test(renderYaml),
  });

  const deploymentDocPath = path.join(workspaceRoot, 'RENDER_DEPLOYMENT.md');
  const deploymentDoc = await readFile(deploymentDocPath, 'utf8');

  checks.push({
    id: 'deployment-doc-openrouter-guidance',
    description: 'Render deployment guide documents OPENROUTER_API_KEY',
    ok: /OPENROUTER_API_KEY/.test(deploymentDoc),
  });

  checks.push({
    id: 'deployment-doc-openrouter-quiz-guidance',
    description: 'Render deployment guide documents OPENROUTER_QUIZ_MODEL',
    ok: /OPENROUTER_QUIZ_MODEL/.test(deploymentDoc),
  });

  checks.push({
    id: 'deployment-doc-no-groq-assignment',
    description: 'Render deployment guide does not assign GROQ_API_KEY',
    ok: !/\bGROQ_API_KEY\s*=/.test(deploymentDoc),
  });

  checks.push({
    id: 'deployment-doc-no-frontend-gemini',
    description: 'Render deployment guide does not recommend assigning VITE_GEMINI_API_KEY',
    ok: !/\bVITE_GEMINI_API_KEY\s*=/.test(deploymentDoc),
  });

  const failed = checks.filter((check) => !check.ok);

  for (const check of checks) {
    const prefix = check.ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} [${check.id}] ${check.description}`);
  }

  if (failed.length > 0) {
    console.log(`\nPhase 6 deploy-config check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 6 deploy-config check passed. Deployment guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase6 deploy-config check:', error);
  process.exit(1);
});
