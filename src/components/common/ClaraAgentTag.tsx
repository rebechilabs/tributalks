import { Badge } from "@/components/ui/badge";
import { Target, DollarSign, Search, Lightbulb, LayoutDashboard, type LucideIcon } from "lucide-react";

const AGENT_CONFIG: Record<string, { icon: LucideIcon; label: string }> = {
  entender: { icon: Target, label: "Entender" },
  precificar: { icon: DollarSign, label: "Precificar" },
  recuperar: { icon: Search, label: "Recuperar" },
  planejar: { icon: Lightbulb, label: "Planejar" },
  comandar: { icon: LayoutDashboard, label: "Comandar" },
};

interface ClaraAgentTagProps {
  agent: string | null;
}

export function ClaraAgentTag({ agent }: ClaraAgentTagProps) {
  if (!agent || !AGENT_CONFIG[agent]) return null;

  const { icon: Icon, label } = AGENT_CONFIG[agent];

  return (
    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 font-medium hover:bg-amber-500/20">
      <Icon className="w-3 h-3 mr-0.5" />
      {label}
    </Badge>
  );
}
