import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CreditRadar } from '@/components/credits/CreditRadar';

export default function RadarCreditos() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <CreditRadar />
      </div>
    </DashboardLayout>
  );
}
