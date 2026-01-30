import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  ChevronDown, 
  TrendingUp, 
  Target, 
  Lightbulb,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreditItem {
  id: string;
  product_description: string;
  ncm_code: string;
  potential_recovery: number;
  confidence_level: string;
  nfe_number: string;
  supplier_name: string;
  status: string;
}

interface OpportunityItem {
  id: string;
  opportunity_name: string;
  economia_real_mensal: number;
  data_conclusao: string;
}

interface SavingsData {
  totalCredits: number;
  totalOpportunities: number;
  totalSavings: number;
  creditsCount: number;
  opportunitiesCount: number;
  creditItems: CreditItem[];
  opportunityItems: OpportunityItem[];
}

export function SavingsSummaryCard() {
  const { user } = useAuth();
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSavingsData();
    }
  }, [user?.id]);

  const fetchSavingsData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch identified credits
      const { data: credits, error: creditsError } = await supabase
        .from('identified_credits')
        .select('id, product_description, ncm_code, potential_recovery, confidence_level, nfe_number, supplier_name, status')
        .eq('user_id', user.id)
        .in('status', ['identified', 'validated', 'recovered']);

      if (creditsError) throw creditsError;

      // Fetch implemented opportunities with real savings
      const { data: opportunities, error: oppError } = await supabase
        .from('company_opportunities')
        .select(`
          id,
          economia_real_mensal,
          data_conclusao,
          opportunity_id,
          tax_opportunities!inner(nome)
        `)
        .eq('user_id', user.id)
        .eq('status', 'implementada')
        .not('economia_real_mensal', 'is', null);

      if (oppError) throw oppError;

      const totalCredits = credits?.reduce((sum, c) => sum + (c.potential_recovery || 0), 0) || 0;
      
      // Calculate annualized opportunity savings
      const totalOpportunities = opportunities?.reduce((sum, o) => {
        const monthlyValue = o.economia_real_mensal || 0;
        // Calculate months since implementation
        if (o.data_conclusao) {
          const conclusionDate = new Date(o.data_conclusao);
          const now = new Date();
          const monthsDiff = (now.getFullYear() - conclusionDate.getFullYear()) * 12 + 
            (now.getMonth() - conclusionDate.getMonth());
          return sum + (monthlyValue * Math.max(1, monthsDiff));
        }
        return sum + monthlyValue;
      }, 0) || 0;

      const opportunityItems: OpportunityItem[] = opportunities?.map(o => ({
        id: o.id,
        opportunity_name: (o.tax_opportunities as any)?.nome || 'Oportunidade',
        economia_real_mensal: o.economia_real_mensal || 0,
        data_conclusao: o.data_conclusao || ''
      })) || [];

      setData({
        totalCredits,
        totalOpportunities,
        totalSavings: totalCredits + totalOpportunities,
        creditsCount: credits?.length || 0,
        opportunitiesCount: opportunities?.length || 0,
        creditItems: credits || [],
        opportunityItems
      });
    } catch (error) {
      console.error('Error fetching savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Média</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Baixa</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no savings yet
  if (!data || data.totalSavings === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden">
        <CardContent className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Main savings display */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Sua Economia Total com Tributech
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatCurrency(data.totalSavings)}
                </p>
              </div>
            </div>

            {/* Breakdown badges */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Créditos:</span>
                  <span className="font-semibold">{formatCurrency(data.totalCredits)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-muted-foreground">Oportunidades:</span>
                  <span className="font-semibold">{formatCurrency(data.totalOpportunities)}</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDetailsOpen(true)}
                className="gap-1.5 shrink-0"
              >
                Ver detalhes
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Detalhes da Sua Economia
            </DialogTitle>
            <DialogDescription>
              Veja todos os créditos identificados e oportunidades implementadas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200/50">
                <CardContent className="py-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalCredits)}</p>
                  <p className="text-sm text-muted-foreground">{data.creditsCount} créditos identificados</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200/50">
                <CardContent className="py-4 text-center">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(data.totalOpportunities)}</p>
                  <p className="text-sm text-muted-foreground">{data.opportunitiesCount} oportunidades implementadas</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <ScrollArea className="h-[300px] pr-4">
              {/* Credits List */}
              {data.creditItems.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Créditos Identificados
                  </h4>
                  <div className="space-y-2">
                    {data.creditItems.map((credit) => (
                      <div 
                        key={credit.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <p className="font-medium truncate">
                              {credit.product_description || `NCM ${credit.ncm_code}`}
                            </p>
                            {getConfidenceBadge(credit.confidence_level)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            NF-e {credit.nfe_number} • {credit.supplier_name}
                          </p>
                        </div>
                        <p className="font-semibold text-blue-600 shrink-0 ml-3">
                          {formatCurrency(credit.potential_recovery)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities List */}
              {data.opportunityItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Oportunidades Implementadas
                  </h4>
                  <div className="space-y-2">
                    {data.opportunityItems.map((opp) => (
                      <div 
                        key={opp.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <div>
                            <p className="font-medium">{opp.opportunity_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Implementada em {new Date(opp.data_conclusao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-semibold text-amber-600">
                            {formatCurrency(opp.economia_real_mensal)}/mês
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Total Footer */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Economia Total</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(data.totalSavings)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
