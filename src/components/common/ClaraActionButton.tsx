import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ACTION_PATTERNS: { pattern: RegExp; route: string; label: string }[] = [
  { pattern: /\[Ver no Comparativo\]/g, route: "/dashboard/entender/comparativo", label: "Ver no Comparativo" },
  { pattern: /\[Gerar Relatório PDF\]/g, route: "__command:/resumo", label: "Gerar Relatório PDF" },
  { pattern: /\[Ver Radar de Créditos\]/g, route: "/dashboard/recuperar/radar", label: "Ver Radar de Créditos" },
  { pattern: /\[Simular cenário\]/g, route: "/dashboard/entender/comparativo", label: "Simular cenário" },
  { pattern: /\[Ver Oportunidades\]/g, route: "/dashboard/planejar/oportunidades", label: "Ver Oportunidades" },
  { pattern: /\[Ver DRE\]/g, route: "/dashboard/entender/dre", label: "Ver DRE" },
  { pattern: /\[Ver Score\]/g, route: "/dashboard/entender/score-tributario", label: "Ver Score" },
  { pattern: /\[Ver Margem Ativa\]/g, route: "/dashboard/precificar/margem-ativa", label: "Ver Margem Ativa" },
];

interface ClaraActionButtonProps {
  content: string;
  onCommand?: (command: string) => void;
}

export function ClaraActionButtons({ content, onCommand }: ClaraActionButtonProps) {
  const navigate = useNavigate();
  
  const matchedActions = ACTION_PATTERNS.filter(({ pattern }) => pattern.test(content));
  // Reset lastIndex after test
  ACTION_PATTERNS.forEach(p => p.pattern.lastIndex = 0);

  if (matchedActions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {matchedActions.map(({ route, label }, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
          onClick={() => {
            if (route.startsWith("__command:")) {
              onCommand?.(route.replace("__command:", ""));
            } else {
              navigate(route);
            }
          }}
        >
          {label}
          <ArrowRight className="w-3 h-3" />
        </Button>
      ))}
    </div>
  );
}
