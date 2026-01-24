import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  FileText,
  Upload,
  Loader2,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";

// Tipos
interface NcmAnalysis {
  id: string;
  user_id: string;
  product_name: string;
  ncm_code: string;
  status: 'ok' | 'revisar_ncm' | 'revisar_tributacao' | 'incompleto' | 'pendente';
  reason: string | null;
  suggested_action: string | null;
  revenue_percentage: number | null;
  created_at: string;
}

interface ErpChecklistItem {
  id: string;
  user_id: string;
  item_key: string;
  item_label: string;
  item_description: string | null;
  status: 'pendente' | 'em_andamento' | 'concluido';
  updated_at: string;
}

// Checklist padrão para CBS/IBS
const DEFAULT_CHECKLIST_ITEMS = [
  {
    item_key: 'revisar_ncm_50',
    item_label: 'Revisar NCMs dos 50 produtos com maior faturamento',
    item_description: 'Verificar se os NCMs estão atualizados conforme a TIPI 2024 e se refletem corretamente a natureza do produto.',
  },
  {
    item_key: 'mapear_regime_diferenciado',
    item_label: 'Mapear produtos com regime diferenciado de IBS/CBS',
    item_description: 'Identificar produtos sujeitos a alíquotas reduzidas, isenções ou regime específico (ex: cesta básica, medicamentos).',
  },
  {
    item_key: 'adicionar_campos_erp',
    item_label: 'Adicionar campos de CBS, IBS e Imposto Seletivo no ERP',
    item_description: 'Criar campos na ficha de produto para armazenar alíquotas e regras específicas dos novos tributos.',
  },
  {
    item_key: 'testar_nf_reforma',
    item_label: 'Testar emissão de NF no layout da Reforma',
    item_description: 'Validar que o sistema está gerando os XMLs com os campos obrigatórios da reforma tributária.',
  },
  {
    item_key: 'treinar_equipe',
    item_label: 'Treinar equipe fiscal nas novas regras',
    item_description: 'Capacitar a equipe sobre as diferenças entre o sistema atual e o CBS/IBS.',
  },
  {
    item_key: 'revisar_regras_credito',
    item_label: 'Revisar regras de crédito de CBS/IBS',
    item_description: 'Mapear quais aquisições darão direito a crédito no novo sistema e parametrizar no ERP.',
  },
];

// Mock de dados para demonstração inicial
const MOCK_NCM_DATA: Omit<NcmAnalysis, 'id' | 'user_id' | 'created_at'>[] = [
  {
    product_name: 'Smartphone XYZ',
    ncm_code: '8517.12.31',
    status: 'revisar_tributacao',
    reason: 'Produto eletrônico sujeito a Imposto Seletivo',
    suggested_action: 'Verificar alíquota de IS e parametrizar no ERP',
    revenue_percentage: 15,
  },
  {
    product_name: 'Refrigerante Cola 2L',
    ncm_code: '2202.10.00',
    status: 'revisar_tributacao',
    reason: 'Bebida açucarada - possível incidência de Imposto Seletivo',
    suggested_action: 'Mapear alíquota de IS para bebidas açucaradas',
    revenue_percentage: 8,
  },
  {
    product_name: 'Notebook Profissional',
    ncm_code: '8471.30.12',
    status: 'ok',
    reason: null,
    suggested_action: null,
    revenue_percentage: 22,
  },
  {
    product_name: 'Medicamento Genérico A',
    ncm_code: '3004.90.99',
    status: 'revisar_ncm',
    reason: 'NCM pode estar desatualizado - verificar TIPI 2024',
    suggested_action: 'Consultar tabela TIPI atualizada e corrigir se necessário',
    revenue_percentage: 5,
  },
  {
    product_name: 'Cesta Básica Item',
    ncm_code: '1902.19.00',
    status: 'revisar_tributacao',
    reason: 'Produto da cesta básica - alíquota reduzida de CBS/IBS',
    suggested_action: 'Parametrizar alíquota reduzida conforme LC 214/2025',
    revenue_percentage: 3,
  },
  {
    product_name: 'Peça Automotiva',
    ncm_code: '8708.99.90',
    status: 'incompleto',
    reason: 'Falta informação de origem e destinação',
    suggested_action: 'Completar cadastro com dados de origem e uso',
    revenue_percentage: 12,
  },
];

