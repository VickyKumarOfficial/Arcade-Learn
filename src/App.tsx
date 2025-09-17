import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "@/hooks/use-dark-mode";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SurveyProvider } from "@/contexts/SurveyContext";
import { SurveyModal } from "@/components/SurveyModal";
import DevelopmentBanner from "@/components/DevelopmentBanner";
import Index from "./pages/Index";
import Roadmaps from "./pages/Roadmaps";
import RoadmapDetail from "./pages/RoadmapDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import SignIn from "@/pages/SignIn";
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
          <GameProvider>
            <TooltipProvider>
              <DevelopmentBanner />
              <Toaster />
              <Sonner />
            <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/roadmaps" element={<Roadmaps />} />
                  <Route path="/roadmap/:id" element={<RoadmapDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/contactus" element={<ContactUs />} />
                  <Route path="/ai/chat" element={<AIChatPage />} />
                  <Route path="/ai/doubt-solving" element={<AIDoubtSolving />} />
                  <Route path="/ai/roadmap-generation" element={<AIRoadmapGeneration />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignIn initialMode="register" />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <SurveyModal />
              </BrowserRouter>
            </TooltipProvider>
          </GameProvider>
        </SurveyProvider>
      </AuthProvider>
    </DarkModeProvider>
  </QueryClientProvider>
);

export default App;
