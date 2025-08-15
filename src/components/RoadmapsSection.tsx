
import { roadmaps } from "@/data/roadmaps";
import RoadmapCard from "./RoadmapCard";

const RoadmapsSection = () => {
  const categories = [...new Set(roadmaps.map(roadmap => roadmap.category))];

  return (
    <section id="roadmaps" className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-normal md:leading-normal px-2">
            Choose Your 
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent"> Path</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Curated learning roadmaps designed by industry experts to take you from beginner to professional. 
            Each roadmap includes hands-on projects, real-world resources, and career guidance.
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 mt-8 sm:mt-10 leading-normal md:leading-normal px-2">
            Some Popular 
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent"> Courses</span>
          </h2>

        </div>

        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2">
            {categories.map((category) => (
              <div
                key={category}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-white dark:bg-gray-800 rounded-full shadow-md border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-200"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">{category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapsSection;
