import { 
  Wallet, TrendingUp, Percent, Gem, Building2, Scale, Lightbulb, Shield 
} from 'lucide-react';
import { NexusKpiCard } from './NexusKpiCard';
import { NexusGridSkeleton } from './NexusKpiSkeleton';
import { NexusKpiData } from '@/hooks/useNexusData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NexusGridProps {
  data: NexusKpiData | null;
  loading: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatVariation(value: number, type: 'currency' | 'percent' = 'currency'): string {
  if (type === 'percent') {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }
  const sign = value >= 0 ? '+' : '-';
  return `${sign} ${formatCurrency(Math.abs(value))}`;
}

export function NexusGrid({ data, loading }: NexusGridProps) {
  if (loading || !data) {
    return <NexusGridSkeleton />;
  }

  const kpiCards = [
    // Card 1: Fluxo de Caixa
    {
      icon: <Wallet className="w-5 h-5" />,
      title: 'Fluxo de Caixa',
      value: data.fluxoCaixa.valor,
      formattedValue: formatCurrency(data.fluxoCaixa.valor),
      variation: data.fluxoCaixa.variacao !== null ? {
        direction: data.fluxoCaixa.variacao >= 0 ? 'up' as const : 'down' as const,
        value: formatVariation(data.fluxoCaixa.variacao),
        label: 'vs mês anterior',
      } : undefined,
      status: data.fluxoCaixa.status,
      tooltip: 'Disponível hoje + entradas - saídas próximos 30 dias (EBITDA + Créditos)',
    },
    // Card 2: Receita Mensal
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Receita Mensal',
      value: data.receitaMensal.valor,
      formattedValue: formatCurrency(data.receitaMensal.valor),
      variation: data.receitaMensal.variacaoPercent !== null ? {
        direction: data.receitaMensal.variacaoPercent >= 0 ? 'up' as const : 'down' as const,
        value: formatVariation(data.receitaMensal.variacaoPercent, 'percent'),
        label: 'vs mês anterior',
      } : undefined,
      status: data.receitaMensal.status,
      tooltip: 'Faturamento do mês atual',
    },
    // Card 3: Margem de Contribuição
    {
      icon: <Percent className="w-5 h-5" />,
      title: 'Margem de Contribuição',
      value: data.margemContribuicao.valor,
      formattedValue: `${data.margemContribuicao.valor.toFixed(1)}%`,
      status: data.margemContribuicao.status,
      tooltip: '(Receita - Custos Variáveis) / Receita',
    },
    // Card 4: Margem Líquida
    {
      icon: <Gem className="w-5 h-5" />,
      title: 'Margem Líquida',
      value: data.margemLiquida.valor,
      formattedValue: `${data.margemLiquida.valor.toFixed(1)}%`,
      variation: data.margemLiquida.projecao2027 !== null ? {
        direction: data.margemLiquida.projecao2027 < data.margemLiquida.valor ? 'down' as const : 'up' as const,
        value: `${data.margemLiquida.projecao2027.toFixed(1)}% em 2027`,
        label: '',
      } : undefined,
      status: data.margemLiquida.status,
      tooltip: 'Lucro Líquido / Receita. Projeção com Reforma Tributária.',
    },
    // Card 5: Impacto Tributário no Caixa
    {
      icon: <Building2 className="w-5 h-5" />,
      title: 'Impacto Tribut. Caixa',
      value: data.impactoTributarioCaixa.valor,
      formattedValue: formatCurrency(data.impactoTributarioCaixa.valor),
      variation: {
        direction: 'neutral' as const,
        value: `Vence ${format(data.impactoTributarioCaixa.dataVencimento, "dd 'de' MMM", { locale: ptBR })}`,
      },
      status: data.impactoTributarioCaixa.status,
      tooltip: 'Impostos a pagar nos próximos 30 dias',
    },
    // Card 6: Impacto Tributário na Margem
    {
      icon: <Scale className="w-5 h-5" />,
      title: 'Impacto Tribut. Margem',
      value: data.impactoTributarioMargem.valorPp,
      formattedValue: `${data.impactoTributarioMargem.valorPp.toFixed(1)}pp`,
      variation: {
        direction: 'neutral' as const,
        value: `${data.impactoTributarioMargem.percentualReceita.toFixed(1)}% da receita`,
      },
      status: data.impactoTributarioMargem.status,
      tooltip: 'Quantos pontos percentuais da margem vão para imposto',
    },
    // Card 7: Créditos Disponíveis
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Créditos Disponíveis',
      value: data.creditosDisponiveis.valor,
      formattedValue: formatCurrency(data.creditosDisponiveis.valor),
      variation: {
        direction: 'neutral' as const,
        value: `${data.creditosDisponiveis.percentualAproveitado}% aproveitados`,
      },
      status: data.creditosDisponiveis.status,
      tooltip: 'Créditos tributários recuperáveis',
      action: {
        label: 'Ver no Radar',
        href: '/dashboard/analise-notas',
      },
    },
    // Card 8: Risco Fiscal
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Risco Fiscal',
      value: data.riscoFiscal.score,
      formattedValue: `Score ${data.riscoFiscal.score}`,
      variation: {
        direction: 'neutral' as const,
        value: `Nível ${data.riscoFiscal.nivel}`,
      },
      status: data.riscoFiscal.status,
      tooltip: 'Saúde tributária de 0 a 1000',
      action: {
        label: 'Ver Score',
        href: '/dashboard/score-tributario',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card, index) => (
        <NexusKpiCard
          key={card.title}
          {...card}
          animationDelay={index * 50}
        />
      ))}
    </div>
  );
}
