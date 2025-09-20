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
    xp: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25",
    level: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25",
    streak: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25",
    achievement: "bg-primary text-primary-foreground shadow-primary/25",
    progress: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25",
    completion: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25",
    premium: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 border border-primary/20"
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
