import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

const RUNTIME_GEMINI_PATTERN = /@google\/generative-ai|GoogleGenerativeAI|process\.env\.GEMINI_API_KEY/;

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectJsFilesRecursively(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsFilesRecursively(absolutePath)));
      continue;
    }

    if (entry.isFile() && absolutePath.endsWith('.js')) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function runChecks() {
  const checks = [];

  const legacyServicePath = path.join(workspaceRoot, 'backend', 'services', 'aiOrchestratorService.js');
  checks.push({
    id: 'legacy-gemini-service-removed',
    description: 'Legacy Gemini service file is removed',
    ok: !(await fileExists(legacyServicePath)),
  });

  const backendPackageJsonPath = path.join(workspaceRoot, 'backend', 'package.json');
  const backendPackageJson = JSON.parse(await readFile(backendPackageJsonPath, 'utf8'));
  checks.push({
    id: 'backend-no-gemini-dependency',
    description: 'Backend package no longer depends on @google/generative-ai',
    ok: !backendPackageJson?.dependencies?.['@google/generative-ai'],
  });

  const rootPackageJsonPath = path.join(workspaceRoot, 'package.json');
  const rootPackageJson = JSON.parse(await readFile(rootPackageJsonPath, 'utf8'));
  checks.push({
    id: 'root-no-google-genai-deps',
    description: 'Root package no longer depends on @google/genai or @google/generative-ai',
    ok:
      !rootPackageJson?.dependencies?.['@google/genai'] &&
      !rootPackageJson?.dependencies?.['@google/generative-ai'],
  });

  const serverPath = path.join(workspaceRoot, 'backend', 'server.js');
  const serverSource = await readFile(serverPath, 'utf8');
  checks.push({
    id: 'chat-route-still-exists',
    description: 'AI chat route still exists',
    ok: /app\.post\('\/api\/ai\/chat'/.test(serverSource),
  });
  checks.push({
    id: 'survey-route-still-exists',
    description: 'Survey AI roadmap route still exists',
    ok: /app\.post\('\/api\/user\/:userId\/ai-roadmap'/.test(serverSource),
  });

  const servicesDir = path.join(workspaceRoot, 'backend', 'services');
  const serviceFiles = await collectJsFilesRecursively(servicesDir);
  let foundGeminiRuntimeReference = false;

  for (const filePath of serviceFiles) {
    const content = await readFile(filePath, 'utf8');
    if (RUNTIME_GEMINI_PATTERN.test(content)) {
      foundGeminiRuntimeReference = true;
      break;
    }
  }

  checks.push({
    id: 'no-gemini-runtime-references',
    description: 'No Gemini SDK or GEMINI_API_KEY references remain in backend service runtime code',
    ok: !foundGeminiRuntimeReference,
  });

  const envExamplePath = path.join(workspaceRoot, '.env.example');
  const envExample = await readFile(envExamplePath, 'utf8');
  checks.push({
    id: 'env-example-no-gemini-template',
    description: '.env.example no longer recommends GEMINI_API_KEY',
    ok: !/GEMINI_API_KEY/.test(envExample),
  });

  const failed = checks.filter((check) => !check.ok);

  for (const check of checks) {
    const prefix = check.ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} [${check.id}] ${check.description}`);
  }

  if (failed.length > 0) {
    console.log(`\nPhase 5 no-gemini check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 5 no-gemini check passed. Runtime cleanup guardrails are satisfied.');
}

runChecks().catch((error) => {
  console.error('Unexpected error while running phase5 no-gemini check:', error);
  process.exit(1);
});
