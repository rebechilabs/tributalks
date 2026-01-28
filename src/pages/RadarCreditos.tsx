import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TaxRadarTabs } from '@/components/credits/TaxRadarTabs';
import { useSearchParams } from 'react-router-dom';

export default function RadarCreditos() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') as 'creditos' | 'exposicao' | null;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <TaxRadarTabs defaultTab={tab || 'creditos'} />
      </div>
    </DashboardLayout>
  );
}
