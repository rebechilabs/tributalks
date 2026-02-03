import { AlertTriangle, ExternalLink, Droplets, Pill, Sparkles, Wine, Car } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MonophasicProduct {
  ncm: string;
  category: string;
  quantity: number;
  totalPisCofinsPaid: number;
  legalBasis: string;
}

interface MonophasicAlertProps {
  products: MonophasicProduct[];
  totalRecovery: number;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  'Combustíveis': { icon: Droplets, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  'Medicamentos': { icon: Pill, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  'Cosméticos': { icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  'Bebidas': { icon: Wine, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  'Autopeças': { icon: Car, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
};

const legalBasisLinks: Record<string, string> = {
  'Lei 11.116/2005': 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11116.htm',
  'Lei 10.147/2000': 'https://www.planalto.gov.br/ccivil_03/leis/l10147.htm',
  'Lei 13.097/2015': 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13097.htm',
  'Lei 10.485/2002': 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10485.htm',
};

export function MonophasicAlert({ products, totalRecovery }: MonophasicAlertProps) {
  if (!products || products.length === 0) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Group by category
  const byCategory = products.reduce((acc, prod) => {
    if (!acc[prod.category]) {
      acc[prod.category] = { items: [], total: 0 };
    }
    acc[prod.category].items.push(prod);
    acc[prod.category].total += prod.totalPisCofinsPaid;
    return acc;
  }, {} as Record<string, { items: MonophasicProduct[]; total: number }>);

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-amber-900 dark:text-amber-100 flex items-center gap-2">
              Produtos Monofásicos Detectados
              <Badge variant="secondary" className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                {products.length} {products.length === 1 ? 'item' : 'itens'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300 mt-1">
              PIS/COFINS já recolhido na indústria – revenda deve ter alíquota zero (CST 04)
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-medium">Recuperável</p>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {formatCurrency(totalRecovery)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(byCategory).map(([category, data]) => {
            const config = categoryConfig[category] || categoryConfig['Autopeças'];
            const IconComponent = config.icon;
            const legalBasis = data.items[0]?.legalBasis || '';
            const link = legalBasisLinks[legalBasis];
            
            return (
              <div 
                key={category}
                className={`rounded-lg p-3 ${config.bgColor} border border-${config.color.replace('text-', '')}/20`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`h-4 w-4 ${config.color}`} />
                  <span className={`font-medium text-sm ${config.color}`}>{category}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(data.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.items.length} NCM{data.items.length > 1 ? 's' : ''} afetado{data.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  {link && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={() => window.open(link, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver {legalBasis}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
          <span className="text-xs text-amber-700 dark:text-amber-400">
            💡 Produtos com tributação monofásica já tiveram PIS/COFINS recolhido na origem. 
            Na revenda, use CST 04 (alíquota zero) para evitar pagamento em duplicidade.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to extract monophasic products from identified credits
export function extractMonophasicProducts(credits: any[]): MonophasicProduct[] {
  const monophasicRuleCodes = ['PIS_COFINS_007', 'PIS_COFINS_008', 'PIS_COFINS_010', 'PIS_COFINS_011'];
  
  // Map NCM prefixes to categories
  const ncmToCategory = (ncm: string): string => {
    if (ncm.startsWith('2710') || ncm.startsWith('2207')) return 'Combustíveis';
    if (ncm.startsWith('3004') || ncm.startsWith('3003')) return 'Medicamentos';
    if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return 'Cosméticos';
    if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return 'Bebidas';
    if (ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) return 'Autopeças';
    return 'Outros';
  };

  const ncmToLegalBasis = (ncm: string): string => {
    if (ncm.startsWith('2710') || ncm.startsWith('2207')) return 'Lei 11.116/2005';
    if (ncm.startsWith('3004') || ncm.startsWith('3003')) return 'Lei 10.147/2000';
    if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return 'Lei 10.147/2000';
    if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return 'Lei 13.097/2015';
    if (ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) return 'Lei 10.485/2002';
    return 'Legislação monofásica';
  };

  // Check if credit is from a monophasic rule or has monophasic NCM characteristics
  const isMonophasicNCM = (ncm: string): boolean => {
    if (!ncm) return false;
    if (ncm.startsWith('2710') || ncm.startsWith('2207')) return true;
    if (ncm.startsWith('3004') || ncm.startsWith('3003')) return true;
    if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return true;
    if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return true;
    if (ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) return true;
    return false;
  };

  // Group credits by NCM
  const ncmMap = new Map<string, MonophasicProduct>();
  
  for (const credit of credits) {
    const ruleCode = credit.credit_rules?.rule_code || '';
    const taxType = credit.credit_rules?.tax_type || '';
    const ncm = credit.ncm_code || '';
    
    // Include if it's a monophasic rule OR if it's PIS/COFINS with monophasic NCM
    const isMonophasicRule = monophasicRuleCodes.includes(ruleCode);
    const isPisCofinsWithMonophasicNcm = taxType.toLowerCase().includes('pis') && isMonophasicNCM(ncm);
    
    if (isMonophasicRule || isPisCofinsWithMonophasicNcm) {
      const existing = ncmMap.get(ncm);
      if (existing) {
        existing.quantity += 1;
        existing.totalPisCofinsPaid += credit.potential_recovery || 0;
      } else {
        ncmMap.set(ncm, {
          ncm,
          category: ncmToCategory(ncm),
          quantity: 1,
          totalPisCofinsPaid: credit.potential_recovery || 0,
          legalBasis: ncmToLegalBasis(ncm),
        });
      }
    }
  }

  return Array.from(ncmMap.values());
}
