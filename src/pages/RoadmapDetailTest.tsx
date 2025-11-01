import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, Circle, Clock, ArrowLeft, ExternalLink, 
  Trophy, Target, Lock, Star, AlertCircle, BarChart2
} from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { componentTests } from "@/data/componentTests";
import { Roadmap, RoadmapComponent, TestResult } from "@/types";
import Navigation from "@/components/Navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { ComponentTest } from "@/components/ComponentTest";
import { TestResults } from "@/components/TestResults";
import { RatingDisplay, ComponentRatingBadge, ComponentStarsBadge } from "@/components/RatingDisplay";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";

// Import our new helper even though we can't replace the entire GameContext
import { checkPrerequisites, canAccessComponent } from "@/lib/testSystem";

const RoadmapDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<{
    testId: string;
    componentId: string;
    roadmapId: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showRatingAnimation, setShowRatingAnimation] = useState<boolean>(false);
  const { state, dispatch } = useGameTest();

  // Move useEffect before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    const foundRoadmap = roadmaps.find(r => r.id === id);
    if (foundRoadmap) {
      // Update components with completion status and strong lock status
      const updatedRoadmap = {
        ...foundRoadmap,
        components: foundRoadmap.components.map(component => {
          const componentKey = `${foundRoadmap.id}-${component.id}`;
          const isCompleted = state.userData.completedComponents.includes(componentKey);
          
          // Use stronger lock system with 80% score requirement
          const accessCheck = canAccessComponent(component, state.userData, foundRoadmap.id);
          const isLocked = !accessCheck.canAccess;

          // Find test results for this component (if any)
          const testResults = state.userData.testResults?.filter(result => 
            result.componentId === component.id && 
            result.roadmapId === foundRoadmap.id
          );
          
          // Get the latest test result
          const latestResult = testResults?.length > 0 
            ? testResults.sort((a, b) => 
                new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
              )[0]
            : undefined;

          return {
            ...component,
            completed: isCompleted,
            isLocked: isLocked,
            testResult: latestResult,
            lockReason: accessCheck.reason,
            requiredScore: accessCheck.requiredScore
          };
        })
      };
      
      updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => c.completed).length;
      setRoadmap(updatedRoadmap);
    }
  }, [id, state.userData.completedComponents, state.userData.testResults]);

  // This component is now the default for all roadmaps

  // Redirect non-authenticated users to AuthGuard
  if (!user) {
    return <AuthGuard 
      title="Continue Your Learning Journey"
      description="Sign in to access roadmaps and track your progress"
      featuresList={[
        "Access detailed learning roadmaps",
        "Take component tests and earn ratings",
        "Track completion progress", 
        "Earn stars and badges"
      ]}
    />;
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Roadmap not found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const startTest = (componentId: string) => {
    const component = roadmap.components.find(c => c.id === componentId);
    
    if (!component || !component.testId) return;
    
    // Stronger lock enforcement - show specific reason
    if (component.isLocked) {
      if (component.lockReason) {
        alert(component.lockReason);
      } else {
        alert('This component is locked. Complete the previous components with at least 80% score to unlock.');
      }
      return;
    }
    
    setActiveTest({
      testId: component.testId,
      componentId,
      roadmapId: roadmap.id
    });
  };

  const handleTestComplete = (result: TestResult) => {
    // Store the test result for display
    setTestResult(result);
    setActiveTest(null);
    
    // Show rating animation
    setShowRatingAnimation(true);

    // In our actual implementation, we'd use the GameContext to update the state
    const component = roadmap.components.find(c => c.id === result.componentId);
    if (component) {
      // This is where we would dispatch to our updated GameContext
      // dispatch({ 
      //   type: 'COMPLETE_TEST', 
      //   payload: { testResult: result, component, roadmapId: roadmap.id } 
      // });

      // For demo purposes, we'll update the UI directly
      const updatedRoadmap = { ...roadmap };
      const componentToUpdate = updatedRoadmap.components.find(c => c.id === result.componentId);
      if (componentToUpdate) {
        componentToUpdate.completed = result.passed;
        componentToUpdate.testResult = result;
        
        if (result.passed) {
          updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => c.completed).length;
          
          // Unlock dependent components
          updatedRoadmap.components.forEach(c => {
            if (c.prerequisiteIds && c.prerequisiteIds.includes(result.componentId)) {
              c.isLocked = false;
            }
          });
        }
        
        setRoadmap(updatedRoadmap);
      }
    }
  };

  const closeTestResult = () => {
    setTestResult(null);
    setShowRatingAnimation(false);
  };

  const retakeTest = () => {
    if (testResult) {
      setActiveTest({
        testId: testResult.testId,
        componentId: testResult.componentId,
        roadmapId: testResult.roadmapId
      });
      setTestResult(null);
    }
  };

  const progressPercentage = (roadmap.completedComponents / roadmap.components.length) * 100;
  const totalHours = roadmap.components.reduce((total, component) => total + component.estimatedHours, 0);
  
  // For the test-based progression system
  const totalRating = roadmap.components.reduce((total, component) => {
    const testResult = component.testResult;
    return total + (testResult?.rating || 0);
  }, 0);
  
  const earnedStars = roadmap.components.reduce((total, component) => {
    const testResult = component.testResult;
    return total + (testResult?.stars || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Rating Animation (replaces XP Animation) */}
      {showRatingAnimation && testResult && (
        <RatingDisplay 
          ratingGained={testResult?.rating || 0}
          starsGained={testResult?.stars || 0}
          component={roadmap.components.find(c => c.id === testResult?.componentId)}
          testResult={testResult}
          isVisible={showRatingAnimation}
          onAnimationComplete={() => setShowRatingAnimation(false)}
        />
      )}
      
      {/* Active Test Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <ComponentTest 
            testId={activeTest.testId}
            componentId={activeTest.componentId}
            roadmapId={activeTest.roadmapId}
            onComplete={handleTestComplete}
            onCancel={() => setActiveTest(null)}
          />
        </div>
      )}
      
      {/* Test Results Modal */}
      {testResult && !activeTest && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <TestResults 
            result={testResult}
            onRetake={retakeTest}
            onClose={closeTestResult}
            attemptsRemaining={
              (componentTests[testResult.testId]?.maxAttempts || 3) - 
              (state.userData.testResults?.filter(r => 
                r.testId === testResult.testId && 
                r.componentId === testResult.componentId
              ).length || 0)
            }
          />
        </div>
      )}
      
      <div className="pt-[92px] sm:pt-[108px] pb-12">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-card/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmaps
          </Button>

          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border-0">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-3xl shadow-lg`}>
                {roadmap.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{roadmap.title}</h1>
                  <Badge className={`${roadmap.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                    roadmap.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                    {roadmap.difficulty}
                  </Badge>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{roadmap.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{roadmap.components.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Components</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{totalHours}h</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
                  </div>
                  <>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {totalRating}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rating Points</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                        {earnedStars > 0 ? `⭐ ${earnedStars}` : "0"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Stars Earned</div>
                    </div>
                  </>
                </div>
                
                {progressPercentage > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{roadmap.completedComponents}/{roadmap.components.length} completed</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Components Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Components</h2>
            
            {roadmap.components.map((component, index) => (
              <Card 
                key={component.id} 
                className={`
                  bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg 
                  ${component.isLocked ? 'opacity-75' : 'hover:shadow-xl transition-all duration-300'}
                `}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {component.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : component.isLocked ? (
                        <Lock className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                          {index + 1}
                        </div>
                        <CardTitle className={`text-xl flex-1 ${component.completed ? 'text-gray-900 dark:text-white' : component.isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {component.title}
                        </CardTitle>
                        
                        {component.testResult && (
                          <div className="flex items-center gap-2">
                            <ComponentRatingBadge rating={component.testResult.rating} completed={component.completed} />
                            {component.testResult.stars > 0 && (
                              <ComponentStarsBadge stars={component.testResult.stars} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <CardDescription className="text-gray-600 dark:text-gray-300 mb-3">
                        {component.description}
                      </CardDescription>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{component.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{component.resources.length} resources</span>
                        </div>
                        
                        {component.testId && (
                          <div className="flex items-center gap-1">
                            {component.testResult?.passed ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Passed: {component.testResult.score}%
                              </Badge>
                            ) : component.testResult ? (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                Failed: {component.testResult.score}%
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Test Required
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        {!component.isLocked ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedComponent(
                              expandedComponent === component.id ? null : component.id
                            )}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-medium"
                          >
                            {expandedComponent === component.id ? 'Hide Resources' : 'View Resources'}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="text-gray-400 p-0 h-auto font-medium cursor-not-allowed"
                            onClick={() => {
                              if (component.lockReason) {
                                alert(component.lockReason);
                              } else {
                                alert('Complete the previous component with at least 80% score to access resources.');
                              }
                            }}
                          >
                            🔒 Resources Locked
                          </Button>
                        )}
                        
                        {component.testId && !component.isLocked && (
                          <Button
                            size="sm"
                            onClick={() => startTest(component.id)}
                            variant={component.completed ? "outline" : "default"}
                            className={component.completed 
                              ? "text-green-600 hover:text-green-700 dark:text-green-400" 
                              : ""
                            }
                          >
                            {component.testResult 
                              ? "Retake Test" 
                              : component.completed 
                                ? "Test Completed" 
                                : "Take Test"
                            }
                          </Button>
                        )}
                        
                        {component.isLocked && (
                          <div className="flex items-center gap-2 text-orange-500 text-sm">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs">
                              {component.lockReason || 'Complete prerequisites with 80% score first'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedComponent === component.id && !component.isLocked && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Learning Resources:</h4>
                      {component.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{resource.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {resource.type}
                              </Badge>
                            </div>
                            {resource.duration && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {resource.duration}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {component.testId && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                              <AlertCircle className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                Component Test Required
                              </h5>
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                To complete this component, you'll need to pass a test with a score of 80% or higher.
                                Each test question is worth 20 points, and you'll need to answer most questions correctly.
                              </p>
                              {component.isLocked && (
                                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Complete the prerequisite component(s) to unlock this test.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {progressPercentage === 100 && (
            <div className="mt-12 text-center">
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">🎉 Congratulations!</h3>
                  <p className="text-lg mb-6">You've completed this roadmap! You're now ready to explore job opportunities.</p>
                  <Button 
                    onClick={() => navigate('/jobs')}
                    className="bg-white text-green-600 hover:bg-gray-100 font-medium"
                  >
                    Explore Job Opportunities
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default RoadmapDetail;