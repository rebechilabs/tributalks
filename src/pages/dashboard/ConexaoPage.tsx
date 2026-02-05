import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { Newspaper, Users, Gift } from "lucide-react";

const tools = [
  {
    title: "Newsletter",
    description: "Receba atualizações tributárias toda terça às 07h07.",
    href: "/noticias",
    icon: Newspaper,
    stepNumber: 1,
    statusKey: 'newsletter' as const,
  },
  {
    title: "Comunidade",
    description: "Conexões e networking com outros empresários.",
    href: "/comunidade",
    icon: Users,
    stepNumber: 2,
    statusKey: 'comunidade' as const,
  },
  {
    title: "Indique e Ganhe",
    description: "Ganhe até 20% de desconto indicando amigos.",
    href: "/indicar",
    icon: Gift,
    stepNumber: 3,
    statusKey: 'indicar' as const,
    badge: "Novo",
  },
];

export default function ConexaoPage() {
  const getToolStatus = (): ToolStatus => {
    return 'pending';
  };

  return (
    <DashboardLayout title="Conexão & Comunicação">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Conexão & Comunicação</h1>
          <p className="text-muted-foreground">
            Mantenha-se informado e conectado com a comunidade tributária
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
              status={getToolStatus()}
              stepNumber={tool.stepNumber}
              badge={tool.badge}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
