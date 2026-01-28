import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ChecklistItem as ChecklistItemType, 
  ChecklistResponse, 
  responseLabels 
} from "@/data/checklistReformaItems";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";

interface ChecklistItemProps {
  item: ChecklistItemType;
  response: ChecklistResponse | undefined;
  notes: string;
  onResponseChange: (response: ChecklistResponse) => void;
  onNotesChange: (notes: string) => void;
  index: number;
}

export function ChecklistItemComponent({
  item,
  response,
  notes,
  onResponseChange,
  onNotesChange,
  index
}: ChecklistItemProps) {
  const [showNotes, setShowNotes] = useState(false);

  const responses: ChecklistResponse[] = ['sim', 'parcial', 'nao', 'nao_sei'];

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-2">
            <p className="text-sm font-medium leading-relaxed flex-1">
              {item.question}
            </p>
            
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm p-4 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">O que significa:</p>
                    <p className="text-xs">{item.helpText.meaning}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">Por que importa:</p>
                    <p className="text-xs">{item.helpText.importance}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">O que costuma dar errado:</p>
                    <p className="text-xs">{item.helpText.commonIssue}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Response Options */}
          <div className="flex flex-wrap gap-2">
            {responses.map((r) => {
              const isSelected = response === r;
              const config = responseLabels[r];
              
              return (
                <button
                  key={r}
                  onClick={() => onResponseChange(r)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md border transition-all",
                    isSelected 
                      ? `${config.bgColor} ${config.color} border-2` 
                      : "bg-background hover:bg-muted border-border"
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Risk indicator for concerning answers */}
          {(response === 'nao' || response === 'nao_sei') && item.riskWeight >= 2 && (
            <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              ⚠️ Ponto de atenção identificado
            </p>
          )}

          {/* Notes toggle and input */}
          <div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNotes ? '▼ Ocultar observações' : '▶ Adicionar observações (opcional)'}
            </button>
            
            {showNotes && (
              <Textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Observações ou contexto adicional..."
                className="mt-2 text-sm min-h-[60px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
