import { NexusInsightCard } from './NexusInsightCard';
import { NexusInsight } from '@/hooks/useNexusData';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, AlertCircle } from 'lucide-react';

interface NexusInsightsSectionProps {
  insights: NexusInsight[];
  loading: boolean;
}

function InsightsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NexusInsightsSection({ insights, loading }: NexusInsightsSectionProps) {
  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Insights Automáticos
        </h2>
        <InsightsSkeleton />
      </section>
    );
  }

  if (insights.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Insights Automáticos
        </h2>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Nenhum insight crítico identificado. Seus indicadores estão dentro do esperado.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Insights Automáticos
        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {insights.length} {insights.length === 1 ? 'ação' : 'ações'}
        </span>
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <NexusInsightCard
            key={insight.id}
            type={insight.type}
            icon={insight.icon}
            message={insight.message}
            action={insight.action}
            animationDelay={400 + index * 100}
          />
        ))}
      </div>
    </section>
  );
}
