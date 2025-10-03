import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RoadmapComponent, TestResult } from '@/types';
import { Star, Award, Trophy, BarChart2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface RatingDisplayProps {
  ratingGained: number;
  starsGained: number;
  component?: RoadmapComponent;
  testResult?: TestResult;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const RatingDisplay = ({
  ratingGained,
  starsGained,
  component,
  testResult,
  isVisible,
  onAnimationComplete
}: RatingDisplayProps) => {
  const [progress, setProgress] = useState(0);
  const [showStars, setShowStars] = useState(false);
  
  // Reset animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      setProgress(0);
      setShowStars(false);
      
      // Start animation sequence
      const progressTimer = setTimeout(() => {
        setProgress(100);
      }, 500);
      
      const starsTimer = setTimeout(() => {
        setShowStars(true);
      }, 1800);
      
      const completeTimer = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 5000);
      
      return () => {
        clearTimeout(progressTimer);
        clearTimeout(starsTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onAnimationComplete]);
  
  // No animation if not visible
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          
          <Card className="max-w-md w-full bg-card border border-border shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              {/* Particles Animation */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-white/20"
                    initial={{ 
                      x: Math.random() * 100 - 50 + '%',
                      y: '100%',
                      scale: 0
                    }}
                    animate={{ 
                      y: '-100%',
                      scale: Math.random() * 0.8 + 0.2,
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: Math.random() * 3 + 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3
                    }}
                  />
                ))}
              </div>
              
              <div className="relative p-6">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-block mb-4 p-3 bg-blue-600/30 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.7 }}
                  >
                    {component?.completed ? (
                      <Trophy className="w-10 h-10 text-yellow-300" />
                    ) : (
                      <Award className="w-10 h-10 text-blue-300" />
                    )}
                  </motion.div>
                  
                  <motion.h2
                    className="text-xl font-bold text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {testResult?.passed ? 'Test Passed!' : 'Test Completed!'}
                  </motion.h2>
                  
                  {component && (
                    <motion.p
                      className="text-sm text-blue-200 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {component.title}
                    </motion.p>
                  )}
                </div>
                
                {/* Rating Score */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-blue-300" />
                      <span className="text-sm font-medium text-blue-200">Rating Points</span>
                    </div>
                    <span className="text-sm font-bold text-white">+{ratingGained}</span>
                  </div>
                  
                  <motion.div
                    className="h-2 bg-muted rounded-full overflow-hidden"
                    initial={{ width: '100%' }}
                  >
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ 
                        duration: 1.2, 
                        ease: "easeOut" 
                      }}
                    />
                  </motion.div>
                </motion.div>
                
                {/* Stars Earned */}
                {starsGained > 0 && (
                  <motion.div
                    className="flex flex-col items-center justify-center p-4 bg-primary/20 rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: showStars ? 1 : 0,
                      scale: showStars ? 1 : 0.8
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-sm font-medium text-yellow-300 mb-3">Stars Earned</span>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: starsGained }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            delay: 0.2 + i * 0.2,
                            type: 'spring',
                            stiffness: 200
                          }}
                        >
                          <Star className="w-8 h-8 fill-yellow-300 text-yellow-300" />
                        </motion.div>
                      ))}
                    </div>
                    
                    {testResult && (
                      <motion.p
                        className="text-xs text-blue-200 mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + starsGained * 0.2 }}
                      >
                        Score: {testResult.score}% • Rating: {testResult.rating}
                      </motion.p>
                    )}
                  </motion.div>
                )}
                
                {/* Progress Note */}
                {component && (
                  <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <p className="text-xs text-blue-200">
                      {testResult?.passed 
                        ? 'Component completed! You can now proceed to the next component.' 
                        : 'Review the material and try the test again to complete this component.'}
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RatingDisplay;

// Badge for showing rating on components
interface ComponentRatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  completed?: boolean;
}

export const ComponentRatingBadge = ({ 
  rating, 
  size = 'sm', 
  completed = false 
}: ComponentRatingBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4'
  };
  
  return (
    <div 
      className={`
        inline-flex items-center gap-1 rounded-full 
        ${completed 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
        font-medium ${sizeClasses[size]}
      `}
    >
      <BarChart2 className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
      <span>{rating}</span>
    </div>
  );
};

// Badge for showing stars
interface ComponentStarsBadgeProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ComponentStarsBadge = ({ stars, size = 'sm' }: ComponentStarsBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4'
  };
  
  const starSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div 
      className={`
        inline-flex items-center gap-1 rounded-full 
        bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300
        font-medium ${sizeClasses[size]}
      `}
    >
      {stars > 0 ? (
        Array.from({ length: Math.min(stars, 3) }).map((_, i) => (
          <Star key={i} className={`${starSize[size]} fill-yellow-500 text-yellow-500`} />
        ))
      ) : (
        <span>0 ⭐</span>
      )}
      
      {stars > 3 && <span>+{stars - 3}</span>}
    </div>
  );
};