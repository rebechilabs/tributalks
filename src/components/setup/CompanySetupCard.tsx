import { forwardRef } from "react";
import { Building2, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCnpj } from "@/hooks/useCnpjLookup";
import { Company } from "@/contexts/CompanyContext";

interface CompanySetupCardProps {
  company: Company;
  isPrimary?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onSetPrimary?: () => void;
}

const REGIME_LABELS: Record<string, string> = {
  'mei': 'MEI',
  'simples': 'Simples Nacional',
  'presumido': 'Lucro Presumido',
  'real': 'Lucro Real',
};

export const CompanySetupCard = forwardRef<HTMLDivElement, CompanySetupCardProps>(
  function CompanySetupCard({ company, isPrimary = false, onEdit, onRemove, onSetPrimary }, ref) {
    const displayName = company.nome_fantasia || company.razao_social || 'Empresa sem nome';
    const regime = company.regime_tributario ? REGIME_LABELS[company.regime_tributario] || company.regime_tributario : 'Não informado';

    return (
      <Card ref={ref} className={`transition-all ${isPrimary ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {displayName}
                </h4>
                {isPrimary && (
                  <Badge variant="default" className="shrink-0 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Principal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {company.cnpj_principal ? formatCnpj(company.cnpj_principal) : 'CNPJ não informado'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {regime}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {onSetPrimary && !isPrimary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSetPrimary}
                className="text-xs"
              >
                Definir Principal
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  }
);
