import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LogIn, 
  UserPlus, 
  Trophy, 
  Target, 
  Star, 
  BarChart3,
  Zap,
  Gift
} from "lucide-react";

interface AuthGuardProps {
  title?: string;
  description?: string;
  featuresList?: string[];
}

export const AuthGuard = ({ 
  title = "Start Your Learning Journey", 
  description = "Sign in to access your personalized dashboard and track your progress",
  featuresList = [
    "Track your XP and level progression",
    "Unlock achievements and badges", 
    "Maintain learning streaks",
    "Access personalized roadmaps",
    "View detailed analytics",
    "Compete on leaderboards"
  ]
}: AuthGuardProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title}
          </CardTitle>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuresList.map((feature, index) => {
              const icons = [Target, Star, BarChart3, Zap, Gift, Trophy];
              const Icon = icons[index % icons.length];
              
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              onClick={() => navigate('/signin')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In to Continue
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              variant="outline"
              className="flex-1 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 h-12"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Join thousands of learners on their path to tech careers
            </p>
            <div className="flex justify-center items-center space-x-6 mt-3 text-xs text-gray-400 dark:text-gray-500">
              <span>✓ Free to start</span>
              <span>✓ No credit card required</span>
              <span>✓ Instant access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
