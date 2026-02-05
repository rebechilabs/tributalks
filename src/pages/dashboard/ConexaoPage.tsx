import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ModuleToolCard, ToolStatus } from "@/components/home/ModuleToolCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Users, Mail, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const topTools = [
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

        <div className="max-w-5xl w-full space-y-6">
          {/* Linha 1: 3 cards menores */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {topTools.map((tool) => (
              <ModuleToolCard
                key={tool.href}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                icon={tool.icon}
                status={getToolStatus()}
                stepNumber={tool.stepNumber}
              />
            ))}
          </div>

          {/* Linha 2: Card grande em destaque - Indique e Ganhe */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Gift className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h3 className="text-lg font-semibold">Indique e Ganhe</h3>
                  <Badge className="bg-primary text-primary-foreground">Novo</Badge>
                </div>
                <p className="text-muted-foreground">
                  Ganhe até 20% de desconto indicando amigos para a plataforma
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/indicar" className="flex items-center gap-2">
                  Acessar <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
