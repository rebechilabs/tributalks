import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { 
  Loader2, 
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  Brain,
  Zap,
  RefreshCw,
  Users,
  Target,
  DollarSign,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export default function AdminMonitoring() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const { nexus, diagnostic, clara, userPlans, loading, error, refetch } = useAdminMetrics(selectedDays);

  // Check admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Erro ao verificar role:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    if (!authLoading && user) {
      checkAdminRole();
    } else if (!authLoading && !user) {
      setIsAdmin(false);
    }
  }, [user, authLoading]);

  if (authLoading || isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Acesso Restrito
              </h2>
              <p className="text-muted-foreground">
                Esta área é restrita a administradores do sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monitoramento Estratégico</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe as métricas das 3 mudanças estratégicas implementadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {[7, 14, 30].map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                >
                  {days}d
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* NEXUS First Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">NEXUS First</CardTitle>
                <CardDescription>Últimos {selectedDays} dias</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Professional → NEXUS primeiro"
                value={loading ? null : `${nexus.professionalToNexus}%`}
                icon={<Users className="w-4 h-4" />}
                trend={nexus.professionalToNexus > 80 ? "up" : "neutral"}
              />
              <MetricCard
                label="Tempo até primeira ação"
                value={loading ? null : `${nexus.avgTimeToFirstAction}s`}
                icon={<Clock className="w-4 h-4" />}
                trend={nexus.avgTimeToFirstAction < 30 ? "up" : "down"}
              />
              <MetricCard
                label="vs. grupo controle"
                value={loading ? null : `+${nexus.engagementVsControl}%`}
                subtitle="engagement"
                icon={<TrendingUp className="w-4 h-4" />}
                trend="up"
              />
            </div>
          </CardContent>
        </Card>

        {/* Diagnóstico Rápido Card */}
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Diagnóstico Rápido</CardTitle>
                <CardDescription>Últimos {selectedDays} dias • {diagnostic.totalDiagnostics} diagnósticos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard
                label="Taxa de conclusão"
                value={loading ? null : `${diagnostic.completionRate}%`}
                icon={<Target className="w-4 h-4" />}
                trend={diagnostic.completionRate > 70 ? "up" : "down"}
              />
              <MetricCard
                label="Tempo médio"
                value={loading ? null : `${diagnostic.avgTimeSeconds}s`}
                icon={<Clock className="w-4 h-4" />}
                trend={diagnostic.avgTimeSeconds < 120 ? "up" : "down"}
              />
              <MetricCard
                label="Upload XML"
                value={loading ? null : `${diagnostic.xmlPercentage}%`}
                icon={<Database className="w-4 h-4" />}
                trend="neutral"
              />
              <MetricCard
                label="Conexão ERP"
                value={loading ? null : `${diagnostic.erpPercentage}%`}
                icon={<Database className="w-4 h-4" />}
                trend="neutral"
              />
              <MetricCard
                label="Taxa de 'Pular'"
                value={loading ? null : `${diagnostic.skipRate}%`}
                icon={<TrendingDown className="w-4 h-4" />}
                trend={diagnostic.skipRate < 30 ? "up" : "down"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clara Cache Card */}
        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Clara Cache Inteligente</CardTitle>
                <CardDescription>Últimos {selectedDays} dias • {clara.totalQueries} queries</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <MetricCard
                label="Hit rate"
                value={loading ? null : `${clara.cacheHitRate}%`}
                icon={<Database className="w-4 h-4" />}
                trend={clara.cacheHitRate > 40 ? "up" : "neutral"}
              />
              <MetricCard
                label="Custo/usuário"
                value={loading ? null : `R$ ${clara.costPerUser.toFixed(2)}/mês`}
                icon={<DollarSign className="w-4 h-4" />}
                trend={clara.costPerUser < 20 ? "up" : "down"}
              />
              <MetricCard
                label="Economia vs. baseline"
                value={loading ? null : `${clara.savingsVsBaseline}%`}
                icon={<TrendingUp className="w-4 h-4" />}
                trend={clara.savingsVsBaseline > 50 ? "up" : "neutral"}
              />
            </div>
            
            {/* Distribution bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distribuição de queries</span>
                <span className="text-muted-foreground">{clara.tokensSaved.toLocaleString()} tokens salvos</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                <div 
                  className="bg-success transition-all" 
                  style={{ width: `${clara.cachePercentage}%` }}
                  title={`Cache: ${clara.cachePercentage}%`}
                />
                <div 
                  className="bg-primary transition-all" 
                  style={{ width: `${clara.geminiPercentage}%` }}
                  title={`Gemini: ${clara.geminiPercentage}%`}
                />
                <div 
                  className="bg-warning transition-all" 
                  style={{ width: `${clara.sonnetPercentage}%` }}
                  title={`Sonnet: ${clara.sonnetPercentage}%`}
                />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Cache: {clara.cachePercentage}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Gemini: {clara.geminiPercentage}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>Sonnet: {clara.sonnetPercentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Plan Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Distribuição de Planos</CardTitle>
                <CardDescription>{userPlans.total} usuários totais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <PlanCard label="Professional" count={userPlans.professional} color="bg-primary" />
              <PlanCard label="Enterprise" count={userPlans.enterprise} color="bg-warning" />
              <PlanCard label="Navigator" count={userPlans.navigator} color="bg-success" />
              <PlanCard label="Starter" count={userPlans.starter} color="bg-muted-foreground" />
              <PlanCard label="Free" count={userPlans.free} color="bg-muted" />
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface MetricCardProps {
  label: string;
  value: string | null;
  subtitle?: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

function MetricCard({ label, value, subtitle, icon, trend }: MetricCardProps) {
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  
  return (
    <div className="bg-background/50 rounded-lg p-4 border">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {value === null ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${trendColor}`}>{value}</span>
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

interface PlanCardProps {
  label: string;
  count: number;
  color: string;
}

function PlanCard({ label, count, color }: PlanCardProps) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/30">
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
