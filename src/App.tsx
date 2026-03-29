import { lazy, Suspense } from "react";
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

const Index = lazy(() => import("./pages/Index"));
const Roadmaps = lazy(() => import("./pages/Roadmaps"));
const RoadmapDetailTest = lazy(() => import("./pages/RoadmapDetailTest"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Aim = lazy(() => import("./pages/Aim"));
const Resume = lazy(() => import("./pages/Resume"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Jobs = lazy(() => import("./pages/Jobs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const FAQs = lazy(() => import("@/pages/FAQs"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const AIDoubtSolving = lazy(() => import("@/pages/AIDoubtSolving"));
const AIRoadmapGeneration = lazy(() => import("@/pages/AIRoadmapGeneration"));
const AIChatPage = lazy(() => import("@/pages/AIChatPage"));
const CodingPractice = lazy(() => import("@/pages/CodingPractice"));
const FrontendRoadmapFlow = lazy(() => import("@/pages/FrontendRoadmapFlow"));
const BackendRoadmapFlow = lazy(() => import("@/pages/BackendRoadmapFlow"));
const FullstackMernRoadmapFlow = lazy(() => import("@/pages/FullstackMernRoadmapFlow"));
const MentorBooking = lazy(() => import("@/pages/MentorBooking"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center text-sm text-zinc-400">
    Loading page...
  </div>
);

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
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/roadmaps" element={<Roadmaps />} />
                      <Route path="/roadmap/:id" element={<RoadmapDetailTest />} />
                      <Route path="/roadmap/frontend-react/flow" element={<FrontendRoadmapFlow />} />
                      <Route path="/roadmap/backend-nodejs/flow" element={<BackendRoadmapFlow />} />
                      <Route path="/roadmap/fullstack-mern/flow" element={<FullstackMernRoadmapFlow />} />
                      <Route path="/roadmap/frontend-react/mentor" element={<MentorBooking />} />
                      <Route path="/roadmap/backend-nodejs/mentor" element={<MentorBooking />} />
                      <Route path="/roadmap/fullstack-mern/mentor" element={<MentorBooking />} />
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
                      <Route path="/practice" element={<CodingPractice />} />
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/signup" element={<SignIn initialMode="register" />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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
