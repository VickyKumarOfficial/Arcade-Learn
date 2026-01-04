import { Button } from "@/components/ui/button";
import { ArrowDown, Trophy } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { Leaderboard } from "./Leaderboard";
import { AuthGuard } from "./AuthGuard";
import { motion } from "framer-motion";

// Mouse position type for interactive particles
interface MousePosition {
  x: number;
  y: number;
}

const Hero = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const { state } = useGameTest();
  const { isAuthenticated } = useAuth();

  // Track mouse position for interactive particles
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    // Calculate mouse position relative to center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const handleLeaderboardClick = () => {
    if (isAuthenticated) {
      setShowLeaderboard(true);
    } else {
      setShowAuthPrompt(true);
    }
  };

  const scrollToRoadmaps = () => {
    document.getElementById('roadmaps')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden pt-16 sm:pt-20"
    >
      {/* Gradient Glow Orb */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600 blur-[300px] z-0" />

      {/* Secondary glow orb for depth */}
      <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-blue-500 blur-[250px] z-0 opacity-50" />

      {/* Interactive Floating particles (dots) - moves subtly with cursor */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        style={{
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Particle dots - extra small (1-2px) scattered across the screen */}
        <div className="absolute top-[8%] left-[5%] rounded-full animate-float-slow bg-blue-400/60" style={{ width: '2px', height: '2px' }} />
        <div className="absolute top-[12%] left-[20%] rounded-full animate-float-medium bg-blue-500/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.3s' }} />
        <div className="absolute top-[5%] left-[35%] rounded-full animate-float-fast bg-blue-400/40" style={{ width: '2px', height: '2px', animationDelay: '1s' }} />
        <div className="absolute top-[15%] left-[55%] rounded-full animate-float-slow bg-blue-300/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.7s' }} />
        <div className="absolute top-[8%] left-[70%] rounded-full animate-float-medium bg-blue-500/60" style={{ width: '2px', height: '2px', animationDelay: '0.5s' }} />
        <div className="absolute top-[18%] left-[85%] rounded-full animate-float-fast bg-blue-400/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '1.2s' }} />
        <div className="absolute top-[25%] left-[8%] rounded-full animate-float-medium bg-blue-500/40" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.9s' }} />
        <div className="absolute top-[30%] left-[92%] rounded-full animate-float-slow bg-blue-400/50" style={{ width: '2px', height: '2px', animationDelay: '0.4s' }} />
        <div className="absolute top-[40%] left-[3%] rounded-full animate-float-fast bg-blue-300/60" style={{ width: '2px', height: '2px', animationDelay: '0.8s' }} />
        <div className="absolute top-[45%] left-[95%] rounded-full animate-float-medium bg-blue-500/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '1.1s' }} />
        <div className="absolute top-[55%] left-[7%] rounded-full animate-float-slow bg-blue-400/40" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.6s' }} />
        <div className="absolute top-[60%] left-[90%] rounded-full animate-float-fast bg-blue-500/50" style={{ width: '2px', height: '2px', animationDelay: '0.2s' }} />
        <div className="absolute top-[70%] left-[12%] rounded-full animate-float-medium bg-blue-400/60" style={{ width: '2px', height: '2px', animationDelay: '1.3s' }} />
        <div className="absolute top-[75%] left-[25%] rounded-full animate-float-slow bg-blue-300/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.5s' }} />
        <div className="absolute top-[80%] left-[40%] rounded-full animate-float-fast bg-blue-500/40" style={{ width: '2px', height: '2px', animationDelay: '1s' }} />
        <div className="absolute top-[85%] left-[60%] rounded-full animate-float-medium bg-blue-400/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.7s' }} />
        <div className="absolute top-[78%] left-[75%] rounded-full animate-float-slow bg-blue-500/60" style={{ width: '2px', height: '2px', animationDelay: '0.3s' }} />
        <div className="absolute top-[88%] left-[88%] rounded-full animate-float-fast bg-blue-300/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '0.9s' }} />
        <div className="absolute top-[35%] left-[18%] rounded-full animate-float-medium bg-blue-400/50" style={{ width: '1.5px', height: '1.5px', animationDelay: '1.4s' }} />
        <div className="absolute top-[50%] left-[82%] rounded-full animate-float-slow bg-blue-500/40" style={{ width: '2px', height: '2px', animationDelay: '0.8s' }} />
      </motion.div>

      {/* Floating geometric shapes - CSS only for performance */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Shape 1 - Top left */}
        <div className="absolute top-[15%] left-[10%] w-20 h-20 border border-blue-500/30 rounded-full animate-float-slow" />
        {/* Shape 2 - Top right */}
        <div className="absolute top-[20%] right-[15%] w-16 h-16 border border-blue-400/25 rotate-45 animate-float-medium" />
        {/* Shape 3 - Bottom left */}
        <div className="absolute bottom-[25%] left-[15%] w-12 h-12 border border-blue-600/20 rounded-lg rotate-12 animate-float-fast" />
        {/* Shape 4 - Bottom right */}
        <div className="absolute bottom-[30%] right-[10%] w-24 h-24 border border-blue-500/20 rounded-full animate-float-slow" style={{ animationDelay: '1s' }} />
        {/* Shape 5 - Center top */}
        <div className="absolute top-[10%] left-[45%] w-8 h-8 border border-blue-400/30 rotate-45 animate-float-medium" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Dot Pattern Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 z-[1]"></div>

      <motion.div
        className="container mx-auto px-2 sm:px-4 text-center relative z-10 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          {/* Badge/Tag */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full p-1 pr-3 mb-6 bg-blue-500/15 border border-blue-500/30 backdrop-blur-sm">
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                NEW
              </span>
              <span className="text-sm text-blue-100">Start learning with structured roadmaps</span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              Your Journey to
              <motion.span
                className="inline-block mt-2 sm:mt-3 px-4 py-1 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Tech Mastery
              </motion.span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 leading-relaxed px-2 sm:px-4 max-w-2xl mx-auto"
          >
            Follow curated learning roadmaps from foundational to mastery levels.
            Track your progress and unlock career opportunities as you grow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={buttonVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-12 px-2 sm:px-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base lg:text-lg font-semibold rounded-full shadow-lg shadow-blue-600/25 transition-all duration-300"
                onClick={scrollToRoadmaps}
              >
                Start Your Journey
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-blue-900 hover:border-blue-600 hover:bg-blue-950/50 px-8 py-3 text-base lg:text-lg font-semibold rounded-full backdrop-blur-sm text-white transition-all duration-300"
                onClick={handleLeaderboardClick}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Leaderboard
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 lg:gap-14 max-w-3xl mx-auto mb-12 sm:mb-16 px-2"
          >
            {[
              { label: "50+ Learning Components" },
              { label: "5+ Career Roadmaps" },
              { label: "100% Free Resources" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05, x: 3 }}
              >
                <span className="text-blue-500">✓</span>
                <span className="text-slate-400">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Animated bounce arrow */}
        {/* <motion.div
          className="animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <ArrowDown
            className="mx-auto text-white/60 w-8 h-8 cursor-pointer hover:text-blue-500 transition-colors duration-300"
            onClick={scrollToRoadmaps}
          />
        </motion.div> */}
      </motion.div>

      {/* Leaderboard Modal */}
      {showLeaderboard && isAuthenticated && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4">
          <Leaderboard
            userData={state.userData}
            onClose={() => setShowLeaderboard(false)}
          />
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4">
          <div className="bg-card p-1 rounded-xl max-w-lg w-full">
            <AuthGuard
              title="Join the Competition!"
              description="Sign in to see where you rank among other learners"
              featuresList={[
                "View global leaderboards",
                "Compare your progress",
                "Track your rank improvements",
                "See top performers"
              ]}
            />
            <div className="p-4 pt-0">
              <Button
                variant="outline"
                onClick={() => setShowAuthPrompt(false)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;