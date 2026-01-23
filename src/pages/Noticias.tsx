import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Newspaper, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Clock,
  Briefcase,
  ExternalLink,
  Calculator,
  Bot,
  Bell,
  Filter,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Noticia {
  id: string;
  fonte: string;
  fonte_url: string | null;
  titulo_original: string;
  relevancia: string;
  categoria: string;
  setores_afetados: string[];
  regimes_afetados: string[];
  resumo_executivo: string | null;
  o_que_muda: string | null;
  quem_e_afetado: string | null;
  acao_recomendada: string | null;
  data_publicacao: string;
}

interface AlertConfig {
  ativo: boolean;
  setores_filtro: string[];
  regimes_filtro: string[];
  relevancia_minima: string;
}

const PLAN_HIERARCHY = {
  'FREE': 0,
  'BASICO': 1,
  'PROFISSIONAL': 2,
  'PREMIUM': 3,
};

const SETORES = ['Serviços', 'Comércio', 'Indústria', 'Tecnologia', 'Saúde', 'Educação'];
const REGIMES = ['SIMPLES', 'PRESUMIDO', 'REAL'];

type RelevanciaKey = 'ALTA' | 'MEDIA' | 'BAIXA';

const relevanciaConfig: Record<RelevanciaKey, { icon: typeof AlertCircle; label: string; className: string }> = {
  ALTA: { 
    icon: AlertCircle, 
    label: 'Alta relevância', 
    className: 'bg-destructive/20 text-destructive border-destructive/30' 
  },
  MEDIA: { 
    icon: AlertTriangle, 
    label: 'Média relevância', 
    className: 'bg-primary/20 text-primary border-primary/30' 
  },
  BAIXA: { 
    icon: Info, 
    label: 'Informativo', 
    className: 'bg-success/20 text-success border-success/30' 
  },
};

const getRelevanciaConfig = (relevancia: string) => {
  return relevanciaConfig[relevancia as RelevanciaKey] || relevanciaConfig.MEDIA;
};

