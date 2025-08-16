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
  return <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 relative overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 dark:opacity-10"></div>
      
      <div className="container mx-auto px-2 sm:px-4 text-center relative z-10 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            Your Journey to
            <span className="bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent block mt-1 sm:mt-2 leading-normal md:leading-normal">
              Tech Mastery
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-4 max-w-3xl mx-auto">
            Follow curated learning roadmaps from foundational to mastery levels. 
            Track your progress and unlock career opportunities as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200" onClick={scrollToRoadmaps}>
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-white/20 dark:border-white/30 hover:bg-white/10 dark:hover:bg-white/20 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-xl backdrop-blur-sm text-sky-300 dark:text-sky-200"
              onClick={() => setShowLeaderboard(true)}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 px-2 sm:px-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400 dark:text-blue-300 mb-1 sm:mb-2">50+</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-300 dark:text-gray-400">Learning Components</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400 dark:text-purple-300 mb-1 sm:mb-2">5+</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-300 dark:text-gray-400">Career Roadmaps</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400 dark:text-green-300 mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-300 dark:text-gray-400">Free Resources</div>
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