export default function CbsIbsNcm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar análises de NCM
  const { data: ncmAnalysis, isLoading: loadingNcm } = useQuery({
    queryKey: ['ncm-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('company_ncm_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('revenue_percentage', { ascending: false });
      
      if (error) throw error;
      return data as NcmAnalysis[];
    },
    enabled: !!user?.id,
  });

  // Query para buscar checklist do ERP
  const { data: erpChecklist, isLoading: loadingChecklist } = useQuery({
    queryKey: ['erp-checklist', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('erp_checklist')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as ErpChecklistItem[];
    },
    enabled: !!user?.id,
  });

  // Mutation para inicializar checklist
  const initChecklist = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const items = DEFAULT_CHECKLIST_ITEMS.map(item => ({
        ...item,
        user_id: user.id,
        status: 'pendente' as const,
      }));

      const { error } = await supabase
        .from('erp_checklist')
        .insert(items);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-checklist', user?.id] });
      toast({ title: 'Checklist inicializado com sucesso!' });
    },
    onError: () => {
      toast({ 
        title: 'Erro ao inicializar checklist', 
        variant: 'destructive' 
      });
    },
  });

  // Mutation para atualizar status do checklist
  const updateChecklistStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ErpChecklistItem['status'] }) => {
      const { error } = await supabase
        .from('erp_checklist')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-checklist', user?.id] });
    },
    onError: () => {
      toast({ 
        title: 'Erro ao atualizar status', 
        variant: 'destructive' 
      });
    },
  });

  // Mutation para carregar dados mock (para demonstração)
  const loadMockData = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const items = MOCK_NCM_DATA.map(item => ({
        ...item,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('company_ncm_analysis')
        .insert(items);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ncm-analysis', user?.id] });
      toast({ title: 'Dados de exemplo carregados!' });
    },
    onError: () => {
      toast({ 
        title: 'Erro ao carregar dados de exemplo', 
        variant: 'destructive' 
      });
    },
  });

  // Cálculos de KPIs
  const totalProducts = ncmAnalysis?.length || 0;
  const criticalProducts = ncmAnalysis?.filter(p => p.status !== 'ok').length || 0;
  const criticalRevenuePercentage = ncmAnalysis
    ?.filter(p => p.status !== 'ok')
    .reduce((acc, p) => acc + (p.revenue_percentage || 0), 0) || 0;

  const checklistProgress = erpChecklist?.length 
    ? (erpChecklist.filter(i => i.status === 'concluido').length / erpChecklist.length) * 100
    : 0;

  const getStatusBadge = (status: NcmAnalysis['status']) => {
    const config = {
      ok: { label: 'OK', variant: 'default' as const, className: 'bg-green-500/10 text-green-600 border-green-200' },
      revisar_ncm: { label: 'Revisar NCM', variant: 'outline' as const, className: 'bg-amber-500/10 text-amber-600 border-amber-200' },
      revisar_tributacao: { label: 'Revisar Tributação', variant: 'outline' as const, className: 'bg-orange-500/10 text-orange-600 border-orange-200' },
      incompleto: { label: 'Incompleto', variant: 'outline' as const, className: 'bg-red-500/10 text-red-600 border-red-200' },
      pendente: { label: 'Pendente', variant: 'outline' as const, className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const getChecklistIcon = (status: ErpChecklistItem['status']) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'em_andamento':
        return <Loader2 className="h-5 w-5 text-amber-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const cycleChecklistStatus = (current: ErpChecklistItem['status']): ErpChecklistItem['status'] => {
    const cycle: Record<ErpChecklistItem['status'], ErpChecklistItem['status']> = {
      pendente: 'em_andamento',
      em_andamento: 'concluido',
      concluido: 'pendente',
    };
    return cycle[current];
  };

  const hasData = totalProducts > 0;
  const hasChecklist = (erpChecklist?.length || 0) > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Adequação CBS/IBS & NCM</h1>
          <p className="text-muted-foreground">
            Prepare seu cadastro de produtos e ERP para a Reforma Tributária
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-sm text-muted-foreground">Produtos analisados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{criticalProducts}</p>
                  <p className="text-sm text-muted-foreground">Produtos para revisão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {criticalRevenuePercentage > 0 ? `${criticalRevenuePercentage.toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">Faturamento em NCMs críticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta se não houver dados */}
        {!hasData && !loadingNcm && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Info className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Ainda não analisamos seus NCMs para a Reforma
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Suba suas notas fiscais em "Importar XMLs" para que possamos identificar 
                    automaticamente os NCMs mais frequentes e verificar sua adequação à CBS/IBS.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => loadMockData.mutate()} disabled={loadMockData.isPending}>
                    {loadMockData.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Carregar dados de exemplo
                  </Button>
                  <Button asChild>
                    <Link to="/dashboard/importar-xml">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar XMLs
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de NCMs críticos */}
        {hasData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                NCMs que precisam de atenção
              </CardTitle>
              <CardDescription>
                Lista de produtos com NCM potencialmente incorreto ou que requerem parametrização especial para CBS/IBS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Produto</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">NCM</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Motivo</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ação Sugerida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ncmAnalysis?.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <span className="font-medium">{item.product_name}</span>
                          {item.revenue_percentage && item.revenue_percentage > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({item.revenue_percentage}% fat.)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-sm">{item.ncm_code}</td>
                        <td className="py-3 px-2">{getStatusBadge(item.status)}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground max-w-xs">
                          {item.reason || '—'}
                        </td>
                        <td className="py-3 px-2 text-sm max-w-xs">
                          {item.suggested_action || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist de ERP */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Checklist de Parametrização do ERP
                </CardTitle>
                <CardDescription>
                  Tarefas essenciais para preparar seu sistema para a Reforma Tributária
                </CardDescription>
              </div>
              {hasChecklist && (
                <div className="flex items-center gap-3">
                  <Progress value={checklistProgress} className="w-24 h-2" />
                  <span className="text-sm font-medium">{checklistProgress.toFixed(0)}%</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!hasChecklist && !loadingChecklist ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Inicialize o checklist para acompanhar as tarefas de adequação do seu ERP.
                </p>
                <Button onClick={() => initChecklist.mutate()} disabled={initChecklist.isPending}>
                  {initChecklist.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Inicializar Checklist
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {erpChecklist?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => updateChecklistStatus.mutate({ 
                      id: item.id, 
                      status: cycleChecklistStatus(item.status) 
                    })}
                  >
                    {getChecklistIcon(item.status)}
                    <div className="flex-1">
                      <p className={`font-medium ${item.status === 'concluido' ? 'line-through text-muted-foreground' : ''}`}>
                        {item.item_label}
                      </p>
                      {item.item_description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.item_description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {item.status === 'concluido' ? 'Concluído' : 
                       item.status === 'em_andamento' ? 'Em andamento' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nota sobre integração futura */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Em breve:</strong> Esta análise será integrada automaticamente com seus XMLs importados, 
              identificando NCMs mais frequentes e cruzando com as regras da Reforma Tributária (CBS/IBS/IS).
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
