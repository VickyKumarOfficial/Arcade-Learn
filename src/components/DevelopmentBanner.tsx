import { AlertTriangle } from "lucide-react";

const DevelopmentBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] w-full">
      <div className="bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-md border-b border-orange-200/60 dark:border-orange-800/40 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-1">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-center min-h-[32px] sm:min-h-[36px]">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200 leading-tight sm:leading-relaxed">
              <span className="hidden sm:inline">Website is under development phase. Some features may not work properly!</span>
              <span className="sm:hidden">Under development - some features may not work!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentBanner;