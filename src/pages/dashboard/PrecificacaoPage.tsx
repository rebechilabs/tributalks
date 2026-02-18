import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { Target, Wallet } from "lucide-react";

const tools = [
  {
    title: "Margem Ativa + PriceGuard",
    description: "Análise de margens por NCM e cálculo de novos preços em lote.",
    href: "/dashboard/precificacao/margem",
    icon: Target,
    stepNumber: 1,
    statusKey: 'margem' as const,
  },
  {
    title: "Split Payment",
    description: "Simule o impacto do Split Payment 2026 na sua margem.",
    href: "/dashboard/precificacao/split",
    icon: Wallet,
    stepNumber: 2,
    statusKey: 'split' as const,
  },
];

export default function PrecificacaoPage() {
  const getToolStatus = (_statusKey: string): ToolStatus => {
    return 'pending';
  };

  return (
    <DashboardLayout title="Precificar">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Precificar</h1>
          <p className="text-muted-foreground">
            Proteja suas margens com análises de impacto tributário
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <ModuleToolCard
              key={tool.href}
              title={tool.title}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
              status={getToolStatus(tool.statusKey)}
              stepNumber={tool.stepNumber}
              badge={'badge' in tool ? (tool.badge as string) : undefined}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
