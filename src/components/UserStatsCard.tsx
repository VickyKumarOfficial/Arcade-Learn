import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserGameData } from "@/types";
import { getLevelProgress, getLevelTitle } from "@/lib/gamification";
import { XPBadge, LevelBadge, StreakBadge } from "./StyledBadges";

interface UserStatsCardProps {
  userData: UserGameData;
}

export const UserStatsCard = ({ userData }: UserStatsCardProps) => {
  const levelInfo = getLevelProgress(userData.totalXP);
  const levelTitle = getLevelTitle(userData.level);

  return (
    <Card className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white border-0 shadow-xl overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold">Your Progress</span>
          <LevelBadge level={userData.level} title={levelTitle} size="md" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {/* XP and Level Display */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {userData.level}
            </div>
            <div className="text-sm opacity-90">Level</div>
            <div className="text-xs opacity-75 mt-1">{levelTitle}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {userData.totalXP.toLocaleString()}
            </div>
            <div className="text-sm opacity-90">Total XP</div>
            <div className="text-xs opacity-75 mt-1">All Time</div>
          </div>
        </div>
        
        {/* Level Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Level {levelInfo.current}</span>
            <span className="opacity-90">Level {levelInfo.next}</span>
          </div>
          <div className="relative">
            <Progress 
              value={levelInfo.progress} 
              className="h-3 bg-white/20" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full opacity-80" style={{width: `${levelInfo.progress}%`}}></div>
          </div>
          <div className="flex justify-between text-xs opacity-75">
            <span>{levelInfo.currentLevelXP}/100 XP</span>
            <span>{levelInfo.xpToNext} XP to next level</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-bold flex items-center justify-center gap-1 mb-1">
              🔥 {userData.currentStreak}
            </div>
            <div className="text-xs opacity-90">Current Streak</div>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-bold mb-1">{userData.totalComponentsCompleted}</div>
            <div className="text-xs opacity-90">Components Done</div>
          </div>
        </div>

        {/* Badge Row */}
        <div className="flex flex-wrap gap-2 pt-2">
          <XPBadge xp={userData.totalXP} size="sm" />
          {userData.currentStreak > 0 && (
            <StreakBadge streak={userData.currentStreak} size="sm" />
          )}
          {userData.completedRoadmaps.length > 0 && (
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
              🎯 {userData.completedRoadmaps.length} Roadmap{userData.completedRoadmaps.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
