import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useClaraFeedback } from "@/hooks/useClaraMemory";
import { cn } from "@/lib/utils";

interface ClaraFeedbackButtonsProps {
  messageContent: string;
  responseContent: string;
  contextScreen?: string;
  modelUsed?: string;
  className?: string;
}

/**
 * Botões de feedback (thumbs up/down) para respostas da Clara
 * Coleta dados para futuro fine-tuning
 */
export function ClaraFeedbackButtons({
  messageContent,
  responseContent,
  contextScreen,
  modelUsed,
  className,
}: ClaraFeedbackButtonsProps) {
  const { submitFeedback, submitting } = useClaraFeedback();
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRating = async (newRating: 'positive' | 'negative') => {
    if (submitted) return;
    
    setRating(newRating);
    
    // Se for negativo, mostra input para comentário
    if (newRating === 'negative') {
      setShowTextInput(true);
      return;
    }
    
    // Se for positivo, envia direto
    const result = await submitFeedback(
      messageContent,
      responseContent,
      newRating,
      { contextScreen, modelUsed }
    );
    
    if (result) {
      setSubmitted(true);
      toast.success("Obrigado pelo feedback! 💙");
    }
  };

  const handleSubmitWithText = async () => {
    if (!rating || submitted) return;
    
    const result = await submitFeedback(
      messageContent,
      responseContent,
      rating,
      { 
        feedbackText: feedbackText.trim() || undefined,
        contextScreen, 
        modelUsed 
      }
    );
    
    if (result) {
      setSubmitted(true);
      setShowTextInput(false);
      toast.success("Obrigado! Seu feedback ajuda a Clara a melhorar.");
    }
  };

  if (submitted) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <span>✓ Feedback registrado</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Esta resposta foi útil?</span>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full transition-colors",
            rating === 'positive' && "bg-primary/10 text-primary"
          )}
          onClick={() => handleRating('positive')}
          disabled={submitting || submitted}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full transition-colors",
            rating === 'negative' && "bg-destructive/10 text-destructive"
          )}
          onClick={() => handleRating('negative')}
          disabled={submitting || submitted}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {showTextInput && (
        <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              O que poderia ser melhor?
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => {
                setShowTextInput(false);
                setRating(null);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Ex: A resposta não respondeu minha dúvida sobre..."
            className="min-h-[60px] text-sm resize-none"
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSubmitWithText()}
              disabled={submitting}
              className="text-xs"
            >
              Pular
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitWithText}
              disabled={submitting}
              className="text-xs gap-1"
            >
              <Send className="h-3 w-3" />
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
