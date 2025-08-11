import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import RoadmapsSection from "@/components/RoadmapsSection";
import SignIn from "./SignIn";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <RoadmapsSection />
    </div>
  );
};

export default Index;
