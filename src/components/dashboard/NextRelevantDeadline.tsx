import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertTriangle, Clock, ExternalLink, CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prazo {
  id: string;
  titulo: string;
  data_prazo: string;
  descricao: string | null;
  tipo: string | null;
  base_legal: string | null;
  url_referencia: string | null;
  afeta_regimes: string[] | null;
  afeta_setores: string[] | null;
}

export function NextRelevantDeadline() {
  const { user, profile } = useAuth();
  const [prazo, setPrazo] = useState<Prazo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextDeadline = async () => {
      try {
        // Get user's regime and sector for filtering
        const userRegime = profile?.regime?.toUpperCase() || null;
        
        // Also try to get sector from company_profile
        let userSetor: string | null = null;
        if (user?.id) {
          const { data: companyProfile } = await supabase
            .from('company_profile')
            .select('setor')
            .eq('user_id', user.id)
            .maybeSingle();
          userSetor = companyProfile?.setor || null;
        }

        // Fetch upcoming deadlines
        const { data, error } = await supabase
          .from('prazos_reforma')
          .select('*')
          .eq('ativo', true)
          .gte('data_prazo', new Date().toISOString().split('T')[0])
          .order('data_prazo', { ascending: true })
          .limit(10);

        if (error) throw error;

        // Filter by relevance to user
        const relevantPrazos = (data || []).filter(p => {
          // If no filters, it's for everyone
          const hasRegimeFilter = p.afeta_regimes && p.afeta_regimes.length > 0;
          const hasSetorFilter = p.afeta_setores && p.afeta_setores.length > 0;

          if (!hasRegimeFilter && !hasSetorFilter) return true;

          // Check regime match
          const regimeMatch = !hasRegimeFilter || 
            (userRegime && p.afeta_regimes?.includes(userRegime)) ||
            p.afeta_regimes?.includes('TODOS');

          // Check setor match
          const setorMatch = !hasSetorFilter || 
            (userSetor && p.afeta_setores?.includes(userSetor)) ||
            p.afeta_setores?.includes('TODOS');

          return regimeMatch || setorMatch;
        });

        setPrazo(relevantPrazos[0] || null);
      } catch (error) {
        console.error('Error fetching deadline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextDeadline();
  }, [user?.id, profile?.regime]);

  if (loading) {
    return (
      <Card className="mb-6 border-border/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-5 w-64 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prazo) {
    return null;
  }

  const prazoDate = new Date(prazo.data_prazo);
  const daysUntil = differenceInDays(prazoDate, new Date());
  
  // Urgency level
  const isUrgent = daysUntil <= 30;
  const isWarning = daysUntil <= 90 && daysUntil > 30;

  // Google Calendar link
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(prazo.titulo)}&dates=${format(prazoDate, 'yyyyMMdd')}/${format(prazoDate, 'yyyyMMdd')}&details=${encodeURIComponent(prazo.descricao || '')}`;

  return (
    <Card className={cn(
      "mb-6 border-l-4 transition-all",
      isUrgent ? "border-l-red-500 bg-red-500/5" : 
      isWarning ? "border-l-amber-500 bg-amber-500/5" : 
      "border-l-primary bg-primary/5"
    )}>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* Countdown badge */}
          <div className={cn(
            "w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0",
            isUrgent ? "bg-red-500/10" : isWarning ? "bg-amber-500/10" : "bg-primary/10"
          )}>
            {isUrgent ? (
              <AlertTriangle className={cn("w-6 h-6 mb-1", isUrgent ? "text-red-600" : "text-amber-600")} />
            ) : (
              <Calendar className="w-6 h-6 mb-1 text-primary" />
            )}
            <span className={cn(
              "text-lg font-bold",
              isUrgent ? "text-red-600" : isWarning ? "text-amber-600" : "text-primary"
            )}>
              {daysUntil}
            </span>
            <span className="text-xs text-muted-foreground">dias</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                isUrgent ? "text-red-600" : isWarning ? "text-amber-600" : "text-primary"
              )}>
                {isUrgent ? '⚠️ Prazo Urgente' : isWarning ? '⏰ Atenção' : '📅 Próximo Prazo'}
              </span>
              {prazo.tipo && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">
                  {prazo.tipo}
                </span>
              )}
            </div>
            
            <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2">
              {prazo.titulo}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-2">
              {format(prazoDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              {prazo.base_legal && (
                <span className="text-xs ml-2 text-muted-foreground/70">
                  ({prazo.base_legal})
                </span>
              )}
            </p>

            {prazo.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {prazo.descricao}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1"
                onClick={() => window.open(calendarUrl, '_blank')}
              >
                <CalendarPlus className="w-4 h-4" />
                Adicionar ao Calendário
              </Button>
              
              <Button asChild size="sm" variant="ghost">
                <Link to="/dashboard/timeline-reforma">
                  Ver Timeline
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
