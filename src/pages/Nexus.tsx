import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NexusHeader, NexusGrid, NexusInsightsSection, NexusClaraCard } from '@/components/nexus';
import { useNexusData } from '@/hooks/useNexusData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { BarChart3, Trophy, AlertCircle } from 'lucide-react';
import { QuickDiagnosticModal } from '@/components/onboarding';

export default function Nexus() {
  const { kpiData, insights, loading, lastUpdate, refresh, hasData } = useNexusData();
  const [showQuickDiagnostic, setShowQuickDiagnostic] = useState(false);
  const [showDiagnosticPending, setShowDiagnosticPending] = useState(false);

  // Check for diagnostic flags on mount
  useEffect(() => {
    const needsDiagnostic = localStorage.getItem('needs_quick_diagnostic');
    const diagnosticPending = localStorage.getItem('diagnostic_pending');
    
    if (needsDiagnostic === 'true') {
      setShowQuickDiagnostic(true);
    } else if (diagnosticPending === 'true') {
      setShowDiagnosticPending(true);
    }
  }, []);

  const handleDiagnosticComplete = () => {
    setShowQuickDiagnostic(false);
    setShowDiagnosticPending(false);
    refresh(); // Refresh NEXUS data
  };

  const handleDiagnosticSkip = () => {
    setShowQuickDiagnostic(false);
    setShowDiagnosticPending(true);
  };

  const showDataPrompt = !loading && (!hasData.dre || !hasData.score);

  return (
    <DashboardLayout>
      {/* Quick Diagnostic Modal */}
      <QuickDiagnosticModal
        open={showQuickDiagnostic}
        onComplete={handleDiagnosticComplete}
        onSkip={handleDiagnosticSkip}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <NexusHeader
          lastUpdate={lastUpdate}
          onRefresh={refresh}
          loading={loading}
        />

        {/* Pending diagnostic banner */}
        {showDiagnosticPending && (
          <Alert className="mb-6 border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>Complete seu diagnóstico para ver insights personalizados</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowQuickDiagnostic(true)}
              >
                Completar agora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Data prompt if missing critical data - friendly value-focused language */}
        {showDataPrompt && !showDiagnosticPending && (
          <Card className="p-5 mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">
                  🚀 Esta é uma das ferramentas mais importantes da plataforma
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 mb-4">
                  Para desbloquear insights personalizados e identificar oportunidades de economia 
                  tributária específicas para sua empresa, preencha seu DRE. Leva apenas 3 minutos.
                </p>
                <div className="flex flex-wrap gap-3">
                  {!hasData.dre && (
                    <Button asChild size="sm" className="gap-2">
                      <Link to="/dashboard/dre">
                        <BarChart3 className="w-4 h-4" />
                        Preencher DRE
                        <span className="text-xs opacity-80 ml-1">(3 min)</span>
                      </Link>
                    </Button>
                  )}
                  {!hasData.score && (
                    <Button asChild size="sm" variant={hasData.dre ? "default" : "outline"} className="gap-2">
                      <Link to="/dashboard/score-tributario">
                        <Trophy className="w-4 h-4" />
                        Calcular Score
                        <span className="text-xs opacity-80 ml-1">(2 min)</span>
                      </Link>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Seus dados são criptografados e nunca compartilhados
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* KPI Grid */}
        <NexusGrid data={kpiData} loading={loading} />

        {/* Clara AI Card + Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <NexusInsightsSection insights={insights} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <NexusClaraCard />
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
