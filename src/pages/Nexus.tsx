import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NexusHeader, NexusGrid, NexusInsightsSection } from '@/components/nexus';
import { useNexusData } from '@/hooks/useNexusData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, Trophy, AlertTriangle } from 'lucide-react';

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

        {/* Data prompt if missing critical data */}
        {showDataPrompt && (
          <Card className="p-4 mb-6 border-warning bg-warning/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">
                  Complete seus dados para desbloquear o NEXUS
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Para exibir todos os indicadores, precisamos de mais informações:
                </p>
                <div className="flex flex-wrap gap-2">
                  {!hasData.dre && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/dashboard/dre">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Preencher DRE
                      </Link>
                    </Button>
                  )}
                  {!hasData.score && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/dashboard/score-tributario">
                        <Trophy className="w-4 h-4 mr-1" />
                        Calcular Score
                      </Link>
                    </Button>
                  )}
                </div>
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
