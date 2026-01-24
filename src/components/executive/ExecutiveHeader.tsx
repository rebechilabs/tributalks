import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExecutiveHeaderProps {
  lastUpdate: Date | null;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

export function ExecutiveHeader({ lastUpdate, onRefresh, loading }: ExecutiveHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-foreground">Painel Executivo</h1>
        {lastUpdate && (
          <p className="text-sm text-muted-foreground mt-1">
            Atualizado em {format(lastUpdate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={loading}
        className="gap-2 shrink-0"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar dados
      </Button>
    </div>
  );
}
