import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Medal, Award } from "lucide-react";
import { UserGameData } from "@/types";

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  totalXP: number;
  completedRoadmaps: number;
  avatar: string;
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Alex Chen",
    level: 15,
    totalXP: 22500,
    completedRoadmaps: 3,
    avatar: "👨‍💻"
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    level: 12,
    totalXP: 14400,
    completedRoadmaps: 2,
    avatar: "👩‍💻"
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    level: 10,
    totalXP: 10000,
    completedRoadmaps: 2,
    avatar: "🧑‍💻"
  },
  {
    id: "4",
    name: "Emily Wang",
    level: 9,
    totalXP: 8100,
    completedRoadmaps: 1,
    avatar: "👩‍🎓"
  },
  {
    id: "5",
    name: "David Kim",
    level: 8,
    totalXP: 6400,
    completedRoadmaps: 1,
    avatar: "👨‍🎓"
  }
];

interface LeaderboardProps {
  userData: UserGameData;
  onClose?: () => void;
}

export const Leaderboard = ({ userData, onClose }: LeaderboardProps) => {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">{position}</div>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-400 to-yellow-600";
      case 2:
        return "from-gray-300 to-gray-500";
      case 3:
        return "from-amber-400 to-amber-600";
      default:
        return "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800";
    }
  };

  // Add current user to leaderboard for demo
  const currentUserEntry: LeaderboardEntry = {
    id: "current",
    name: "You",
    level: userData.level,
    totalXP: userData.totalXP,
    completedRoadmaps: userData.completedRoadmaps.length,
    avatar: "🎯"
  };

  const allEntries = [...mockLeaderboard, currentUserEntry].sort((a, b) => b.totalXP - a.totalXP);
  const userRank = allEntries.findIndex(entry => entry.id === "current") + 1;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div>Leaderboard</div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                You rank #{userRank} out of {allEntries.length} learners
              </div>
            </div>
          </CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {allEntries.slice(0, 10).map((entry, index) => {
            const position = index + 1;
            const isCurrentUser = entry.id === "current";
            
            return (
              <div 
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-600' 
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${getRankColor(position)} shadow-lg`}>
                  {position <= 3 ? (
                    getRankIcon(position)
                  ) : (
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{position}</span>
                  )}
                </div>
                
                <div className="text-2xl">{entry.avatar}</div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {entry.name}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>Level {entry.level}</span>
                    </div>
                    <div>
                      <span>{entry.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div>
                      <span>{entry.completedRoadmaps} roadmaps</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
