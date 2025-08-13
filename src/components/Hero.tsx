import { Button } from "@/components/ui/button";
import { ArrowDown, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Leaderboard } from "./Leaderboard";

const Hero = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { state } = useGame();
  
  const scrollToRoadmaps = () => {
    document.getElementById('roadmaps')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 dark:opacity-10"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your Journey to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
              Tech Mastery
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 dark:text-gray-400 mb-8 leading-relaxed px-4">
            Follow curated learning roadmaps from foundational to mastery levels. 
            Track your progress and unlock career opportunities as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200" onClick={scrollToRoadmaps}>
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-white/20 dark:border-white/30 hover:bg-white/10 dark:hover:bg-white/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl backdrop-blur-sm text-sky-300 dark:text-sky-200"
              onClick={() => setShowLeaderboard(true)}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto mb-12 sm:mb-16 px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 dark:text-blue-300 mb-2">50+</div>
              <div className="text-sm sm:text-base text-gray-300 dark:text-gray-400">Learning Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 dark:text-purple-300 mb-2">5+</div>
              <div className="text-sm sm:text-base text-gray-300 dark:text-gray-400">Career Roadmaps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 dark:text-green-300 mb-2">100%</div>
              <div className="text-sm sm:text-base text-gray-300 dark:text-gray-400">Free Resources</div>
            </div>
          </div>
        </div>
        
        <div className="animate-bounce">
          <ArrowDown className="mx-auto text-white/60 dark:text-white/50 w-8 h-8 cursor-pointer hover:text-white dark:hover:text-white/80 transition-colors" onClick={scrollToRoadmaps} />
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Leaderboard 
            userData={state.userData} 
            onClose={() => setShowLeaderboard(false)}
          />
        </div>
      )}
    </section>;
};
export default Hero;