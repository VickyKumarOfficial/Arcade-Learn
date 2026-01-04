import Hero from "@/components/Hero";
import ShowcaseCard from "@/components/ShowcaseCard";
import Navigation from "@/components/Navigation";
import RoadmapsSection from "@/components/RoadmapsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import SignIn from "./SignIn";
import dashboardPreview from "@/assets/dashboard-preview.png";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <ShowcaseCard imageSrc={dashboardPreview} />
      <RoadmapsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
