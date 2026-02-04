import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { BarChart3, Trophy, Scale } from "lucide-react";
import { useHomeState } from "@/hooks/useHomeState";

const tools = [
  {
    title: "DRE Inteligente",
    description: "A base para todas as análises. Conecte seu ERP ou preencha manualmente.",
    href: "/dashboard/entender/dre",
    icon: BarChart3,
    stepNumber: 1,
    statusKey: 'dre' as const,
  },
  {
    title: "Score Tributário",
    description: "Diagnóstico da saúde tributária em escala de 0 a 1000.",
    href: "/dashboard/entender/score",
    icon: Trophy,
    stepNumber: 2,
    statusKey: 'score' as const,
  },
  {
    title: "Simpronto",
    description: "Compare 5 regimes tributários incluindo Simples 2027.",
    href: "/dashboard/entender/simpronto",
    icon: Scale,
    stepNumber: 3,
    statusKey: 'simpronto' as const,
  },
];

export default function EntenderPage() {
  const homeState = useHomeState();

  const getToolStatus = (statusKey: string): ToolStatus => {
    switch (statusKey) {
      case 'dre':
        return homeState.dreData ? 'completed' : 'pending';
      case 'score':
        return homeState.scoreData ? 'completed' : 'pending';
      case 'simpronto':
        // Simpronto requires DRE to be completed
        return homeState.dreData ? 'pending' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <DashboardLayout title="Entender Meu Negócio">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Entender Meu Negócio</h1>
          <p className="text-muted-foreground">
            Diagnóstico completo da sua situação tributária
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ModuleToolCard
              key={tool.href}
              title={tool.title}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
              status={getToolStatus(tool.statusKey)}
              stepNumber={tool.stepNumber}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
