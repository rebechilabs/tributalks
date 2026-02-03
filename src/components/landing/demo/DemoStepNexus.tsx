import { motion } from "framer-motion";
import { TrendingUp, DollarSign, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const KPIS = [
  {
    label: "Score Tributário",
    value: "72/100",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Créditos Identificados",
    value: "R$ 47k",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    label: "Impacto Reforma",
    value: "+8,5%",
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    label: "Economia Potencial",
    value: "R$ 180k/ano",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

interface DemoStepNexusProps {
  onComplete: () => void;
}

export function DemoStepNexus({ onComplete }: DemoStepNexusProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold text-foreground">Dashboard NEXUS</h3>
        <p className="text-muted-foreground">
          Seu centro de comando tributário
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {KPIS.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            className="p-4 bg-card rounded-xl border border-border"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">
                KPI {index + 1}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-green-500 font-medium text-lg">
          ✅ Tudo pronto para você começar!
        </p>
        <Button size="lg" className="gap-2" onClick={onComplete}>
          <Sparkles className="w-4 h-4" />
          Testar Grátis por 7 Dias
        </Button>
        <p className="text-xs text-muted-foreground">
          Sem cartão de crédito • Cancele quando quiser
        </p>
      </motion.div>
    </div>
  );
}
