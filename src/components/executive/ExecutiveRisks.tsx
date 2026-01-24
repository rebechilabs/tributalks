import { Link } from "react-router-dom";
import { Shield, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { RiskItem } from "@/hooks/useExecutiveData";

interface ExecutiveRisksProps {
  risks: RiskItem[];
  loading?: boolean;
  onGenerateReport?: () => void;
}

const nivelStyles: Record<string, { bg: string; text: string; label: string }> = {
  'baixo': { bg: 'bg-emerald-500/10', text: 'text-emerald-700', label: 'Baixo' },
  'medio': { bg: 'bg-yellow-500/10', text: 'text-yellow-700', label: 'Médio' },
  'alto': { bg: 'bg-red-500/10', text: 'text-red-700', label: 'Alto' },
};

const categoriaIcons: Record<string, typeof Shield> = {
  'Conformidade': Shield,
  'Eficiencia': Shield,
  'Documentacao': FileText,
  'Gestao': Shield,
  'Risco': AlertTriangle,
};

export function ExecutiveRisks({ risks, loading, onGenerateReport }: ExecutiveRisksProps) {
  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport();
    } else {
      toast({
        title: "Relatório em desenvolvimento",
        description: "Em breve você poderá gerar relatórios PDF para a diretoria.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
          <Skeleton className="h-9 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  // No risks data - prompt user to calculate score
  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Riscos & Governança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-foreground">
              Nenhum risco significativo identificado
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Complete o Score Tributário para uma análise completa de riscos.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/score-tributario">Ver Score Completo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Riscos & Governança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk, index) => {
          const nivelStyle = nivelStyles[risk.nivel] || nivelStyles['medio'];
          const Icon = categoriaIcons[risk.categoria] || Shield;

          return (
            <div 
              key={`${risk.categoria}-${index}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={cn("p-1.5 rounded shrink-0", nivelStyle.bg)}>
                <Icon className={cn("w-4 h-4", nivelStyle.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {risk.categoria}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {risk.descricao}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={cn("text-xs shrink-0", nivelStyle.bg, nivelStyle.text)}
              >
                {nivelStyle.label}
              </Badge>
            </div>
          );
        })}

        {/* Generate Report CTA */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2 mt-4"
          onClick={handleGenerateReport}
        >
          <FileText className="w-4 h-4" />
          Gerar relatório para diretoria
        </Button>
      </CardContent>
    </Card>
  );
}
