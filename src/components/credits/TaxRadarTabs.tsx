import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingDown } from 'lucide-react';
import { CreditRadar } from './CreditRadar';
import { ExposureProjection } from './ExposureProjection';
import { SavingsSummaryCard } from './SavingsSummaryCard';

interface TaxRadarTabsProps {
  defaultTab?: 'creditos' | 'exposicao';
}

export function TaxRadarTabs({ defaultTab = 'creditos' }: TaxRadarTabsProps) {
  return (
    <div className="space-y-6">
      {/* Savings Summary Card - sempre visível no topo */}
      <SavingsSummaryCard />

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="creditos" className="gap-2">
            <Target className="h-4 w-4" />
            Créditos Recuperáveis
          </TabsTrigger>
          <TabsTrigger value="exposicao" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Exposição Projetada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creditos">
          <CreditRadar />
        </TabsContent>

        <TabsContent value="exposicao">
          <ExposureProjection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
