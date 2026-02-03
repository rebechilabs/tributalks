import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, ShieldCheck, AlertTriangle, Info, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export interface ConfidenceData {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  factors: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  type: 'knowledge' | 'memory' | 'pattern' | 'agent' | 'context';
  label: string;
  contribution: number; // 0-100
}

interface ClaraConfidenceIndicatorProps {
  confidence: ConfidenceData;
  variant?: 'badge' | 'inline' | 'detailed';
}

const levelConfig = {
  high: {
    icon: ShieldCheck,
    label: 'Alta confiança',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    description: 'Resposta baseada em fontes verificadas e contexto robusto',
  },
  medium: {
    icon: Brain,
    label: 'Confiança moderada',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Baseado em conhecimento geral e padrões aprendidos',
  },
  low: {
    icon: AlertTriangle,
    label: 'Baixa confiança',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    description: 'Recomendo validar com seu contador ou consultor',
  },
};

const factorIcons: Record<ConfidenceFactor['type'], string> = {
  knowledge: '📚',
  memory: '🧠',
  pattern: '🔄',
  agent: '🎯',
  context: '📊',
};

export function ClaraConfidenceIndicator({ 
  confidence, 
  variant = 'badge' 
}: ClaraConfidenceIndicatorProps) {
  const config = levelConfig[confidence.level];
  const Icon = config.icon;

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge 
                variant="outline" 
                className={`${config.bg} ${config.border} ${config.color} gap-1 cursor-help text-xs px-2 py-0.5`}
              >
                <Icon className="w-3 h-3" />
                {confidence.score}%
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="font-medium">{config.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{config.description}</p>
              
              {confidence.factors.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Fontes utilizadas:
                  </p>
                  {confidence.factors.map((factor, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>{factorIcons[factor.type]} {factor.label}</span>
                      <span className="text-muted-foreground">+{factor.contribution}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        <span>{confidence.score}% confiança</span>
      </span>
    );
  }

  // Detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-3 ${config.bg} ${config.border} border space-y-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <div>
            <p className={`font-medium ${config.color}`}>{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <div className={`text-2xl font-bold ${config.color}`}>{confidence.score}%</div>
      </div>

      {/* Confidence bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence.score}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${confidence.level === 'high' ? 'bg-green-500' : confidence.level === 'medium' ? 'bg-amber-500' : 'bg-orange-500'}`}
        />
      </div>

      {/* Factors breakdown */}
      {confidence.factors.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Composição da confiança:
          </p>
          <div className="grid grid-cols-2 gap-1">
            {confidence.factors.map((factor, i) => (
              <div 
                key={i} 
                className="flex items-center gap-1.5 text-xs bg-background/50 rounded px-2 py-1"
              >
                <span>{factorIcons[factor.type]}</span>
                <span className="flex-1 truncate">{factor.label}</span>
                <span className="text-muted-foreground font-medium">+{factor.contribution}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Helper para calcular o nível baseado no score
export function getConfidenceLevel(score: number): ConfidenceData['level'] {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Helper para criar ConfidenceData a partir do backend
export function parseConfidenceFromResponse(response: {
  confidence_score?: number;
  confidence_factors?: Array<{
    type: string;
    label: string;
    contribution: number;
  }>;
}): ConfidenceData | null {
  if (!response.confidence_score) return null;

  const score = Math.round(response.confidence_score);
  const level = getConfidenceLevel(score);
  
  const factors: ConfidenceFactor[] = (response.confidence_factors || []).map(f => ({
    type: f.type as ConfidenceFactor['type'],
    label: f.label,
    contribution: Math.round(f.contribution),
  }));

  return { score, level, factors };
}
