// ============================================================================
// PYTHON CODE EXECUTOR - WEB WORKER (Pyodide-based)
// ============================================================================
// This worker executes Python code in an isolated environment using Pyodide.
// Pyodide is a Python interpreter compiled to WebAssembly.

/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

// Types for worker communication
interface TestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
}

interface WorkerInput {
  type: 'execute' | 'init';
  code?: string;
  functionName?: string;
  testCase?: TestCaseInput;
  timeLimit?: number;
}

interface WorkerOutput {
  type: 'result' | 'error' | 'ready' | 'loading';
  testCaseId?: string;
  passed?: boolean;
  output?: string;
  expectedOutput?: string;
  error?: string;
  executionTime?: number;
  consoleOutput?: string[];
  progress?: string;
}

// ============================================================================
// PYODIDE INITIALIZATION
// ============================================================================

let pyodide: any = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function initPyodide(): Promise<void> {
  if (pyodide) return;
  if (initPromise) return initPromise;
  
  isInitializing = true;
  
  initPromise = (async () => {
    try {
      self.postMessage({ type: 'loading', progress: 'Loading Python runtime...' } as WorkerOutput);
      
      // Import pyodide from CDN (more reliable than bundled)
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
      
      self.postMessage({ type: 'loading', progress: 'Initializing Python...' } as WorkerOutput);
      
      // @ts-ignore - loadPyodide is available after importScripts
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });
      
      // Set up output capture
      await pyodide.runPythonAsync(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.outputs = []
        self.max_lines = 100
        self.max_size = 50000
        self.total_size = 0
    
    def write(self, text):
        if len(self.outputs) < self.max_lines and self.total_size < self.max_size:
            self.outputs.append(str(text))
            self.total_size += len(str(text))
    
    def flush(self):
        pass
    
    def get_output(self):
        return self.outputs
    
    def clear(self):
        self.outputs = []
        self.total_size = 0

_output_capture = OutputCapture()
      `);
      
      isInitializing = false;
      self.postMessage({ type: 'ready' } as WorkerOutput);
    } catch (error: any) {
      isInitializing = false;
      throw new Error(`Failed to initialize Python: ${error.message}`);
    }
  })();
  
  return initPromise;
}

// ============================================================================
// SECURITY PATTERNS
// ============================================================================

const DANGEROUS_PATTERNS = [
  // File system
  /\bopen\s*\(/gi,
  /\bwith\s+open\b/gi,
  /\bos\s*\.\s*\w+/gi,
  /\bos\b/gi,
  /\bpathlib\b/gi,
  /\bshutil\b/gi,
  /\b__file__\b/gi,
  
  // Code execution
  /\bexec\s*\(/gi,
  /\beval\s*\(/gi,
  /\bcompile\s*\(/gi,
  /\b__import__\s*\(/gi,
  /\bimportlib\b/gi,
  
  // System access
  /\bsubprocess\b/gi,
  /\bsys\s*\.\s*exit/gi,
  /\bexit\s*\(/gi,
  /\bquit\s*\(/gi,
  
  // Network
  /\brequests\b/gi,
  /\burllib\b/gi,
  /\bsocket\b/gi,
  /\bhttp\b/gi,
  
  // Dangerous builtins
  /\bglobals\s*\(/gi,
  /\blocals\s*\(/gi,
  /\bvars\s*\(/gi,
  /\bdir\s*\(/gi,
  /\bgetattr\s*\(/gi,
  /\bsetattr\s*\(/gi,
  /\bdelattr\s*\(/gi,
  /\b__builtins__\b/gi,
  /\b__class__\b/gi,
  /\b__bases__\b/gi,
  /\b__subclasses__\b/gi,
  /\b__mro__\b/gi,
  /\b__globals__\b/gi,
  /\b__code__\b/gi,
  
  // Pickle (security risk)
  /\bpickle\b/gi,
  /\bcPickle\b/gi,
];

function validateCode(code: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (code.length > 100000) {
    errors.push('Code exceeds maximum length of 100KB');
    return { isValid: false, errors, warnings };
  }
  
  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(code)) {
      const match = code.match(pattern);
      errors.push(`Blocked: "${match?.[0]?.trim() || 'pattern'}" is not allowed for security reasons`);
    }
  }
  
  // Check for potential infinite loops
  if (/while\s+True\s*:/i.test(code) && !/break/.test(code)) {
    warnings.push('Potential infinite loop: while True without break');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

// ============================================================================
// CODE EXECUTION
// ============================================================================

async function executeUserCode(
  code: string,
  functionName: string,
  inputData: Record<string, any>
): Promise<{ result: any; error?: string; consoleOutput: string[] }> {
  try {
    // Reset output capture
    await pyodide.runPythonAsync(`
_output_capture.clear()
sys.stdout = _output_capture
sys.stderr = _output_capture
    `);
    
    // Run user code to define the function
    await pyodide.runPythonAsync(code);
    
    // Check if function exists
    const functionExists = await pyodide.runPythonAsync(`
'${functionName}' in dir()
    `);
    
    if (!functionExists) {
      return {
        result: undefined,
        error: `Function "${functionName}" not found`,
        consoleOutput: []
      };
    }
    
    // Prepare arguments
    const args = Object.values(inputData);
    const argsJson = JSON.stringify(args);
    
    // Execute the function
    const resultJson = await pyodide.runPythonAsync(`
import json

_args = json.loads('${argsJson.replace(/'/g, "\\'")}')
_result = ${functionName}(*_args)

# Convert result to JSON-serializable format
def _to_json_serializable(obj):
    if isinstance(obj, (list, tuple)):
        return [_to_json_serializable(x) for x in obj]
    elif isinstance(obj, dict):
        return {k: _to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    else:
        return str(obj)

json.dumps(_to_json_serializable(_result))
    `);
    
    // Get console output
    const consoleOutput = await pyodide.runPythonAsync(`
list(_output_capture.get_output())
    `);
    
    // Parse result
    const result = JSON.parse(resultJson);
    
    // Format console output
    const formattedOutput = consoleOutput.toJs().map((line: string) => {
      const trimmed = line.trim();
      if (trimmed) return `[log] ${trimmed}`;
      return null;
    }).filter(Boolean);
    
    return {
      result,
      consoleOutput: formattedOutput
    };
  } catch (error: any) {
    // Get any console output before the error
    let consoleOutput: string[] = [];
    try {
      const output = await pyodide.runPythonAsync(`list(_output_capture.get_output())`);
      consoleOutput = output.toJs().map((line: string) => {
        const trimmed = line.trim();
        if (trimmed) return `[log] ${trimmed}`;
        return null;
      }).filter(Boolean);
    } catch {}
    
    // Clean up error message
    let errorMessage = error.message || 'Execution error';
    
    // Extract Python traceback if present
    if (errorMessage.includes('PythonError:')) {
      const lines = errorMessage.split('\n');
      const lastLine = lines[lines.length - 1] || lines[lines.length - 2];
      if (lastLine && lastLine.trim()) {
        errorMessage = lastLine.trim();
      }
    }
    
    return {
      result: undefined,
      error: errorMessage,
      consoleOutput
    };
  }
}

function compareResults(actual: any, expected: any): boolean {
  if (actual === expected) return true;
  if (actual === undefined || expected === undefined) return false;
  if (actual === null || expected === null) return false;
  return JSON.stringify(actual) === JSON.stringify(expected);
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = async function(event: MessageEvent<WorkerInput>) {
  const { type, code, functionName, testCase, timeLimit } = event.data;
  
  // Handle init request
  if (type === 'init') {
    try {
      await initPyodide();
    } catch (error: any) {
      self.postMessage({
        type: 'error',
        error: error.message
      } as WorkerOutput);
    }
    return;
  }
  
  if (type !== 'execute' || !code || !functionName || !testCase) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase?.id || 'unknown',
      error: 'Invalid message'
    } as WorkerOutput);
    return;
  }
  
  const startTime = performance.now();
  
  // Ensure Pyodide is initialized
  try {
    await initPyodide();
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error: `Python runtime error: ${error.message}`,
      executionTime: performance.now() - startTime,
      consoleOutput: []
    } as WorkerOutput);
    return;
  }
  
  // Validate code
  const validation = validateCode(code);
  if (!validation.isValid) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error: validation.errors.join('; '),
      executionTime: performance.now() - startTime,
      consoleOutput: validation.warnings.map(w => `[warn] ${w}`)
    } as WorkerOutput);
    return;
  }
  
  // Parse test case
  let inputData: Record<string, any>;
  let expectedOutput: any;
  
  try {
    inputData = JSON.parse(testCase.input);
    expectedOutput = JSON.parse(testCase.expectedOutput);
  } catch (parseError: any) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error: `Failed to parse test case: ${parseError.message}`,
      executionTime: performance.now() - startTime,
      consoleOutput: []
    } as WorkerOutput);
    return;
  }
  
  // Execute with timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Execution timeout')), timeLimit || 10000);
  });
  
  try {
    const { result, error, consoleOutput } = await Promise.race([
      executeUserCode(code, functionName, inputData),
      timeoutPromise
    ]);
    
    const executionTime = performance.now() - startTime;
    
    if (error) {
      self.postMessage({
        type: 'error',
        testCaseId: testCase.id,
        error,
        executionTime,
        consoleOutput
      } as WorkerOutput);
      return;
    }
    
    const passed = compareResults(result, expectedOutput);
    
    self.postMessage({
      type: 'result',
      testCaseId: testCase.id,
      passed,
      output: JSON.stringify(result),
      expectedOutput: testCase.expectedOutput,
      executionTime,
      consoleOutput
    } as WorkerOutput);
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error: error.message === 'Execution timeout' 
        ? 'Execution timeout: Your code took too long. Check for infinite loops.'
        : error.message,
      executionTime: performance.now() - startTime,
      consoleOutput: []
    } as WorkerOutput);
  }
};

self.onerror = function(error: ErrorEvent) {
  self.postMessage({
    type: 'error',
    testCaseId: 'unknown',
    error: `Worker error: ${error.message || 'Unknown error'}`
  } as WorkerOutput);
};
