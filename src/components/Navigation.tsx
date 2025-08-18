import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X, Trophy, Star, LogOut } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { LevelBadge, XPBadge, StreakBadge } from "./StyledBadges";

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
    ...(isAuthenticated ? [{ label: 'Dashboard', path: '/dashboard' }] : []),
    { label: 'Careers', path: '/careers' },
    { label: 'FAQs', path: '/faqs' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg flex items-center justify-center">
              <img src="/favicon.png" alt="Arcade Learn Logo" className="h-8 w-8 object-contain mix-blend-luminosity brightness-1000" />
            </div>
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
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.firstName}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
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
