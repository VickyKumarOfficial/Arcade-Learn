import { Button } from "@/components/ui/button";
import { ArrowDown, Trophy } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { Leaderboard } from "./Leaderboard";
import { AuthGuard } from "./AuthGuard";
import { motion } from "framer-motion";
import HeroGlobe from "./HeroGlobe";

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

  // Typewriter effect for badge text
  const badgeTexts = [
    "Start learning with structured roadmaps",
    "Get career opportunities based on your skills",
    "Get certified by completing modules & exams",
    "Track progress with interactive dashboards",
    "Join a community of passionate learners",
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    const currentFullText = badgeTexts[currentTextIndex];
    
    // If waiting after typing complete, wait 3 seconds then start deleting
    if (isWaiting) {
      const waitTimer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(waitTimer);
    }

    // Typing speed
    const typeSpeed = isDeleting ? 20 : 50;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        } else {
          // Finished typing, wait before deleting
          setIsWaiting(true);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % badgeTexts.length);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, isWaiting, currentTextIndex, badgeTexts]);

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

      {/* Floating geometric shapes*/}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-20 h-20 border border-blue-500/30 rounded-full animate-float-slow opacity-20" />
        <div className="absolute top-[20%] right-[15%] w-16 h-16 border border-blue-400/25 rotate-45 animate-float-medium opacity-30" />
        <div className="absolute bottom-[25%] left-[15%] w-12 h-12 border border-blue-600/20 rounded-lg rotate-12 animate-float-fast opacity-40" />
        <div className="absolute bottom-[5%] right-[5%] w-24 h-24 border border-blue-500/20 rounded-full animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[10%] left-[45%] w-8 h-8 border border-blue-400/30 rotate-45 animate-float-medium opacity-40" style={{ animationDelay: '0.5s' }} />
      </div>
      

      {/* Dot Pattern Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 z-[1]"></div>

      {/* Main Content - Split Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)]">
          
          {/* Left Side - Text Content */}
          <motion.div
            className="text-center lg:text-left order-2 lg:order-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Badge/Tag with Typewriter Effect */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full p-1 pr-4 mb-6 bg-blue-500/15 border border-blue-500/30 backdrop-blur-sm">
              <span className="bg-blue-600 text-slate-200 text-xs px-3 py-1 rounded-full font-medium shrink-0">
                NEW
              </span>
              <span className="font-mono text-sm text-blue-100 min-w-[200px] sm:min-w-[280px]">
                {displayText}
                <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse" style={{ animationDuration: '1s' }} />
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-slate-300 mb-4 sm:mb-6 leading-tight">
              <span className="block">Your Journey</span>
              <span className="block mt-1 sm:mt-2 whitespace-nowrap">
                to{" "}
                <motion.span
                  className="inline-block px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-700 to-blue-500"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  Tech Mastery
                </motion.span>
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 leading-relaxed px-2 sm:px-4 max-w-2xl mx-auto"
          >
            Follow curated learning roadmaps from foundational to mastery levels.
            Track your progress and unlock career opportunities as you grow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={buttonVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10 sm:mb-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-slate-200 px-8 py-3 text-base lg:text-lg font-semibold rounded-full shadow-lg shadow-blue-600/25 transition-all duration-300"
                onClick={scrollToRoadmaps}
              >
                Start Your Journey
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-blue-900 hover:border-blue-600 hover:bg-blue-950/50 px-8 py-3 text-base lg:text-lg font-semibold rounded-full backdrop-blur-sm text-slate-200 transition-all duration-300"
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
            className="flex flex-nowrap justify-center lg:justify-start items-center gap-3 sm:gap-5 lg:gap-6 overflow-x-auto"
          >
            {[
              { label: "50+ Components" },
              { label: "5+ Roadmaps" },
              { label: "100% Free" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05, x: 3 }}
              >
                <span className="text-blue-500">✓</span>
                <span className="text-slate-400 text-xs sm:text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
          </motion.div>

          {/* Right Side - 3D Globe */}
          <motion.div 
            className="order-1 lg:order-2 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl aspect-square">
              <HeroGlobe />
            </div>
          </motion.div>
        </div>
      </div>

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

      {/* Curved Arc Divider */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden z-20 pointer-events-none">
        <svg
          className="relative block w-full h-[80px] sm:h-[100px] md:h-[120px]"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          {/* Fill below the arc */}
          <path
            d="M0,120 L0,60 Q720,0 1440,60 L1440,120 Z"
            fill="black"
          />
          {/* The arc line */}
          <path
            d="M0,60 Q720,0 1440,60"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="5"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;