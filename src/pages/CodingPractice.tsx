import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { 
  ProblemPanel, 
  CodeEditor, 
  ExecutionPanel, 
  ProblemList 
} from '@/components/coding-practice';
import { useCodingPractice } from '@/hooks/useCodingPractice';
import Navigation from '@/components/Navigation';
import { 
  List, 
  X, 
  Code2, 
  Trophy,
  Target
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const CodingPractice: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showProblemList, setShowProblemList] = React.useState(true);
  
  const {
    currentProblem,
    selectProblemById,
    code,
    setCode,
    resetCode,
    isRunning,
    submissionResult,
    runTests,
    submitSolution,
    viewedHints,
    viewHint,
    filteredProblems,
    filters,
    setFilters,
    error,
    clearError,
  } = useCodingPractice();

  // Handle problem ID from URL
  useEffect(() => {
    const problemId = searchParams.get('problem');
    if (problemId) {
      selectProblemById(problemId);
    } else if (filteredProblems.length > 0 && !currentProblem) {
      // Select first problem by default
      selectProblemById(filteredProblems[0].id);
    }
  }, [searchParams, selectProblemById, filteredProblems, currentProblem]);

  const handleSelectProblem = (problemId: string) => {
    selectProblemById(problemId);
    // Update URL without navigation
    window.history.replaceState(null, '', `/practice?problem=${problemId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Problem List Sidebar - Desktop */}
        {showProblemList && (
          <div className="hidden lg:flex w-80 border-r flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Problems</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowProblemList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ProblemList
              problems={filteredProblems}
              selectedProblemId={currentProblem?.id || null}
              onSelectProblem={handleSelectProblem}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}

        {/* Mobile Problem List */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden fixed left-4 bottom-4 z-50 shadow-lg"
            >
              <List className="h-4 w-4 mr-2" />
              Problems
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex items-center gap-2 p-3 border-b">
              <Code2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Problems</h2>
            </div>
            <ProblemList
              problems={filteredProblems}
              selectedProblemId={currentProblem?.id || null}
              onSelectProblem={(id) => {
                handleSelectProblem(id);
              }}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              {!showProblemList && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex h-8"
                  onClick={() => setShowProblemList(true)}
                >
                  <List className="h-4 w-4 mr-2" />
                  Problems
                </Button>
              )}
              {currentProblem && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    {currentProblem.title}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                {filteredProblems.length} problems available
              </span>
            </div>
          </div>

          {/* Resizable Panels */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Problem Description Panel */}
            <ResizablePanel defaultSize={35} minSize={25}>
              <ProblemPanel
                problem={currentProblem}
                viewedHints={viewedHints}
                onViewHint={viewHint}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Code Editor and Results */}
            <ResizablePanel defaultSize={65} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                {/* Code Editor */}
                <ResizablePanel defaultSize={60} minSize={30}>
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    onRun={() => runTests(false)}
                    onSubmit={submitSolution}
                    onReset={resetCode}
                    isRunning={isRunning}
                  />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Execution Results */}
                <ResizablePanel defaultSize={40} minSize={20}>
                  <ExecutionPanel
                    result={submissionResult}
                    isRunning={isRunning}
                    error={error}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default CodingPractice;
