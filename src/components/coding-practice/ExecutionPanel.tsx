import React from 'react';
import { SubmissionResult, ExecutionResult } from '@/types/codingPractice';
import { formatExecutionTime } from '@/services/codeExecutionService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Terminal,
  FileCheck
} from 'lucide-react';

interface ExecutionPanelProps {
  result: SubmissionResult | null;
  isRunning: boolean;
  error: string | null;
}

const TestCaseResult: React.FC<{ result: ExecutionResult; index: number }> = ({
  result,
  index,
}) => {
  return (
    <div
      className={`p-3 rounded-lg border ${
        result.passed
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="font-medium text-sm">Test Case {index + 1}</span>
          <Badge 
            variant="outline" 
            className={result.passed ? 'text-green-500' : 'text-red-500'}
          >
            {result.passed ? 'Passed' : 'Failed'}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatExecutionTime(result.executionTime)}
        </div>
      </div>

      {result.error ? (
        <div className="mt-2 p-2 bg-red-500/10 rounded text-sm text-red-500 font-mono">
          <span className="font-semibold">Error: </span>
          {result.error}
        </div>
      ) : (
        <div className="space-y-2 text-sm font-mono">
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[70px]">Output:</span>
            <code className={result.passed ? 'text-green-500' : 'text-red-500'}>
              {result.output || 'undefined'}
            </code>
          </div>
          {!result.passed && (
            <div className="flex gap-2">
              <span className="text-muted-foreground min-w-[70px]">Expected:</span>
              <code className="text-blue-500">{result.expectedOutput}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  result,
  isRunning,
  error,
}) => {
  if (isRunning) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Running tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Terminal className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          Run your code to see results here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">Ctrl + Enter</kbd> to run
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="results" className="h-full flex flex-col">
      <div className="px-4 pt-2 border-b">
        <TabsList className="h-9">
          <TabsTrigger value="results" className="text-xs">
            <FileCheck className="w-3.5 h-3.5 mr-1.5" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="console" className="text-xs">
            <Terminal className="w-3.5 h-3.5 mr-1.5" />
            Console
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="results" className="flex-1 m-0 p-0">
        <div className="p-4">
          {/* Summary */}
          <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${
            result.overallPassed 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {result.overallPassed ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className={`font-semibold ${
                  result.overallPassed ? 'text-green-500' : 'text-red-500'
                }`}>
                  {result.overallPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.passedTests}/{result.totalTests} test cases passed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatExecutionTime(result.totalExecutionTime)}
              </div>
            </div>
          </div>

          {/* Individual Results */}
          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="space-y-3 pr-4">
              {result.results.map((testResult, index) => (
                <TestCaseResult 
                  key={testResult.testCaseId} 
                  result={testResult} 
                  index={index} 
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      <TabsContent value="console" className="flex-1 m-0 p-4">
        <div className="h-full bg-muted/50 rounded-lg p-3 font-mono text-sm">
          <p className="text-muted-foreground">
            Console output will appear here...
          </p>
          {/* TODO: Capture and display console.log outputs */}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ExecutionPanel;
