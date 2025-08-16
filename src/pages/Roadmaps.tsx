import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { Roadmap, RoadmapComponent } from "@/types";
import Navigation from "@/components/Navigation";
import { useGame } from "@/contexts/GameContext";
import { XPDisplay } from "@/components/XPDisplay";
import { AchievementPopup } from "@/components/AchievementPopup";
import BackToTopButton from "@/components/BackToTopButton";

const Roadmaps = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const { state, dispatch } = useGame();

  const handleRoadmapClick = (roadmap: Roadmap) => {
    // Update roadmap with real-time completion status
    const updatedRoadmap = {
      ...roadmap,
      components: roadmap.components.map(component => ({
        ...component,
        completed: state.userData.completedComponents.includes(`${roadmap.id}-${component.id}`)
      }))
    };
    updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => c.completed).length;
    setSelectedRoadmap(updatedRoadmap);
    setExpandedComponent(null);
  };

  const handleBackToList = () => {
    setSelectedRoadmap(null);
    setExpandedComponent(null);
  };

  const toggleComponent = (componentId: string) => {
    if (!selectedRoadmap) return;
    
    const component = selectedRoadmap.components.find(c => c.id === componentId);
    if (!component) return;

    // Check if component is already completed in game state using the full key
    const componentKey = `${selectedRoadmap.id}-${componentId}`;
    const isCurrentlyCompleted = state.userData.completedComponents.includes(componentKey);
    
    // Update local roadmap state for UI
    const updatedRoadmap = { ...selectedRoadmap };
    const componentToUpdate = updatedRoadmap.components.find(c => c.id === componentId);
    if (componentToUpdate) {
      componentToUpdate.completed = !isCurrentlyCompleted;
      // Calculate real-time completed count
      updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => 
        state.userData.completedComponents.includes(`${selectedRoadmap.id}-${c.id}`) || c.id === componentId && !isCurrentlyCompleted
      ).length;
      setSelectedRoadmap(updatedRoadmap);

      // Dispatch appropriate action based on current state
      if (!isCurrentlyCompleted) {
        // Component is being completed
        dispatch({ 
          type: 'COMPLETE_COMPONENT', 
          payload: { component: componentToUpdate, roadmapId: selectedRoadmap.id } 
        });
      } else {
        // Component is being uncompleted
        dispatch({ 
          type: 'UNCOMPLETE_COMPONENT', 
          payload: { component: componentToUpdate, roadmapId: selectedRoadmap.id } 
        });
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'Intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  };

  // Roadmap List View
  const RoadmapCard = ({ roadmap }: { roadmap: Roadmap }) => {
    // Calculate real-time progress
    const completedCount = roadmap.components.filter(component => 
      state.userData.completedComponents.includes(`${roadmap.id}-${component.id}`)
    ).length;
    const progressPercentage = (completedCount / roadmap.components.length) * 100;
    
    return (
      <Card 
        className="h-full hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm cursor-pointer flex flex-col overflow-hidden"
        onClick={() => handleRoadmapClick(roadmap)}
      >
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-lg sm:text-2xl mb-3 sm:mb-4 shadow-lg flex-shrink-0`}>
              {roadmap.icon}
            </div>
            <Badge className={`${getDifficultyColor(roadmap.difficulty)} text-xs sm:text-sm flex-shrink-0`}>
              {roadmap.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">{roadmap.title}</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {roadmap.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0 flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3 sm:space-y-4 flex-1">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium text-gray-900 dark:text-white text-right">{roadmap.estimatedDuration}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Components</span>
              <span className="font-medium text-gray-900 dark:text-white text-right">{roadmap.components.length} modules</span>
            </div>
            
            {completedCount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{completedCount}/{roadmap.components.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            <div className={`w-full bg-gradient-to-r ${roadmap.color} hover:opacity-90 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-center`}>
              {completedCount > 0 ? 'Continue Learning' : 'Start Roadmap'}
            </div>
          </div>
          
          <Button 
            className={`w-full bg-gradient-to-r ${roadmap.color} hover:opacity-90 text-white font-medium py-2 sm:py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg mt-3 sm:mt-4 text-sm sm:text-base`}
          >
            {roadmap.completedComponents > 0 ? 'Continue Learning' : 'Start Roadmap'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Roadmap Detail View
  const RoadmapDetailView = () => {
    if (!selectedRoadmap) return null;

    const progressPercentage = (selectedRoadmap.completedComponents / selectedRoadmap.components.length) * 100;
    const totalHours = selectedRoadmap.components.reduce((total, component) => total + component.estimatedHours, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <Button
            onClick={handleBackToList}
            variant="outline"
            className="mb-6 bg-white/10 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/30 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmaps
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${selectedRoadmap.color} flex items-center justify-center text-3xl shadow-2xl`}>
                {selectedRoadmap.icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white dark:text-gray-100 mb-2">{selectedRoadmap.title}</h1>
                <p className="text-gray-300 dark:text-gray-400 text-lg max-w-2xl">{selectedRoadmap.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Badge className={getDifficultyColor(selectedRoadmap.difficulty)}>
                {selectedRoadmap.difficulty}
              </Badge>
              <div className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{selectedRoadmap.estimatedDuration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <span>{totalHours} total hours</span>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8 bg-white/10 dark:bg-gray-800/60 border-white/20 dark:border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white dark:text-gray-100">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white dark:text-gray-100">
                  <span>Completed Components</span>
                  <span className="font-bold">{selectedRoadmap.completedComponents} / {selectedRoadmap.components.length}</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/20 dark:bg-gray-700/50">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 transition-all duration-300 ease-in-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-center text-gray-300 dark:text-gray-400">
                  {Math.round(progressPercentage)}% Complete
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-6">Learning Components</h2>
            {selectedRoadmap.components.map((component: RoadmapComponent, index: number) => (
              <Card key={component.id} className="bg-white/10 dark:bg-gray-800/40 border-white/20 dark:border-gray-600/30 hover:bg-white/15 dark:hover:bg-gray-800/60 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleComponent(component.id)}
                        className="mt-1 transition-colors"
                      >
                        {component.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-400 dark:text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-white dark:hover:text-gray-200" />
                        )}
                      </button>
                      <div className="flex-1">
                        <CardTitle className="text-white dark:text-gray-100 mb-2">
                          {index + 1}. {component.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 dark:text-gray-400">
                          {component.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 dark:text-gray-500">
                          <span>~{component.estimatedHours} hours</span>
                          <span>{component.resources.length} resources</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedComponent(
                        expandedComponent === component.id ? null : component.id
                      )}
                      className="bg-white/10 dark:bg-gray-700/50 border-white/20 dark:border-gray-600/30 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/70"
                    >
                      {expandedComponent === component.id ? 'Collapse' : 'View Resources'}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedComponent === component.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white dark:text-gray-100">Learning Resources:</h4>
                      {component.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-white/5 dark:bg-gray-700/30 rounded-lg border border-white/10 dark:border-gray-600/20">
                          <div>
                            <div className="font-medium text-white dark:text-gray-100">{resource.title}</div>
                            <div className="text-sm text-gray-400 dark:text-gray-500 capitalize">{resource.type} • {resource.duration}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-white/10 dark:bg-gray-600/50 border-white/20 dark:border-gray-500/30 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-600/70"
                          >
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
        <BackToTopButton />
      </div>
    );
  };

  // Main render - show list or detail view
  return (
    <>
      {/* Achievement Popups - Always visible */}
      {state.newlyUnlockedAchievements.map((achievement) => (
        <AchievementPopup
          key={achievement.id}
          achievement={achievement}
          onClose={() => dispatch({ type: 'DISMISS_ACHIEVEMENT', payload: { achievementId: achievement.id } })}
        />
      ))}

      {/* XP Animation - Always visible */}
      <XPDisplay 
        xpGained={state.recentXPGain}
        component={state.lastCompletedComponent}
        isVisible={state.showXPAnimation}
        levelUp={state.levelUp}
        newLevel={state.newLevel}
      />
      
      {selectedRoadmap ? (
        <RoadmapDetailView />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navigation />
          <div className="container mx-auto px-4 py-8 pt-24">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-normal md:leading-normal">
                Learning Roadmaps
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose your learning path and master new skills with our curated roadmaps. 
                Each roadmap is designed to take you from beginner to expert level.
              </p>
            </div>

            {/* Roadmaps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
              {roadmaps.map((roadmap) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} />
              ))}
            </div>
          </div>
          <BackToTopButton />
    </div>
      )}
    </>
  );
};

export default Roadmaps;
