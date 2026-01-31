import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const tierStyles = {
  bronze: {
    bg: "bg-amber-900/20",
    border: "border-amber-700/50",
    glow: "shadow-amber-500/20",
    text: "text-amber-600",
    iconColor: "text-amber-600",
  },
  silver: {
    bg: "bg-slate-400/20",
    border: "border-slate-400/50",
    glow: "shadow-slate-400/20",
    text: "text-slate-400",
    iconColor: "text-slate-400",
  },
  gold: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/30",
    text: "text-yellow-500",
    iconColor: "text-yellow-500",
  },
  platinum: {
    bg: "bg-cyan-400/20",
    border: "border-cyan-400/50",
    glow: "shadow-cyan-400/30",
    text: "text-cyan-400",
    iconColor: "text-cyan-400",
  },
};

const sizeConfig = {
  sm: { container: "w-10 h-10", iconSize: "w-4 h-4" },
  md: { container: "w-14 h-14", iconSize: "w-6 h-6" },
  lg: { container: "w-20 h-20", iconSize: "w-10 h-10" },
};

export function AchievementBadge({
  icon: Icon,
  name,
  description,
  tier,
  earned,
  earnedAt,
  size = "md",
}: AchievementBadgeProps) {
  const styles = tierStyles[tier];
  const sizes = sizeConfig[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "rounded-full flex items-center justify-center border-2 transition-all duration-300",
              sizes.container,
              earned
                ? cn(styles.bg, styles.border, "shadow-lg", styles.glow)
                : "bg-muted/30 border-muted grayscale opacity-40"
            )}
          >
            <Icon 
              className={cn(
                sizes.iconSize, 
                earned ? styles.iconColor : "text-muted-foreground"
              )} 
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className={cn("font-semibold", earned && styles.text)}>
              {name}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {earned && earnedAt && (
              <p className="text-xs text-muted-foreground/70">
                Conquistado em {format(new Date(earnedAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            )}
            {!earned && (
              <p className="text-xs text-muted-foreground/70 italic">
                Ainda não conquistado
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
