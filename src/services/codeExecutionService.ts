import { 
  TestCase, 
  ExecutionResult, 
  SubmissionResult, 
  CodeValidationResult,
  SupportedLanguage
} from '@/types/codingPractice';

// Worker pool management
interface WorkerInstance {
  worker: Worker;
  busy: boolean;
  id: number;
  language: SupportedLanguage;
}

// Python worker state
interface PythonWorkerState {
  worker: Worker | null;
  ready: boolean;
  initializing: boolean;
  initPromise: Promise<void> | null;
}

class CodeExecutionEngine {
  private jsWorkerPool: WorkerInstance[] = [];
  private pythonState: PythonWorkerState = {
    worker: null,
    ready: false,
    initializing: false,
    initPromise: null,
  };
  private maxJsWorkers = 2;
  private workerIdCounter = 0;
  private useWorkers = true;
  
  constructor() {
    // Try to initialize JS worker pool
    this.initializeJsWorkerPool();
  }
  
  private initializeJsWorkerPool() {
    try {
      for (let i = 0; i < this.maxJsWorkers; i++) {
        this.addJsWorker();
      }
    } catch (error) {
      console.warn('Web Workers not available, falling back to direct execution');
      this.useWorkers = false;
    }
  }
  
  private addJsWorker(): WorkerInstance | null {
    try {
      const worker = new Worker(
        new URL('../workers/codeExecutor.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      const instance: WorkerInstance = {
        worker,
        busy: false,
        id: this.workerIdCounter++,
        language: 'javascript'
      };
      
      this.jsWorkerPool.push(instance);
      return instance;
    } catch (error) {
      console.error('Failed to create JS worker:', error);
      this.useWorkers = false;
      return null;
    }
  }
  
  // Initialize Python worker (lazy loading)
  async initPythonWorker(): Promise<void> {
    if (this.pythonState.ready) return;
    if (this.pythonState.initPromise) return this.pythonState.initPromise;
    
    this.pythonState.initializing = true;
    
    this.pythonState.initPromise = new Promise((resolve, reject) => {
      try {
        const worker = new Worker(
          new URL('../workers/pythonExecutor.worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        const timeout = setTimeout(() => {
          reject(new Error('Python initialization timeout'));
        }, 60000); // 60 second timeout for Pyodide load
        
        worker.onmessage = (event) => {
          const data = event.data;
          if (data.type === 'ready') {
            clearTimeout(timeout);
            this.pythonState.worker = worker;
            this.pythonState.ready = true;
            this.pythonState.initializing = false;
            resolve();
          } else if (data.type === 'error' && this.pythonState.initializing) {
            clearTimeout(timeout);
            reject(new Error(data.error || 'Failed to initialize Python'));
          }
        };
        
        worker.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`Python worker error: ${error.message}`));
        };
        
        // Trigger initialization
        worker.postMessage({ type: 'init' });
      } catch (error: any) {
        this.pythonState.initializing = false;
        reject(error);
      }
    });
    
    return this.pythonState.initPromise;
  }
  
  private getAvailableJsWorker(): WorkerInstance | null {
    if (!this.useWorkers) return null;
    
    let instance = this.jsWorkerPool.find(w => !w.busy);
    
    if (!instance && this.jsWorkerPool.length < this.maxJsWorkers) {
      instance = this.addJsWorker();
    }
    
    return instance || null;
  }
  
  private releaseWorker(instance: WorkerInstance) {
    instance.busy = false;
  }
  
  async executeTestCase(
    code: string,
    functionName: string,
    testCase: TestCase,
    timeLimit: number = 5000,
    language: SupportedLanguage = 'javascript'
  ): Promise<ExecutionResult> {
    if (language === 'python') {
      return this.executePythonTestCase(code, functionName, testCase, timeLimit);
    }
    return this.executeJsTestCase(code, functionName, testCase, timeLimit);
  }
  
  private async executeJsTestCase(
    code: string,
    functionName: string,
    testCase: TestCase,
    timeLimit: number = 5000
  ): Promise<ExecutionResult> {
    const instance = this.getAvailableJsWorker();
    
    // Fallback to direct execution if no workers available
    if (!instance) {
      return this.executeDirectly(code, functionName, testCase, timeLimit);
    }
    
    instance.busy = true;
    
    return new Promise<ExecutionResult>((resolve) => {
      const startTime = performance.now();
      let timeoutId: ReturnType<typeof setTimeout>;
      let resolved = false;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        instance.worker.onmessage = null;
        instance.worker.onerror = null;
        this.releaseWorker(instance);
      };
      
      const resolveOnce = (result: ExecutionResult) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(result);
      };
      
      // Set up timeout
      timeoutId = setTimeout(() => {
        // Terminate and replace the worker on timeout
        instance.worker.terminate();
        const index = this.jsWorkerPool.indexOf(instance);
        if (index > -1) {
          this.jsWorkerPool.splice(index, 1);
        }
        // Add a fresh worker
        this.addJsWorker();
        
        resolveOnce({
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: `Execution timeout: Your code took longer than ${timeLimit / 1000} seconds. This might be due to an infinite loop.`,
          executionTime: timeLimit,
          testCaseId: testCase.id,
        });
      }, timeLimit + 500);
      
      // Set up message handler
      instance.worker.onmessage = (event) => {
        const data = event.data;
        
        if (data.type === 'result') {
          resolveOnce({
            success: true,
            passed: data.passed,
            output: data.output || '',
            expectedOutput: data.expectedOutput || testCase.expectedOutput,
            executionTime: data.executionTime || (performance.now() - startTime),
            testCaseId: data.testCaseId,
            consoleOutput: data.consoleOutput,
          });
        } else if (data.type === 'error') {
          resolveOnce({
            success: false,
            passed: false,
            output: '',
            expectedOutput: testCase.expectedOutput,
            error: data.error,
            executionTime: data.executionTime || (performance.now() - startTime),
            testCaseId: data.testCaseId,
            consoleOutput: data.consoleOutput,
          });
        }
      };
      
      // Set up error handler
      instance.worker.onerror = (error) => {
        resolveOnce({
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: `Worker error: ${error.message || 'Unknown error'}`,
          executionTime: performance.now() - startTime,
          testCaseId: testCase.id,
        });
      };
      
      // Send code to worker
      instance.worker.postMessage({
        type: 'execute',
        code,
        functionName,
        testCase: {
          id: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
        },
        timeLimit,
      });
    });
  }
  
  private async executePythonTestCase(
    code: string,
    functionName: string,
    testCase: TestCase,
    timeLimit: number = 10000 // Python is slower, give more time
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    
    try {
      // Ensure Python worker is ready
      await this.initPythonWorker();
      
      if (!this.pythonState.worker || !this.pythonState.ready) {
        return {
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: 'Python environment not available',
          executionTime: performance.now() - startTime,
          testCaseId: testCase.id,
        };
      }
      
      return new Promise<ExecutionResult>((resolve) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        let resolved = false;
        
        const resolveOnce = (result: ExecutionResult) => {
          if (resolved) return;
          resolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          resolve(result);
        };
        
        // Set timeout
        timeoutId = setTimeout(() => {
          resolveOnce({
            success: false,
            passed: false,
            output: '',
            expectedOutput: testCase.expectedOutput,
            error: `Time Limit Exceeded (${timeLimit}ms)`,
            executionTime: timeLimit,
            testCaseId: testCase.id,
          });
        }, timeLimit + 1000);
        
        // Handle response
        const handler = (event: MessageEvent) => {
          const data = event.data;
          if (data.type === 'result' && data.testCaseId === testCase.id) {
            this.pythonState.worker!.removeEventListener('message', handler);
            resolveOnce({
              success: data.success,
              passed: data.passed,
              output: data.output,
              expectedOutput: testCase.expectedOutput,
              error: data.error,
              executionTime: data.executionTime || (performance.now() - startTime),
              testCaseId: testCase.id,
              consoleOutput: data.consoleOutput,
            });
          }
        };
        
        this.pythonState.worker!.addEventListener('message', handler);
        
        // Send code to Python worker
        this.pythonState.worker!.postMessage({
          type: 'execute',
          code,
          functionName,
          testCase: {
            id: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
          },
          timeLimit,
        });
      });
    } catch (error: any) {
      return {
        success: false,
        passed: false,
        output: '',
        expectedOutput: testCase.expectedOutput,
        error: error.message || 'Python execution error',
        executionTime: performance.now() - startTime,
        testCaseId: testCase.id,
      };
    }
  }
  
  // Fallback direct execution (less isolated, but works if workers fail)
  private async executeDirectly(
    code: string,
    functionName: string,
    testCase: TestCase,
    timeLimit: number
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    
    try {
      // Basic validation
      const validation = validateCodeBasic(code);
      if (!validation.isValid) {
        return {
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: `Security Error: ${validation.errors.join(', ')}`,
          executionTime: 0,
          testCaseId: testCase.id,
        };
      }
      
      const inputData = JSON.parse(testCase.input);
      const expectedOutput = JSON.parse(testCase.expectedOutput);
      
      // Create sandboxed function
      const sandbox = createSandbox();
      const sandboxKeys = Object.keys(sandbox);
      const sandboxValues = Object.values(sandbox);
      
      // Note: Don't try to redefine 'eval' or 'arguments' - causes strict mode errors
      // They are blocked by static analysis instead
      const wrappedCode = `
        "use strict";
        ${code}
        return typeof ${functionName} === 'function' ? ${functionName} : undefined;
      `;
      
      const createUserFunction = new Function(...sandboxKeys, wrappedCode);
      const userFunction = createUserFunction(...sandboxValues);
      
      if (typeof userFunction !== 'function') {
        return {
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: `Function "${functionName}" not found`,
          executionTime: performance.now() - startTime,
          testCaseId: testCase.id,
        };
      }
      
      const args = Object.values(inputData);
      const clonedArgs = args.map(arg => Array.isArray(arg) ? [...arg] : arg);
      
      let result = userFunction(...clonedArgs);
      
      // Handle in-place modifications
      if (result === undefined && clonedArgs.length > 0 && Array.isArray(clonedArgs[0])) {
        result = clonedArgs[0];
      }
      
      const passed = JSON.stringify(result) === JSON.stringify(expectedOutput);
      
      return {
        success: true,
        passed,
        output: JSON.stringify(result),
        expectedOutput: testCase.expectedOutput,
        executionTime: performance.now() - startTime,
        testCaseId: testCase.id,
      };
    } catch (error: any) {
      return {
        success: false,
        passed: false,
        output: '',
        expectedOutput: testCase.expectedOutput,
        error: error.message || 'Execution error',
        executionTime: performance.now() - startTime,
        testCaseId: testCase.id,
      };
    }
  }
  
  async runAllTestCases(
    code: string,
    functionName: string,
    testCases: TestCase[],
    timeLimit: number = 5000,
    runHiddenTests: boolean = false,
    language: SupportedLanguage = 'javascript'
  ): Promise<SubmissionResult> {
    const testsToRun = runHiddenTests 
      ? testCases 
      : testCases.filter(tc => !tc.isHidden);
    
    const results: ExecutionResult[] = [];
    let totalExecutionTime = 0;
    
    // Run tests sequentially to avoid overwhelming the browser
    for (const testCase of testsToRun) {
      const result = await this.executeTestCase(code, functionName, testCase, timeLimit, language);
      results.push(result);
      totalExecutionTime += result.executionTime;
    }
    
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;
    
    return {
      totalTests: testsToRun.length,
      passedTests,
      failedTests,
      results,
      overallPassed: failedTests === 0,
      totalExecutionTime,
    };
  }
  
  // Clean up workers
  terminate() {
    // Terminate JS workers
    for (const instance of this.jsWorkerPool) {
      instance.worker.terminate();
    }
    this.jsWorkerPool = [];
    
    // Terminate Python worker
    if (this.pythonState.worker) {
      this.pythonState.worker.terminate();
      this.pythonState = {
        worker: null,
        ready: false,
        initializing: false,
        initPromise: null,
      };
    }
  }
}

