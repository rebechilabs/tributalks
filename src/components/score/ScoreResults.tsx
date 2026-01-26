import { RefreshCw, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";

interface ScoreResultsProps {
  onRecalculate: () => void;
  onDownloadPdf: () => void;
  isLoading?: boolean;
}

export function ScoreResults({ 
  onRecalculate,
  onDownloadPdf,
  isLoading 
}: ScoreResultsProps) {
  return (
    <div className="space-y-6">
      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onDownloadPdf}
        >
          <Download className="h-4 w-4" />
          Baixar Relatório PDF
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onRecalculate}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Recalcular Score
        </Button>
        <Link to="/historico">
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Ver Histórico
          </Button>
        </Link>
      </div>

      {/* Professional Disclaimer */}
      <TaxDisclaimer />
    </div>
  );
}
