import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateComponentXP } from "@/lib/gamification";
import { RoadmapComponent } from "@/types";
import { XPBadge, LevelBadge } from "./StyledBadges";
import { CheckCircle, Clock, BookOpen, X } from "lucide-react";

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

  useEffect(() => {
    if (levelUp && newLevel) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [levelUp, newLevel]);

  useEffect(() => {
    if (isVisible && xpGained > 0) {
      setShowXP(true);
      const timer = setTimeout(() => setShowXP(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, xpGained]);

  if (!isVisible || xpGained === 0) return null;

  return (
    <>
      {/* Enhanced XP Gain Animation */}
      {showXP && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-2 duration-500 fade-in">
          <Card className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white border-0 shadow-2xl max-w-xs">
            <CardContent className="p-0">
              {/* Close button */}
              <button
                onClick={() => setShowXP(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Header with celebration */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPgo=')] opacity-30" />
                
                <div className="relative z-10 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 animate-pulse" />
                  <span className="font-bold text-sm">Component Completed!</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-3">
                {/* XP Display */}
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl animate-bounce">⭐</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-200">+{xpGained}</div>
                    <div className="text-xs text-white/80">XP EARNED</div>
                  </div>
                </div>
                
                {/* Component Info */}
                {component && (
                  <div className="space-y-2 border-t border-white/20 pt-3">
                    <div className="font-medium text-sm text-center truncate">
                      {component.title}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{component.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{component.resources?.length || 0} resources</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Progress indicator */}
                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Level Up Animation */}
      {showLevelUp && newLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Card className="pointer-events-auto max-w-md mx-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-2xl animate-in zoom-in duration-700">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPgo=')] opacity-30 animate-pulse" />
              
              <div className="relative z-10">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold mb-2">LEVEL UP!</h2>
                <LevelBadge level={newLevel} size="lg" />
                <p className="text-sm opacity-90 mt-4">
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
