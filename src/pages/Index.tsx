import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import RoadmapsSection from "@/components/RoadmapsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import SignIn from "./SignIn";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <RoadmapsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  );
};

export default Index;
