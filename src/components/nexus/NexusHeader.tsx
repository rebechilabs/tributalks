import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, Settings, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface NexusHeaderProps {
  lastUpdate: Date | null;
  onRefresh: () => void;
  loading: boolean;
}

export function NexusHeader({ lastUpdate, onRefresh, loading }: NexusHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Title & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">NEXUS</h1>
          <p className="text-sm text-muted-foreground">Painel de Comando Executivo</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Last Update */}
        {lastUpdate && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Atualizado {format(lastUpdate, "dd/MM 'às' HH:mm", { locale: ptBR })}
          </span>
        )}

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>

        {/* PDF Report */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2"
        >
          <Link to="/dashboard/executivo">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Relatório PDF</span>
          </Link>
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hidden sm:flex"
        >
          <Link to="/configuracoes">
            <Settings className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
