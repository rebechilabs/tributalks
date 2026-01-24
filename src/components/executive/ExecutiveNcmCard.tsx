import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NcmAnalysis {
  id: string;
  status: string;
  revenue_percentage: number | null;
}

interface ExecutiveNcmCardProps {
  userId: string | undefined;
  loading?: boolean;
}

export function ExecutiveNcmCard({ userId, loading: externalLoading }: ExecutiveNcmCardProps) {
  const { data: ncmAnalysis, isLoading } = useQuery({
    queryKey: ['ncm-analysis-summary', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('company_ncm_analysis')
        .select('id, status, revenue_percentage')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as NcmAnalysis[];
    },
    enabled: !!userId,
  });

  const loading = externalLoading || isLoading;

  // Cálculos
  const totalProducts = ncmAnalysis?.length || 0;
  const criticalProducts = ncmAnalysis?.filter(p => p.status !== 'ok').length || 0;
  const criticalPercentage = totalProducts > 0 ? (criticalProducts / totalProducts) * 100 : 0;
  const criticalRevenuePercentage = ncmAnalysis
    ?.filter(p => p.status !== 'ok')
    .reduce((acc, p) => acc + (p.revenue_percentage || 0), 0) || 0;

  // Determinar status geral
  const getOverallStatus = (): 'ok' | 'atencao' | 'critico' | 'sem_dados' => {
    if (totalProducts === 0) return 'sem_dados';
    if (criticalProducts === 0) return 'ok';
    if (criticalPercentage < 20) return 'atencao';
    return 'critico';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    ok: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      badge: <Badge className="bg-green-500/10 text-green-600 border-green-200">OK</Badge>,
      title: 'Cadastro pronto para CBS e IBS',
    },
    atencao: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      badge: <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Atenção</Badge>,
      title: 'Cadastro de produtos requer atenção',
    },
    critico: {
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      badge: <Badge className="bg-red-500/10 text-red-600 border-red-200">Crítico</Badge>,
      title: 'Cadastro de produtos precisa de revisão urgente',
    },
    sem_dados: {
      icon: Info,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      badge: <Badge variant="outline">Sem dados</Badge>,
      title: 'Análise de NCM pendente',
    },
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Cadastro pronto para CBS e IBS
          </CardTitle>
          {config.badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <StatusIcon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{config.title}</h3>
            {overallStatus === 'sem_dados' ? (
              <p className="text-sm text-muted-foreground mt-1">
                Suba suas notas em "Importar XMLs" ou acesse a tela de NCM para iniciar a análise.
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {criticalRevenuePercentage > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {criticalRevenuePercentage.toFixed(0)}%
                    </span>{' '}
                    do seu faturamento está em NCMs críticos para a Reforma.
                  </p>
                )}
                {criticalProducts > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{criticalProducts}</span>{' '}
                    produto{criticalProducts !== 1 ? 's precisam' : ' precisa'} de revisão no ERP antes de 2026.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/dashboard/cbs-ibs-ncm">
            Ver detalhes para ERP
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
