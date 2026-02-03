import { motion } from "framer-motion";
import { 
  Bot, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Target,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSmartPrefill } from "@/hooks/useSmartPrefill";

interface ToolStep {
  id: string;
  name: string;
  description: string;
  path: string;
  estimatedTime: number;
  prefillCount?: number;
}

interface PersonalizedToolPlanProps {
  priority: string;
  userPlan: string;
  onStartTool: (path: string) => void;
  onChangePriority: () => void;
}

// Planos de ferramentas baseados na prioridade
const TOOL_PLANS: Record<string, ToolStep[]> = {
  caixa: [
    {
      id: "score",
      name: "Score Tributário",
      description: "Diagnóstico rápido da sua saúde fiscal",
      path: "/dashboard/score-tributario",
      estimatedTime: 3,
    },
    {
      id: "split",
      name: "Simulador Split Payment",
      description: "Quanto vai travar do seu caixa em 2026?",
      path: "/dashboard/calculadora/split-payment",
      estimatedTime: 5,
    },
    {
      id: "radar",
      name: "Radar de Créditos",
      description: "Identifique créditos tributários não aproveitados",
      path: "/dashboard/analise-notas-fiscais",
      estimatedTime: 10,
    },
  ],
  margem: [
    {
      id: "dre",
      name: "DRE Inteligente",
      description: "Analise sua margem e encontre gargalos",
      path: "/dashboard/dre",
      estimatedTime: 8,
    },
    {
      id: "margem",
      name: "Margem Ativa",
      description: "Otimize preços e negocie com fornecedores",
      path: "/dashboard/margem-ativa",
      estimatedTime: 10,
    },
    {
      id: "comparativo",
      name: "Comparativo de Regimes",
      description: "Seu regime atual é o melhor?",
      path: "/dashboard/calculadora/comparativo-regimes",
      estimatedTime: 5,
    },
  ],
  compliance: [
    {
      id: "checklist",
      name: "Checklist Reforma",
      description: "Sua empresa está pronta para 2026?",
      path: "/dashboard/checklist-reforma",
      estimatedTime: 5,
    },
    {
      id: "timeline",
      name: "Timeline Reforma",
      description: "Prazos e marcos importantes",
      path: "/dashboard/timeline-reforma",
      estimatedTime: 3,
    },
    {
      id: "score",
      name: "Score Tributário",
      description: "Avalie sua conformidade fiscal",
      path: "/dashboard/score-tributario",
      estimatedTime: 3,
    },
  ],
  crescimento: [
    {
      id: "dre",
      name: "DRE Inteligente",
      description: "Entenda sua estrutura de custos",
      path: "/dashboard/dre",
      estimatedTime: 8,
    },
    {
      id: "comparativo",
      name: "Comparativo de Regimes",
      description: "Qual regime suporta seu crescimento?",
      path: "/dashboard/calculadora/comparativo-regimes",
      estimatedTime: 5,
    },
    {
      id: "checklist",
      name: "Checklist Reforma",
      description: "Prepare-se para as mudanças tributárias",
      path: "/dashboard/checklist-reforma",
      estimatedTime: 5,
    },
  ],
};

const PRIORITY_LABELS: Record<string, string> = {
  caixa: "Proteger seu fluxo de caixa",
  margem: "Aumentar sua margem de lucro",
  compliance: "Garantir conformidade fiscal",
  crescimento: "Planejar seu crescimento",
};

export function PersonalizedToolPlan({
  priority,
  userPlan,
  onStartTool,
  onChangePriority,
}: PersonalizedToolPlanProps) {
  const tools = TOOL_PLANS[priority] || TOOL_PLANS.caixa;
  const totalTime = tools.reduce((acc, t) => acc + t.estimatedTime, 0);

  // Busca dados de prefill para cada ferramenta (apenas para exibição)
  const { preFilled: scorePrefill } = useSmartPrefill({ tool: "score" });

  // Mapeia prefill count para cada ferramenta
  const toolsWithPrefill = tools.map((tool) => {
    let prefillCount = 0;
    if (tool.id === "score") prefillCount = scorePrefill.length;
    // Adicionar mais conforme implementamos
    return { ...tool, prefillCount };
  });

  return (
    <div className="space-y-6">
      {/* Header com Clara */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Seu Plano Personalizado
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-muted-foreground">
            Objetivo:{" "}
            <span className="text-foreground font-medium">
              {PRIORITY_LABELS[priority]}
            </span>
          </p>
        </div>
      </div>

      {/* Resumo */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-primary" />
            <span>
              <strong>{tools.length}</strong> ferramentas selecionadas
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>~{totalTime} min total</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ferramentas */}
      <div className="space-y-3">
        {toolsWithPrefill.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <h3 className="font-semibold">{tool.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {tool.estimatedTime} min
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tool.description}
                    </p>
                    {tool.prefillCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tool.prefillCount} campos já preenchidos</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onStartTool(tool.path)}
                    className="ml-4"
                  >
                    Iniciar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mensagem da Clara */}
      <Card className="border-dashed">
        <CardContent className="py-4 px-4">
          <div className="flex items-start gap-3">
            <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              💡 Vou te acompanhar em cada etapa! Campos já preenchidos
              automaticamente com base no seu perfil — você só confirma.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={onChangePriority}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Mudar prioridade
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartTool("/dashboard")}
        >
          Ir para o Dashboard
        </Button>
      </div>
    </div>
  );
}
