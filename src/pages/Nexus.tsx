import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NexusHeader, NexusGrid, NexusInsightsSection } from '@/components/nexus';
import { useNexusData } from '@/hooks/useNexusData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, Trophy } from 'lucide-react';

export default function Nexus() {
  const { kpiData, insights, loading, lastUpdate, refresh, hasData } = useNexusData();

  const showDataPrompt = !loading && (!hasData.dre || !hasData.score);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <NexusHeader
          lastUpdate={lastUpdate}
          onRefresh={refresh}
          loading={loading}
        />

        {/* Data prompt if missing critical data - friendly value-focused language */}
        {showDataPrompt && (
          <Card className="p-5 mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">
                  🎯 Desbloqueie insights personalizados
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 mb-4">
                  Com poucos dados, a Clara pode identificar oportunidades de economia tributária 
                  específicas para sua empresa. Leva menos de 5 minutos.
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
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Seus dados são criptografados e nunca compartilhados
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* KPI Grid */}
        <NexusGrid data={kpiData} loading={loading} />

        {/* Insights Section */}
        <NexusInsightsSection insights={insights} loading={loading} />
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
