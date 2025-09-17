import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X, Trophy, Star, LogOut, User, Settings, ChevronDown, Sparkles, Brain, Bot } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
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

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state } = useGame();
  const { isAuthenticated, user, logout } = useAuth();
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Roadmaps', path: '/roadmaps' },
    { label: 'Careers', path: '/careers' }
  ];

  const aiMenuItems = [
    { 
      label: 'Doubt Solving with AI', 
      path: '/ai/doubt-solving',
      icon: Brain,
      description: 'Get instant help with your coding questions'
    },
    { 
      label: 'Roadmap Generation', 
      path: '/ai/roadmap-generation',
      icon: Bot,
      description: 'Create personalized learning roadmaps'
    }
  ];

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className="fixed top-[36px] sm:top-[44px] left-0 right-0 z-50 bg-white/85 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            {/* <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg flex items-center justify-center"> */}
              <img src="/logo-bgfree.png" alt="Arcade Learn Logo" className="h-7 w-12" />
            {/* </div> */}
            <span className="text-lg sm:text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Arcade
              </span>
              <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent ml-1">
              Learn
              </span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* AI Dropdown Menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    location.pathname.startsWith('/ai')
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl" 
                align="center" 
                side="bottom" 
                sideOffset={8}
                avoidCollisions={true}
              >
                {aiMenuItems.map((item) => (
                  <DropdownMenuItem 
                    key={item.path}
                    onClick={() => navigate(item.path)} 
                    className="cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Stats - Desktop (only show if authenticated) */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-2 mr-2">
                <LevelBadge level={state.userData.level} size="sm" />
                <XPBadge xp={state.userData.totalXP} size="sm" />
                {state.userData.currentStreak > 0 && (
                  <StreakBadge streak={state.userData.currentStreak} size="sm" />
                )}
              </div>
            )}
            {/* Dark Mode Toggle Switch */}
            <div 
              onClick={toggleDarkMode}
              className={`relative inline-flex items-center w-12 sm:w-14 h-6 sm:h-7 rounded-full cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-300 dark:bg-gray-600 shadow-md hover:shadow-lg'
              }`}
              aria-label="Toggle dark mode"
            >
              {/* Slider Circle */}
              <div
                className={`absolute w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-center hover:scale-110 ${
                  isDarkMode ? 'translate-x-6 sm:translate-x-8' : 'translate-x-1'
                }`}
              >
                {/* Icon inside the slider */}
                {isDarkMode ? (
                  <Moon className="h-2 sm:h-3 w-2 sm:w-3 text-purple-600 animate-pulse" />
                ) : (
                  <Sun className="h-2 sm:h-3 w-2 sm:w-3 text-yellow-500 animate-pulse" />
                )}
              </div>
              
              {/* Background Icons */}
              <div className="absolute inset-0 flex items-center justify-between px-1 sm:px-2">
                <Sun className={`h-2 sm:h-3 w-2 sm:w-3 transition-all duration-300 ${
                  isDarkMode ? 'opacity-40 text-white scale-90' : 'opacity-0 scale-75'
                }`} />
                <Moon className={`h-2 sm:h-3 w-2 sm:w-3 transition-all duration-300 ${
                  isDarkMode ? 'opacity-0 scale-75' : 'opacity-40 text-gray-600 scale-90'
                }`} />
              </div>
            </div>
            
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
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
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
              <div className="hidden sm:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => navigate('/signin')}
                >
                  Log In
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* AI Menu Items for Mobile */}
              <div className="space-y-1 pt-2">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>AI Features</span>
                  </div>
                </div>
                {aiMenuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-6 py-3 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </div>
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
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === '/dashboard'
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
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === '/profile'
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
                      <LevelBadge level={state.userData.level} size="sm" />
                      <XPBadge xp={state.userData.totalXP} size="sm" />
                      {state.userData.currentStreak > 0 && (
                        <StreakBadge streak={state.userData.currentStreak} size="sm" />
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
