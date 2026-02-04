import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { LayoutDashboard, FileText } from "lucide-react";

const tools = [
  {
    title: "NEXUS",
    description: "Centro de comando executivo com 8 KPIs consolidados.",
    href: "/dashboard/comandar/nexus",
    icon: LayoutDashboard,
    stepNumber: 1,
    statusKey: 'nexus' as const,
  },
  {
    title: "Relatórios PDF",
    description: "Exporte relatórios executivos por empresa.",
    href: "/dashboard/comandar/relatorios",
    icon: FileText,
    stepNumber: 2,
    statusKey: 'relatorios' as const,
    badge: "Em breve",
  },
];

export default function ComandarPage() {
  const getToolStatus = (statusKey: string): ToolStatus => {
    // NEXUS is always available, relatorios is coming soon
    if (statusKey === 'relatorios') return 'pending';
    return 'pending';
  };

  return (
    <DashboardLayout title="Comandar">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Comandar</h1>
          <p className="text-muted-foreground">
            Visão executiva consolidada e relatórios
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
