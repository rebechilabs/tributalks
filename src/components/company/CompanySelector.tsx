import { useState } from "react";
import { Building2, Plus, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompany } from "@/contexts/CompanyContext";
import { usePlanAccess, PLAN_LABELS } from "@/hooks/useFeatureAccess";
import { AddCompanyModal } from "./AddCompanyModal";
import { formatCnpj } from "@/hooks/useCnpjLookup";
import { cn } from "@/lib/utils";

export function CompanySelector() {
  const { 
    companies, 
    currentCompany, 
    setCurrentCompany, 
    maxCompanies, 
    canAddMore,
    isLoading 
  } = useCompany();
  const { currentPlan, isNavigator } = usePlanAccess();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Only show for Navigator+ plans
  if (!isNavigator) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <Building2 className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Carregando empresas...</span>
      </div>
    );
  }

  const displayName = currentCompany?.nome_fantasia || currentCompany?.razao_social || 'Selecionar empresa';
  const displayCnpj = currentCompany?.cnpj_principal ? formatCnpj(currentCompany.cnpj_principal) : '';

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Empresa:</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 max-w-[300px] justify-between"
            >
              <div className="flex flex-col items-start truncate">
                <span className="font-medium truncate">{displayName}</span>
                {displayCnpj && (
                  <span className="text-xs text-muted-foreground">{displayCnpj}</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[300px]">
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => setCurrentCompany(company)}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  company.id === currentCompany?.id && "bg-primary/10"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {company.nome_fantasia || company.razao_social || 'Sem nome'}
                  </span>
                  {company.cnpj_principal && (
                    <span className="text-xs text-muted-foreground">
                      {formatCnpj(company.cnpj_principal)}
                    </span>
                  )}
                </div>
                {company.id === currentCompany?.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {companies.length} de {maxCompanies} empresa{maxCompanies !== 1 ? 's' : ''} ({PLAN_LABELS[currentPlan]})
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={!canAddMore}
                  className={cn(
                    "gap-1",
                    !canAddMore && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Adicionar CNPJ</span>
                </Button>
              </div>
            </TooltipTrigger>
            {!canAddMore && (
              <TooltipContent>
                <p>Seu plano permite até {maxCompanies} empresa{maxCompanies !== 1 ? 's' : ''}.</p>
                <p className="text-primary">Faça upgrade para adicionar mais.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <AddCompanyModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </>
  );
}
