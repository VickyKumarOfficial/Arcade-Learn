import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "@/hooks/use-dark-mode";
import { GameTestProvider } from "@/contexts/GameTestContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SurveyProvider } from "@/contexts/SurveyContext";
import { SurveyModal } from "@/components/SurveyModal";
// import DevelopmentBanner from "@/components/DevelopmentBanner"; // Commented out - can be enabled in future
import Index from "./pages/Index";
import Roadmaps from "./pages/Roadmaps";
import RoadmapDetailTest from "./pages/RoadmapDetailTest";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Aim from "./pages/Aim";
import Resume from "./pages/Resume";
import ResumeBuilder from "./pages/ResumeBuilder";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import SignIn from "@/pages/SignIn";
import AuthCallback from "@/pages/AuthCallback";
import FAQs from "@/pages/FAQs";
import ContactUs from "@/pages/ContactUs";
import AIDoubtSolving from "@/pages/AIDoubtSolving";
import AIRoadmapGeneration from "@/pages/AIRoadmapGeneration";
import AIChatPage from "@/pages/AIChatPage";
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DarkModeProvider>
      <AuthProvider>
        <SurveyProvider>
          <GameTestProvider>
              <TooltipProvider>
                {/* <DevelopmentBanner /> - Removed to utilize space, uncomment if needed in future */}
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/roadmaps" element={<Roadmaps />} />
                    <Route path="/roadmap/:id" element={<RoadmapDetailTest />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/aim" element={<Aim />} />
                    <Route path="/resume" element={<Resume />} />
                    <Route path="/resume-builder" element={<ResumeBuilder />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/contactus" element={<ContactUs />} />
                  <Route path="/ai/chat" element={<AIChatPage />} />
                    <Route path="/ai/doubt-solving" element={<AIDoubtSolving />} />
                    <Route path="/ai/roadmap-generation" element={<AIRoadmapGeneration />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignIn initialMode="register" />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <SurveyModal />
                </BrowserRouter>
              </TooltipProvider>
            </GameTestProvider>
        </SurveyProvider>
      </AuthProvider>
    </DarkModeProvider>
  </QueryClientProvider>
);

export default App;
