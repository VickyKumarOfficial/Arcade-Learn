import { AlertTriangle } from "lucide-react";

const DevelopmentBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] w-full">
      <div className="bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-md border-b border-orange-200/60 dark:border-orange-800/40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-3 text-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200 leading-relaxed">
              Website is under development phase. Some features may not work properly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentBanner;