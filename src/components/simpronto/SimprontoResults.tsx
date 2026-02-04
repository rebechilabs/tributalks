import { Button } from "@/components/ui/button";
import { RotateCcw, Download, Share2 } from "lucide-react";
import { SimprontoResult, SimprontoInput } from "@/types/simpronto";
import { RecommendationCard } from "./RecommendationCard";
import { ComparisonTable } from "./ComparisonTable";
import { ComparisonChart } from "./ComparisonChart";
import { formatarMoeda } from "@/utils/simprontoCalculations";

interface SimprontoResultsProps {
  result: SimprontoResult;
  input: SimprontoInput;
  onReset: () => void;
}

export function SimprontoResults({ result, input, onReset }: SimprontoResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Resultado da Simulação</h2>
          <p className="text-sm text-muted-foreground">
            Faturamento: {formatarMoeda(input.faturamento_anual)} • 
            Perfil: {input.perfil_clientes}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Nova Simulação
          </Button>
        </div>
      </div>
      
      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card de recomendação */}
        <RecommendationCard result={result} />
        
        {/* Gráfico comparativo */}
        <ComparisonChart result={result} />
      </div>
      
      {/* Tabela detalhada */}
      <div>
        <h3 className="text-lg font-medium mb-4">Comparativo Detalhado</h3>
        <ComparisonTable result={result} />
      </div>
      
      {/* Notas importantes */}
      <div className="rounded-lg border border-muted bg-muted/30 p-4">
        <h4 className="font-medium mb-2">📌 Notas Importantes</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Os cálculos são estimativas baseadas nos dados informados e nas regras tributárias vigentes.</li>
          <li>O Simples 2027 ainda depende de regulamentação definitiva. Alíquotas e regras podem mudar.</li>
          <li>A escolha entre "por dentro" e "por fora" no Simples 2027 será definitiva e anual.</li>
          <li>Consulte sempre um contador antes de tomar decisões sobre mudança de regime tributário.</li>
        </ul>
      </div>
    </div>
  );
}
