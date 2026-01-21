import { 
  TestCase, 
  ExecutionResult, 
  SubmissionResult, 
  CodeValidationResult 
} from '@/types/codingPractice';

// Worker pool management
interface WorkerInstance {
  worker: Worker;
  busy: boolean;
  id: number;
}

class CodeExecutionEngine {
  private workerPool: WorkerInstance[] = [];
  private maxWorkers = 2;
  private workerIdCounter = 0;
  private useWorkers = true;
  
  constructor() {
    // Try to initialize worker pool
    this.initializeWorkerPool();
  }
  
  private initializeWorkerPool() {
    try {
      for (let i = 0; i < this.maxWorkers; i++) {
        this.addWorker();
      }
    } catch (error) {
      console.warn('Web Workers not available, falling back to direct execution');
      this.useWorkers = false;
    }
  }
  
  private addWorker(): WorkerInstance | null {
    try {
      const worker = new Worker(
        new URL('../workers/codeExecutor.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      const instance: WorkerInstance = {
        worker,
        busy: false,
        id: this.workerIdCounter++
      };
      
      this.workerPool.push(instance);
      return instance;
    } catch (error) {
      console.error('Failed to create worker:', error);
      this.useWorkers = false;
      return null;
    }
  }
  
  private getAvailableWorker(): WorkerInstance | null {
    if (!this.useWorkers) return null;
    
    // Find an available worker
    let instance = this.workerPool.find(w => !w.busy);
    
    // If no available worker and we can create more, create one
    if (!instance && this.workerPool.length < this.maxWorkers) {
      instance = this.addWorker();
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
    timeLimit: number = 5000
  ): Promise<ExecutionResult> {
    const instance = this.getAvailableWorker();
    
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
        const index = this.workerPool.indexOf(instance);
        if (index > -1) {
          this.workerPool.splice(index, 1);
        }
        // Add a fresh worker
        this.addWorker();
        
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
    runHiddenTests: boolean = false
  ): Promise<SubmissionResult> {
    const testsToRun = runHiddenTests 
      ? testCases 
      : testCases.filter(tc => !tc.isHidden);
    
    const results: ExecutionResult[] = [];
    let totalExecutionTime = 0;
    
    // Run tests sequentially to avoid overwhelming the browser
    for (const testCase of testsToRun) {
      const result = await this.executeTestCase(code, functionName, testCase, timeLimit);
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
    for (const instance of this.workerPool) {
      instance.worker.terminate();
    }
    this.workerPool = [];
  }
}

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  /\beval\s*\(/gi,
  /\bFunction\s*\(/gi,
  /\bnew\s+Function\b/gi,
  /\bimport\s*\(/gi,
  /\bimport\s+/gi,
  /\brequire\s*\(/gi,
  /\bfetch\s*\(/gi,
  /\bXMLHttpRequest\b/gi,
  /\bWebSocket\b/gi,
  /\bdocument\b/gi,
  /\bwindow\b/gi,
  /\blocalStorage\b/gi,
  /\bsessionStorage\b/gi,
  /\bindexedDB\b/gi,
  /\bnavigator\b/gi,
  /\blocation\b/gi,
  /\bhistory\b/gi,
  /\balert\s*\(/gi,
  /\bconfirm\s*\(/gi,
  /\bprompt\s*\(/gi,
  /\bsetTimeout\s*\(/gi,
  /\bsetInterval\s*\(/gi,
  /\bpostMessage\s*\(/gi,
  /\b__proto__\b/gi,
  /\bprototype\s*\[/gi,
  /\bconstructor\s*\[/gi,
  /\bprocess\b/gi,
  /\bglobal\b/gi,
  /\bBuffer\b/gi,
];

// Basic code validation
function validateCodeBasic(code: string): CodeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(code)) {
      const match = code.match(pattern);
      errors.push(`Blocked pattern: "${match?.[0] || 'unknown'}"`);
    }
  }
  
  // Check for infinite loop indicators
  if (/while\s*\(\s*true\s*\)/i.test(code) && !/break/i.test(code)) {
    warnings.push('Potential infinite loop: while(true) without break');
  }
  
  if (/for\s*\(\s*;\s*;\s*\)/i.test(code) && !/break/i.test(code)) {
    warnings.push('Potential infinite loop: for(;;) without break');
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
  
  return {
    console: {
      log: (...args: any[]) => {
        consoleOutput.push(args.map(a => JSON.stringify(a)).join(' '));
      },
      error: (...args: any[]) => {
        consoleOutput.push('[error] ' + args.map(a => JSON.stringify(a)).join(' '));
      },
      warn: (...args: any[]) => {
        consoleOutput.push('[warn] ' + args.map(a => JSON.stringify(a)).join(' '));
      },
      info: (...args: any[]) => {
        consoleOutput.push('[info] ' + args.map(a => JSON.stringify(a)).join(' '));
      },
    },
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    BigInt,
    Symbol,
    JSON,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Date,
    RegExp,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURI,
    decodeURI,
    encodeURIComponent,
    decodeURIComponent,
    undefined,
    NaN,
    Infinity,
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
  runHiddenTests: boolean = false
): Promise<SubmissionResult> => {
  return getExecutionEngine().runAllTestCases(code, functionName, testCases, timeLimit, runHiddenTests);
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