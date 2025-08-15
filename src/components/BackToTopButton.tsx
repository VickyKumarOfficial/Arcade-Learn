import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 ${
        isHovered 
          ? "rounded-full px-4 py-3 w-auto h-12" 
          : "rounded-full w-12 h-12"
      }`}
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5 flex" />
      <span 
        className={`ml-2 text-sm font-medium whitespace-nowrap transition duration-200 ${
          isHovered 
            ? "opacity-100 max-w-xs" 
            : "opacity-0 max-w-0 overflow-hidden"
        }`}
      >
        Back to Top
      </span>
    </button>
  );
};

export default BackToTopButton;
