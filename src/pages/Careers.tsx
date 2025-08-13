
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { careerOptions } from "@/data/careers";
import { roadmaps } from "@/data/roadmaps";
import Navigation from "@/components/Navigation";
import { Briefcase, Search } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

const Careers = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4 leading-normal md:leading-normal">
              Career 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Opportunities</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Discover career paths that match your skills and interests. Each role includes salary insights, 
              required skills, and top companies hiring for these positions.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`capitalize ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
            {filteredCareers.map((career) => (
              <Card key={career.id} className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{career.averageSalary.split(' - ')[0]}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">avg. salary</div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {career.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
                    
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
                      View Learning Path
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Choose a roadmap that aligns with your career goals and start building your skills today.
                </p>
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-medium"
                  onClick={() => navigate("/roadmaps")}
                >
                  Explore Roadmap 
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
