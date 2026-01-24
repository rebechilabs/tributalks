import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DREWizard } from '@/components/dre/DREWizard';

export default function DRE() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <DREWizard />
      </div>
    </DashboardLayout>
  );
}
