import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const workspaceRoot = path.resolve(scriptDir, '..', '..');

async function run() {
  const checks = [];

  const mcpDocPath = path.join(workspaceRoot, 'MCP_IMPLEMENTATION.md');
  const mcpDoc = await readFile(mcpDocPath, 'utf8');

  checks.push({
    id: 'mcp-doc-mentions-openrouter',
    description: 'MCP implementation guide includes OpenRouter runtime guidance',
    ok: /OpenRouter/.test(mcpDoc),
  });

  checks.push({
    id: 'mcp-doc-has-openrouter-env',
    description: 'MCP implementation guide documents OPENROUTER_API_KEY setup',
    ok: /OPENROUTER_API_KEY=/.test(mcpDoc),
  });

  checks.push({
    id: 'mcp-doc-no-groq-env-assignment',
    description: 'MCP implementation guide does not assign GROQ_API_KEY',
    ok: !/\bGROQ_API_KEY\s*=/.test(mcpDoc),
  });

  checks.push({
    id: 'mcp-doc-no-gemini-env-assignment',
    description: 'MCP implementation guide does not assign GEMINI_API_KEY',
    ok: !/\bGEMINI_API_KEY\s*=/.test(mcpDoc),
  });

  checks.push({
    id: 'mcp-doc-no-frontend-gemini-assignment',
    description: 'MCP implementation guide does not assign VITE_GEMINI_API_KEY',
    ok: !/\bVITE_GEMINI_API_KEY\s*=/.test(mcpDoc),
  });

  checks.push({
    id: 'mcp-doc-no-frontend-groq-assignment',
    description: 'MCP implementation guide does not assign VITE_GROQ_API_KEY',
    ok: !/\bVITE_GROQ_API_KEY\s*=/.test(mcpDoc),
  });

  const readmePath = path.join(workspaceRoot, 'README.md');
  const readme = await readFile(readmePath, 'utf8');

  checks.push({
    id: 'readme-openrouter-reference',
    description: 'README references OpenRouter as AI provider',
    ok: /OpenRouter/.test(readme),
  });

  checks.push({
    id: 'readme-no-frontend-gemini-assignment',
    description: 'README does not assign VITE_GEMINI_API_KEY',
    ok: !/\bVITE_GEMINI_API_KEY\s*=/.test(readme),
  });

  const failed = checks.filter((check) => !check.ok);

  for (const check of checks) {
    const prefix = check.ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} [${check.id}] ${check.description}`);
  }

  if (failed.length > 0) {
    console.log(`\nPhase 7 docs-consistency check failed with ${failed.length} issue(s).`);
    process.exit(1);
  }

  console.log('\nPhase 7 docs-consistency check passed. Documentation guardrails are satisfied.');
}

run().catch((error) => {
  console.error('Unexpected error while running phase7 docs-consistency check:', error);
  process.exit(1);
});