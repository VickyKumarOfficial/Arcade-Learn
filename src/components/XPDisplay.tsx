import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateComponentXP } from "@/lib/gamification";
import { RoadmapComponent } from "@/types";
import { XPBadge, LevelBadge } from "./StyledBadges";
import { CheckCircle, Clock, BookOpen, X } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

interface XPDisplayProps {
  xpGained: number;
  component?: RoadmapComponent;
  isVisible: boolean;
  levelUp?: boolean;
  newLevel?: number;
}

export const XPDisplay = ({ xpGained, component, isVisible, levelUp = false, newLevel }: XPDisplayProps) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const { dispatch } = useGame();

  const hideXPAnimation = useCallback(() => {
    setShowXP(false);
    dispatch({ type: 'HIDE_XP_ANIMATION' });
  }, [dispatch]);

  useEffect(() => {
    if (levelUp && newLevel) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [levelUp, newLevel]);

  useEffect(() => {
    if (isVisible && xpGained > 0) {
      console.log('XPDisplay: Showing XP animation -', { xpGained, component: component?.title, isVisible });
      setShowXP(true);
      const timer = setTimeout(() => {
        console.log('XPDisplay: Auto-hiding XP animation after 4.5s');
        hideXPAnimation();
      }, 4500); // Increased to 4.5 seconds for better visibility
      return () => clearTimeout(timer);
    }
  }, [isVisible, xpGained, hideXPAnimation]);

  if (!isVisible || xpGained === 0) return null;

  return (
    <>
      {/* Enhanced XP Gain Animation */}
      {showXP && (
        <div className="fixed top-16 right-4 z-50 animate-in slide-in-from-right-2 duration-500 fade-in">
          <Card className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white border-0 shadow-xl max-w-64 w-64">
            <CardContent className="p-0">
              {/* Close button */}
              <button
                onClick={hideXPAnimation}
                className="absolute top-1 right-1 text-white/70 hover:text-white transition-colors z-10 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </button>
              
              {/* Compact Content */}
              <div className="p-3 space-y-2">
                {/* XP Display - Compact */}
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xl animate-bounce">⭐</div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-200">+{xpGained} XP</div>
                    <div className="text-xs text-white/80">Component Completed!</div>
                  </div>
                </div>
                
                {/* Component Name - Simplified */}
                {component && (
                  <div className="text-center border-t border-white/20 pt-2">
                    <div className="font-medium text-xs text-white/90 truncate">
                      {component.title}
                    </div>
                  </div>
                )}
                
                {/* Progress indicator - Smaller */}
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Level Up Animation */}
      {showLevelUp && newLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Card className="pointer-events-auto max-w-80 mx-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-2xl animate-in zoom-in duration-700">
            <CardContent className="p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPgo=')] opacity-30" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-3 animate-bounce">🎉</div>
                <h2 className="text-xl font-bold mb-3">LEVEL UP!</h2>
                <LevelBadge level={newLevel} size="lg" />
                <p className="text-sm opacity-90 mt-3">
                  You've reached Level {newLevel}!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

interface ComponentXPBadgeProps {
  component: RoadmapComponent;
  className?: string;
  completed?: boolean;
}

export const ComponentXPBadge = ({ component, className = "", completed = false }: ComponentXPBadgeProps) => {
  const xp = calculateComponentXP(component);
  
  return (
    <XPBadge 
      xp={xp} 
      showPlus={!completed}
      size="sm" 
      animated={!completed}
    />
  );
};
