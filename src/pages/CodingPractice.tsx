import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ProblemPanel, 
  CodeEditor, 
  ExecutionPanel, 
  ProblemList,
  CodingStatsDashboard
} from '@/components/coding-practice';
import { useCodingPractice } from '@/hooks/useCodingPractice';
import Navigation from '@/components/Navigation';
import { 
  List, 
  X, 
  Code2, 
  Trophy,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CodingStats } from '@/types/codingPractice';

const CodingPractice: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showProblemList, setShowProblemList] = useState(true);
  const [activeView, setActiveView] = useState<'practice' | 'stats'>('practice');
  const [navbarVisible, setNavbarVisible] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  
  // Mock stats for now - will be replaced with real data from database
  const [codingStats] = useState<CodingStats>({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalAttempts: 0,
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalXpFromCoding: 0,
    averageExecutionTime: 0,
  });
  
  const {
    currentProblem,
    selectProblemById,
    code,
    setCode,
    resetCode,
    language,
    setLanguage,
    supportedLanguages,
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

  // Click outside detection to hide navbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarVisible &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest('[data-navbar-toggle]')
      ) {
        setNavbarVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navbarVisible]);

  const handleSelectProblem = (problemId: string) => {
    selectProblemById(problemId);
    // Update URL without navigation
    window.history.replaceState(null, '', `/practice?problem=${problemId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Backdrop blur overlay for navbar area only */}
      {navbarVisible && (
        <div 
          className="fixed top-0 left-0 right-0 h-20 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setNavbarVisible(false)}
        />
      )}
      
      <div ref={navbarRef}>
        <Navigation 
          externalVisibility={navbarVisible}
          onVisibilityChange={setNavbarVisible}
        />
      </div>
      
      {/* Toggle Arrow Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-2 left-1/2 transform -translate-x-1/2 z-[60] h-6 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90 transition-all duration-200"
        onClick={() => setNavbarVisible(!navbarVisible)}
        data-navbar-toggle
        title={navbarVisible ? "Hide navigation" : "Show navigation"}
      >
        {navbarVisible ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>
      
      {/* Spacer - smaller since navbar is hidden by default */}
      <div className="shrink-0 h-2" />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Problem List Sidebar - 3D Sliding Overlay */}
        <div className={`fixed left-0 z-30 transition-all duration-500 ease-out transform ${
          showProblemList 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
             style={{
               top: '3.5rem', // Start after the spacer
               bottom: '0',
               width: '20rem'
             }}>
          <div className="h-full bg-background border-r shadow-2xl backdrop-blur-sm flex flex-col" 
               style={{
                 transform: showProblemList ? 'perspective(1000px) rotateY(0deg)' : 'perspective(1000px) rotateY(-10deg)',
                 boxShadow: '10px 0 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
               }}>
            <div className="flex items-center justify-between p-3 border-b bg-background/95 relative z-40 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Problems</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative z-50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => setShowProblemList(false)}
                title="Close problems sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <ProblemList
                problems={filteredProblems}
                selectedProblemId={currentProblem?.id || null}
                onSelectProblem={handleSelectProblem}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        </div>

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
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 relative z-10">
            <div className="flex items-center gap-3">
              {!showProblemList && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex h-8 hover:bg-primary/10 transition-colors duration-200"
                  onClick={() => setShowProblemList(true)}
                >
                  <List className="h-4 w-4 mr-2" />
                  Problems
                </Button>
              )}
              
              {/* View Toggle Tabs */}
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'practice' | 'stats')}>
                <TabsList className="h-8">
                  <TabsTrigger value="practice" className="text-xs px-3 h-7">
                    <Code2 className="w-3.5 h-3.5 mr-1.5" />
                    Practice
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs px-3 h-7">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                    My Stats
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {activeView === 'practice' && currentProblem && (
                <div className="flex items-center gap-2 ml-2">
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
                {codingStats.totalSolved} solved · {filteredProblems.length} available
              </span>
            </div>
          </div>

          {/* Stats View */}
          {activeView === 'stats' && (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Coding Statistics
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Track your progress and improve your skills
                  </p>
                </div>
                <CodingStatsDashboard stats={codingStats} />
              </div>
            </div>
          )}

          {/* Practice View - Resizable Panels */}
          {activeView === 'practice' && (
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
                    language={language}
                    onLanguageChange={setLanguage}
                    supportedLanguages={supportedLanguages}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingPractice;
