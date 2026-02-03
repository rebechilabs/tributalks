import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DREDashboard } from '@/components/dre/DREDashboard';
import { DREHistory } from '@/components/dre/DREHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureGate } from '@/components/FeatureGate';

export default function DREResultados() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="dre_inteligente">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <DREDashboard />
            </TabsContent>
            <TabsContent value="historico">
              <DREHistory />
            </TabsContent>
          </Tabs>
        </FeatureGate>
      </div>
    </DashboardLayout>
  );
}
