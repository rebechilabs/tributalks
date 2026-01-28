import { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { useCnpjLookup, CnpjData, formatCnpj } from "@/hooks/useCnpjLookup";
import { cn } from "@/lib/utils";

interface CnpjInputProps {
  value: string;
  onChange: (cnpj: string) => void;
  onDataLoaded?: (data: CnpjData) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCompanyInfo?: boolean;
}

export const CnpjInput = forwardRef<HTMLInputElement, CnpjInputProps>(
  (
    {
      value,
      onChange,
      onDataLoaded,
      label = "CNPJ",
      placeholder = "00.000.000/0000-00",
      disabled = false,
      className,
      showCompanyInfo = true,
    },
    ref
  ) => {
    const { lookup, isLoading, data, error, reset } = useCnpjLookup();
    const [displayValue, setDisplayValue] = useState(value);

    // Sync display value with external value
    useEffect(() => {
      if (value !== displayValue.replace(/\D/g, '')) {
        setDisplayValue(formatCnpj(value));
      }
    }, [value]);

    // Apply mask as user types
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '').slice(0, 14);
      const formatted = formatCnpj(rawValue);
      setDisplayValue(formatted);
      onChange(rawValue);
      
      // Reset lookup data when input changes
      if (data) {
        reset();
      }
    };

    // Handle lookup button click
    const handleLookup = async () => {
      const cleanedCnpj = value.replace(/\D/g, '');
      if (cleanedCnpj.length === 14) {
        const result = await lookup(cleanedCnpj);
        if (result && onDataLoaded) {
          onDataLoaded(result);
        }
      }
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLookup();
      }
    };

    const isValidFormat = value.replace(/\D/g, '').length === 14;

    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label htmlFor="cnpj">{label}</Label>}
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={ref}
              id="cnpj"
              type="text"
              value={displayValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
            className={cn(
                "h-12 pr-10 font-mono",
                data && "border-primary focus-visible:ring-primary",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            
            {/* Status icon inside input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : data ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : error ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : null}
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleLookup}
            disabled={!isValidFormat || isLoading || disabled}
            className="h-12 px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Company info card */}
        {showCompanyInfo && data && (
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {data.razao_social}
                </p>
                {data.nome_fantasia && (
                  <p className="text-xs text-muted-foreground truncate">
                    {data.nome_fantasia}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{data.uf}</span>
                  {data.municipio && <span>• {data.municipio}</span>}
                  {data.cnae_fiscal && (
                    <span>• CNAE: {data.cnae_fiscal}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    data.situacao_cadastral === 'ATIVA' 
                      ? "bg-primary/10 text-primary"
                      : "bg-accent text-accent-foreground"
                  )}>
                    {data.situacao_cadastral}
                  </span>
                  {data.porte && (
                    <span className="text-xs text-muted-foreground">
                      {data.porte}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CnpjInput.displayName = "CnpjInput";
