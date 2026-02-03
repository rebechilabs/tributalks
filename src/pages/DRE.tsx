import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DREWizard } from '@/components/dre/DREWizard';
import { FeatureGate } from '@/components/FeatureGate';

export default function DRE() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="dre_inteligente">
          <DREWizard />
        </FeatureGate>
      </div>
    </DashboardLayout>
  );
}