// ============================================================================
// SECURITY PATTERNS (mirrored from worker for fallback validation)
// ============================================================================

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  // Code execution
  /\beval\s*\(/gi,
  /\bFunction\s*\(/gi,
  /\bnew\s+Function\b/gi,
  /\bsetTimeout\s*\(\s*["'`]/gi,  // setTimeout with string
  /\bsetInterval\s*\(\s*["'`]/gi, // setInterval with string
  
  // Module loading
  /\bimport\s*\(/gi,
  /\bimport\s+/gi,
  /\brequire\s*\(/gi,
  /\bimportScripts\s*\(/gi,
  
  // Network access
  /\bfetch\s*\(/gi,
  /\bXMLHttpRequest\b/gi,
  /\bWebSocket\b/gi,
  /\bEventSource\b/gi,
  /\bRTCPeerConnection\b/gi,
  
  // DOM access
  /\bdocument\b/gi,
  /\bwindow\b/gi,
  /\bself\b(?!\s*\.\s*(?:console|Math|Array|Object|String|Number|Boolean))/gi,
  /\bglobalThis\b/gi,
  
  // Storage
  /\blocalStorage\b/gi,
  /\bsessionStorage\b/gi,
  /\bindexedDB\b/gi,
  /\bcaches\b/gi,
  /\bcookieStore\b/gi,
  
  // Browser APIs
  /\bnavigator\b/gi,
  /\blocation\b/gi,
  /\bhistory\b/gi,
  /\balert\s*\(/gi,
  /\bconfirm\s*\(/gi,
  /\bprompt\s*\(/gi,
  
  // Worker/Thread access
  /\bWorker\s*\(/gi,
  /\bSharedWorker\s*\(/gi,
  /\bServiceWorker\b/gi,
  /\bpostMessage\s*\(/gi,
  
  // Prototype pollution
  /\b__proto__\b/gi,
  /\bprototype\s*\[/gi,
  /\bconstructor\s*\[/gi,
  /Object\s*\.\s*setPrototypeOf/gi,
  /Object\s*\.\s*defineProperty/gi,
  /Object\s*\.\s*defineProperties/gi,
  /Reflect\s*\.\s*setPrototypeOf/gi,
  
  // Node.js globals
  /\bprocess\b/gi,
  /\bglobal\b/gi,
  /\bBuffer\b/gi,
  /\b__dirname\b/gi,
  /\b__filename\b/gi,
  /\bmodule\s*\.\s*exports/gi,
  
  // Dangerous APIs
  /\bProxy\b/gi,
  /\bReflect\b/gi,
];

// Additional patterns that are suspicious
const SUSPICIOUS_PATTERNS = [
  /while\s*\(\s*true\s*\)/gi,
  /while\s*\(\s*1\s*\)/gi,
  /for\s*\(\s*;\s*;\s*\)/gi,
];

// Basic code validation
function validateCodeBasic(code: string): CodeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check code length
  if (code.length > 100000) {
    errors.push('Code exceeds maximum length of 100KB');
    return { isValid: false, errors, warnings };
  }
  
  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(code)) {
      const match = code.match(pattern);
      errors.push(`Blocked: "${match?.[0]?.trim() || 'pattern'}" is not allowed`);
    }
  }
  
  // Check for suspicious patterns (warnings only)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(code) && !/break/.test(code)) {
      warnings.push('Potential infinite loop detected - ensure you have proper exit conditions');
    }
  }
  
  // Check for very deep nesting
  const bracketCount = (code.match(/[\[{(]/g) || []).length;
  if (bracketCount > 500) {
    warnings.push('Very deep nesting detected - may cause stack issues');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Create sandbox for direct execution fallback
function createSandbox() {
  const consoleOutput: string[] = [];
  const maxOutput = 100;
  const maxStringLen = 10000;
  
  const stringify = (arg: any): string => {
    try {
      if (arg === undefined) return 'undefined';
      if (arg === null) return 'null';
      if (typeof arg === 'function') return '[Function]';
      if (typeof arg === 'symbol') return arg.toString();
      const str = typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      return str.length > maxStringLen ? str.slice(0, maxStringLen) + '...' : str;
    } catch {
      return '[Object]';
    }
  };
  
  const addOutput = (type: string, args: any[]) => {
    if (consoleOutput.length < maxOutput) {
      const message = args.map(stringify).join(' ');
      consoleOutput.push(`[${type}] ${message}`);
    }
  };
  
  return {
    console: {
      log: (...args: any[]) => addOutput('log', args),
      error: (...args: any[]) => addOutput('error', args),
      warn: (...args: any[]) => addOutput('warn', args),
      info: (...args: any[]) => addOutput('info', args),
      debug: (...args: any[]) => addOutput('debug', args),
      trace: (...args: any[]) => addOutput('trace', args),
      table: (data: any) => addOutput('table', [data]),
      dir: (obj: any) => addOutput('dir', [obj]),
      assert: (condition: boolean, ...args: any[]) => {
        if (!condition) addOutput('assert', args.length ? args : ['Assertion failed']);
      },
      clear: () => {},
      count: () => {},
      countReset: () => {},
      group: () => {},
      groupCollapsed: () => {},
      groupEnd: () => {},
      time: () => {},
      timeEnd: () => {},
      timeLog: () => {},
    },
    // Math (frozen copy)
    Math: Object.freeze({ ...Math }),
    // Data types
    Array,
    Object,
    String,
    Number,
    Boolean,
    BigInt,
    Symbol,
    // JSON (safe subset)
    JSON: Object.freeze({
      parse: JSON.parse,
      stringify: JSON.stringify
    }),
    // Collections
    Map,
    Set,
    WeakMap,
    WeakSet,
    // Date with fixed time (deterministic for testing)
    Date: class SafeDate extends Date {
      constructor(value?: number | string | Date) {
        if (value === undefined) super(1704067200000);
        else super(value as number | string);
      }
      static now() { return 1704067200000; }
    },
    RegExp,
    // Errors
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    ReferenceError,
    URIError,
    // Utilities
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURI,
    decodeURI,
    encodeURIComponent,
    decodeURIComponent,
    // Constants
    undefined,
    NaN,
    Infinity,
    // Internal
    _consoleOutput: consoleOutput,
  };
}

// Singleton instance
let engineInstance: CodeExecutionEngine | null = null;

export function getExecutionEngine(): CodeExecutionEngine {
  if (!engineInstance) {
    engineInstance = new CodeExecutionEngine();
  }
  return engineInstance;
}

// Public API - convenience exports
export const validateCode = validateCodeBasic;

export const executeCode = async (
  code: string,
  functionName: string,
  testCase: TestCase,
  timeLimit: number = 5000
): Promise<ExecutionResult> => {
  return getExecutionEngine().executeTestCase(code, functionName, testCase, timeLimit);
};

export const runAllTestCases = async (
  code: string,
  functionName: string,
  testCases: TestCase[],
  timeLimit: number = 5000,
  runHiddenTests: boolean = false,
  language: SupportedLanguage = 'javascript'
): Promise<SubmissionResult> => {
  return getExecutionEngine().runAllTestCases(code, functionName, testCases, timeLimit, runHiddenTests, language);
};

// Extract function name from code
export const extractFunctionName = (code: string): string | null => {
  // Match: function name(
  const functionMatch = code.match(/function\s+(\w+)\s*\(/);
  if (functionMatch) return functionMatch[1];
  
  // Match: const/let/var name = function
  const varFuncMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*function/);
  if (varFuncMatch) return varFuncMatch[1];
  
  // Match: const/let/var name = (params) =>
  const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*\(/);
  if (arrowMatch) return arrowMatch[1];
  
  // Match: const/let/var name = async function
  const asyncFuncMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*async\s+function/);
  if (asyncFuncMatch) return asyncFuncMatch[1];
  
  return null;
};

// Format execution time for display
export const formatExecutionTime = (ms: number): string => {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)} μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)} ms`;
  } else {
    return `${(ms / 1000).toFixed(2)} s`;
  }
};