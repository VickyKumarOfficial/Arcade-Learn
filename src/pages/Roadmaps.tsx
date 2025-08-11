import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { Roadmap, RoadmapComponent } from "@/types";
import Navigation from "@/components/Navigation";

const Roadmaps = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const handleRoadmapClick = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setExpandedComponent(null);
  };

  const handleBackToList = () => {
    setSelectedRoadmap(null);
    setExpandedComponent(null);
  };

  const toggleComponent = (componentId: string) => {
    if (!selectedRoadmap) return;
    
    // Simulate marking component as completed
    const updatedRoadmap = { ...selectedRoadmap };
    const component = updatedRoadmap.components.find(c => c.id === componentId);
    if (component) {
      component.completed = !component.completed;
      updatedRoadmap.completedComponents = updatedRoadmap.components.filter(c => c.completed).length;
      setSelectedRoadmap(updatedRoadmap);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Roadmap List View
  const RoadmapCard = ({ roadmap }: { roadmap: Roadmap }) => {
    const progressPercentage = (roadmap.completedComponents / roadmap.components.length) * 100;
    
    return (
      <Card 
        className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm cursor-pointer"
        onClick={() => handleRoadmapClick(roadmap)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
              {roadmap.icon}
            </div>
            <Badge className={getDifficultyColor(roadmap.difficulty)}>
              {roadmap.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">{roadmap.title}</CardTitle>
          <CardDescription className="text-gray-600 leading-relaxed">
            {roadmap.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium text-gray-900">{roadmap.estimatedDuration}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Components</span>
              <span className="font-medium text-gray-900">{roadmap.components.length} modules</span>
            </div>
            
            {roadmap.completedComponents > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{roadmap.completedComponents}/{roadmap.components.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            <div className={`w-full bg-gradient-to-r ${roadmap.color} hover:opacity-90 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-center`}>
              {roadmap.completedComponents > 0 ? 'Continue Learning' : 'Start Roadmap'}
            </div>
          </div>
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
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                <h1 className="text-4xl font-bold text-white mb-2">{selectedRoadmap.title}</h1>
                <p className="text-gray-300 text-lg max-w-2xl">{selectedRoadmap.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Badge className={getDifficultyColor(selectedRoadmap.difficulty)}>
                {selectedRoadmap.difficulty}
              </Badge>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{selectedRoadmap.estimatedDuration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>{totalHours} total hours</span>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8 bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span>Completed Components</span>
                  <span className="font-bold">{selectedRoadmap.completedComponents} / {selectedRoadmap.components.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-center text-gray-300">
                  {Math.round(progressPercentage)}% Complete
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Learning Components</h2>
            {selectedRoadmap.components.map((component: RoadmapComponent, index: number) => (
              <Card key={component.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleComponent(component.id)}
                        className="mt-1 transition-colors"
                      >
                        {component.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <CardTitle className="text-white mb-2">
                          {index + 1}. {component.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {component.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
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
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {expandedComponent === component.id ? 'Collapse' : 'View Resources'}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedComponent === component.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Learning Resources:</h4>
                      {component.resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{resource.title}</div>
                            <div className="text-sm text-gray-400 capitalize">{resource.type} • {resource.duration}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
      </div>
    );
  };

  // Main render - show list or detail view
  if (selectedRoadmap) {
    return <RoadmapDetailView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Learning Roadmaps
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose your learning path and master new skills with our curated roadmaps. 
            Each roadmap is designed to take you from beginner to expert level.
          </p>
        </div>

        {/* Roadmaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
