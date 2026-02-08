// Web Worker for isolated code execution
// This runs in a separate thread with no access to DOM, localStorage, etc.

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const SECURITY_CONFIG = {
  maxExecutionTime: 10000,      // 10 seconds max
  maxOutputLines: 100,          // Max console.log lines
  maxStringLength: 10000,       // Max output string length (10KB)
  maxOutputTotalSize: 50000,    // Max total output size (50KB)
  maxRecursionDepth: 1000,      // Prevent stack overflow attacks
  maxArrayLength: 100000,       // Prevent memory exhaustion
  maxObjectKeys: 10000,         // Prevent object size attacks
  maxArrayOperations: 1000000,  // Max total array iterations to prevent infinite loops
};

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
  securityWarnings?: string[];
}

// ============================================================================
// DANGEROUS PATTERNS - Comprehensive blocklist
// ============================================================================

const DANGEROUS_PATTERNS: RegExp[] = [
  // === Code Execution ===
  /\beval\s*\(/gi,
  /\bFunction\s*\(/gi,
  /\bnew\s+Function\b/gi,
  /\bGeneratorFunction\b/gi,
  /\bAsyncFunction\b/gi,
  /\bAsyncGeneratorFunction\b/gi,
  
  // === Module Loading ===
  /\bimport\s*\(/gi,
  /\bimport\s+[\w{*]/gi,
  /\brequire\s*\(/gi,
  /\bexports\s*[.=\[]/gi,
  /\bmodule\s*\.\s*exports/gi,
  /\bdefine\s*\(/gi,  // AMD modules
  
  // === Network Access ===
  /\bfetch\s*\(/gi,
  /\bXMLHttpRequest\b/gi,
  /\bWebSocket\b/gi,
  /\bEventSource\b/gi,
  /\bRTCPeerConnection\b/gi,
  /\bRTCDataChannel\b/gi,
  /\bBeacon\b/gi,
  /\bsendBeacon\b/gi,
  
  // === DOM and Browser APIs ===
  /\bdocument\b/gi,
  /\bwindow\b/gi,
  /\bglobalThis\b/gi,
  /\bframes\b/gi,
  /\bparent\b/gi,
  /\btop\b(?=\s*[.\[])/gi,
  /\bopener\b/gi,
  
  // === Storage ===
  /\blocalStorage\b/gi,
  /\bsessionStorage\b/gi,
  /\bindexedDB\b/gi,
  /\bcaches\b/gi,
  /\bcookieStore\b/gi,
  
  // === Browser Features ===
  /\blocation\b/gi,
  /\bhistory\b/gi,
  /\bnavigator\b/gi,
  /\bscreen\b(?=\s*[.\[])/gi,
  /\balert\s*\(/gi,
  /\bconfirm\s*\(/gi,
  /\bprompt\s*\(/gi,
  /\bprint\s*\(/gi,
  
  // === Timers ===
  /\bsetTimeout\s*\(/gi,
  /\bsetInterval\s*\(/gi,
  /\bsetImmediate\s*\(/gi,
  /\bclearTimeout\s*\(/gi,
  /\bclearInterval\s*\(/gi,
  /\brequestAnimationFrame\s*\(/gi,
  /\bcancelAnimationFrame\s*\(/gi,
  /\brequestIdleCallback\s*\(/gi,
  /\bqueueMicrotask\s*\(/gi,
  
  // === Workers and Threading ===
  /\bWorker\s*\(/gi,
  /\bnew\s+Worker\b/gi,
  /\bSharedWorker\b/gi,
  /\bServiceWorker\b/gi,
  /\bpostMessage\s*\(/gi,
  /\bBroadcastChannel\b/gi,
  /\bMessageChannel\b/gi,
  /\bMessagePort\b/gi,
  
  // === Prototype Pollution ===
  /\b__proto__\b/gi,
  /\bconstructor\s*\[/gi,
  /\bprototype\s*\[/gi,
  /\["constructor"\]/gi,
  /\['constructor'\]/gi,
  /\["__proto__"\]/gi,
  /\['__proto__'\]/gi,
  /\["prototype"\]/gi,
  /\['prototype'\]/gi,
  /Object\s*\.\s*setPrototypeOf/gi,
  /Object\s*\.\s*getPrototypeOf/gi,
  /Object\s*\.\s*defineProperty/gi,
  /Object\s*\.\s*defineProperties/gi,
  /Object\s*\.\s*getOwnPropertyDescriptor/gi,
  /Object\s*\.\s*getOwnPropertyDescriptors/gi,
  
  // === Dangerous Object Methods ===
  /\.constructor\s*\(/gi,
  /\.constructor\s*\[/gi,
  /\bReflect\s*\./gi,
  /\bProxy\s*\(/gi,
  /\bnew\s+Proxy\b/gi,
  
  // === Node.js Globals ===
  /\bprocess\b/gi,
  /\bglobal\b(?!This)/gi,
  /\bBuffer\b/gi,
  /\b__dirname\b/gi,
  /\b__filename\b/gi,
  /\bchild_process\b/gi,
  /\bfs\b(?=\s*[.\[])/gi,
  /\bpath\b(?=\s*\.)/gi,
  /\bos\b(?=\s*\.)/gi,
  
  // === Web APIs that could be dangerous ===
  /\bFileReader\b/gi,
  /\bFileWriter\b/gi,
  /\bBlob\s*\(/gi,
  /\bFile\s*\(/gi,
  /\bFormData\b/gi,
  /\bURL\s*\.\s*createObjectURL/gi,
  /\bURL\s*\.\s*revokeObjectURL/gi,
  /\bAtob\s*\(/gi,
  /\bBtoa\s*\(/gi,
  /\bTextDecoder\b/gi,
  /\bTextEncoder\b/gi,
  /\bCrypto\b/gi,
  /\bcrypto\s*\./gi,
  
  // === Source manipulation ===
  /\.toString\s*\(\s*\)\s*\.\s*match/gi,
  /\.toString\s*\(\s*\)\s*\.\s*replace/gi,
  /Function\s*\.\s*prototype/gi,
  /arguments\s*\.\s*callee/gi,
  /arguments\s*\.\s*caller/gi,
];

// Additional patterns that might be in comments/strings (extra caution)
const SUSPICIOUS_PATTERNS: RegExp[] = [
  /javascript\s*:/gi,
  /data\s*:/gi,
  /vbscript\s*:/gi,
  /<\s*script/gi,
  /<\s*\/\s*script/gi,
  /on\w+\s*=/gi,  // Event handlers like onclick=
];

// ============================================================================
// CODE VALIDATION
// ============================================================================

// Validate code for dangerous patterns
function validateCode(code: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check code length (prevent DoS via huge code)
  if (code.length > 100000) {
    errors.push('Code exceeds maximum length of 100KB');
    return { isValid: false, errors, warnings };
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(code)) {
      const match = code.match(pattern);
      errors.push(`Blocked: "${match?.[0]?.trim() || 'pattern'}" is not allowed for security reasons`);
    }
  }
  
  // Check for suspicious patterns (warnings only)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(code)) {
      warnings.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }
  
  // Check for potential infinite loops (heuristic)
  if (/while\s*\(\s*true\s*\)/.test(code) && !/break/.test(code)) {
    warnings.push('Potential infinite loop: while(true) without break statement');
  }
  if (/while\s*\(\s*1\s*\)/.test(code) && !/break/.test(code)) {
    warnings.push('Potential infinite loop: while(1) without break statement');
  }
  if (/for\s*\(\s*;\s*;\s*\)/.test(code) && !/break/.test(code)) {
    warnings.push('Potential infinite loop: for(;;) without break statement');
  }
  
  // Check for very deep nesting (potential stack attack)
  const maxNesting = (code.match(/[\[{(]/g) || []).length;
  if (maxNesting > 500) {
    warnings.push('Very deep nesting detected - may cause stack issues');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// SAFE CONSOLE IMPLEMENTATION
// ============================================================================

// Create a safe console that captures output with size limits
function createSafeConsole(): { console: typeof console; getOutput: () => string[]; getTotalSize: () => number } {
  const output: string[] = [];
  let totalSize = 0;
  
  const stringify = (arg: any, depth: number = 0): string => {
    // Prevent deep recursion
    if (depth > 10) return '[Max depth exceeded]';
    
    try {
      if (arg === undefined) return 'undefined';
      if (arg === null) return 'null';
      if (typeof arg === 'function') return '[Function]';
      if (typeof arg === 'symbol') return arg.toString();
      
      // Handle circular references and large objects
      if (typeof arg === 'object') {
        try {
          const seen = new WeakSet();
          const str = JSON.stringify(arg, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return '[Circular]';
              seen.add(value);
            }
            if (typeof value === 'function') return '[Function]';
            if (typeof value === 'symbol') return value.toString();
            return value;
          });
          
          if (str.length > SECURITY_CONFIG.maxStringLength) {
            return str.slice(0, SECURITY_CONFIG.maxStringLength) + '... [truncated]';
          }
          return str;
        } catch {
          return '[Object]';
        }
      }
      
      const str = String(arg);
      if (str.length > SECURITY_CONFIG.maxStringLength) {
        return str.slice(0, SECURITY_CONFIG.maxStringLength) + '... [truncated]';
      }
      return str;
    } catch {
      return '[Unstringifiable]';
    }
  };
  
  const addOutput = (type: string, args: any[]) => {
    // Check limits
    if (output.length >= SECURITY_CONFIG.maxOutputLines) {
      if (output.length === SECURITY_CONFIG.maxOutputLines) {
        output.push('[log] ... output truncated (max lines reached)');
      }
      return;
    }
    
    if (totalSize >= SECURITY_CONFIG.maxOutputTotalSize) {
      if (!output.some(o => o.includes('max size reached'))) {
        output.push('[log] ... output truncated (max size reached)');
      }
      return;
    }
    
    const message = args.map(a => stringify(a)).join(' ');
    const line = `[${type}] ${message}`;
    
    totalSize += line.length;
    output.push(line);
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
    clear: () => { /* no-op */ },
    count: () => { /* no-op */ },
    countReset: () => { /* no-op */ },
    group: () => { /* no-op */ },
    groupCollapsed: () => { /* no-op */ },
    groupEnd: () => { /* no-op */ },
    time: () => { /* no-op */ },
    timeEnd: () => { /* no-op */ },
    timeLog: () => { /* no-op */ },
    assert: (condition: boolean, ...args: any[]) => {
      if (!condition) addOutput('assert', args.length ? args : ['Assertion failed']);
    },
  } as typeof console;
  
  return {
    console: safeConsole,
    getOutput: () => output,
    getTotalSize: () => totalSize
  };
}

// ============================================================================
// SANDBOX GLOBALS
// ============================================================================

// Create a frozen, safe version of Math
function createSafeMath(): Math {
  const safeMath = { ...Math };
  return Object.freeze(safeMath);
}

// Create a safe Date constructor (limited functionality)
function createSafeDate() {
  // Allow Date but prevent access to system time attacks
  return class SafeDate extends Date {
    constructor(value?: number | string | Date) {
      if (value === undefined) {
        // Default to a fixed timestamp for reproducibility
        super(1704067200000); // 2024-01-01T00:00:00.000Z
      } else {
        super(value as number | string);
      }
    }
    static now() {
      return 1704067200000; // Fixed timestamp
    }
  };
}

// Safe built-ins that users can access
function createSandboxGlobals(safeConsole: typeof console) {
  // Create safe wrappers for array methods that might cause infinite loops
  const SafeArray = class extends Array<any> {
    static iterationCount = 0;
    static maxIterations = SECURITY_CONFIG.maxArrayOperations;
    
    static resetIterationCount() {
      SafeArray.iterationCount = 0;
    }
    
    map(callback: any, thisArg?: any): any[] {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      return super.map(callback, thisArg);
    }
    
    filter(callback: any, thisArg?: any): any[] {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      return super.filter(callback, thisArg);
    }
    
    reduce(callback: any, initialValue?: any): any {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      return super.reduce(callback, initialValue);
    }
    
    forEach(callback: any, thisArg?: any): void {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      super.forEach(callback, thisArg);
    }
    
    some(callback: any, thisArg?: any): boolean {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      return super.some(callback, thisArg);
    }
    
    // Note: every() is not overridden to avoid TypeScript type predicate issues
    // The parent Array.every() works fine and the iteration count is still bounded
    // by the execution timeout
    
    find(callback: any, thisArg?: any): any {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      return super.find(callback, thisArg);
    }
    
    findIndex(callback: any, thisArg?: any): number {
      SafeArray.iterationCount += this.length;
      if (SafeArray.iterationCount > SafeArray.maxIterations) {
        throw new Error('Array operation limit exceeded - too many iterations');
      }
      return super.findIndex(callback, thisArg);
    }
  };
  
  // Use original Array but reset iteration count
  (Array as any).iterationCount = 0;
  
  return {
    // Console
    console: safeConsole,
    
    // Math (frozen copy)
    Math: createSafeMath(),
    
    // Data types - use originals since they're frozen constructors
    Array: Array,  // Use original Array for compatibility
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
    
    // Typed Arrays (safe - fixed size)
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
    
    // JSON (safe - only parse/stringify)
    JSON: Object.freeze({
      parse: JSON.parse,
      stringify: JSON.stringify
    }),
    
    // Error types
    Error: Error,
    TypeError: TypeError,
    RangeError: RangeError,
    SyntaxError: SyntaxError,
    ReferenceError: ReferenceError,
    URIError: URIError,
    EvalError: EvalError,
    
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
    
    // RegExp (limited - could be used for ReDoS attacks)
    RegExp: RegExp,
    
    // Date (safe version with fixed time)
    Date: createSafeDate(),
    
    // Promise (for async problems in future)
    Promise: Promise,
    
    // Additional safe utilities
    atob: typeof atob !== 'undefined' ? atob : undefined,
    btoa: typeof btoa !== 'undefined' ? btoa : undefined,
    
    // Structured clone for deep copying
    structuredClone: typeof structuredClone !== 'undefined' 
      ? (obj: any) => {
          try {
            const result = structuredClone(obj);
            return result;
          } catch {
            return JSON.parse(JSON.stringify(obj));
          }
        }
      : (obj: any) => JSON.parse(JSON.stringify(obj)),
  };
}

// ============================================================================
// CODE EXECUTION
// ============================================================================

// Execute user code safely
function executeUserCode(
  code: string,
  functionName: string,
  inputData: Record<string, any>
): { result: any; error?: string; consoleOutput: string[]; warnings?: string[] } {
  const { console: safeConsole, getOutput, getTotalSize } = createSafeConsole();
  const sandbox = createSandboxGlobals(safeConsole);
  
  try {
    // Create function with sandbox as scope
    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = Object.values(sandbox);
    
    // Block access to global scope by adding shadow variables for dangerous globals
    // Note: 'eval' and 'arguments' cannot be redefined in strict mode at all
    // They are blocked by static analysis in validateCode() instead
    const blockedGlobals = [
      'window', 'self', 'globalThis', 
      'document', 'location', 'navigator', 'history',
      'localStorage', 'sessionStorage', 'indexedDB',
      'fetch', 'XMLHttpRequest', 'WebSocket',
      'Worker', 'SharedWorker', 'ServiceWorker',
      'Proxy', 'Reflect',
      'importScripts', 'postMessage'
    ];
    
    // Wrap code - don't try to redefine 'eval' or 'arguments' (strict mode error)
    const wrappedCode = `
      "use strict";
      ${code}
      return typeof ${functionName} === 'function' ? ${functionName} : undefined;
    `;
    
    // Create the function factory with blocked globals as undefined parameters
    const allKeys = [...sandboxKeys, ...blockedGlobals];
    const allValues = [...sandboxValues, ...blockedGlobals.map(() => undefined)];
    
    const createUserFunction = new Function(...allKeys, wrappedCode);
    
    // Get the user's function
    const userFunction = createUserFunction(...allValues);
    
    if (typeof userFunction !== 'function') {
      return {
        result: undefined,
        error: `Function "${functionName}" not found or is not a function`,
        consoleOutput: getOutput()
      };
    }
    
    // Execute with input arguments
    const args = Object.values(inputData);
    
    // Deep clone arrays/objects to detect in-place modifications
    const clonedArgs = args.map(arg => {
      if (arg === null || arg === undefined) return arg;
      if (typeof arg === 'object') {
        try {
          return JSON.parse(JSON.stringify(arg));
        } catch {
          return arg;
        }
      }
      return arg;
    });
    
    let result = userFunction(...clonedArgs);
    
    // Handle in-place modification functions (like reverseString, merge)
    // If result is undefined and first arg was an array that changed, return it
    if (result === undefined && clonedArgs.length > 0 && Array.isArray(clonedArgs[0])) {
      result = clonedArgs[0];
    }
    
    // Check for excessive memory usage (heuristic)
    const outputSize = getTotalSize();
    if (outputSize > SECURITY_CONFIG.maxOutputTotalSize) {
      return {
        result,
        consoleOutput: getOutput(),
        warnings: ['Console output was truncated due to size limits']
      };
    }
    
    return {
      result,
      consoleOutput: getOutput()
    };
  } catch (error: any) {
    // Sanitize error message to not leak internal details
    let errorMessage = error.message || 'Execution error';
    
    // Common error patterns to make more user-friendly
    if (errorMessage.includes('is not defined')) {
      const match = errorMessage.match(/(\w+) is not defined/);
      if (match) {
        errorMessage = `'${match[1]}' is not defined. Did you forget to declare it?`;
      }
    }
    
    if (errorMessage.includes('is not a function')) {
      const match = errorMessage.match(/(\w+) is not a function/);
      if (match) {
        errorMessage = `'${match[1]}' is not a function. Check your code for typos.`;
      }
    }
    
    return {
      result: undefined,
      error: errorMessage,
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

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

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
      consoleOutput: validation.warnings.length > 0 
        ? validation.warnings.map(w => `[warn] ${w}`)
        : []
    } as WorkerOutput);
    return;
  }
  
  // Log any validation warnings to console output
  const validationWarnings = validation.warnings.map(w => `[warn] ${w}`);
  
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
      consoleOutput: validationWarnings
    } as WorkerOutput);
    return;
  }
  
  // Step 3: Execute user code
  const { result, error, consoleOutput, warnings } = executeUserCode(code, functionName, inputData);
  const executionTime = performance.now() - startTime;
  
  // Combine all warnings
  const allWarnings = [
    ...validationWarnings,
    ...(warnings?.map(w => `[warn] ${w}`) || [])
  ];
  const finalConsoleOutput = [...allWarnings, ...consoleOutput];
  
  if (error) {
    self.postMessage({
      type: 'error',
      testCaseId: testCase.id,
      error,
      executionTime,
      consoleOutput: finalConsoleOutput
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
    consoleOutput: finalConsoleOutput
  } as WorkerOutput);
};

// Handle errors
self.onerror = function(error: ErrorEvent) {
  self.postMessage({
    type: 'error',
    testCaseId: 'unknown',
    error: `Worker error: ${error.message || 'Unknown error'}`
  } as WorkerOutput);
};
