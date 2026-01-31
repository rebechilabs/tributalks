import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakData } from "@/hooks/useDashboardData";

interface StreakDisplayProps {
  streakData?: StreakData;
  showLongest?: boolean;
  className?: string;
}

export function StreakDisplay({ streakData, showLongest = false, className }: StreakDisplayProps) {
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const isActive = currentStreak > 0;

  // Determine fire intensity based on streak
  const getFireColor = () => {
    if (currentStreak >= 30) return "text-purple-500";
    if (currentStreak >= 14) return "text-orange-500";
    if (currentStreak >= 7) return "text-yellow-500";
    if (currentStreak >= 3) return "text-amber-500";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
        isActive 
          ? "bg-orange-500/10 border border-orange-500/20" 
          : "bg-muted/50"
      )}>
        <Flame className={cn(
          "h-4 w-4",
          isActive && "animate-pulse",
          getFireColor()
        )} />
        <span className={cn(
          isActive ? getFireColor() : "text-muted-foreground"
        )}>
          {currentStreak}
        </span>
      </div>
      
      {showLongest && longestStreak > currentStreak && (
        <span className="text-xs text-muted-foreground">
          Recorde: {longestStreak}
        </span>
      )}
    </div>
  );
}
