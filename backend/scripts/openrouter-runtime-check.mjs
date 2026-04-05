import { access, readFile } from 'node:fs/promises';
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

async function exists(relativePath) {
  try {
    await access(toAbsolute(relativePath));
    return true;
  } catch {
    return false;
  }
}

function logResult({ ok, id, description }) {
  console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${description}`);
}

async function runPatternChecks() {
  const checks = [
    {
      id: 'route-chat-exists',
      file: 'backend/server.js',
      pattern: /app\.post\('\/api\/ai\/chat'/,
      description: 'AI chat route exists',
    },
    {
      id: 'route-roadmap-doubt-exists',
      file: 'backend/server.js',
      pattern: /app\.post\('\/api\/roadmap\/doubt'/,
      description: 'Roadmap doubt route exists',
    },
    {
      id: 'route-survey-roadmap-exists',
      file: 'backend/server.js',
      pattern: /app\.post\('\/api\/user\/:userId\/ai-roadmap'/,
      description: 'Survey AI roadmap route exists',
    },
    {
      id: 'route-quiz-exists',
      file: 'backend/server.js',
      pattern: /app\.post\('\/api\/quiz\/generate'/,
      description: 'Quiz generation route exists',
    },
    {
      id: 'route-quiz-uses-mcp-tool',
      file: 'backend/server.js',
      pattern: /invokeMcpTool\('generate_quiz'/,
      description: 'Quiz route invokes MCP generate_quiz tool',
    },
    {
      id: 'server-chat-orchestrator-import-stable',
      file: 'backend/server.js',
      pattern: /from '\.\/services\/aiOrchestratorService\.fallback\.js'/,
      description: 'Server imports fallback chat orchestrator',
    },
    {
      id: 'provider-export-openrouter',
      file: 'backend/services/openRouterProvider.js',
      pattern: /export const openRouterProvider/,
      description: 'Shared OpenRouter provider export exists',
    },
    {
      id: 'provider-export-map-error',
      file: 'backend/services/openRouterProvider.js',
      pattern: /export function mapOpenRouterError/,
      description: 'Shared OpenRouter error mapper export exists',
    },
    {
      id: 'roadmap-service-imports-provider',
      file: 'backend/services/roadmapDoubtService.js',
      pattern: /from '\.\/openRouterProvider\.js'/,
      description: 'Roadmap doubt service imports shared provider',
    },
    {
      id: 'roadmap-service-uses-provider',
      file: 'backend/services/roadmapDoubtService.js',
      pattern: /openRouterProvider\.chatCompletion\(/,
      description: 'Roadmap doubt service calls OpenRouter provider',
    },
    {
      id: 'roadmap-service-no-groq-import',
      file: 'backend/services/roadmapDoubtService.js',
      pattern: /groq-sdk/,
      negate: true,
      description: 'Roadmap doubt service has no Groq SDK import',
    },
    {
      id: 'roadmap-service-no-groq-provider-branch',
      file: 'backend/services/roadmapDoubtService.js',
      pattern: /provider:\s*'groq'/,
      negate: true,
      description: 'Roadmap doubt service has no groq provider branch',
    },
    {
      id: 'chat-service-imports-provider',
      file: 'backend/services/aiOrchestratorService.fallback.js',
      pattern: /from '\.\/openRouterProvider\.js'/,
      description: 'Chat service imports shared provider',
    },
    {
      id: 'chat-service-uses-provider',
      file: 'backend/services/aiOrchestratorService.fallback.js',
      pattern: /openRouterProvider\.chatCompletion\(/,
      description: 'Chat service calls OpenRouter provider',
    },
    {
      id: 'chat-service-no-gemini-sdk',
      file: 'backend/services/aiOrchestratorService.fallback.js',
      pattern: /@google\/generative-ai/,
      negate: true,
      description: 'Chat service has no Gemini SDK import',
    },
    {
      id: 'chat-service-no-groq-sdk',
      file: 'backend/services/aiOrchestratorService.fallback.js',
      pattern: /groq-sdk/,
      negate: true,
      description: 'Chat service has no Groq SDK import',
    },
    {
      id: 'chat-service-no-gemini-env',
      file: 'backend/services/aiOrchestratorService.fallback.js',
      pattern: /process\.env\.GEMINI_API_KEY/,
      negate: true,
      description: 'Chat service has no GEMINI_API_KEY usage',
    },
    {
      id: 'chat-service-no-groq-env',
      file: 'backend/services/aiOrchestratorService.fallback.js',
      pattern: /process\.env\.GROQ_API_KEY/,
      negate: true,
      description: 'Chat service has no GROQ_API_KEY usage',
    },
    {
      id: 'survey-service-imports-provider',
      file: 'backend/services/surveyService.js',
      pattern: /from '\.\/openRouterProvider\.js'/,
      description: 'Survey service imports shared provider',
    },
    {
      id: 'survey-service-uses-provider',
      file: 'backend/services/surveyService.js',
      pattern: /openRouterProvider\.chatCompletion\(/,
      description: 'Survey service calls OpenRouter provider',
    },
    {
      id: 'survey-service-no-gemini-sdk',
      file: 'backend/services/surveyService.js',
      pattern: /@google\/generative-ai/,
      negate: true,
      description: 'Survey service has no Gemini SDK import',
    },
    {
      id: 'survey-service-no-gemini-env',
      file: 'backend/services/surveyService.js',
      pattern: /process\.env\.GEMINI_API_KEY/,
      negate: true,
      description: 'Survey service has no GEMINI_API_KEY usage',
    },
    {
      id: 'survey-service-no-gemini-model-label',
      file: 'backend/services/surveyService.js',
      pattern: /gemini-1\.5-flash/,
      negate: true,
      description: 'Survey service does not hardcode Gemini model label',
    },
    {
      id: 'mcp-registers-quiz-tool',
      file: 'backend/mcpServer.js',
      pattern: /registerTool\(\s*'generate_quiz'/,
      description: 'MCP server registers generate_quiz tool',
    },
    {
      id: 'mcp-imports-provider',
      file: 'backend/mcpServer.js',
      pattern: /from '\.\/services\/openRouterProvider\.js'/,
      description: 'MCP server imports shared provider',
    },
    {
      id: 'mcp-uses-provider',
      file: 'backend/mcpServer.js',
      pattern: /openRouterProvider\.chatCompletion\(/,
      description: 'MCP server uses OpenRouter provider',
    },
    {
      id: 'mcp-no-groq-sdk',
      file: 'backend/mcpServer.js',
      pattern: /groq-sdk/,
      negate: true,
      description: 'MCP server has no Groq SDK import',
    },
    {
      id: 'mcp-no-groq-env',
      file: 'backend/mcpServer.js',
      pattern: /process\.env\.GROQ_API_KEY/,
      negate: true,
      description: 'MCP server has no GROQ_API_KEY usage',
    },
    {
      id: 'frontend-roadmap-provider-openrouter-only',
      file: 'src/services/roadmapDoubtService.ts',
      pattern: /provider\?:\s*'openrouter'/,
      description: 'Frontend roadmap doubt response provider is openrouter-only',
    },
    {
      id: 'frontend-roadmap-provider-no-groq-union',
      file: 'src/services/roadmapDoubtService.ts',
      pattern: /provider\?:\s*'openrouter'\s*\|\s*'groq'/,
      negate: true,
      description: 'Frontend roadmap doubt provider union excludes groq',
    },
    {
      id: 'root-env-no-gemini-template',
      file: '.env.example',
      pattern: /GEMINI_API_KEY/,
      negate: true,
      description: 'Root .env.example has no GEMINI_API_KEY template',
    },
    {
      id: 'backend-env-no-gemini-template',
      file: 'backend/.env.example',
      pattern: /GEMINI_API_KEY/,
      negate: true,
      description: 'Backend .env.example has no GEMINI_API_KEY template',
    },
    {
      id: 'backend-env-no-groq-template',
      file: 'backend/.env.example',
      pattern: /GROQ_API_KEY/,
      negate: true,
      description: 'Backend .env.example has no GROQ_API_KEY template',
    },
  ];

  const results = [];

  for (const check of checks) {
    const source = await read(check.file);
    const matched = check.pattern.test(source);
    const ok = check.negate ? !matched : matched;
    results.push({ ok, id: check.id, description: check.description });
  }

  return results;
}

async function runComputedChecks() {
  const results = [];

  const legacyServiceRemoved = !(await exists('backend/services/aiOrchestratorService.js'));
  results.push({
    ok: legacyServiceRemoved,
    id: 'legacy-gemini-service-removed',
    description: 'Legacy Gemini orchestrator file is removed',
  });

  const backendPackageJson = JSON.parse(await read('backend/package.json'));
  const backendDeps = backendPackageJson.dependencies || {};
  results.push({
    ok: !backendDeps['@google/generative-ai'] && !backendDeps['groq-sdk'],
    id: 'backend-no-legacy-ai-deps',
    description: 'Backend dependencies exclude Gemini and Groq SDK packages',
  });

  const rootPackageJson = JSON.parse(await read('package.json'));
  const rootDeps = rootPackageJson.dependencies || {};
  const rootDevDeps = rootPackageJson.devDependencies || {};
  results.push({
    ok:
      !rootDeps['@google/genai'] &&
      !rootDeps['@google/generative-ai'] &&
      !rootDevDeps['@google/genai'] &&
      !rootDevDeps['@google/generative-ai'],
    id: 'root-no-legacy-google-ai-deps',
    description: 'Root package excludes Gemini SDK dependencies',
  });

  return results;
}

async function run() {
  const [patternResults, computedResults] = await Promise.all([runPatternChecks(), runComputedChecks()]);
  const allResults = [...patternResults, ...computedResults];
  const failed = allResults.filter((result) => !result.ok);

  for (const result of allResults) {
    logResult(result);
  }

  if (failed.length > 0) {
    console.log(`\nOpenRouter runtime check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nOpenRouter runtime check passed. Runtime/provider guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running OpenRouter runtime check:', error);
  process.exit(1);
});
