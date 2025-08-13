import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import RoadmapsSection from "@/components/RoadmapsSection";
import FAQSection from "@/components/FAQSection";
import SignIn from "./SignIn";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <RoadmapsSection />
      <FAQSection />
    </div>
  );
};

export default Index;
