import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AchievementBadgeProps {
  icon: string;
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
  },
  silver: {
    bg: "bg-slate-400/20",
    border: "border-slate-400/50",
    glow: "shadow-slate-400/20",
    text: "text-slate-400",
  },
  gold: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/30",
    text: "text-yellow-500",
  },
  platinum: {
    bg: "bg-cyan-400/20",
    border: "border-cyan-400/50",
    glow: "shadow-cyan-400/30",
    text: "text-cyan-400",
  },
};

const sizeConfig = {
  sm: { container: "w-10 h-10", icon: "text-lg" },
  md: { container: "w-14 h-14", icon: "text-2xl" },
  lg: { container: "w-20 h-20", icon: "text-4xl" },
};

export function AchievementBadge({
  icon,
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
            <span className={cn(sizes.icon, earned ? "" : "grayscale")}>
              {icon}
            </span>
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
