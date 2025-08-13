import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/types";
import { CheckCircle, Sparkles } from "lucide-react";

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementPopup = ({ achievement, onClose }: AchievementPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <Card 
        className={`pointer-events-auto max-w-md mx-4 transition-all duration-500 transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-[-20px] opacity-0 scale-95'
        } bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white border-0 shadow-2xl`}
      >
        <CardContent className="p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+Cjwvc3ZnPgo=')] opacity-30" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="text-5xl">{achievement.icon}</div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <h2 className="text-xl font-bold">Achievement Unlocked!</h2>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
            <p className="text-sm opacity-90 mb-4">{achievement.description}</p>
            
            <div className="bg-white/20 rounded-lg px-4 py-2 mb-4">
              <span className="font-bold text-lg">+{achievement.xpReward} XP</span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              Awesome!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