export default function Noticias() {
  const { profile, user } = useAuth();
  const currentPlan = profile?.plano || 'FREE';
  const userLevel = PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] || 0;
  
  const hasAccess = userLevel >= PLAN_HIERARCHY.BASICO;
  const isPremium = userLevel >= PLAN_HIERARCHY.PREMIUM;

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Filtros (só Premium)
  const [filtroSetor, setFiltroSetor] = useState<string>('todos');
  const [filtroRegime, setFiltroRegime] = useState<string>('todos');
  const [filtroRelevancia, setFiltroRelevancia] = useState<string>('todas');
  
  // Alertas (só Premium)
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    ativo: false,
    setores_filtro: [],
    regimes_filtro: [],
    relevancia_minima: 'MEDIA'
  });

  useEffect(() => {
    if (hasAccess) {
      fetchNoticias();
      if (isPremium) {
        fetchAlertConfig();
      }
    }
  }, [hasAccess, isPremium]);

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('noticias_tributarias')
        .select('*')
        .eq('publicado', true)
        .order('data_publicacao', { ascending: false })
        .limit(20);

      // Aplicar filtros apenas para Premium
      if (isPremium) {
        if (filtroSetor !== 'todos') {
          query = query.contains('setores_afetados', [filtroSetor]);
        }
        if (filtroRegime !== 'todos') {
          query = query.contains('regimes_afetados', [filtroRegime]);
        }
        if (filtroRelevancia !== 'todas') {
          query = query.eq('relevancia', filtroRelevancia);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setNoticias(data || []);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertConfig = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('alertas_configuracao')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAlertConfig({
          ativo: data.ativo,
          setores_filtro: data.setores_filtro || [],
          regimes_filtro: data.regimes_filtro || [],
          relevancia_minima: data.relevancia_minima || 'MEDIA'
        });
      }
    } catch (error) {
      // Ignora erro se não existir configuração
    }
  };

  const handleAlertToggle = async (ativo: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alertas_configuracao')
        .upsert({
          user_id: user.id,
          ativo,
          setores_filtro: alertConfig.setores_filtro,
          regimes_filtro: alertConfig.regimes_filtro,
          relevancia_minima: alertConfig.relevancia_minima
        });

      if (error) throw error;
      
      setAlertConfig(prev => ({ ...prev, ativo }));
      toast.success(ativo ? 'Alertas ativados!' : 'Alertas desativados');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora';
    if (diffHours < 24) return `Há ${diffHours}h`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Tela bloqueada para FREE
  if (!hasAccess) {
    return (
      <DashboardLayout title="Notícias Tributárias">
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Acompanhe as mudanças que afetam sua empresa
            </h2>
            <p className="text-muted-foreground mb-6">
              Notícias tributárias atualizadas 3x ao dia, filtradas e resumidas por IA.
            </p>
            <ul className="text-left text-muted-foreground space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Newspaper className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>DOU, Receita Federal, PGFN, Confaz</span>
              </li>
              <li className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Jota, ConJur, Valor Econômico</span>
              </li>
              <li className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Resumo executivo + ação recomendada</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mb-4">
              Disponível a partir do plano Básico.
            </p>
            <Link to="/#planos">
              <Button className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer upgrade — R$99/mês
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notícias Tributárias">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">
              Atualizadas 3x ao dia · Última atualização: {lastUpdate || '--:--'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchNoticias}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        {/* Filtros Premium */}
        {isPremium && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Filtros</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Premium</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Setor</label>
                <Select value={filtroSetor} onValueChange={(v) => { setFiltroSetor(v); fetchNoticias(); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {SETORES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Regime</label>
                <Select value={filtroRegime} onValueChange={(v) => { setFiltroRegime(v); fetchNoticias(); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="SIMPLES">Simples Nacional</SelectItem>
                    <SelectItem value="PRESUMIDO">Lucro Presumido</SelectItem>
                    <SelectItem value="REAL">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Relevância</label>
                <Select value={filtroRelevancia} onValueChange={(v) => { setFiltroRelevancia(v); fetchNoticias(); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggle de Alertas */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Alertas por e-mail</p>
                  <p className="text-sm text-muted-foreground">Receber notícias filtradas por e-mail</p>
                </div>
              </div>
              <Switch 
                checked={alertConfig.ativo} 
                onCheckedChange={handleAlertToggle}
              />
            </div>
          </div>
        )}

        {/* Lista de Notícias */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma notícia encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {noticias.map((noticia) => {
              const config = getRelevanciaConfig(noticia.relevancia);
              const Icon = config.icon;

              return (
                <div
                  key={noticia.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedNoticia(noticia)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                      config.className
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(noticia.data_publicacao)}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {noticia.titulo_original}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {noticia.resumo_executivo}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{noticia.setores_afetados?.join(', ') || 'Todos os setores'}</span>
                    <span className="text-border">·</span>
                    <span>{noticia.regimes_afetados?.map(r => {
                      const labels: Record<string, string> = { SIMPLES: 'Simples', PRESUMIDO: 'Presumido', REAL: 'Real' };
                      return labels[r] || r;
                    }).join(', ') || 'Todos os regimes'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Upgrade para não-Premium */}
        {!isPremium && (
          <div className="mt-8 bg-card border border-primary/30 rounded-xl p-6 text-center">
            <Bell className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">
              Quer receber alertas personalizados por e-mail?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              No plano Premium você configura filtros por setor e regime,
              e nunca perde uma notícia importante.
            </p>
            <Link to="/#planos">
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade para Premium — R$500/mês
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Notícia Expandida */}
      <Dialog open={!!selectedNoticia} onOpenChange={() => setSelectedNoticia(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNoticia && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl pr-6">
                  {selectedNoticia.titulo_original}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-2">
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                    getRelevanciaConfig(selectedNoticia.relevancia).className
                  )}>
                    {(() => {
                      const Icon = getRelevanciaConfig(selectedNoticia.relevancia).icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                    {getRelevanciaConfig(selectedNoticia.relevancia).label}
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedNoticia.fonte}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedNoticia.data_publicacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Resumo Executivo */}
                {selectedNoticia.resumo_executivo && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                      <Info className="w-4 h-4 text-primary" />
                      Resumo Executivo
                    </h4>
                    <p className="text-muted-foreground">{selectedNoticia.resumo_executivo}</p>
                  </div>
                )}

                {/* O que muda */}
                {selectedNoticia.o_que_muda && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      O que muda na prática
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-line">{selectedNoticia.o_que_muda}</p>
                  </div>
                )}

                {/* Quem é afetado */}
                {selectedNoticia.quem_e_afetado && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Quem é afetado
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-line">{selectedNoticia.quem_e_afetado}</p>
                  </div>
                )}

                {/* Ação recomendada */}
                {selectedNoticia.acao_recomendada && (
                  <div className="mb-6 bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      Ação recomendada
                    </h4>
                    <p className="text-foreground whitespace-pre-line">{selectedNoticia.acao_recomendada}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <Link to="/calculadora/split-payment">
                    <Button variant="outline" size="sm">
                      <Calculator className="w-4 h-4 mr-2" />
                      Simular impacto
                    </Button>
                  </Link>
                  <Link to="/tribubot">
                    <Button variant="outline" size="sm">
                      <Bot className="w-4 h-4 mr-2" />
                      Perguntar ao TribuBot
                    </Button>
                  </Link>
                  {selectedNoticia.fonte_url && (
                    <a href={selectedNoticia.fonte_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        Ver fonte original
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}