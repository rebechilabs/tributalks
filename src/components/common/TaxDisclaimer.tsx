import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaxDisclaimerProps {
  className?: string;
}

export function TaxDisclaimer({ className = "" }: TaxDisclaimerProps) {
  return (
    <Alert className={`border-yellow-500/30 bg-yellow-500/5 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-muted-foreground text-sm">
        <strong className="text-foreground">Importante:</strong> Este cálculo tem caráter 
        informativo e educacional. Consulte um profissional tributário habilitado antes de 
        implementar qualquer estratégia fiscal na sua empresa. Os resultados apresentados 
        não constituem parecer técnico, consultoria ou promessa de resultado.
      </AlertDescription>
    </Alert>
  );
}
