import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  checklistBlocks, 
  ChecklistResponse, 
  getTotalItems,
  calculateReadinessScore,
  getRiskLevel
} from "@/data/checklistReformaItems";
import { ChecklistBlockComponent } from "./ChecklistBlock";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChecklistWizardProps {
  onComplete: (results: ChecklistResults) => void;
}

export interface ChecklistResults {
  responses: Record<string, ChecklistResponse>;
  notes: Record<string, string>;
  readinessScore: number;
  riskLevel: 'baixo' | 'moderado' | 'alto' | 'critico';
  simCount: number;
  parcialCount: number;
  naoCount: number;
  naoSeiCount: number;
  topRisks: Array<{ blockTitle: string; itemQuestion: string; riskWeight: number }>;
}

export function ChecklistWizard({ onComplete }: ChecklistWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, ChecklistResponse>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const totalItems = getTotalItems();
  const answeredItems = Object.keys(responses).length;
  const currentBlock = checklistBlocks[currentBlockIndex];

  // Load existing responses
  useEffect(() => {
    const loadResponses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('reform_checklist_responses')
          .select('item_key, response, notes')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const loadedResponses: Record<string, ChecklistResponse> = {};
          const loadedNotes: Record<string, string> = {};
          
          data.forEach(item => {
            loadedResponses[item.item_key] = item.response as ChecklistResponse;
            if (item.notes) loadedNotes[item.item_key] = item.notes;
          });

          setResponses(loadedResponses);
          setNotes(loadedNotes);
        }
      } catch (error) {
        console.error('Error loading responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [user]);

  const handleResponseChange = async (itemKey: string, response: ChecklistResponse) => {
    if (!user) return;

    setResponses(prev => ({ ...prev, [itemKey]: response }));

    // Find block key for this item
    const block = checklistBlocks.find(b => b.items.some(i => i.key === itemKey));
    if (!block) return;

    // Save to database
    try {
      const { error } = await supabase
        .from('reform_checklist_responses')
        .upsert({
          user_id: user.id,
          block_key: block.key,
          item_key: itemKey,
          response,
          notes: notes[itemKey] || null
        }, { onConflict: 'user_id,item_key' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Erro ao salvar resposta');
    }
  };

  const handleNotesChange = async (itemKey: string, noteValue: string) => {
    if (!user) return;

    setNotes(prev => ({ ...prev, [itemKey]: noteValue }));

    // Only save if there's already a response for this item
    if (!responses[itemKey]) return;

    const block = checklistBlocks.find(b => b.items.some(i => i.key === itemKey));
    if (!block) return;

    try {
      const { error } = await supabase
        .from('reform_checklist_responses')
        .upsert({
          user_id: user.id,
          block_key: block.key,
          item_key: itemKey,
          response: responses[itemKey],
          notes: noteValue || null
        }, { onConflict: 'user_id,item_key' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const calculateResults = (): ChecklistResults => {
    const simCount = Object.values(responses).filter(r => r === 'sim').length;
    const parcialCount = Object.values(responses).filter(r => r === 'parcial').length;
    const naoCount = Object.values(responses).filter(r => r === 'nao').length;
    const naoSeiCount = Object.values(responses).filter(r => r === 'nao_sei').length;

    const readinessScore = calculateReadinessScore(responses);
    const riskLevel = getRiskLevel(readinessScore);

    // Identify top risks (items with 'nao' or 'nao_sei' and high risk weight)
    const risks: Array<{ blockTitle: string; itemQuestion: string; riskWeight: number }> = [];
    
    checklistBlocks.forEach(block => {
      block.items.forEach(item => {
        const response = responses[item.key];
        if ((response === 'nao' || response === 'nao_sei') && item.riskWeight >= 2) {
          risks.push({
            blockTitle: block.title,
            itemQuestion: item.question,
            riskWeight: item.riskWeight
          });
        }
      });
    });

    // Sort by risk weight descending and take top 5
    const topRisks = risks.sort((a, b) => b.riskWeight - a.riskWeight).slice(0, 5);

    return {
      responses,
      notes,
      readinessScore,
      riskLevel,
      simCount,
      parcialCount,
      naoCount,
      naoSeiCount,
      topRisks
    };
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSaving(true);
    const results = calculateResults();

    try {
      // Save summary
      const { error } = await supabase
        .from('reform_checklist_summaries')
        .upsert({
          user_id: user.id,
          total_items: totalItems,
          sim_count: results.simCount,
          parcial_count: results.parcialCount,
          nao_count: results.naoCount,
          nao_sei_count: results.naoSeiCount,
          readiness_score: results.readinessScore,
          risk_level: results.riskLevel,
          top_risks: results.topRisks,
          recommendations: [],
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      onComplete(results);
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error('Erro ao finalizar checklist');
    } finally {
      setIsSaving(false);
    }
  };

  const currentBlockAnswered = currentBlock.items.filter(item => responses[item.key]).length;
  const isCurrentBlockComplete = currentBlockAnswered === currentBlock.items.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm text-muted-foreground">
              {answeredItems} de {totalItems} perguntas respondidas
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(answeredItems / totalItems) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Block Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {checklistBlocks.map((block, index) => {
          const blockAnswered = block.items.filter(item => responses[item.key]).length;
          const isComplete = blockAnswered === block.items.length;
          const isCurrent = index === currentBlockIndex;

          return (
            <button
              key={block.key}
              onClick={() => setCurrentBlockIndex(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                isCurrent 
                  ? 'bg-primary text-primary-foreground' 
                  : isComplete 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {isComplete && <CheckCircle className="h-4 w-4" />}
              <span>{index + 1}. {block.title}</span>
            </button>
          );
        })}
      </div>

      {/* Current Block */}
      <Card>
        <CardContent className="pt-6">
          <ChecklistBlockComponent
            block={currentBlock}
            blockIndex={currentBlockIndex}
            totalBlocks={checklistBlocks.length}
            responses={responses}
            notes={notes}
            onResponseChange={handleResponseChange}
            onNotesChange={handleNotesChange}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentBlockIndex(prev => prev - 1)}
          disabled={currentBlockIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Bloco Anterior
        </Button>

        {currentBlockIndex < checklistBlocks.length - 1 ? (
          <Button
            onClick={() => setCurrentBlockIndex(prev => prev + 1)}
          >
            Próximo Bloco
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={answeredItems < totalItems || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Finalizar e Ver Resultado
          </Button>
        )}
      </div>

      {/* Hint for incomplete */}
      {currentBlockIndex === checklistBlocks.length - 1 && answeredItems < totalItems && (
        <p className="text-sm text-muted-foreground text-center">
          Responda todas as {totalItems} perguntas para finalizar o checklist.
        </p>
      )}
    </div>
  );
}
