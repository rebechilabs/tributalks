import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { Newspaper, Users, Gift, Mail } from "lucide-react";

const tools = [
  {
    title: "Notícias",
    description: "Atualizações tributárias toda terça às 07h07.",
    href: "/noticias",
    icon: Newspaper,
    stepNumber: 1,
    statusKey: 'noticias' as const,
  },
  {
    title: "TribuTalks News",
    description: "Newsletter semanal com as principais novidades.",
    href: "/newsletter",
    icon: Mail,
    stepNumber: 2,
    statusKey: 'newsletter' as const,
  },
  {
    title: "Comunidade",
    description: "Conexões e networking com outros empresários.",
    href: "/comunidade",
    icon: Users,
    stepNumber: 3,
    statusKey: 'comunidade' as const,
  },
  {
    title: "Indique e Ganhe",
    description: "Ganhe até 20% de desconto indicando amigos.",
    href: "/indicar",
    icon: Gift,
    stepNumber: 4,
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
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">Conexão & Comunicação</h1>
          <p className="text-muted-foreground">
            Mantenha-se informado e conectado com a comunidade tributária
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-5xl w-full">
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
