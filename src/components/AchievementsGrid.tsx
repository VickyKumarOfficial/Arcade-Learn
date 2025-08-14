import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/types";
import { CheckCircle, Lock } from "lucide-react";

interface AchievementsGridProps {
  achievements: Achievement[];
  onClose?: () => void;
}

export const AchievementsGrid = ({ achievements, onClose }: AchievementsGridProps) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div>Achievements</div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {unlockedCount} of {achievements.length} unlocked
              </div>
            </div>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({achievements.length})
          </Button>
          <Button 
            variant={filter === 'unlocked' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('unlocked')}
          >
            Unlocked ({unlockedCount})
          </Button>
          <Button 
            variant={filter === 'locked' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('locked')}
          >
            Locked ({achievements.length - unlockedCount})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`relative overflow-hidden ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-lg border-yellow-200 dark:border-yellow-800' 
                  : 'bg-gray-50 dark:bg-gray-800 opacity-75 border-gray-200 dark:border-gray-700'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {achievement.title}
                      </h3>
                      {achievement.unlocked ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm mb-2 ${achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={achievement.unlocked ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        +{achievement.xpReward} XP
                      </Badge>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {achievement.unlocked && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-yellow-400 border-r-transparent" />
              )}
            </Card>
          ))}
        </div>
        
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🎯</div>
            <p>No achievements found for the selected filter.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
