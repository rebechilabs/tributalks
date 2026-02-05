import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { Target, Wallet, Shield } from "lucide-react";

const tools = [
  {
    title: "Margem Ativa",
    description: "Upload em lote por NCM para análise de margens e impostos.",
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
  {
    title: "PriceGuard",
    description: "Calcule novos preços em lote e exporte planilha.",
    href: "/dashboard/precificacao/priceguard",
    icon: Shield,
    stepNumber: 3,
    statusKey: 'priceguard' as const,
  },
];

export default function PrecificacaoPage() {
  const getToolStatus = (statusKey: string): ToolStatus => {
    // For now, all tools are pending until we implement status tracking
    if (statusKey === 'priceguard') return 'pending';
    return 'pending';
  };

  return (
    <DashboardLayout title="Precificação">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Precificação</h1>
          <p className="text-muted-foreground">
            Proteja suas margens com análises de impacto tributário
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
              badge={'badge' in tool ? (tool.badge as string) : undefined}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
