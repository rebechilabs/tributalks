import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusColors: Record<string, { bg: string; text: string; ring: string }> = {
  excellent: { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-500/30' },
  good: { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-500/30' },
  regular: { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-500/30' },
  attention: { bg: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-500/30' },
  critical: { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-500/30' },
  pending: { bg: 'bg-muted', text: 'text-muted-foreground', ring: 'ring-muted/30' },
};

const statusLabels: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bom',
  regular: 'Regular',
  attention: 'Atenção',
  critical: 'Crítico',
  pending: 'Pendente',
};

const sizeConfig = {
  sm: { container: 'w-24 h-24', text: 'text-xl', grade: 'text-xs', stroke: 8 },
  md: { container: 'w-40 h-40', text: 'text-3xl', grade: 'text-sm', stroke: 10 },
  lg: { container: 'w-56 h-56', text: 'text-5xl', grade: 'text-lg', stroke: 12 },
};

export function ScoreGauge({ 
  score, 
  grade, 
  status, 
  size = 'md',
  showLabel = true 
}: ScoreGaugeProps) {
  const colors = statusColors[status] || statusColors.pending;
  const config = sizeConfig[size];
  
  // Calculate percentage for the circular progress
  const percentage = Math.min(score / 1000, 1);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("relative", config.container)}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            className={colors.text}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", config.text, colors.text)}>
            {score}
          </span>
          <span className={cn(
            "font-semibold px-2 py-0.5 rounded",
            config.grade,
            colors.bg,
            "text-white"
          )}>
            {grade}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="text-center">
          <p className={cn("font-medium", colors.text)}>
            {statusLabels[status] || status}
          </p>
          <p className="text-xs text-muted-foreground">
            de 1000 pontos
          </p>
        </div>
      )}
    </div>
  );
}
