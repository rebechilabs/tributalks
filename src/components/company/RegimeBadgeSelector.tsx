import { useState } from "react";
import { Scale, Check, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCompany } from "@/contexts/CompanyContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const REGIME_OPTIONS = [
  { value: "simples", label: "Simples Nacional" },
  { value: "presumido", label: "Lucro Presumido" },
  { value: "real", label: "Lucro Real" },
] as const;

const REGIME_LABELS: Record<string, string> = {
  simples: "Simples Nacional",
  presumido: "Lucro Presumido",
  real: "Lucro Real",
};

export function RegimeBadgeSelector() {
  const { currentCompany, updateCompany } = useCompany();
  const queryClient = useQueryClient();
  const [pendingRegime, setPendingRegime] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!currentCompany) return null;

  const currentRegime = currentCompany.regime_tributario;
  const displayLabel = currentRegime ? REGIME_LABELS[currentRegime] || currentRegime : null;

  const handleSelect = (value: string) => {
    if (value === currentRegime) return;
    setPendingRegime(value);
  };

  const handleConfirm = async () => {
    if (!pendingRegime) return;
    setIsUpdating(true);
    try {
      const success = await updateCompany(currentCompany.id, {
        regime_tributario: pendingRegime,
      });
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["home-state"] });
        queryClient.invalidateQueries({ queryKey: ["dre"] });
        queryClient.invalidateQueries({ queryKey: ["tax-score"] });
        queryClient.invalidateQueries({ queryKey: ["credits"] });
        queryClient.invalidateQueries({ queryKey: ["comparativo-regimes"] });
        toast({
          title: "Regime atualizado",
          description: `Regime alterado para ${REGIME_LABELS[pendingRegime]}.`,
        });
      }
    } finally {
      setIsUpdating(false);
      setPendingRegime(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
              "bg-card border border-yellow-500/30 hover:border-yellow-500/60",
              "focus:outline-none focus:ring-2 focus:ring-yellow-500/30",
              !displayLabel && "text-muted-foreground"
            )}
          >
            <Scale className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">
              {displayLabel || "Definir regime"}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {REGIME_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{option.label}</span>
              {currentRegime === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!pendingRegime}
        onOpenChange={(open) => !open && setPendingRegime(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alterar regime tributário?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Alterar para <strong>{pendingRegime && REGIME_LABELS[pendingRegime]}</strong>?
              Isso afetará os cálculos de todas as ferramentas (DRE, Comparativo, Radar e Score).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isUpdating}>
              {isUpdating ? "Atualizando..." : "Confirmar alteração"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
