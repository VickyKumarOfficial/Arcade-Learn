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
  return <section className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden pt-16 sm:pt-20">
    {/* Gradient Glow Orb - Pink/Magenta - Must be above bg but below content */}
    <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600 blur-[300px] z-0"></div>

    {/* Dot Pattern Background */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

    <div className="container mx-auto px-2 sm:px-4 text-center relative z-10 max-w-7xl">
      <div className="max-w-4xl mx-auto">
        {/* Badge/Tag */}
        <div className="inline-flex items-center gap-2 rounded-full p-1 pr-3 mb-6 bg-blue-500/15 border border-blue-500/30">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            NEW
          </span>
          <span className="text-sm text-blue-100">Start learning with structured roadmaps</span>
        </div>

        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
          Your Journey to
          <span className="inline-block mt-2 sm:mt-3 px-4 py-1 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white">
            Tech Mastery
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 leading-relaxed px-2 sm:px-4 max-w-2xl mx-auto">
          Follow curated learning roadmaps from foundational to mastery levels.
          Track your progress and unlock career opportunities as you grow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-12 px-2 sm:px-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base lg:text-lg font-semibold rounded-full shadow-lg shadow-blue-600/25 transform hover:scale-105 transition-all duration-300"
            onClick={scrollToRoadmaps}
          >
            Start Your Journey
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-2 border-blue-900 hover:border-blue-600 hover:bg-blue-950/50 px-8 py-3 text-base lg:text-lg font-semibold rounded-full backdrop-blur-sm text-white transition-all duration-300"
            onClick={handleLeaderboardClick}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Leaderboard
          </Button>
        </div>

        {/* Stats with icons */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 lg:gap-14 max-w-3xl mx-auto mb-12 sm:mb-16 px-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            <span className="text-slate-400">50+ Learning Components</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            <span className="text-slate-400">5+ Career Roadmaps</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            <span className="text-slate-400">100% Free Resources</span>
          </div>
        </div>
      </div>

      <div className="animate-bounce">
        <ArrowDown className="mx-auto text-white/60 w-8 h-8 cursor-pointer hover:text-blue-500 transition-colors duration-300" onClick={scrollToRoadmaps} />
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