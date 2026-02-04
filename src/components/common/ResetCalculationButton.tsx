import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Valid table names for reset operations
type ResetableTable = 
  | 'company_dre'
  | 'tax_score_history'
  | 'credit_analysis_summary'
  | 'xml_imports'
  | 'company_opportunities'
  | 'company_ncm_analysis';

interface ResetCalculationButtonProps {
  toolName: string;
  tables: ResetableTable[]; // Tables to clear
  onReset?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

export function ResetCalculationButton({
  toolName,
  tables,
  onReset,
  variant = "outline",
  size = "sm",
  showIcon = true,
  className,
}: ResetCalculationButtonProps) {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const companyName = currentCompany?.nome_fantasia || currentCompany?.razao_social || 'Empresa';

  const handleReset = async () => {
    if (!currentCompany?.user_id) {
      toast.error("Nenhuma empresa selecionada");
      return;
    }

    setIsResetting(true);

    try {
      // Delete from specified tables
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', currentCompany.user_id);
        
        if (error) {
          console.error(`Error clearing ${table}:`, error);
        }
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['home-state'] });
      queryClient.invalidateQueries({ queryKey: ['dre'] });
      queryClient.invalidateQueries({ queryKey: ['tax-score'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['xml-imports'] });

      toast.success("Cálculo zerado com sucesso");
      onReset?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Error resetting calculation:", error);
      toast.error("Erro ao zerar cálculo");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {showIcon && <Trash2 className="h-4 w-4 mr-1" />}
        Zerar Cálculo
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ Zerar Cálculo
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Tem certeza que deseja zerar este cálculo?</p>
                <p>
                  Todos os dados do <strong>{toolName}</strong> serão apagados 
                  para a empresa <strong>{companyName}</strong>.
                </p>
                <p className="text-destructive font-medium">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar e Zerar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
