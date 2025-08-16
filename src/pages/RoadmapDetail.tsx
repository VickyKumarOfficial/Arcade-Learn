
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, ArrowLeft, ExternalLink, Trophy, Target } from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { Roadmap, RoadmapComponent } from "@/types";
import Navigation from "@/components/Navigation";
import { AchievementPopup } from "@/components/AchievementPopup";
import { XPDisplay, ComponentXPBadge } from "@/components/XPDisplay";
import { useGame } from "@/contexts/GameContext";

const RoadmapDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const { state, dispatch } = useGame();

  useEffect(() => {
    const foundRoadmap = roadmaps.find(r => r.id === id);
    if (foundRoadmap) {
      // Update components with completion status from game state
      const updatedRoadmap = {
        ...foundRoadmap,
        components: foundRoadmap.components.map(component => ({
          ...component,
          completed: state.userData.completedComponents.includes(`${foundRoadmap.id}-${component.id}`)
        }))
      };
      updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => c.completed).length;
      setRoadmap(updatedRoadmap);
    }
  }, [id, state.userData.completedComponents]);

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

  const toggleComponent = (componentId: string) => {
    const component = roadmap.components.find(c => c.id === componentId);
    if (!component) return;

    // Check if component is already completed in game state using the full key
    const componentKey = `${roadmap.id}-${componentId}`;
    const isCurrentlyCompleted = state.userData.completedComponents.includes(componentKey);

    // Update local state immediately for UI responsiveness
    const updatedRoadmap = { ...roadmap };
    const componentToUpdate = updatedRoadmap.components.find(c => c.id === componentId);
    if (componentToUpdate) {
      componentToUpdate.completed = !isCurrentlyCompleted;
      updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => c.completed).length;
      setRoadmap(updatedRoadmap);

      // Dispatch appropriate action based on current state
      if (!isCurrentlyCompleted) {
        // Component is being completed
        dispatch({ 
          type: 'COMPLETE_COMPONENT', 
          payload: { component: componentToUpdate, roadmapId: roadmap.id } 
        });

        // Check if roadmap is now complete
        if (updatedRoadmap.completedComponents === updatedRoadmap.components.length) {
          dispatch({ 
            type: 'COMPLETE_ROADMAP', 
            payload: { roadmap: updatedRoadmap } 
          });
        }
      } else {
        // Component is being uncompleted
        dispatch({ 
          type: 'UNCOMPLETE_COMPONENT', 
          payload: { component: componentToUpdate, roadmapId: roadmap.id } 
        });
      }
    }
  };

  const progressPercentage = (roadmap.completedComponents / roadmap.components.length) * 100;
  const totalHours = roadmap.components.reduce((total, component) => total + component.estimatedHours, 0);
  const totalXP = roadmap.components.reduce((total, component) => total + component.xpReward, 0);
  const earnedXP = roadmap.components.filter(c => c.completed).reduce((total, component) => total + component.xpReward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      {/* Achievement Popups */}
      {state.newlyUnlockedAchievements.map((achievement) => (
        <AchievementPopup
          key={achievement.id}
          achievement={achievement}
          onClose={() => dispatch({ type: 'DISMISS_ACHIEVEMENT', payload: { achievementId: achievement.id } })}
        />
      ))}

      {/* XP Animation */}
      <XPDisplay 
        xpGained={state.recentXPGain}
        component={state.lastCompletedComponent}
        isVisible={state.showXPAnimation}
        levelUp={state.levelUp}
        newLevel={state.newLevel}
      />
      
      <div className="pt-20 pb-12">
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
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{totalXP}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
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
              <Card key={component.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComponent(component.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {component.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                          {index + 1}
                        </div>
                        <CardTitle className={`text-xl flex-1 ${component.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {component.title}
                        </CardTitle>
                        <ComponentXPBadge component={component} />
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
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedComponent(
                          expandedComponent === component.id ? null : component.id
                        )}
                        className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-medium"
                      >
                        {expandedComponent === component.id ? 'Hide Resources' : 'View Resources'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedComponent === component.id && (
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
