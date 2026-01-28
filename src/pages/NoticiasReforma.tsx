import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Bell,
  Filter,
  RefreshCw,
  Lightbulb,
  Calendar,
  ArrowRight
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

interface Pilula {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: string;
}

interface Prazo {
  id: string;
  titulo: string;
  descricao: string | null;
  data_prazo: string;
  tipo: string;
  base_legal: string | null;
  url_referencia: string | null;
}

interface AlertConfig {
  ativo: boolean;
  setores_filtro: string[];
  regimes_filtro: string[];
  relevancia_minima: string;
}

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

const PILULA_TIPOS: Record<string, { icon: typeof Lightbulb; color: string }> = {
  fato: { icon: Info, color: 'text-blue-400' },
  conceito: { icon: Lightbulb, color: 'text-purple-400' },
  prazo: { icon: Calendar, color: 'text-orange-400' },
  dica: { icon: Sparkles, color: 'text-green-400' },
  alerta: { icon: AlertTriangle, color: 'text-red-400' },
};

export default function Noticias() {
  const { profile, user } = useAuth();
  const { isNavigator, isProfessional } = usePlanAccess();
  
  const hasAccess = isNavigator;

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [pilulaDoDia, setPilulaDoDia] = useState<Pilula | null>(null);
  const [proximoPrazo, setProximoPrazo] = useState<Prazo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Filtros (só Professional+)
  const [filtroSetor, setFiltroSetor] = useState<string>('todos');
  const [filtroRegime, setFiltroRegime] = useState<string>('todos');
  const [filtroRelevancia, setFiltroRelevancia] = useState<string>('todas');
  
  // Alertas (só Professional+)
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    ativo: false,
    setores_filtro: [],
    regimes_filtro: [],
    relevancia_minima: 'MEDIA'
  });

  useEffect(() => {
    if (hasAccess) {
      fetchData();
      if (isProfessional) {
        fetchAlertConfig();
      }
    }
  }, [hasAccess, isProfessional]);

  const fetchData = async () => {
    setLoading(true);
    
    // Buscar pílula do dia (rotação ou agendada)
    const today = new Date().toISOString().split('T')[0];
    const { data: pilulas } = await supabase
      .from('pilulas_reforma')
      .select('*')
      .eq('ativo', true)
      .or(`data_exibicao.eq.${today},data_exibicao.is.null`)
      .limit(1);
    
    if (pilulas && pilulas.length > 0) {
      setPilulaDoDia(pilulas[0]);
    } else {
      // Fallback: pegar qualquer pílula ativa
      const { data: anyPilula } = await supabase
        .from('pilulas_reforma')
        .select('*')
        .eq('ativo', true)
        .limit(1);
      if (anyPilula && anyPilula.length > 0) {
        setPilulaDoDia(anyPilula[0]);
      }
    }

    // Buscar próximo prazo
    const { data: prazoData } = await supabase
      .from('prazos_reforma')
      .select('id, titulo, descricao, data_prazo, tipo, base_legal, url_referencia')
      .eq('ativo', true)
      .gte('data_prazo', today)
      .order('data_prazo', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (prazoData) {
      setProximoPrazo(prazoData);
    }

    // Buscar notícias
    await fetchNoticias();
    setLoading(false);
  };

  const fetchNoticias = async () => {
    let query = supabase
      .from('noticias_tributarias')
      .select('*')
      .eq('publicado', true)
      .order('data_publicacao', { ascending: false })
      .limit(20);

    // Aplicar filtros apenas para Professional+
    if (isProfessional) {
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

    if (!error) {
      setNoticias(data || []);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const fetchAlertConfig = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('alertas_configuracao')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setAlertConfig({
        ativo: data.ativo,
        setores_filtro: data.setores_filtro || [],
        regimes_filtro: data.regimes_filtro || [],
        relevancia_minima: data.relevancia_minima || 'MEDIA'
      });
    }
  };

  const handleAlertToggle = async (ativo: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('alertas_configuracao')
      .upsert({
        user_id: user.id,
        ativo,
        setores_filtro: alertConfig.setores_filtro,
        regimes_filtro: alertConfig.regimes_filtro,
        relevancia_minima: alertConfig.relevancia_minima
      });

    if (!error) {
      setAlertConfig(prev => ({ ...prev, ativo }));
      toast.success(ativo ? 'Alertas ativados!' : 'Alertas desativados');
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

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Tela bloqueada para FREE
  if (!hasAccess) {
    return (
      <DashboardLayout title="Notícias da Reforma">
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Acompanhe a Reforma Tributária
            </h2>
            <p className="text-muted-foreground mb-6">
              Feed de notícias atualizado 3x ao dia, pílulas diárias de conhecimento e calendário de prazos 2026-2033.
            </p>
            <ul className="text-left text-muted-foreground space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Pílula do dia: conceitos da reforma explicados</span>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Calendário: prazos que afetam sua empresa</span>
              </li>
              <li className="flex items-start gap-3">
                <Newspaper className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Notícias filtradas e resumidas por IA</span>
              </li>
            </ul>
            <Link to="/#planos">
              <Button className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade para Navigator — R$ 697/mês
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notícias da Reforma">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Pílula do Dia */}
        {pilulaDoDia && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const config = PILULA_TIPOS[pilulaDoDia.tipo] || PILULA_TIPOS.dica;
                    const Icon = config.icon;
                    return <Icon className={cn("w-5 h-5", config.color)} />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      💡 Pílula do Dia
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {pilulaDoDia.tipo}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{pilulaDoDia.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{pilulaDoDia.conteudo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próximo Prazo */}
        {proximoPrazo && (
          <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-orange-400 uppercase tracking-wide">
                        ⏰ Próximo Prazo
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{proximoPrazo.titulo}</h3>
                    {proximoPrazo.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">{proximoPrazo.descricao}</p>
                    )}
                    {/* Base legal e URL */}
                    {(proximoPrazo.base_legal || proximoPrazo.url_referencia) && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {proximoPrazo.base_legal && (
                          <span className="flex items-center gap-1">
                            📜 {proximoPrazo.base_legal}
                          </span>
                        )}
                        {proximoPrazo.url_referencia && (
                          <a 
                            href={proximoPrazo.url_referencia} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver referência
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">
                    {getDaysUntil(proximoPrazo.data_prazo)}
                  </p>
                  <p className="text-xs text-muted-foreground">dias restantes</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/timeline-reforma">
                    Ver calendário completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">📰 Notícias Recentes</h2>
            <p className="text-muted-foreground text-sm">
              Atualizado: {lastUpdate || '--:--'}
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

        {/* Filtros Professional+ */}
        {isProfessional && (
          <Card className="mb-6">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Filtros</span>
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">Professional</Badge>
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
            </CardContent>
          </Card>
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
            <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Upgrade para não-Professional */}
        {!isProfessional && (
          <Card className="mt-8 border-primary/30">
            <CardContent className="py-6 text-center">
              <Bell className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">
                Quer filtros avançados e alertas por e-mail?
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                No plano Professional você configura filtros por setor e regime,
                e nunca perde uma notícia importante.
              </p>
              <Link to="/#planos">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade para Professional — R$ 2.497/mês
                </Button>
              </Link>
            </CardContent>
          </Card>
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
                      <Sparkles className="w-4 h-4 mr-2" />
                      Perguntar à Clara AI
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
