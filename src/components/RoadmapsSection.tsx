
import { useState } from "react";
import { roadmaps } from "@/data/roadmaps";
import RoadmapCard from "./RoadmapCard";

const RoadmapsSection = () => {
  const categories = [...new Set(roadmaps.map(roadmap => roadmap.category))];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Add 'All' option to show all roadmaps
  const allCategories = ['All', ...categories];
  
  // Filter roadmaps based on selected category
  const filteredRoadmaps = selectedCategory === 'All' 
    ? roadmaps 
    : roadmaps.filter(roadmap => roadmap.category === selectedCategory);

  return (
    <section id="roadmaps" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-normal md:leading-normal">
            Choose Your 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Path</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Curated learning roadmaps designed by industry experts to take you from beginner to professional. 
            Each roadmap includes hands-on projects, real-world resources, and career guidance.
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 mt-10 leading-normal md:leading-normal">
            Some Popular 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Courses</span>
          </h2>

        </div>

        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full shadow-md border-2 transition-all duration-200 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-300 dark:border-blue-400'
                    : 'bg-white dark:bg-gray-800 border-transparent hover:border-blue-200 dark:hover:border-blue-400'
                }`}
              >
                <span className={`font-medium ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRoadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapsSection;
