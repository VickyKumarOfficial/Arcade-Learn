import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateComponentXP } from "@/lib/gamification";
import { RoadmapComponent } from "@/types";
import { XPBadge, LevelBadge } from "./StyledBadges";

interface XPDisplayProps {
  xpGained: number;
  component?: RoadmapComponent;
  isVisible: boolean;
  levelUp?: boolean;
  newLevel?: number;
}

export const XPDisplay = ({ xpGained, component, isVisible, levelUp = false, newLevel }: XPDisplayProps) => {
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (levelUp && newLevel) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [levelUp, newLevel]);

  if (!isVisible || xpGained === 0) return null;

  return (
    <>
      {/* XP Gain Animation */}
      <div className="fixed top-24 right-6 z-40 animate-in slide-in-from-right duration-500">
        <Card className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">⭐</div>
              <div>
                <div className="font-bold text-lg">+{xpGained} XP</div>
                {component && (
                  <div className="text-sm opacity-90">
                    {component.title}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
