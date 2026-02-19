import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClaraMessage } from './ClaraMessage';
import { OpportunityCard, type OpportunityData } from './OpportunityCard';
import { DossieTributario } from './DossieTributario';

interface StepResultsProps {
  opportunities: OpportunityData[];
  totalMin: number;
  totalMax: number;
  totalCount: number;
  companyProfile?: Record<string, unknown> | null;
  onRefine?: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export function StepResults({ opportunities, totalMin, totalMax, totalCount, companyProfile, onRefine }: StepResultsProps) {
  const navigate = useNavigate();
  const [selectedOpp, setSelectedOpp] = useState<OpportunityData | null>(null);
  const [accepted, setAccepted] = useState(false);

  const isFallback = totalCount === 0 && opportunities.length > 0;

  const claraText = isFallback
    ? 'Não encontrei oportunidades de alto impacto com os dados atuais. Posso seguir por 3 frentes de governança que normalmente destravam economia indireta:\n\n• Créditos e conciliações\n• Rotinas de compliance\n• Revisão de cadastros fiscais'
    : totalMax > 0
      ? `Encontrei ${totalCount} oportunidade${totalCount > 1 ? 's' : ''} para a sua empresa! A economia estimada total pode chegar a ${formatCurrency(totalMin)} — ${formatCurrency(totalMax)} por ano. Aqui estão as 3 mais relevantes:`
      : 'Com base no perfil da sua empresa, identifiquei essas oportunidades que podem se aplicar ao seu caso:';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <ClaraMessage message={claraText} />

      {isFallback && !accepted && (
        <div className="flex gap-3">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => setAccepted(true)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Sim, seguir
          </Button>
          {onRefine && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onRefine}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refinar com mais perguntas
            </Button>
          )}
        </div>
      )}

      {(!isFallback || accepted) && opportunities.length > 0 && (
        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <OpportunityCard
              key={opp.id || i}
              opp={opp}
              onClick={() => setSelectedOpp(opp)}
            />
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

      {selectedOpp && (
        <DossieTributario
          open={!!selectedOpp}
          onOpenChange={(open) => { if (!open) setSelectedOpp(null); }}
          opportunity={selectedOpp}
          companyProfile={companyProfile as Record<string, unknown> | null}
        />
      )}
    </div>
  );
}
