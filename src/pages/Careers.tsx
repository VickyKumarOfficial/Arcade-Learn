
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { careerOptions } from "@/data/careers";
import { roadmaps } from "@/data/roadmaps";
import Navigation from "@/components/Navigation";
import { Briefcase, Search } from "lucide-react";

const Careers = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Career 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Opportunities</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover career paths that match your skills and interests. Each role includes salary insights, 
              required skills, and top companies hiring for these positions.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`capitalize ${
                  selectedCategory === category 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Career Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCareers.map((career) => (
              <Card key={career.id} className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{career.averageSalary.split(' - ')[0]}</div>
                      <div className="text-sm text-gray-500">avg. salary</div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {career.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {career.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Top Companies</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.companies.slice(0, 3).map((company) => (
                        <Badge key={company} variant="outline" className="border-purple-200 text-purple-700">
                          {company}
                        </Badge>
                      ))}
                      {career.companies.length > 3 && (
                        <Badge variant="outline" className="border-gray-200 text-gray-600">
                          +{career.companies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
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
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Explore Roadmaps
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
