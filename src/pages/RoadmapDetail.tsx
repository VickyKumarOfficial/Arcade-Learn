
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, Circle, Clock, ArrowLeft, ExternalLink, 
  Trophy, Target, Lock, Star, AlertCircle, BarChart2, Briefcase
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
import { getComponentTestIds } from "@/data/componentMapping";
import { checkPrerequisites, canAccessComponent } from "@/lib/testSystem";
import { useDetailedCareerRecommendations } from "@/hooks/useCareerRecommendations";
import { CareerCard } from "@/components/CareerCard";

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
  const { state, dispatch } = useGameTest();

  // Get detailed career recommendations with matching tags and scores
  const careerRecommendations = useDetailedCareerRecommendations(roadmap || {} as Roadmap);
  
  // Debug: Log career recommendations
  console.log('Roadmap:', roadmap?.title, 'Tags:', roadmap?.tags);
  console.log('Career Recommendations:', careerRecommendations);
  console.log('Filtered (>= 15%):', careerRecommendations.filter(rec => rec.similarity >= 0.15));

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
          ) || [];
          
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

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Roadmap not found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Start a test for a component
  const startTest = (componentId: string) => {
    const component = roadmap?.components.find(c => c.id === componentId);
    
    if (!component) return;
    
    // Stronger lock enforcement - show specific reason
    if (component.isLocked) {
      if (component.lockReason) {
        alert(component.lockReason);
      } else {
        alert('This component is locked. Complete the previous components with at least 80% score to unlock.');
      }
      return;
    }
    
    // Map component ID to test ID using our mapping helper
    const testIds = getComponentTestIds();
    const testId = testIds[componentId] || componentId;
    
    setActiveTest({
      testId,
      componentId,
      roadmapId: roadmap?.id || ''
    });
  };
  
  // Handle test completion
  const handleTestComplete = (result: TestResult) => {
    setTestResult(result);
    setActiveTest(null);
    
    // If the test was passed, mark component as completed
    if (result.passed) {
      const componentKey = `${result.roadmapId}-${result.componentId}`;
      
      // Update local state for UI responsiveness
      const updatedRoadmap = { ...roadmap! };
      const componentToUpdate = updatedRoadmap.components.find(c => c.id === result.componentId);
      
      if (componentToUpdate && !componentToUpdate.completed) {
        componentToUpdate.completed = true;
        componentToUpdate.testResult = result;
        updatedRoadmap.completedComponents++;
        setRoadmap(updatedRoadmap);
        
        // TODO: In a real implementation, we would update the GameContext
        // dispatch({ 
        //   type: 'COMPLETE_TEST', 
        //   payload: { result, component: componentToUpdate, roadmapId: result.roadmapId } 
        // });
        
        // Check if roadmap is now complete
        if (updatedRoadmap.completedComponents === updatedRoadmap.components.length) {
          // TODO: Dispatch roadmap completion action
          // dispatch({ 
          //   type: 'COMPLETE_ROADMAP', 
          //   payload: { roadmap: updatedRoadmap } 
          // });
        }
      }
    }
  };

  // Calculate progress metrics
  const progressPercentage = (roadmap.completedComponents / roadmap.components.length) * 100;
  const totalHours = roadmap.components.reduce((total, component) => total + component.estimatedHours, 0);
  
  // Calculate rating statistics for this roadmap
  const getUserRatingForRoadmap = (roadmapId: string) => {
    if (!state.userData.testResults) return { total: 0, stars: 0, average: 0 };
    
    const roadmapTests = state.userData.testResults.filter(
      result => result.roadmapId === roadmapId && result.passed
    );
    
    const totalRating = roadmapTests.reduce((total, result) => total + result.rating, 0);
    const totalStars = Math.floor(totalRating / 100);
    const average = roadmapTests.length > 0 
      ? roadmapTests.reduce((sum, result) => sum + result.score, 0) / roadmapTests.length 
      : 0;
      
    return {
      total: totalRating,
      stars: totalStars,
      average: Math.round(average)
    };
  };
  
  const roadmapRating = getUserRatingForRoadmap(roadmap.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      {/* Test Results Display */}
      {testResult && (
        <TestResults
          result={testResult}
          onClose={() => setTestResult(null)}
        />
      )}
      
      {/* Active Test */}
      {activeTest && (
        <ComponentTest
          testId={activeTest.testId}
          componentId={activeTest.componentId}
          roadmapId={activeTest.roadmapId}
          onComplete={handleTestComplete}
          onCancel={() => setActiveTest(null)}
        />
      )}
      
      <div className="pt-[92px] sm:pt-[108px] pb-12">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-white/50 dark:hover:bg-gray-800/50"
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
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{roadmapRating.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rating Points</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{Math.round(progressPercentage)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
                  </div>
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
              <Card key={component.id} className={`backdrop-blur-sm border-0 shadow-lg transition-all duration-300 ${
                component.isLocked 
                  ? 'bg-gray-100/90 dark:bg-gray-900/90 opacity-75' 
                  : 'bg-white/90 dark:bg-gray-800/90 hover:shadow-xl'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {component.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : component.isLocked ? (
                        <Lock className="w-6 h-6 text-orange-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                          {index + 1}
                        </div>
                        <CardTitle className="text-xl flex-1 text-gray-900 dark:text-white">
                          {component.title}
                        </CardTitle>
                        {component.testResult && (
                          <ComponentRatingBadge rating={component.testResult.rating} />
                        )}
                      </div>
                      
                      <CardDescription className="text-gray-600 dark:text-gray-300 mb-3">
                        {component.description}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{component.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{component.resources.length} resources</span>
                        </div>
                        
                        {component.isLocked && (
                          <div className="flex items-center gap-1 text-orange-500">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs">
                              {component.lockReason || 'Complete prerequisites with 80% score first'}
                            </span>
                          </div>
                        )}
                        
                        {component.testResult && (
                          <div className={`flex items-center gap-1 ${
                            component.testResult.passed ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {component.testResult.passed ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Passed with {component.testResult.score}%</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4" />
                                <span>Failed with {component.testResult.score}%</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-4 mt-3">
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
                        
                        {!component.isLocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTest(component.id)}
                            disabled={component.isLocked}
                            className={`p-0 h-auto font-medium ${
                              component.testResult?.passed
                                ? 'text-green-600 hover:text-green-700 dark:text-green-400'
                                : 'text-orange-600 hover:text-orange-700 dark:text-orange-400'
                            }`}
                          >
                            {component.testResult?.passed
                              ? 'Retake Test'
                              : component.testResult
                                ? 'Try Again'
                                : 'Take Test'}
                          </Button>
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
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {/* Career Recommendations Section */}
          {/* Debug: Always show section for testing */}
          <div className="mt-12 border-2 border-red-500 p-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">DEBUG: Career Recommendations</h3>
            <p>Roadmap: {roadmap?.title || 'No roadmap'}</p>
            <p>Roadmap Tags: {roadmap?.tags?.join(', ') || 'No tags'}</p>
            <p>Total Recommendations: {careerRecommendations.length}</p>
            <p>Filtered (≥ 15%): {careerRecommendations.filter(rec => rec.similarity >= 0.15).length}</p>
            <p>Filtered (≥ 5%): {careerRecommendations.filter(rec => rec.similarity >= 0.05).length}</p>
            <div className="mt-2">
              <h4>All Recommendations:</h4>
              {careerRecommendations.map(rec => (
                <div key={rec.career.id} className="text-sm">
                  {rec.career.title}: {(rec.similarity * 100).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>
          
          {careerRecommendations.filter(rec => rec.similarity >= 0.05).length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Career Opportunities
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Careers you can pursue with skills from this roadmap
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {careerRecommendations
                  .filter(rec => rec.similarity >= 0.05)
                  .slice(0, 6)
                  .map((recommendation) => (
                    <CareerCard
                      key={recommendation.career.id}
                      career={recommendation.career}
                      matchingTags={recommendation.matchingTags}
                      similarity={recommendation.similarity}
                    />
                  ))
                }
              </div>
              
              {careerRecommendations.filter(rec => rec.similarity >= 0.05).length > 6 && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => navigate('/careers')}
                    variant="outline"
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                  >
                    View More Career Options ({careerRecommendations.filter(rec => rec.similarity >= 0.05).length - 6} more)
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {progressPercentage === 100 && (
            <div className="mt-12 text-center">
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">🎉 Congratulations!</h3>
                  <p className="text-lg mb-6">You've completed this roadmap! You're now ready to explore career opportunities.</p>
                  <Button 
                    onClick={() => navigate('/careers')}
                    className="bg-white text-green-600 hover:bg-gray-100 font-medium"
                  >
                    Explore Career Options
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
