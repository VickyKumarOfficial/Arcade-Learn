import { roadmaps } from "@/data/roadmaps";
import { Roadmap } from "@/types";
import Navigation from "@/components/Navigation";
import BackToTopButton from "@/components/BackToTopButton";
import RoadmapsSection from "@/components/RoadmapsSection";

const Roadmaps = () => {
  // Main render - show roadmap grid
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="w-full px-6 py-8 pt-[92px] sm:pt-[108px]">
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

          <RoadmapsSection />
          <BackToTopButton />
        </div>
      </div>
    </>
  );
};

export default Roadmaps;