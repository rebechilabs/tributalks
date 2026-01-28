import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Sparkles,
  FileText,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  ChecklistWizard, 
  ChecklistResultsComponent,
  ChecklistResults,
  generateChecklistPdf 
} from "@/components/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ViewState = 'intro' | 'wizard' | 'results';

export default function ChecklistReforma() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [results, setResults] = useState<ChecklistResults | null>(null);
  const [existingSummary, setExistingSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing completed checklist
  useEffect(() => {
    const loadExistingSummary = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('reform_checklist_summaries')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && data.completed_at) {
          setExistingSummary(data);
          // Also load responses
          const { data: responses } = await supabase
            .from('reform_checklist_responses')
            .select('item_key, response, notes')
            .eq('user_id', user.id);

          if (responses) {
            const loadedResponses: Record<string, any> = {};
            const loadedNotes: Record<string, string> = {};
            responses.forEach(r => {
              loadedResponses[r.item_key] = r.response;
              if (r.notes) loadedNotes[r.item_key] = r.notes;
            });

            setResults({
              responses: loadedResponses,
              notes: loadedNotes,
              readinessScore: data.readiness_score || 0,
              riskLevel: (data.risk_level as 'baixo' | 'moderado' | 'alto' | 'critico') || 'critico',
              simCount: data.sim_count || 0,
              parcialCount: data.parcial_count || 0,
              naoCount: data.nao_count || 0,
              naoSeiCount: data.nao_sei_count,
              topRisks: (data.top_risks as any[]) || []
            });
          }
        }
      } catch (error) {
        // No existing summary, that's fine
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingSummary();
  }, [user]);

  const handleComplete = (completedResults: ChecklistResults) => {
    setResults(completedResults);
    setViewState('results');
    toast.success('Checklist concluído!');
  };

  const handleRestart = async () => {
    if (!user) return;

    // Clear existing responses
    try {
      await supabase
        .from('reform_checklist_responses')
        .delete()
        .eq('user_id', user.id);

      await supabase
        .from('reform_checklist_summaries')
        .delete()
        .eq('user_id', user.id);

      setResults(null);
      setExistingSummary(null);
      setViewState('wizard');
    } catch (error) {
      console.error('Error resetting checklist:', error);
      toast.error('Erro ao reiniciar checklist');
    }
  };

  const handleDownloadPdf = async () => {
    if (!results) return;
    
    try {
      // Get company name if available
      const { data: profile } = await supabase
        .from('company_profile')
        .select('nome_fantasia, razao_social')
        .eq('user_id', user?.id)
        .single();

      const companyName = profile?.nome_fantasia || profile?.razao_social;
      await generateChecklistPdf(results, companyName);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              Checklist da Reforma Tributária
            </h1>
            <p className="text-muted-foreground">
              Avalie a prontidão operacional da sua empresa para a transição 2026-2033
            </p>
          </div>
        </div>

        {/* Intro State */}
        {viewState === 'intro' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Existing Results Notice */}
            {existingSummary && results && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Você já preencheu este checklist</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {results.readinessScore}% • Concluído em {new Date(existingSummary.completed_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewState('results')}
                      >
                        Ver Resultado
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setViewState('wizard')}
                      >
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Intro Card */}
            <Card>
              <CardHeader>
                <CardTitle>O que é este Checklist?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Este checklist ajuda a responder uma pergunta central:
                </p>
                <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r-lg">
                  <p className="text-lg font-medium italic">
                    "A empresa está operacionalmente preparada para atravessar a Reforma Tributária sem cometer erros?"
                  </p>
                </blockquote>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">✓ Este checklist É:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Uma avaliação prática de prontidão</li>
                      <li>• Um instrumento de gestão de risco</li>
                      <li>• Um guia operacional para 2026-2033</li>
                      <li>• Base para um relatório executivo</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-700">✗ Este checklist NÃO é:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Auditoria formal</li>
                      <li>• Parecer jurídico</li>
                      <li>• Laudo definitivo</li>
                      <li>• Substituto de contador/advogado</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blocks Preview */}
            <Card>
              <CardHeader>
                <CardTitle>7 Áreas Avaliadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { num: 1, title: 'Sistemas e Tecnologia' },
                    { num: 2, title: 'Obrigações Acessórias' },
                    { num: 3, title: 'Emissão de Documentos Fiscais' },
                    { num: 4, title: 'Gestão de Créditos' },
                    { num: 5, title: 'Fluxo de Caixa e Split Payment' },
                    { num: 6, title: 'Governança e Responsabilidades' },
                    { num: 7, title: 'Preparação para a Transição' },
                  ].map(block => (
                    <div 
                      key={block.num}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {block.num}
                      </span>
                      <span className="text-sm font-medium">{block.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clara Note */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="py-4">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Clara está aqui para ajudar</p>
                    <p className="text-sm text-purple-700">
                      Durante o preenchimento, passe o mouse sobre o ícone de ajuda (?) em cada pergunta para ver explicações em linguagem simples sobre o que significa, por que importa, e o que costuma dar errado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => setViewState('wizard')}
                className="gap-2"
              >
                <ClipboardCheck className="h-5 w-5" />
                {existingSummary ? 'Atualizar Checklist' : 'Iniciar Checklist'}
              </Button>
            </div>
          </div>
        )}

        {/* Wizard State */}
        {viewState === 'wizard' && (
          <div className="max-w-4xl mx-auto">
            <ChecklistWizard onComplete={handleComplete} />
          </div>
        )}

        {/* Results State */}
        {viewState === 'results' && results && (
          <div className="max-w-4xl mx-auto">
            <ChecklistResultsComponent
              results={results}
              onRestart={handleRestart}
              onDownloadPdf={handleDownloadPdf}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

