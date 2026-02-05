import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, HelpCircle, FileText, Scale } from 'lucide-react';
import { IdentifiedCredit } from '@/hooks/useIdentifiedCredits';

interface IdentifiedCreditsTableProps {
  credits: IdentifiedCredit[];
  maxItems?: number;
}

export function IdentifiedCreditsTable({ credits, maxItems = 50 }: IdentifiedCreditsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const getConfidenceBadge = (level: string, score: number) => {
    const config = {
      high: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: CheckCircle, label: 'Alta' },
      medium: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: AlertTriangle, label: 'Média' },
      low: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: HelpCircle, label: 'Baixa' },
    };

    const { color, icon: Icon, label } = config[level as keyof typeof config] || config.medium;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`${color} gap-1`}>
              <Icon className="h-3 w-3" />
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Confiança: {score}%</p>
            <p className="text-xs text-muted-foreground">
              {level === 'high' && 'Documentação completa e regra bem definida'}
              {level === 'medium' && 'Requer validação de contador'}
              {level === 'low' && 'Análise detalhada recomendada'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const displayCredits = credits.slice(0, maxItems);

  if (credits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum crédito identificado ainda.</p>
        <p className="text-sm mt-2">Importe XMLs para iniciar a análise.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NF-e / Data</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Regra Aplicada</TableHead>
              <TableHead className="text-right">Valor Original</TableHead>
              <TableHead className="text-right">Recuperável</TableHead>
              <TableHead className="text-center">Confiança</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCredits.map((credit) => (
              <TableRow key={credit.id}>
                <TableCell>
                  <div>
                    <span className="font-medium">{credit.nfe_number || '-'}</span>
                    <p className="text-xs text-muted-foreground">
                      {credit.nfe_date ? new Date(credit.nfe_date).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <span className="font-medium text-sm truncate block">
                      {credit.supplier_name || '-'}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatCNPJ(credit.supplier_cnpj)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {credit.rule?.tax_type || 'N/A'}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium">{credit.rule?.rule_name}</p>
                        <p className="text-xs mt-1">{credit.rule?.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Base Legal: {credit.rule?.legal_basis}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(credit.original_tax_value)}
                </TableCell>
                <TableCell className="text-right font-mono text-primary font-semibold">
                  {formatCurrency(credit.potential_recovery)}
                </TableCell>
                <TableCell className="text-center">
                  {getConfidenceBadge(credit.confidence_level, credit.confidence_score)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {credits.length > maxItems && (
        <p className="text-center text-sm text-muted-foreground">
          Mostrando {maxItems} de {credits.length} créditos identificados
        </p>
      )}
    </div>
  );
}
