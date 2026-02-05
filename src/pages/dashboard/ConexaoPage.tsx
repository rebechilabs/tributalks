import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { Newspaper, Users, Gift } from "lucide-react";

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
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">Conexão & Comunicação</h1>
          <p className="text-muted-foreground">
            Mantenha-se informado e conectado com a comunidade tributária
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-4xl w-full">
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

        {/* Newsletter Section */}
        <div className="mt-12 w-full max-w-md">
          <div className="bg-card border rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">📬 TribuTalks News</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Receba nossa newsletter toda terça-feira às 07h07 com as principais atualizações tributárias.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
