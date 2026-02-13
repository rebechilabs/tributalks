import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, Scale, Package, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { IdentifiedCredit } from '@/hooks/useIdentifiedCredits';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreditDetailBreakdownProps {
  credits: IdentifiedCredit[];
}

export function CreditDetailBreakdown({ credits }: CreditDetailBreakdownProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Group by month
  const byMonth = useMemo(() => {
    const groups: Record<string, IdentifiedCredit[]> = {};
    credits.forEach(c => {
      const date = c.nfe_date ? c.nfe_date.substring(0, 7) : 'sem-data';
      if (!groups[date]) groups[date] = [];
      groups[date].push(c);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, items]) => ({
        month,
        label: month !== 'sem-data' 
          ? new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          : 'Sem data',
        items,
        total: items.reduce((s, c) => s + c.potential_recovery, 0),
      }));
  }, [credits]);

  // Group by NCM
  const byNCM = useMemo(() => {
    const groups: Record<string, { ncm: string; desc: string; total: number; count: number; legalBasis: string }> = {};
    credits.forEach(c => {
      const ncm = c.ncm_code || 'N/A';
      if (!groups[ncm]) {
        groups[ncm] = { 
          ncm, 
          desc: c.product_description || '-', 
          total: 0, 
          count: 0,
          legalBasis: c.rule?.legal_basis || '-'
        };
      }
      groups[ncm].total += c.potential_recovery;
      groups[ncm].count++;
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [credits]);

  // Group by rule for legal basis
  const byRule = useMemo(() => {
    const groups: Record<string, { rule_name: string; legal_basis: string; total: number; count: number; tax_type: string }> = {};
    credits.forEach(c => {
      const code = c.rule?.rule_code || 'unknown';
      if (!groups[code]) {
        groups[code] = {
          rule_name: c.rule?.rule_name || 'Regra desconhecida',
          legal_basis: c.rule?.legal_basis || '-',
          total: 0,
          count: 0,
          tax_type: c.rule?.tax_type || '-',
        };
      }
      groups[code].total += c.potential_recovery;
      groups[code].count++;
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [credits]);

  if (credits.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Monthly Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Detalhamento Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {byMonth.map(group => (
            <Collapsible key={group.month}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{group.label}</span>
                  <Badge variant="secondary" className="text-xs">{group.items.length} créditos</Badge>
                </div>
                <span className="font-semibold text-primary">{formatCurrency(group.total)}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NF-e</TableHead>
                        <TableHead>NCM</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Regra</TableHead>
                        <TableHead className="text-right">Recuperável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs">{c.nfe_number || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">{c.ncm_code || '-'}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{c.product_description || '-'}</TableCell>
                          <TableCell className="text-xs">{c.rule?.tax_type || '-'}</TableCell>
                          <TableCell className="text-right font-mono text-primary font-semibold">
                            {formatCurrency(c.potential_recovery)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* NCM Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Detalhamento por NCM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NCM</TableHead>
                <TableHead>Produto / Categoria</TableHead>
                <TableHead className="text-center">Ocorrências</TableHead>
                <TableHead>Base Legal</TableHead>
                <TableHead className="text-right">Total Recuperável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byNCM.map(item => (
                <TableRow key={item.ncm}>
                  <TableCell className="font-mono text-sm">{item.ncm}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{item.desc}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{item.count}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.legalBasis}</TableCell>
                  <TableCell className="text-right font-mono text-primary font-semibold">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Legal Basis Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Base Legal por Oportunidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byRule.map((rule, i) => (
            <div key={i} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{rule.tax_type}</Badge>
                    <span className="font-medium text-sm">{rule.rule_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {rule.legal_basis}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-primary">{formatCurrency(rule.total)}</span>
                  <p className="text-xs text-muted-foreground">{rule.count} créditos</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Prescriptional Deadline */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Prazo prescricional:</strong> O contribuinte tem até <strong>5 anos</strong> para solicitar 
          a restituição ou compensação de tributos pagos indevidamente (art. 168, CTN). 
          Para Simples Nacional, a recuperação é feita via <strong>retificação do PGDAS-D</strong> e 
          posterior pedido de <strong>PER/DCOMP</strong> ou restituição administrativa.
        </AlertDescription>
      </Alert>
    </div>
  );
}
