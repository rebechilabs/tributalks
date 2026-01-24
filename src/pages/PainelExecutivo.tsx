import { useState } from "react";
import { Link } from "react-router-dom";
import { Crown, ArrowRight, FileBarChart } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  ExecutiveHeader,
  ExecutiveThermometer, 
  ExecutiveProjects, 
  ExecutiveReformImpact, 
  ExecutiveRisks,
  ExecutiveNcmCard
} from "@/components/executive";
import { ExecutiveReportPreview } from "@/components/executive/ExecutiveReportPreview";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLAN_HIERARCHY = {
  'FREE': 0,
  'BASICO': 1,
  'PROFISSIONAL': 2,
  'PREMIUM': 3,
};

export default function PainelExecutivo() {
  const { user, profile } = useAuth();
  const currentPlan = profile?.plano || 'FREE';
  const userLevel = PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] || 0;
  const hasPremiumAccess = userLevel >= PLAN_HIERARCHY['PREMIUM'];

  const [reportOpen, setReportOpen] = useState(false);

  const {
    thermometerData,
    topProjects,
    reformData,
    risks,
    loading,
    lastUpdate,
    refresh,
  } = useExecutiveData(user?.id);

  // Show upgrade prompt for non-premium users
  if (!hasPremiumAccess) {
    return (
      <DashboardLayout title="Painel Executivo">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Painel Executivo
              </h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Este painel exclusivo oferece uma visão estratégica completa da saúde tributária 
                da sua empresa, ideal para CEOs, CFOs e empresários.
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 mb-8 max-w-sm mx-auto">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Termômetro tributário com nota geral
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Projetos de caixa prioritários
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Impacto da Reforma Tributária
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Análise de riscos e governança
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Relatórios PDF para diretoria
                </li>
              </ul>
              <Button asChild size="lg" className="gap-2">
                <Link to="/#planos">
                  Fazer upgrade para Premium
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Disponível no plano Premium
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleGenerateReport = () => {
    setReportOpen(true);
  };

  return (
    <DashboardLayout title="Painel Executivo">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header with refresh and report button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ExecutiveHeader 
            lastUpdate={lastUpdate} 
            onRefresh={refresh} 
            loading={loading}
          />
          <Button 
            variant="default" 
            onClick={handleGenerateReport}
            className="gap-2 shrink-0"
          >
            <FileBarChart className="w-4 h-4" />
            Gerar relatório do mês
          </Button>
        </div>

        {/* Block 1 - Thermometer (full width) */}
        <ExecutiveThermometer data={thermometerData} loading={loading} />

        {/* Block 2 - Priority Projects */}
        <ExecutiveProjects projects={topProjects} loading={loading} />

        {/* Grid for blocks 3 and 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block 3 - Reform Impact */}
          <ExecutiveReformImpact data={reformData} loading={loading} />

          {/* Block 4 - Risks */}
          <ExecutiveRisks 
            risks={risks} 
            loading={loading} 
            onGenerateReport={handleGenerateReport}
          />
        </div>

        {/* Block 5 - NCM/CBS/IBS Card */}
        <ExecutiveNcmCard userId={user?.id} loading={loading} />
      </div>

      {/* Report Preview Modal */}
      <ExecutiveReportPreview
        open={reportOpen}
        onOpenChange={setReportOpen}
        thermometerData={thermometerData}
        topProjects={topProjects}
        reformData={reformData}
        risks={risks}
        companyName={profile?.empresa || undefined}
        userId={user?.id}
      />
    </DashboardLayout>
  );
}
