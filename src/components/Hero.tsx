import { Button } from "@/components/ui/button";
import { ArrowDown, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { Leaderboard } from "./Leaderboard";
import { AuthGuard } from "./AuthGuard";

const Hero = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { state } = useGameTest();
  const { isAuthenticated } = useAuth();

  const handleLeaderboardClick = () => {
    if (isAuthenticated) {
      setShowLeaderboard(true);
    } else {
      setShowAuthPrompt(true);
    }
  };
  
  const scrollToRoadmaps = () => {
    document.getElementById('roadmaps')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden pt-16 sm:pt-20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container mx-auto px-2 sm:px-4 text-center relative z-10 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Your Journey to
            <span className="text-primary block mt-1 sm:mt-2 leading-normal md:leading-normal">
              Tech Mastery
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2 sm:px-4 max-w-3xl mx-auto">
            Follow curated learning roadmaps from foundational to mastery levels. 
            Track your progress and unlock career opportunities as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200" onClick={scrollToRoadmaps}>
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-border hover:bg-accent/20 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-xl backdrop-blur-sm text-foreground"
              onClick={handleLeaderboardClick}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 px-2 sm:px-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">50+</div>
              <div className="text-xs sm:text-sm lg:text-base text-foreground">Learning Components</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">5+</div>
              <div className="text-xs sm:text-sm lg:text-base text-foreground">Career Roadmaps</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm lg:text-base text-foreground">Free Resources</div>
            </div>
          </div>
        </div>
        
        <div className="animate-bounce">
          <ArrowDown className="mx-auto text-foreground/60 w-8 h-8 cursor-pointer hover:text-foreground transition-colors" onClick={scrollToRoadmaps} />
        </div>
      </div>

      {/* Leaderboard Modal - Only for authenticated users */}
      {showLeaderboard && isAuthenticated && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4">
          <Leaderboard 
            userData={state.userData} 
            onClose={() => setShowLeaderboard(false)}
          />
        </div>
      )}

      {/* Auth Prompt Modal - For unauthenticated users */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4">
          <div className="bg-card p-1 rounded-xl max-w-lg w-full">
            <AuthGuard 
              title="Join the Competition!"
              description="Sign in to see where you rank among other learners"
              featuresList={[
                "View global leaderboards", 
                "Compare your progress",
                "Track your rank improvements",
                "See top performers"
              ]}
            />
            <div className="p-4 pt-0">
              <Button 
                variant="outline" 
                onClick={() => setShowAuthPrompt(false)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>;
};
export default Hero;