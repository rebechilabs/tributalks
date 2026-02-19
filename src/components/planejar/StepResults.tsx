import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClaraMessage } from './ClaraMessage';
import { OpportunityCard, type OpportunityData } from './OpportunityCard';

interface StepResultsProps {
  opportunities: OpportunityData[];
  totalMin: number;
  totalMax: number;
  totalCount: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export function StepResults({ opportunities, totalMin, totalMax, totalCount }: StepResultsProps) {
  const navigate = useNavigate();

  const claraText = totalMax > 0
    ? `Encontrei ${totalCount} oportunidade${totalCount > 1 ? 's' : ''} para a sua empresa! A economia estimada total pode chegar a ${formatCurrency(totalMin)} — ${formatCurrency(totalMax)} por ano. Aqui estão as 3 mais relevantes:`
    : 'Não encontrei oportunidades específicas para o seu perfil no momento. Complete mais dados do seu perfil para uma análise mais precisa.';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <ClaraMessage message={claraText} />

      {opportunities.length > 0 && (
        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <OpportunityCard key={opp.id || i} opp={opp} />
          ))}
        </div>
      )}

      {totalCount > 3 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/dashboard/planejar/oportunidades')}
        >
          Ver todas as {totalCount} oportunidades
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
