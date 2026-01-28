import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, AlertTriangle, FileX, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface ImportErrorItem {
  fileName: string;
  errorType: 'xml_invalid' | 'duplicate' | 'missing_data' | 'parse_error' | 'upload_error' | 'unknown';
  message: string;
  details?: string;
}

interface ImportErrorsListProps {
  errors: ImportErrorItem[];
  onRetry?: (fileName: string) => void;
}

const errorTypeConfig: Record<string, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  xml_invalid: { 
    label: 'XML Inválido', 
    icon: FileX, 
    color: 'text-red-500 bg-red-500/10'
  },
  duplicate: { 
    label: 'Duplicado', 
    icon: AlertTriangle, 
    color: 'text-amber-500 bg-amber-500/10'
  },
  missing_data: { 
    label: 'Dados Faltantes', 
    icon: AlertTriangle, 
    color: 'text-orange-500 bg-orange-500/10'
  },
  parse_error: { 
    label: 'Erro de Parse', 
    icon: FileX, 
    color: 'text-red-500 bg-red-500/10'
  },
  upload_error: { 
    label: 'Erro de Upload', 
    icon: XCircle, 
    color: 'text-red-500 bg-red-500/10'
  },
  unknown: { 
    label: 'Erro Desconhecido', 
    icon: XCircle, 
    color: 'text-gray-500 bg-gray-500/10'
  }
};

function categorizeErrors(errors: ImportErrorItem[]): Map<string, ImportErrorItem[]> {
  const categories = new Map<string, ImportErrorItem[]>();
  
  for (const error of errors) {
    const type = error.errorType || 'unknown';
    if (!categories.has(type)) {
      categories.set(type, []);
    }
    categories.get(type)!.push(error);
  }
  
  return categories;
}

export function ImportErrorsList({ errors, onRetry }: ImportErrorsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const categorizedErrors = categorizeErrors(errors);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Erros no Processamento</CardTitle>
          </div>
          <Badge variant="destructive">{errors.length} erro(s)</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary by type */}
        <div className="flex flex-wrap gap-2">
          {Array.from(categorizedErrors.entries()).map(([type, items]) => {
            const config = errorTypeConfig[type] || errorTypeConfig.unknown;
            const Icon = config.icon;
            
            return (
              <Badge 
                key={type} 
                variant="outline"
                className={`${config.color} border-current`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {items.length} {config.label}
              </Badge>
            );
          })}
        </div>

        {/* Detailed list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {errors.map((error, idx) => {
            const config = errorTypeConfig[error.errorType] || errorTypeConfig.unknown;
            const Icon = config.icon;
            
            return (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Icon className={`h-4 w-4 mt-0.5 ${config.color.split(' ')[0]}`} />
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {error.fileName}
                    </span>
                    <Badge variant="outline" className={`${config.color} text-xs`}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {error.message}
                  </p>
                  
                  {error.details && (
                    <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                      {error.details}
                    </pre>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(`${error.fileName}: ${error.message}`, idx)}
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(error.fileName)}
                    >
                      Tentar novamente
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help text */}
        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p>
            <strong>Dica:</strong> Arquivos com erro de estrutura XML podem estar corrompidos. 
            Verifique se foram exportados corretamente do sistema emissor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
