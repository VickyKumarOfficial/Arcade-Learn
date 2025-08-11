import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Roadmaps', path: '/roadmaps' },
    { label: 'Careers', path: '/careers' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🚀</span>
            </div>
            <span className="text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Arcade
              </span>
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent ml-1">
              Learn
              </span>
            </span>
          </div>
          
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
          
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle Switch */}
            <div 
              onClick={toggleDarkMode}
              className={`relative inline-flex items-center w-14 h-7 rounded-full cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-300 dark:bg-gray-600 shadow-md hover:shadow-lg'
              }`}
              aria-label="Toggle dark mode"
            >
              {/* Slider Circle */}
              <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-center hover:scale-110 ${
                  isDarkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              >
                {/* Icon inside the slider */}
                {isDarkMode ? (
                  <Moon className="h-3 w-3 text-purple-600 animate-pulse" />
                ) : (
                  <Sun className="h-3 w-3 text-yellow-500 animate-pulse" />
                )}
              </div>
              
              {/* Background Icons */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <Sun className={`h-3 w-3 transition-all duration-300 ${
                  isDarkMode ? 'opacity-40 text-white scale-90' : 'opacity-0 scale-75'
                }`} />
                <Moon className={`h-3 w-3 transition-all duration-300 ${
                  isDarkMode ? 'opacity-0 scale-75' : 'opacity-40 text-gray-600 scale-90'
                }`} />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:inline-flex border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => navigate('/signin')}
            >
              Log In
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => navigate('/signin')}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
