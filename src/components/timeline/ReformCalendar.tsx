import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Prazo {
  id: string;
  titulo: string;
  descricao: string | null;
  data_prazo: string;
  tipo: string;
  afeta_regimes: string[];
  afeta_setores: string[];
  base_legal: string | null;
  url_referencia: string | null;
}

const TIPOS_PRAZO = [
  { value: 'inicio', label: 'Início', color: 'bg-green-500', borderColor: 'border-green-500', bgLight: 'bg-green-500/10' },
  { value: 'transicao', label: 'Transição', color: 'bg-blue-500', borderColor: 'border-blue-500', bgLight: 'bg-blue-500/10' },
  { value: 'obrigacao', label: 'Obrigação', color: 'bg-orange-500', borderColor: 'border-orange-500', bgLight: 'bg-orange-500/10' },
  { value: 'extincao', label: 'Extinção', color: 'bg-red-500', borderColor: 'border-red-500', bgLight: 'bg-red-500/10' },
  { value: 'prazo_final', label: 'Prazo Final', color: 'bg-purple-500', borderColor: 'border-purple-500', bgLight: 'bg-purple-500/10' },
];

const ANOS = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033'];

interface ReformCalendarProps {
  filterByUserRegime?: boolean;
}

export function ReformCalendar({ filterByUserRegime = false }: ReformCalendarProps) {
  const { profile } = useAuth();
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<string[]>(['2026', '2027']);
  const [filtroRegime, setFiltroRegime] = useState<string>('todos');

  useEffect(() => {
    fetchPrazos();
  }, [filtroRegime, profile]);

  const fetchPrazos = async () => {
    setLoading(true);
    
    let query = supabase
      .from('prazos_reforma')
      .select('id, titulo, descricao, data_prazo, tipo, afeta_regimes, afeta_setores, base_legal, url_referencia')
      .eq('ativo', true)
      .order('data_prazo', { ascending: true });

    // Filtrar por regime do usuário logado
    if (filterByUserRegime && profile?.regime) {
      const userRegime = profile.regime.toLowerCase();
      query = query.contains('afeta_regimes', [userRegime]);
    } else if (filtroRegime !== 'todos') {
      query = query.contains('afeta_regimes', [filtroRegime]);
    }

    const { data, error } = await query;

    if (!error) {
      setPrazos(data || []);
    }
    setLoading(false);
  };

  const getTipoConfig = (tipo: string) => {
    return TIPOS_PRAZO.find(t => t.value === tipo) || TIPOS_PRAZO[1];
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const toggleYear = (year: string) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  // Agrupar prazos por ano
  const prazosByYear = prazos.reduce((acc, prazo) => {
    const year = prazo.data_prazo.substring(0, 4);
    if (!acc[year]) acc[year] = [];
    acc[year].push(prazo);
    return acc;
  }, {} as Record<string, Prazo[]>);

  // Encontrar próximo prazo
  const proximoPrazo = prazos.find(p => getDaysUntil(p.data_prazo) >= 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-muted rounded-lg mb-2" />
            <div className="h-24 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro */}
      {!filterByUserRegime && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar por regime:</span>
          </div>
          <Select value={filtroRegime} onValueChange={setFiltroRegime}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os regimes</SelectItem>
              <SelectItem value="simples">Simples Nacional</SelectItem>
              <SelectItem value="presumido">Lucro Presumido</SelectItem>
              <SelectItem value="real">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-3">
        {TIPOS_PRAZO.map(tipo => (
          <div key={tipo.value} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", tipo.color)} />
            <span className="text-xs text-muted-foreground">{tipo.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline por ano */}
      <div className="space-y-4">
        {ANOS.map(year => {
          const yearPrazos = prazosByYear[year] || [];
          const isExpanded = expandedYears.includes(year);
          const hasContent = yearPrazos.length > 0;
          
          return (
            <div key={year} className="relative">
              {/* Header do ano */}
              <button
                onClick={() => toggleYear(year)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg transition-colors",
                  hasContent ? "bg-card border border-border hover:bg-accent" : "bg-muted/50",
                  proximoPrazo && proximoPrazo.data_prazo.startsWith(year) && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-xl font-bold text-foreground">{year}</span>
                  {hasContent && (
                    <Badge variant="secondary">{yearPrazos.length} prazos</Badge>
                  )}
                  {proximoPrazo && proximoPrazo.data_prazo.startsWith(year) && (
                    <Badge className="bg-primary/20 text-primary">Próximo</Badge>
                  )}
                </div>
                
                {/* Mini preview dos tipos */}
                {hasContent && !isExpanded && (
                  <div className="flex gap-1">
                    {[...new Set(yearPrazos.map(p => p.tipo))].map(tipo => {
                      const config = getTipoConfig(tipo);
                      return <div key={tipo} className={cn("w-2 h-2 rounded-full", config.color)} />;
                    })}
                  </div>
                )}
              </button>

              {/* Conteúdo expandido */}
              {isExpanded && hasContent && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-border space-y-3">
                  {yearPrazos.map((prazo, index) => {
                    const tipoConfig = getTipoConfig(prazo.tipo);
                    const daysUntil = getDaysUntil(prazo.data_prazo);
                    const isPast = daysUntil < 0;
                    const isNext = proximoPrazo?.id === prazo.id;
                    
                    return (
                      <Card 
                        key={prazo.id} 
                        className={cn(
                          "transition-all",
                          isNext && "ring-2 ring-primary shadow-lg",
                          isPast && "opacity-60"
                        )}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            {/* Indicador de tipo */}
                            <div className={cn(
                              "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                              tipoConfig.color
                            )} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge className={cn("text-xs", tipoConfig.bgLight, tipoConfig.borderColor, "border")}>
                                  {tipoConfig.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(prazo.data_prazo).toLocaleDateString('pt-BR')}
                                </span>
                                {!isPast && (
                                  <span className={cn(
                                    "text-xs flex items-center gap-1",
                                    isNext ? "text-primary font-medium" : "text-muted-foreground"
                                  )}>
                                    <Clock className="w-3 h-3" />
                                    {daysUntil === 0 ? 'Hoje!' : `${daysUntil} dias`}
                                  </span>
                                )}
                                {isNext && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    Próximo
                                  </Badge>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-foreground">{prazo.titulo}</h4>
                              
                              {prazo.descricao && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {prazo.descricao}
                                </p>
                              )}
                              
                              {/* Base legal e URL */}
                              {(prazo.base_legal || prazo.url_referencia) && (
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  {prazo.base_legal && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {prazo.base_legal}
                                    </span>
                                  )}
                                  {prazo.url_referencia && (
                                    <a 
                                      href={prazo.url_referencia} 
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
                              
                              {/* Tags de regimes/setores */}
                              {(prazo.afeta_regimes?.length > 0 || prazo.afeta_setores?.length > 0) && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {prazo.afeta_regimes?.map(r => (
                                    <Badge key={r} variant="outline" className="text-xs capitalize">
                                      {r}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Ano vazio */}
              {isExpanded && !hasContent && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground py-4">
                    Nenhum prazo cadastrado para {year}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}