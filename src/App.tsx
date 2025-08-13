import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "@/hooks/use-dark-mode";
import Index from "./pages/Index";
import Roadmaps from "./pages/Roadmaps";
import RoadmapDetail from "./pages/RoadmapDetail";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import SignIn from "@/pages/SignIn";
import FAQs from "@/pages/FAQs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DarkModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/roadmap/:id" element={<RoadmapDetail />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignIn initialMode="register" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DarkModeProvider>
  </QueryClientProvider>
);

export default App;
