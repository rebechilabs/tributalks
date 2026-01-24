import { Wallet, Clock, ArrowRight, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { ProjetoTributario } from "@/hooks/useExecutiveData";

interface ExecutiveProjectsProps {
  projects: ProjetoTributario[];
  loading?: boolean;
  onAction?: (projectId: string, action: 'advance' | 'postpone') => void;
}

const prazoLabels: Record<string, { label: string; color: string }> = {
  'curto': { label: 'Curto prazo', color: 'bg-emerald-500/10 text-emerald-700' },
  'medio': { label: 'Médio prazo', color: 'bg-yellow-500/10 text-yellow-700' },
  'longo': { label: 'Longo prazo', color: 'bg-blue-500/10 text-blue-700' },
};

const riscoLabels: Record<string, { label: string; color: string }> = {
  'baixo': { label: 'Risco baixo', color: 'bg-emerald-500/10 text-emerald-700' },
  'medio': { label: 'Risco médio', color: 'bg-yellow-500/10 text-yellow-700' },
  'alto': { label: 'Risco alto', color: 'bg-red-500/10 text-red-700' },
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
}

export function ExecutiveProjects({ projects, loading, onAction }: ExecutiveProjectsProps) {
  const handleAdvance = (projectId: string) => {
    if (onAction) {
      onAction(projectId, 'advance');
    } else {
      toast({
        title: "Projeto iniciado",
        description: "Em breve você receberá orientações para avançar com este projeto.",
      });
    }
  };

  const handlePostpone = (projectId: string) => {
    if (onAction) {
      onAction(projectId, 'postpone');
    } else {
      toast({
        title: "Projeto adiado",
        description: "Este projeto foi movido para revisão futura.",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Projetos de caixa prioritários</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Projetos de caixa prioritários</h2>
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="text-center py-4">
              <Wallet className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-medium text-muted-foreground">Nenhum projeto identificado</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Complete seu Score Tributário para descobrir oportunidades
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Projetos de caixa prioritários</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => {
          const prazoInfo = prazoLabels[project.prazo] || prazoLabels['medio'];
          const riscoInfo = riscoLabels[project.riscoNivel] || riscoLabels['baixo'];

          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {project.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Impact */}
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-muted-foreground">Impacto:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(project.impactoMin)} – {formatCurrency(project.impactoMax)}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={cn("text-xs", prazoInfo.color)}>
                    <Clock className="w-3 h-3 mr-1" />
                    {prazoInfo.label}
                  </Badge>
                  <Badge variant="secondary" className={cn("text-xs", riscoInfo.color)}>
                    {riscoInfo.label}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => handleAdvance(project.id)}
                  >
                    Avançar agora
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePostpone(project.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
