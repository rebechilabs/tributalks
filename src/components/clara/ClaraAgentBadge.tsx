import { Badge } from "@/components/ui/badge";
import { Bot, Calculator, Shield, Zap } from "lucide-react";
import { AgentType } from "@/hooks/clara";

interface ClaraAgentBadgeProps {
  agentType: AgentType;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const AGENT_CONFIG: Record<AgentType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  orchestrator: {
    label: "Clara",
    icon: Bot,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  fiscal: {
    label: "Fiscal",
    icon: Calculator,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  margin: {
    label: "Margem",
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  compliance: {
    label: "Compliance",
    icon: Shield,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
};

export function ClaraAgentBadge({ 
  agentType, 
  showLabel = true,
  size = "md" 
}: ClaraAgentBadgeProps) {
  const config = AGENT_CONFIG[agentType];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.bgColor} ${config.color} border-0 font-medium ${sizeClasses[size]}`}
    >
      <Icon className={`${iconSizes[size]} ${showLabel ? 'mr-1' : ''}`} />
      {showLabel && <span>Agente {config.label}</span>}
    </Badge>
  );
}
