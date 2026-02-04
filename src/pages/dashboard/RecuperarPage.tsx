import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { FileText, Lightbulb } from "lucide-react";
import { useHomeState } from "@/hooks/useHomeState";

const tools = [
  {
    title: "Radar de Créditos",
    description: "Faça upload de XMLs, SPED e DCTF para identificar créditos tributários automaticamente.",
    href: "/dashboard/recuperar/radar",
    icon: FileText,
    stepNumber: 1,
    statusKey: 'radar' as const,
  },
  {
    title: "Oportunidades Fiscais",
    description: "Mais de 61 oportunidades de economia baseadas no seu perfil.",
    href: "/dashboard/recuperar/oportunidades",
    icon: Lightbulb,
    stepNumber: 2,
    statusKey: 'oportunidades' as const,
    badge: "61+",
  },
];

export default function RecuperarPage() {
  const homeState = useHomeState();

  const getToolStatus = (statusKey: string): ToolStatus => {
    switch (statusKey) {
      case 'radar':
        return homeState.creditsData ? 'completed' : 'pending';
      case 'oportunidades':
        return 'pending'; // Always show as available
      default:
        return 'pending';
    }
  };

  return (
    <DashboardLayout title="Recuperar Créditos">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Recuperar Créditos Tributários</h1>
          <p className="text-muted-foreground">
            Identifique créditos e oportunidades de economia fiscal
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
