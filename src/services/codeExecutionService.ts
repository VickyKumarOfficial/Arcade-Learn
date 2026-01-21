import { 
  TestCase, 
  ExecutionResult, 
  SubmissionResult, 
  CodeValidationResult 
} from '@/types/codingPractice';

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bimport\s*\(/,
  /\bimport\s+/,
  /\brequire\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bdocument\b/,
  /\bwindow\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bnavigator\b/,
  /\blocation\b/,
  /\bhistory\b/,
  /\balert\s*\(/,
  /\bconfirm\s*\(/,
  /\bprompt\s*\(/,
  /\bsetTimeout\s*\(/,
  /\bsetInterval\s*\(/,
  /\bpostMessage\s*\(/,
  /\b__proto__\b/,
  /\bprototype\b/,
  /\bconstructor\b/,
  /\bprocess\b/,
  /\bglobal\b/,
  /\bBuffer\b/,
];

// Validate code before execution
export const validateCode = (code: string): CodeValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Dangerous pattern detected: ${pattern.source.replace(/\\b/g, '')}`);
    }
  }

  // Check for infinite loop indicators (basic heuristic)
  if (/while\s*\(\s*true\s*\)/.test(code) && !/break/.test(code)) {
    warnings.push('Potential infinite loop detected: while(true) without break');
  }

  if (/for\s*\(\s*;\s*;\s*\)/.test(code) && !/break/.test(code)) {
    warnings.push('Potential infinite loop detected: for(;;) without break');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Create isolated execution environment
const createSandbox = () => {
  return {
    console: {
      log: (...args: any[]) => args.map(a => JSON.stringify(a)).join(' '),
      error: (...args: any[]) => args.map(a => JSON.stringify(a)).join(' '),
      warn: (...args: any[]) => args.map(a => JSON.stringify(a)).join(' '),
    },
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    JSON,
    Map,
    Set,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
    null: null,
    NaN,
    Infinity,
  };
};

// Execute code with a test case
export const executeCode = async (
  userCode: string,
  functionName: string,
  testCase: TestCase,
  timeLimit: number = 5000
): Promise<ExecutionResult> => {
  const startTime = performance.now();
  
  try {
    // Validate code first
    const validation = validateCode(userCode);
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

    // Parse test case input
    const inputData = JSON.parse(testCase.input);
    const expectedOutput = JSON.parse(testCase.expectedOutput);

    // Create execution promise with timeout
    const executionPromise = new Promise<ExecutionResult>((resolve) => {
      try {
        // Create a sandboxed function
        const sandbox = createSandbox();
        const sandboxKeys = Object.keys(sandbox);
        const sandboxValues = Object.values(sandbox);

        // Wrap user code to capture the function
        const wrappedCode = `
          ${userCode}
          return ${functionName};
        `;

        // Create function in sandbox
        const createFunction = new Function(...sandboxKeys, wrappedCode);
        const userFunction = createFunction(...sandboxValues);

        if (typeof userFunction !== 'function') {
          resolve({
            success: false,
            passed: false,
            output: '',
            expectedOutput: testCase.expectedOutput,
            error: `Function "${functionName}" not found or not a function`,
            executionTime: performance.now() - startTime,
            testCaseId: testCase.id,
          });
          return;
        }

        // Execute the function with input arguments
        const args = Object.values(inputData);
        let result = userFunction(...args);

        // Handle in-place modifications (like reverseString, merge)
        // Check if the first argument was modified
        if (result === undefined && args.length > 0 && Array.isArray(args[0])) {
          result = args[0];
        }

        const executionTime = performance.now() - startTime;
        const outputStr = JSON.stringify(result);
        
        // Compare results
        const passed = JSON.stringify(result) === JSON.stringify(expectedOutput);

        resolve({
          success: true,
          passed,
          output: outputStr,
          expectedOutput: testCase.expectedOutput,
          executionTime,
          testCaseId: testCase.id,
        });
      } catch (error: any) {
        resolve({
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: error.message || 'Execution error',
          executionTime: performance.now() - startTime,
          testCaseId: testCase.id,
        });
      }
    });

    // Timeout promise
    const timeoutPromise = new Promise<ExecutionResult>((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          passed: false,
          output: '',
          expectedOutput: testCase.expectedOutput,
          error: `Execution timeout: exceeded ${timeLimit}ms`,
          executionTime: timeLimit,
          testCaseId: testCase.id,
        });
      }, timeLimit);
    });

    // Race between execution and timeout
    return await Promise.race([executionPromise, timeoutPromise]);
  } catch (error: any) {
    return {
      success: false,
      passed: false,
      output: '',
      expectedOutput: testCase.expectedOutput,
      error: error.message || 'Unknown error',
      executionTime: performance.now() - startTime,
      testCaseId: testCase.id,
    };
  }
};

// Run all test cases
export const runAllTestCases = async (
  userCode: string,
  functionName: string,
  testCases: TestCase[],
  timeLimit: number = 5000,
  runHiddenTests: boolean = false
): Promise<SubmissionResult> => {
  const testsToRun = runHiddenTests 
    ? testCases 
    : testCases.filter(tc => !tc.isHidden);

  const results: ExecutionResult[] = [];
  let totalExecutionTime = 0;

  for (const testCase of testsToRun) {
    const result = await executeCode(userCode, functionName, testCase, timeLimit);
    results.push(result);
    totalExecutionTime += result.executionTime;

    // Stop on first failure for quick feedback (optional)
    // if (!result.passed) break;
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
};

// Extract function name from code (basic extraction)
export const extractFunctionName = (code: string): string | null => {
  // Match: function name(
  const functionMatch = code.match(/function\s+(\w+)\s*\(/);
  if (functionMatch) {
    return functionMatch[1];
  }

  // Match: const/let/var name = function
  const varMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*function/);
  if (varMatch) {
    return varMatch[1];
  }

  // Match: const/let/var name = (
  const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*\(/);
  if (arrowMatch) {
    return arrowMatch[1];
  }

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
