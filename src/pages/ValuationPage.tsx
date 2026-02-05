import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExecutiveValuationCard } from "@/components/executive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { 
  TrendingUp, 
  Calculator, 
  BarChart3, 
  DollarSign, 
  Trophy,
  FileText,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";

const methodologies = [
  {
    icon: Calculator,
    title: "Múltiplo de EBITDA",
    description: "Método mais comum em M&A. Aplica um múltiplo setorial ao EBITDA anual, ajustado pelo compliance tributário.",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Fluxo de Caixa Descontado (DCF)",
    description: "Projeta fluxos de caixa para 5 anos + perpetuidade (Gordon Growth), descontados a valor presente pelo WACC setorial.",
    color: "text-success"
  },
  {
    icon: DollarSign,
    title: "Múltiplo de Receita",
    description: "Útil para empresas em crescimento ou com EBITDA negativo. Aplica múltiplo de receita típico do setor.",
    color: "text-warning"
  }
];

const scoreImpacts = [
  { grade: "A+ / A", adjustment: "+15%", description: "Empresa premium com excelente compliance" },
  { grade: "B", adjustment: "+5%", description: "Boa gestão tributária" },
  { grade: "C", adjustment: "0%", description: "Situação neutra" },
  { grade: "D", adjustment: "-15%", description: "Riscos identificados" },
  { grade: "E", adjustment: "-30%", description: "Alto risco tributário" },
];

export default function ValuationPage() {
  const { user } = useAuth();
  const { valuationData, loading } = useExecutiveData(user?.id);

  return (
    <DashboardLayout title="Valuation">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Estimativa de Valuation</h1>
                <p className="text-muted-foreground">
                  Valor estimado da sua empresa com 3 metodologias
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-sm">
            <Trophy className="w-4 h-4 mr-1" />
            Professional / Enterprise
          </Badge>
        </div>

        {/* Main Valuation Card */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : (
          <ExecutiveValuationCard data={valuationData} loading={false} />
        )}

        {/* Methodologies Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-warning" />
              Como Calculamos o Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {methodologies.map((method, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg bg-background ${method.color}`}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground">{method.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Tributário Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-primary" />
              Impacto do Score Tributário no Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              O Score Tributário da sua empresa ajusta diretamente o valuation. 
              Empresas com melhor compliance tributário são mais atraentes para investidores e compradores.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Nota</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Ajuste</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Significado</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreImpacts.map((impact, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0">
                      <td className="py-3">
                        <Badge variant={index <= 1 ? "default" : index === 2 ? "secondary" : "destructive"} className="font-mono">
                          {impact.grade}
                        </Badge>
                      </td>
                      <td className={`py-3 font-semibold ${
                        impact.adjustment.startsWith('+') ? 'text-success' : 
                        impact.adjustment === '0%' ? 'text-muted-foreground' : 'text-destructive'
                      }`}>
                        {impact.adjustment}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {impact.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link to="/dashboard/entender/score">
                  <Trophy className="w-4 h-4" />
                  Ver meu Score
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/dashboard/entender/dre">
                  <FileText className="w-4 h-4" />
                  Atualizar DRE
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
