import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StyledBadgeProps {
  variant?: 'xp' | 'level' | 'streak' | 'achievement' | 'progress' | 'completion' | 'premium';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StyledBadge = ({ 
  variant = 'xp', 
  children, 
  className = "", 
  size = 'md',
  animated = false
}: StyledBadgeProps) => {
  const baseStyles = "font-medium transition-all duration-1000 border-0 shadow-lg";
  
  const variants = {
    xp: "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 shadow-purple-500/25",
    level: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/25",
    streak: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-orange-500/25",
    achievement: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-yellow-500/25",
    progress: "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 shadow-green-500/25",
    completion: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 shadow-indigo-500/25",
    premium: "bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 text-white hover:from-gray-800 hover:to-violet-800 shadow-gray-900/25 border border-purple-500/20"
  };

  const sizes = {
    sm: "text-xs px-2 py-1 h-5",
    md: "text-sm px-3 py-1.5 h-6",
    lg: "text-base px-4 py-2 h-8"
  };

  const animationClass = variant === 'achievement' 
    ? "" 
    : animated 
      ? "animate-pulse hover:animate-none hover:scale-105 hover:duration-500" 
      : "hover:scale-105 hover:duration-500";

  return (
    <Badge
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        animationClass,
        className
      )}
    >
      {children}
    </Badge>
  );
};

interface XPBadgeProps {
  xp: number;
  showPlus?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const XPBadge = ({ xp, showPlus = false, animated = false, size = 'md' }: XPBadgeProps) => (
  <StyledBadge variant="xp" size={size} animated={animated}>
    <span className="mr-1">⭐</span>
    {showPlus && xp > 0 && '+'}
    {xp.toLocaleString()} XP
  </StyledBadge>
);

interface LevelBadgeProps {
  level: number;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelBadge = ({ level, title, size = 'md' }: LevelBadgeProps) => (
  <StyledBadge variant="level" size={size}>
    <span className="mr-1">🎖️</span>
    Level {level}
    {title && size !== 'sm' && <span className="ml-1 opacity-90">• {title}</span>}
  </StyledBadge>
);

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StreakBadge = ({ streak, size = 'md', animated = true }: StreakBadgeProps) => (
  <StyledBadge variant="streak" size={size} animated={animated && streak > 0}>
    <span className="mr-1">🔥</span>
    {streak} day{streak !== 1 ? 's' : ''}
  </StyledBadge>
);

interface ProgressBadgeProps {
  completed: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBadge = ({ completed, total, size = 'md' }: ProgressBadgeProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;
  
  return (
    <StyledBadge 
      variant={isComplete ? "completion" : "progress"} 
      size={size}
      animated={isComplete}
    >
      {isComplete ? (
        <>
          <span className="mr-1">✅</span>
          Complete!
        </>
      ) : (
        <>
          <span className="mr-1">📊</span>
          {completed}/{total} ({percentage}%)
        </>
      )}
    </StyledBadge>
  );
};

interface AchievementBadgeProps {
  title: string;
  icon: string;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({ title, icon, unlocked = true, size = 'md' }: AchievementBadgeProps) => (
  <StyledBadge 
    variant={unlocked ? "achievement" : "premium"} 
    size={size}
    animated={unlocked}
    className={unlocked ? "" : "opacity-60 grayscale"}
  >
    <span className="mr-1">{unlocked ? icon : '🔒'}</span>
    {title}
  </StyledBadge>
);

interface ComponentXPBadgeProps {
  component: { estimatedHours: number; xpReward?: number };
  size?: 'sm' | 'md' | 'lg';
  completed?: boolean;
}

export const ComponentXPBadge = ({ component, size = 'sm', completed = false }: ComponentXPBadgeProps) => {
  const xp = component.xpReward || (10 + Math.min(component.estimatedHours * 2, 40));
  
  return (
    <StyledBadge 
      variant={completed ? "completion" : "xp"} 
      size={size}
      className={completed ? "opacity-75" : ""}
    >
      <span className="mr-1">{completed ? '✅' : '⭐'}</span>
      {completed ? 'Earned' : '+'}{xp} XP
    </StyledBadge> 
  );
};
