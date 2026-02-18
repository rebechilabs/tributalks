import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DREWizard } from '@/components/dre/DREWizard';
import { FeatureGate } from '@/components/FeatureGate';
import { MotivationalBanner } from '@/components/common/MotivationalBanner';

export default function DRE() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="dre_inteligente">
          <MotivationalBanner
            id="dre"
            icon="📊"
            text="Ao preencher sua DRE, você receberá: diagnóstico completo com Receita Líquida, Margem Bruta, EBITDA, Lucro Líquido e comparação automática com empresas do seu setor."
          />
          <DREWizard />
        </FeatureGate>
      </div>
    </DashboardLayout>
  );
}
