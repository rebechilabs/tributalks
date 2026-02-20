import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DREWizard } from '@/components/dre/DREWizard';
import { DREDashboard } from '@/components/dre/DREDashboard';
import { FeatureGate } from '@/components/FeatureGate';
import { MotivationalBanner } from '@/components/common/MotivationalBanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function DRE() {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  const { data: hasDRE, isLoading, refetch } = useQuery({
    queryKey: ['has-dre', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('company_dre')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const handleComplete = () => {
    setShowWizard(false);
    refetch();
  };

  const showDashboard = hasDRE && !showWizard && !isLoading;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="dre_inteligente">
          <MotivationalBanner
            id="dre"
            icon="barChart"
            text="Ao preencher sua DRE, você receberá: diagnóstico completo com Receita Líquida, Margem Bruta, EBITDA, Lucro Líquido e comparação automática com empresas do seu setor."
          />
          {showDashboard ? (
            <DREDashboard onEdit={() => setShowWizard(true)} />
          ) : (
            <DREWizard onComplete={handleComplete} />
          )}
        </FeatureGate>
      </div>
    </DashboardLayout>
  );
}
