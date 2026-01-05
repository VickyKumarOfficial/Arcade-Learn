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
        return 'bg-primary/20 text-primary hover:bg-primary/30';
      case 'Intermediate':
        return 'bg-primary/20 text-primary hover:bg-primary/30';
      case 'Advanced':
        return 'bg-primary/20 text-primary hover:bg-primary/30';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <>
      <div className="group cursor-pointer transition-all duration-300 hover:scale-105 h-full" onClick={handleStartRoadmap}>
        <div className="bg-card border border-border rounded-xl p-6 min-h-full flex flex-col hover:shadow-lg hover:border-primary/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
              {roadmap.icon}
            </div>
            <Badge className={`bg-primary/20 text-primary text-sm flex-shrink-0`}>
              {roadmap.difficulty}
            </Badge>
          </div>
          
          <h3 className="text-xl font-bold text-foreground leading-tight mb-3 line-clamp-2">{roadmap.title}</h3>
          <p className="text-base text-muted-foreground leading-relaxed mb-6 flex-1 line-clamp-3">
            {roadmap.description}
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground text-right">{roadmap.estimatedDuration}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Components</span>
              <span className="font-medium text-foreground text-right">{roadmap.components.length} modules</span>
            </div>
            
            {completedCount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{completedCount}/{roadmap.components.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleStartRoadmap}
            className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-base`}
          >
            {completedCount > 0 ? 'Continue Learning' : 'Start Roadmap'}
          </Button>
        </div>
      </div>

      {/* Auth Prompt Modal - For unauthenticated users */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4 pt-24">
          <div className="bg-card rounded-xl max-w-md w-full relative shadow-2xl border border-border">
            {/* Close Button - Top Right Corner */}
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
            
            {/* Compact Auth Content */}
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="mb-3 flex justify-center">
                  <div className="p-3 bg-primary rounded-full">
                    <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  Start Your Learning Journey!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
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
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-muted">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-xs text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate('/signin')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm"
                >
                  Sign In to Continue
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full border-border hover:border-primary hover:bg-muted h-9 text-sm"
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
