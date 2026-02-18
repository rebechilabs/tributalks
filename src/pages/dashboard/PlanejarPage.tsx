import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { Lightbulb, Route } from "lucide-react";

const tools = [
  {
    title: "Oportunidades Tributárias",
    description: "Mais de 61 oportunidades de economia baseadas no seu perfil.",
    href: "/dashboard/planejar/oportunidades",
    icon: Lightbulb,
    stepNumber: 1,
    statusKey: 'oportunidades' as const,
    badge: "61+",
  },
  {
    title: "Planejamento Tributário",
    description: "Monte seu plano tributário estratégico personalizado.",
    href: "/dashboard/planejar/planejamento",
    icon: Route,
    stepNumber: 2,
    statusKey: 'planejamento' as const,
    badge: "Em breve",
  },
];

export default function PlanejarPage() {
  const getToolStatus = (statusKey: string): ToolStatus => {
    if (statusKey === 'planejamento') return 'pending';
    return 'pending';
  };

  return (
    <DashboardLayout title="Planejar">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Planejar</h1>
          <p className="text-muted-foreground">
            Planeje sua estratégia tributária com inteligência
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
              badge={tool.badge}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
