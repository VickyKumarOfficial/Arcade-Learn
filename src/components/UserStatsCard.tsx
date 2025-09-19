import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserGameData } from "@/types";
import { Star, Target, TrendingUp } from "lucide-react";

interface UserStatsCardProps {
  userData: UserGameData;
}

export const UserStatsCard = ({ userData }: UserStatsCardProps) => {
  // Calculate average rating correctly (rating points / completed tests)
  const averageRating = userData.completedTests > 0 ? userData.totalRating / userData.completedTests : 0;
  const averageRatingOutOf10 = averageRating / 20; // Convert to 0-10 scale (200 max rating / 20 = 10)
  const completionRate = userData.averageScore;

  return (
    <Card className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white border-0 shadow-xl overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-slow-pulse"></div>
      </div>
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold">Your Progress</span>
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            ⭐ {userData.totalStars} Stars
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {/* Rating and Stars Display */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {averageRatingOutOf10.toFixed(1)}
            </div>
            <div className="text-sm opacity-90">Avg Rating</div>
            <div className="text-xs opacity-75 mt-1">Out of 10.0</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {userData.totalStars}
            </div>
            <div className="text-sm opacity-90">Total Stars</div>
            <div className="text-xs opacity-75 mt-1">All Time</div>
          </div>
        </div>
        
        {/* Test Performance Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Test Performance</span>
            <span className="opacity-90">{completionRate.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={completionRate} 
              className="h-3 bg-white/20" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full opacity-80" style={{width: `${completionRate}%`}}></div>
          </div>
          <div className="flex justify-between text-xs opacity-75">
            <span>Average Score: {userData.averageScore.toFixed(1)}%</span>
            <span>{userData.completedTests} tests completed</span>
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
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
            ⭐ {userData.totalStars} Stars
          </Badge>
          {userData.currentStreak > 0 && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
              🔥 {userData.currentStreak} Day Streak
            </Badge>
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
