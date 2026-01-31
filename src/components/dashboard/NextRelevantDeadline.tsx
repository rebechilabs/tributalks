import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, ExternalLink, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PrazoItem } from "@/hooks/useDashboardData";

interface NextRelevantDeadlineProps {
  prazo: PrazoItem | null;
}

export function NextRelevantDeadline({ prazo }: NextRelevantDeadlineProps) {
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
