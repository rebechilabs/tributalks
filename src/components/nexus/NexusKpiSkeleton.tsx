import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function NexusKpiSkeleton() {
  return (
    <Card className="p-5 border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-2.5 h-2.5 rounded-full" />
      </div>

      {/* Value */}
      <Skeleton className="w-32 h-8 mb-2" />

      {/* Variation */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3" />
        <Skeleton className="w-16 h-3" />
      </div>
    </Card>
  );
}

export function NexusGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <NexusKpiSkeleton key={i} />
      ))}
    </div>
  );
}
