import { useState } from "react";
import { roadmaps } from "@/data/roadmaps";
import { Roadmap } from "@/types";
import Navigation from "@/components/Navigation";
import BackToTopButton from "@/components/BackToTopButton";
import RoadmapsSection from "@/components/RoadmapsSection";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Star, BarChart3, Zap, LogIn, UserPlus, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Roadmaps = () => {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleInteraction = () => {
    if (!user) {
      setShowAuthPrompt(true);
    }
  };

  // Main render - show roadmap grid
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="w-full px-6 py-8 pt-16 sm:pt-20 relative">
          {/* Main Content - Blurred for non-authenticated users */}
          <div className={`${!user ? 'blur-sm pointer-events-none' : ''}`}>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-normal md:leading-normal">
                Learning Roadmaps
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose your learning path and master new skills with our curated roadmaps. 
                Each roadmap is designed to take you from beginner to expert level.
              </p>
            </div>

            <RoadmapsSection onInteraction={handleInteraction} isFullPage={true} />
          </div>

          {/* Authentication Prompt Overlay - For non-authenticated users */}
          {!user && (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-10 bg-black/20">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Unlock Learning Roadmaps!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Sign in to access curated learning paths and track your progress
                  </p>
                  
                  {/* Compact Features List */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {[
                      "Curated roadmaps", 
                      "Progress tracking",
                      "Interactive content",
                      "Expert guidance"
                    ].map((feature, index) => {
                      const icons = [Target, Star, BarChart3, Zap];
                      const Icon = icons[index % icons.length];
                      
                      return (
                        <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <Icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => navigate('/signin')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 text-sm"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In to Continue
                    </Button>
                    <Button 
                      onClick={() => navigate('/signup')}
                      variant="outline"
                      className="w-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 h-10 text-sm"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auth Prompt Modal - Triggered by interactions */}
          {showAuthPrompt && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Unlock Learning Roadmaps!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Sign in to access curated learning paths and track your progress
                  </p>
                  
                  {/* Compact Features List */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {[
                      "Curated roadmaps", 
                      "Progress tracking",
                      "Interactive content",
                      "Expert guidance"
                    ].map((feature, index) => {
                      const icons = [Target, Star, BarChart3, Zap];
                      const Icon = icons[index % icons.length];
                      
                      return (
                        <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <Icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => navigate('/signin')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 text-sm"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In to Continue
                    </Button>
                    <Button 
                      onClick={() => navigate('/signup')}
                      variant="outline"
                      className="w-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 h-10 text-sm"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAuthPrompt(false)}
                      className="w-full text-sm"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <BackToTopButton />
        </div>
      </div>
    </>
  );
};

export default Roadmaps;