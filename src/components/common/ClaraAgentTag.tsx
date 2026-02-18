import { Badge } from "@/components/ui/badge";

const AGENT_CONFIG: Record<string, { emoji: string; label: string }> = {
  entender: { emoji: "🎯", label: "Entender" },
  precificar: { emoji: "💰", label: "Precificar" },
  recuperar: { emoji: "🔍", label: "Recuperar" },
  planejar: { emoji: "💡", label: "Planejar" },
  comandar: { emoji: "📊", label: "Comandar" },
};

interface ClaraAgentTagProps {
  agent: string | null;
}

export function ClaraAgentTag({ agent }: ClaraAgentTagProps) {
  if (!agent || !AGENT_CONFIG[agent]) return null;

  const { emoji, label } = AGENT_CONFIG[agent];

  return (
    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 font-medium hover:bg-amber-500/20">
      {emoji} {label}
    </Badge>
  );
}
