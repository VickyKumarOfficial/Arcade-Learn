
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Roadmap } from "@/types";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";

interface RoadmapCardProps {
  roadmap: Roadmap;
}

const RoadmapCard = ({ roadmap }: RoadmapCardProps) => {
  const navigate = useNavigate();
  const { state } = useGame();
  
  // Calculate real-time progress
  const completedCount = roadmap.components.filter(component => 
    state.userData.completedComponents.includes(`${roadmap.id}-${component.id}`)
  ).length;
  const progressPercentage = (completedCount / roadmap.components.length) * 100;
  
  const handleStartRoadmap = () => {
    navigate(`/roadmap/${roadmap.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'Intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  };

  return (
    <Card className="h-full hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roadmap.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
            {roadmap.icon}
          </div>
          <Badge className={getDifficultyColor(roadmap.difficulty)}>
            {roadmap.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{roadmap.title}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {roadmap.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Duration</span>
            <span className="font-medium text-gray-900 dark:text-white">{roadmap.estimatedDuration}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Components</span>
            <span className="font-medium text-gray-900 dark:text-white">{roadmap.components.length} modules</span>
          </div>
          
          {completedCount > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{completedCount}/{roadmap.components.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
          
          <Button 
            onClick={handleStartRoadmap}
            className={`w-full bg-gradient-to-r ${roadmap.color} hover:opacity-90 text-white font-medium py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg`}
          >
            {completedCount > 0 ? 'Continue Learning' : 'Start Roadmap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoadmapCard;
