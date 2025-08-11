
import { roadmaps } from "@/data/roadmaps";
import RoadmapCard from "./RoadmapCard";

const RoadmapsSection = () => {
  const categories = [...new Set(roadmaps.map(roadmap => roadmap.category))];

  return (
    <section id="roadmaps" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Path</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Curated learning roadmaps designed by industry experts to take you from beginner to professional. 
            Each roadmap includes hands-on projects, real-world resources, and career guidance.
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 mt-10">
            Some Popular 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Courses</span>
          </h2>

        </div>

        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <div
                key={category}
                className="px-6 py-3 bg-white rounded-full shadow-md border-2 border-transparent hover:border-blue-200 transition-all duration-200"
              >
                <span className="font-medium text-gray-700">{category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapsSection;
