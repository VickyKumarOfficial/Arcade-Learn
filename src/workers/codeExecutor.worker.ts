// Web Worker for isolated code execution
// This runs in a separate thread with no access to DOM, localStorage, etc.

interface WorkerInput {
  type: 'execute';
  code: string;
  functionName: string;
  testCase: {
    id: string;
    input: string;
    expectedOutput: string;
  };
  timeLimit: number;
}

interface WorkerOutput {
  type: 'result' | 'error' | 'timeout';
  testCaseId: string;
  passed?: boolean;
  output?: string;
  expectedOutput?: string;
  error?: string;
  executionTime?: number;
  consoleOutput?: string[];
}

// Dangerous patterns to block - comprehensive list
const DANGEROUS_PATTERNS: RegExp[] = [
  // Code execution
  /\beval\s*\(/gi,
  /\bFunction\s*\(/gi,
  /\bnew\s+Function\b/gi,
  
  // Module loading
  /\bimport\s*\(/gi,
  /\bimport\s+/gi,
  /\brequire\s*\(/gi,
  /\bexports\b/gi,
  /\bmodule\b/gi,
  
  // Network access
  /\bfetch\s*\(/gi,
  /\bXMLHttpRequest\b/gi,
  /\bWebSocket\b/gi,
  /\bEventSource\b/gi,
  /\bnavigator\b/gi,
  
  // DOM and Browser APIs
  /\bdocument\b/gi,
  /\bwindow\b/gi,
  /\bself\b(?!\s*[,\)])/gi, // Allow 'self' in destructuring but not as global
  /\bglobalThis\b/gi,
  
  // Storage
  /\blocalStorage\b/gi,
  /\bsessionStorage\b/gi,
  /\bindexedDB\b/gi,
  /\bcaches\b/gi,
  
  // Browser features
  /\blocation\b/gi,
  /\bhistory\b/gi,
  /\balert\s*\(/gi,
  /\bconfirm\s*\(/gi,
  /\bprompt\s*\(/gi,
  
  // Timers (we control these)
  /\bsetTimeout\s*\(/gi,
  /\bsetInterval\s*\(/gi,
  /\bsetImmediate\s*\(/gi,
  /\brequestAnimationFrame\s*\(/gi,
  /\brequestIdleCallback\s*\(/gi,
  
  // Workers and threading
  /\bWorker\s*\(/gi,
  /\bSharedWorker\b/gi,
  /\bServiceWorker\b/gi,
  /\bpostMessage\s*\(/gi,
  
  // Prototype pollution
  /\b__proto__\b/gi,
  /\bconstructor\s*\[/gi,
  /\bprototype\s*\[/gi,
  /Object\s*\.\s*setPrototypeOf/gi,
  /Object\s*\.\s*defineProperty/gi,
  /Object\s*\.\s*defineProperties/gi,
  
  // Node.js globals (shouldn't exist in browser but extra safety)
  /\bprocess\b/gi,
  /\bglobal\b/gi,
  /\bBuffer\b/gi,
  /\b__dirname\b/gi,
  /\b__filename\b/gi,
  
  // Dangerous methods
  /\.constructor\s*\(/gi,
  /\bReflect\b/gi,
  /\bProxy\b/gi,
];

// Validate code for dangerous patterns
function validateCode(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const pattern of DANGEROUS_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(code)) {
      const match = code.match(pattern);
      errors.push(`Blocked: "${match?.[0] || pattern.source}" is not allowed for security reasons`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Create a safe console that captures output
function createSafeConsole(): { console: typeof console; getOutput: () => string[] } {
  const output: string[] = [];
  const maxOutputLength = 100;
  const maxStringLength = 1000;
  
  const stringify = (arg: any): string => {
    try {
      if (arg === undefined) return 'undefined';
      if (arg === null) return 'null';
      if (typeof arg === 'function') return '[Function]';
      if (typeof arg === 'symbol') return arg.toString();
      const str = JSON.stringify(arg);
      return str.length > maxStringLength ? str.slice(0, maxStringLength) + '...' : str;
    } catch {
      return String(arg);
    }
  };
  
  const addOutput = (type: string, args: any[]) => {
    if (output.length < maxOutputLength) {
      const message = args.map(stringify).join(' ');
      output.push(`[${type}] ${message}`);
    }
  };
  
  const safeConsole = {
    log: (...args: any[]) => addOutput('log', args),
    error: (...args: any[]) => addOutput('error', args),
    warn: (...args: any[]) => addOutput('warn', args),
    info: (...args: any[]) => addOutput('info', args),
    debug: (...args: any[]) => addOutput('debug', args),
    trace: (...args: any[]) => addOutput('trace', args),
    table: (data: any) => addOutput('table', [data]),
    dir: (obj: any) => addOutput('dir', [obj]),
    clear: () => {},
    count: () => {},
    countReset: () => {},
    group: () => {},
    groupCollapsed: () => {},
    groupEnd: () => {},
    time: () => {},
    timeEnd: () => {},
    timeLog: () => {},
    assert: (condition: boolean, ...args: any[]) => {
      if (!condition) addOutput('assert', args.length ? args : ['Assertion failed']);
    },
  } as typeof console;
  
  return {
    console: safeConsole,
    getOutput: () => output
  };
}

// Safe built-ins that users can access
function createSandboxGlobals(safeConsole: typeof console) {
  return {
    // Console
    console: safeConsole,
    
    // Math
    Math: Math,
    
    // Data types
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    Boolean: Boolean,
    BigInt: BigInt,
    Symbol: Symbol,
    
    // Collections
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet,
    
    // Typed Arrays
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    BigInt64Array: BigInt64Array,
    BigUint64Array: BigUint64Array,
    ArrayBuffer: ArrayBuffer,
    DataView: DataView,
    
    // JSON
    JSON: JSON,
    
    // Error types
    Error: Error,
    TypeError: TypeError,
    RangeError: RangeError,
    SyntaxError: SyntaxError,
    ReferenceError: ReferenceError,
    
    // Utility functions
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    encodeURI: encodeURI,
    decodeURI: decodeURI,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    
    // Constants
    undefined: undefined,
    NaN: NaN,
    Infinity: Infinity,
    
    // RegExp
    RegExp: RegExp,
    
    // Date (read-only operations)
    Date: Date,
    
    // Promise (for async problems in future)
    Promise: Promise,
  };
}

// Execute user code safely
function executeUserCode(
  code: string,
  functionName: string,
  inputData: Record<string, any>
): { result: any; error?: string; consoleOutput: string[] } {
  const { console: safeConsole, getOutput } = createSafeConsole();
  const sandbox = createSandboxGlobals(safeConsole);
  
  try {
    // Wrap user code to extract the function
    const wrappedCode = `
      "use strict";
      ${code}
      return typeof ${functionName} === 'function' ? ${functionName} : undefined;
    `;
    
    // Create function with sandbox as scope
    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = Object.values(sandbox);
    
    // Create the function factory
    const createUserFunction = new Function(...sandboxKeys, wrappedCode);
    
    // Get the user's function
    const userFunction = createUserFunction(...sandboxValues);
    
    if (typeof userFunction !== 'function') {
      return {
        result: undefined,
        error: `Function "${functionName}" not found or is not a function`,
        consoleOutput: getOutput()
      };
    }
    
    // Execute with input arguments
    const args = Object.values(inputData);
    
    // Clone arrays to detect in-place modifications
    const clonedArgs = args.map(arg => 
      Array.isArray(arg) ? [...arg] : arg
    );
    
    let result = userFunction(...clonedArgs);
    
    // Handle in-place modification functions (like reverseString, merge)
    // If result is undefined and first arg was an array that changed, return it
    if (result === undefined && clonedArgs.length > 0 && Array.isArray(clonedArgs[0])) {
      result = clonedArgs[0];
    }
    
    return {
      result,
      consoleOutput: getOutput()
    };
  } catch (error: any) {
    return {
      result: undefined,
      error: error.message || 'Execution error',
      consoleOutput: getOutput()
    };
  }
}

// Compare results with deep equality
function compareResults(actual: any, expected: any): boolean {
  // Handle undefined/null
  if (actual === expected) return true;
  if (actual === undefined || expected === undefined) return false;
  if (actual === null || expected === null) return false;
  
  // For arrays, compare sorted versions for problems where order doesn't matter
  // But for most problems, exact match is required
  return JSON.stringify(actual) === JSON.stringify(expected);
}

// Main message handler
self.onmessage = function(event: MessageEvent<WorkerInput>) {
  const { type, code, functionName, testCase, timeLimit } = event.data;
  
  if (type !== 'execute') {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error: 'Invalid message type'
    } as WorkerOutput);
    return;
  }
  
  const startTime = performance.now();
  
  // Step 1: Validate code for dangerous patterns
  const validation = validateCode(code);
  if (!validation.isValid) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error: validation.errors.join('; '),
      executionTime: performance.now() - startTime,
      consoleOutput: []
    } as WorkerOutput);
    return;
  }
  
  // Step 2: Parse test case
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
  
  // Step 3: Execute user code
  const { result, error, consoleOutput } = executeUserCode(code, functionName, inputData);
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
  
  // Step 4: Compare results
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
};

// Handle errors
self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    testCaseId: 'unknown',
    error: `Worker error: ${error.message || 'Unknown error'}`
  } as WorkerOutput);
};
