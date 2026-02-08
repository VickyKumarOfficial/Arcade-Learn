import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, Settings, ChevronDown, Brain, Bot, Code2, Calendar, Users, FolderKanban } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useState, useEffect } from "react";
import React from "react";
import { useGameTest } from "@/contexts/GameTestContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { LevelBadge, XPBadge, StreakBadge } from "./StyledBadges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavigationProps {
  externalVisibility?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  externalVisibility, 
  onVisibilityChange 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { state } = useGameTest();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    // If external visibility is provided, don't use scroll-based visibility
    if (externalVisibility !== undefined) {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, externalVisibility]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Roadmaps', path: '/roadmaps' },
    { label: 'Jobs', path: '/jobs' }
  ];

  const moreMenuItems = [
    {
      label: 'Coding Practice',
      path: '/practice',
      icon: Code2,
      description: 'Solve problems and build skills',
      badge: 'New',
      stats: '10 problems'
    },
    {
      label: 'Daily Challenges',
      path: '/practice/daily',
      icon: Calendar,
      description: '5-15 min daily tasks to build habits',
      badge: 'Coming Soon',
      stats: '0 day streak'
    },
    {
      label: 'Study Rooms',
      path: '/practice/study-rooms',
      icon: Users,
      description: 'Co-learn with peers in real-time',
      badge: 'Coming Soon',
      stats: '2 active now'
    },
    {
      label: 'Project Portfolio',
      path: '/practice/portfolio',
      icon: FolderKanban,
      description: 'Showcase your projects to employers',
      badge: 'Coming Soon',
      stats: '0 projects'
    },
    {
      label: 'AI Doubt Solving',
      path: '/ai/chat',
      icon: Brain,
      description: 'Get instant help with coding questions',
      badge: '✨'
    },
    {
      label: 'AI Roadmap',
      path: '/ai/roadmap-generation',
      icon: Bot,
      description: 'Generate personalized learning paths',
      badge: '✨'
    }
  ];

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Use external visibility if provided, otherwise use internal state
  const effectiveVisibility = externalVisibility !== undefined ? externalVisibility : isVisible;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      effectiveVisibility ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <div
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate('/')}
          >
            <img src="/logo-bgfree.png" alt="Arcade Learn Logo" className="h-7 w-12" />
            <span className="text-lg sm:text-xl font-bold hidden sm:block">
              <span className="text-blue-500">Arcade</span>
              <span className="text-white ml-1">Learn</span>
            </span>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-2 border border-white/10">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* More Mega Menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                    location.pathname.startsWith('/practice') || location.pathname.startsWith('/ai')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[720px] bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl p-0"
                align="center"
                side="bottom"
                sideOffset={12}
                avoidCollisions={true}
              >
                <div className="p-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-2 border-b border-border/50">
                    Practice & Learn with AI
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {moreMenuItems.map((item) => (
                      <div
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                        }}
                        className="cursor-pointer p-3 rounded-lg border border-transparent"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <item.icon className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm font-semibold text-foreground">
                                {item.label}
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {item.description}
                            </div>
                            {item.stats && (
                              <div className="text-xs font-medium text-primary/70">
                                {item.stats}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          {/* Right Side - Auth/User */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* User Stats - Desktop (only show if authenticated) */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-2 mr-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  ⭐ {state.userData.totalStars}
                </Badge>
                {state.userData.currentStreak > 0 && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    🔥 {state.userData.currentStreak}
                  </Badge>
                )}
              </div>
            )}
            {/* Dark Mode Toggle Switch */}
            {/* <div
              onClick={toggleDarkMode}
              className={`relative inline-flex items-center w-12 sm:w-14 h-6 sm:h-7 rounded-full cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 
                bg-muted border border-border shadow-md hover:shadow-lg
              `}
              aria-label="Toggle dark mode"
            > */}
              {/* Slider Circle */}
              {/* <div
                className={`absolute w-4 sm:w-5 h-4 sm:h-5 bg-primary rounded-full shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-center hover:scale-110 ${isDarkMode ? 'translate-x-6 sm:translate-x-8' : 'translate-x-1'
                  }`}
              > */}
                {/* Icon inside the slider */}
                {/* {isDarkMode ? (
                  <Moon className="h-2 sm:h-3 w-2 sm:w-3 text-primary-foreground" />
                ) : (
                  <Sun className="h-2 sm:h-3 w-2 sm:w-3 text-primary-foreground" />
                )}
              </div> */}

              {/* Background Icons */}
              {/* <div className="absolute inset-0 flex items-center justify-between px-1 sm:px-2">
                <Sun className={`h-2 sm:h-3 w-2 sm:w-3 transition-all duration-300 ${isDarkMode ? 'opacity-40 text-foreground scale-90' : 'opacity-0 scale-75'
                  }`} />
                <Moon className={`h-2 sm:h-3 w-2 sm:w-3 transition-all duration-300 ${isDarkMode ? 'opacity-0 scale-75' : 'opacity-40 text-foreground scale-90'
                  }`} />
              </div> */}
            {/* </div> */}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>

            {/* Desktop Buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.firstName}
                </span>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user && getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="end"
                    side="bottom"
                    sideOffset={5}
                    avoidCollisions={true}
                  >
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-2 py-2 border border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 rounded-full px-4 py-2"
                  onClick={() => navigate('/signin')}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-lg gap-6">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              {/* More Features Section */}
              <div className="space-y-1 pt-2">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <span>More Features</span>
                  </div>
                </div>
                {moreMenuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-6 py-3 rounded-md transition-colors ${location.pathname === item.path
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                        {item.stats && (
                          <p className="text-xs text-primary/70 mt-1">{item.stats}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Add Dashboard and Profile for authenticated users in mobile */}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === '/dashboard'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === '/profile'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    Profile
                  </button>
                </>
              )}

              {/* Mobile Buttons */}
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* User stats for mobile */}
                    <div className="flex items-center justify-center space-x-2 py-2">
                      <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-xs">
                        ⭐ {state.userData.totalStars}
                      </Badge>
                      {state.userData.currentStreak > 0 && (
                        <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 text-xs">
                          🔥 {state.userData.currentStreak}
                        </Badge>
                      )}
                    </div>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-300 py-2">
                      Welcome, {user?.firstName}!
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => {
                        navigate('/signin');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
