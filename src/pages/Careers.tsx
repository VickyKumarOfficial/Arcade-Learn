import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { careerOptions } from "@/data/careers";
import { roadmaps } from "@/data/roadmaps";
import Navigation from "@/components/Navigation";
import BackToTopButton from "@/components/BackToTopButton";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Trophy, Target, Star, BarChart3, Zap, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Careers = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const categories = ['all', ...new Set(careerOptions.map(career => 
    career.roadmapIds.map(id => roadmaps.find(r => r.id === id)?.category).filter(Boolean)
  ).flat())];

  const filteredCareers = selectedCategory === 'all' 
    ? careerOptions 
    : careerOptions.filter(career => 
        career.roadmapIds.some(id => 
          roadmaps.find(r => r.id === id)?.category === selectedCategory
        )
      );

  const handleInteraction = () => {
    if (!user) {
      setShowAuthPrompt(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 overflow-x-hidden">
      <Navigation />
      
      <div className="pt-24 sm:pt-28 pb-8 sm:pb-12 relative">
        {/* Main Content - Blurred for non-authenticated users */}
        <div className={`container mx-auto px-2 sm:px-4 max-w-7xl ${!user ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2 leading-normal md:leading-normal">
              Career 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Opportunities</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
              Discover career paths that match your skills and interests. Each role includes salary insights, 
              required skills, and top companies hiring for these positions.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => user ? setSelectedCategory(category) : handleInteraction()}
                className={`capitalize text-xs sm:text-sm px-3 sm:px-4 py-2 ${
                  selectedCategory === category 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Career Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {filteredCareers.map((career) => (
              <Card key={career.id} className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col overflow-hidden"
                onClick={handleInteraction}>
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">{career.averageSalary.split(' - ')[0]}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">avg. salary</div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {career.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {career.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="space-y-6 flex-1">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Required Skills</h4>
                      <div className="flex flex-wrap gap-2 px-1">
                        {career.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Top Companies</h4>
                      <div className="flex flex-wrap gap-2 px-1">
                        {career.companies.slice(0, 3).map((company) => (
                          <Badge key={company} variant="outline" className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                            {company}
                          </Badge>
                        ))}
                        {career.companies.length > 3 && (
                          <Badge variant="outline" className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                            +{career.companies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>Relevant Roadmaps</span>
                      <span>{career.roadmapIds.length} available</span>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                      onClick={handleInteraction}>
                      View Learning Path
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl"
              onClick={handleInteraction}>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Choose a roadmap that aligns with your career goals and start building your skills today.
                </p>
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user) {
                      navigate("/roadmaps");
                    } else {
                      handleInteraction();
                    }
                  }}
                >
                  Explore Roadmap 
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Authentication Prompt Overlay - For non-authenticated users */}
        {!user && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-10 bg-black/20">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Unlock Career Opportunities!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Sign in to explore career paths and salary insights
                </p>
                
                {/* Compact Features List */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    "Career opportunities", 
                    "Salary information",
                    "Required skills",
                    "Learning roadmaps"
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
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Unlock Career Opportunities!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Sign in to explore career paths and salary insights
                </p>
                
                {/* Compact Features List */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    "Career opportunities", 
                    "Salary information",
                    "Required skills",
                    "Learning roadmaps"
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
      </div>
      <BackToTopButton />
    </div>
  );
};

export default Careers;