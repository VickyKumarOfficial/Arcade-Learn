import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { Roadmap } from "@/types";
import Navigation from "@/components/Navigation";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BackToTopButton from "@/components/BackToTopButton";
import { AuthGuard } from "@/components/AuthGuard";
import RoadmapsSection from "@/components/RoadmapsSection";

const Roadmaps = () => {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { state } = useGameTest();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRoadmapClick = (roadmap: Roadmap) => {
    // Check authentication before allowing access
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    // Always use test-based system - navigate to test-based roadmap page
    navigate(`/roadmap/${roadmap.id}`);
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
          </div>
          
          {/* Button moved outside flex-1 container for consistent alignment */}
          <div className={`w-full bg-gradient-to-r ${roadmap.color} hover:opacity-90 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-center mt-4`}>
            {completedCount > 0 ? 'Continue Learning' : 'Start Roadmap'}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Main render - show roadmap grid
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-[92px] sm:pt-[108px]">
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

          <RoadmapsSection />
          <BackToTopButton />
        </div>
      </div>

      {/* Auth Guard Modal */}
      {showAuthPrompt && (
        <AuthGuard 
          title="Continue Your Learning Journey"
          description="Sign in to access roadmaps and track your progress"
          featuresList={[
            "Access detailed learning roadmaps",
            "Take component tests and earn ratings",
            "Track your progress with visual analytics",
            "Unlock achievements and badges",
            "Get personalized learning recommendations"
          ]}
        />
      )}
    </>
  );
};

export default Roadmaps;