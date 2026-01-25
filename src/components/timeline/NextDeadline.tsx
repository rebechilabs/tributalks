import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock,
  Calendar,
  ArrowRight,
  AlertTriangle,
  FileText,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Prazo {
  id: string;
  titulo: string;
  descricao: string | null;
  data_prazo: string;
  tipo: string;
  base_legal: string | null;
  url_referencia: string | null;
}

const TIPOS_PRAZO: Record<string, { label: string; color: string; icon: string }> = {
  inicio: { label: 'Início', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🚀' },
  transicao: { label: 'Transição', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔄' },
  obrigacao: { label: 'Obrigação', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '📋' },
  extincao: { label: 'Extinção', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
  prazo_final: { label: 'Prazo Final', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '⏰' },
};

interface NextDeadlineProps {
  showLink?: boolean;
  compact?: boolean;
}

export function NextDeadline({ showLink = true, compact = false }: NextDeadlineProps) {
  const [prazo, setPrazo] = useState<Prazo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNextDeadline();
  }, []);

  const fetchNextDeadline = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('prazos_reforma')
      .select('id, titulo, descricao, data_prazo, tipo, base_legal, url_referencia')
      .eq('ativo', true)
      .gte('data_prazo', today)
      .order('data_prazo', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setPrazo(data);
    }
    setLoading(false);
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Card className="border-orange-500/30 bg-orange-500/5 animate-pulse">
        <CardContent className="py-5">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!prazo) {
    return null;
  }

  const daysUntil = getDaysUntil(prazo.data_prazo);
  const tipoConfig = TIPOS_PRAZO[prazo.tipo] || TIPOS_PRAZO.transicao;
  const isUrgent = daysUntil <= 30;
  const isVeryUrgent = daysUntil <= 7;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-4 rounded-lg border",
        isVeryUrgent ? "bg-red-500/10 border-red-500/30" : 
        isUrgent ? "bg-orange-500/10 border-orange-500/30" : 
        "bg-muted/50 border-border"
      )}>
        <div className="flex items-center gap-3">
          <Clock className={cn(
            "w-5 h-5",
            isVeryUrgent ? "text-red-400" : isUrgent ? "text-orange-400" : "text-muted-foreground"
          )} />
          <div>
            <p className="text-sm font-medium text-foreground line-clamp-1">{prazo.titulo}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(prazo.data_prazo).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-lg font-bold",
            isVeryUrgent ? "text-red-400" : isUrgent ? "text-orange-400" : "text-primary"
          )}>
            {daysUntil}
          </p>
          <p className="text-xs text-muted-foreground">dias</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "border",
      isVeryUrgent ? "border-red-500/30 bg-red-500/5" : 
      isUrgent ? "border-orange-500/30 bg-orange-500/5" : 
      "border-primary/30 bg-primary/5"
    )}>
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              isVeryUrgent ? "bg-red-500/20" : isUrgent ? "bg-orange-500/20" : "bg-primary/20"
            )}>
              {isVeryUrgent ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Clock className={cn(
                  "w-5 h-5",
                  isUrgent ? "text-orange-400" : "text-primary"
                )} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-xs font-medium uppercase tracking-wide",
                  isVeryUrgent ? "text-red-400" : isUrgent ? "text-orange-400" : "text-primary"
                )}>
                  ⏰ Próximo Prazo
                </span>
                <Badge className={cn("text-xs border", tipoConfig.color)}>
                  {tipoConfig.icon} {tipoConfig.label}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">{prazo.titulo}</h3>
              {prazo.descricao && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className={cn(
              "text-3xl font-bold",
              isVeryUrgent ? "text-red-400" : isUrgent ? "text-orange-400" : "text-primary"
            )}>
              {daysUntil}
            </p>
            <p className="text-xs text-muted-foreground">dias restantes</p>
          </div>
        </div>
        
        {showLink && (
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/timeline-reforma">
                Ver calendário completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}