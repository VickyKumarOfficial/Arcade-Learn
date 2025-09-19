import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Roadmap } from "@/types";
import { useNavigate } from "react-router-dom";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { X } from "lucide-react";

interface RoadmapCardProps {
  roadmap: Roadmap;
}

const RoadmapCard = ({ roadmap }: RoadmapCardProps) => {
  const navigate = useNavigate();
  const { state } = useGameTest();
  const { user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // Calculate real-time progress
  const completedCount = roadmap.components.filter(component => 
    state.userData.completedComponents.includes(`${roadmap.id}-${component.id}`)
  ).length;
  const progressPercentage = (completedCount / roadmap.components.length) * 100;
  
  const handleStartRoadmap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
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

  return (
    <>
      <div className="group cursor-pointer transition-all duration-300 hover:scale-105" onClick={handleStartRoadmap}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 h-full flex flex-col hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
              {roadmap.icon}
            </div>
            <Badge className={`${getDifficultyColor(roadmap.difficulty)} text-sm flex-shrink-0`}>
              {roadmap.difficulty}
            </Badge>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-3">{roadmap.title}</h3>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1">
            {roadmap.description}
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium text-gray-900 dark:text-white text-right">{roadmap.estimatedDuration}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Components</span>
              <span className="font-medium text-gray-900 dark:text-white text-right">{roadmap.components.length} modules</span>
            </div>
            
            {completedCount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{completedCount}/{roadmap.components.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleStartRoadmap}
            className={`w-full bg-gradient-to-r ${roadmap.color} hover:opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-base`}
          >
            {completedCount > 0 ? 'Continue Learning' : 'Start Roadmap'}
          </Button>
        </div>
      </div>

      {/* Auth Prompt Modal - For unauthenticated users */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 pt-24">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full relative shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Close Button - Top Right Corner */}
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
            </button>
            
            {/* Compact Auth Content */}
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="mb-3 flex justify-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Start Your Learning Journey!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Sign in to access roadmaps and track your progress
                </p>
              </div>
              
              {/* Compact Features */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  "Learning roadmaps", 
                  "Track progress",
                  "Earn XP & achievements",
                  "Compete on leaderboards"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate('/signin')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-9 text-sm"
                >
                  Sign In to Continue
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 h-9 text-sm"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoadmapCard; 
