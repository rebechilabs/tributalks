import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmartPrefill, PrefillField, MissingField } from "@/hooks/useSmartPrefill";
import { Sparkles, Check, Pencil, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaraSmartSetupProps {
  tool: 'rtc' | 'score' | 'dre' | 'priceguard' | 'omc';
  onUseData: (data: Record<string, any>) => void;
  onSkip: () => void;
  className?: string;
}

export function ClaraSmartSetup({ tool, onUseData, onSkip, className }: ClaraSmartSetupProps) {
  const { preFilled, missing, loading, userName, hasEnoughData, refresh } = useSmartPrefill({ tool });
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showManualMode, setShowManualMode] = useState(false);

  const handleAnswerChange = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleUseData = () => {
    // Combina dados pré-preenchidos com respostas do usuário
    const combinedData: Record<string, any> = {};
    
    preFilled.forEach(field => {
      combinedData[field.key] = field.value;
    });
    
    Object.entries(answers).forEach(([key, value]) => {
      combinedData[key] = value;
    });

    onUseData(combinedData);
  };

  const allQuestionsAnswered = missing.every(
    field => !field.required || answers[field.key]
  );

  const canProceed = hasEnoughData && allQuestionsAnswered;

  if (loading) {
    return (
      <Card className={cn("border-primary/20 bg-primary/5", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  // Se não tem dados suficientes, mostra versão simplificada
  if (!hasEnoughData && preFilled.length === 0) {
    return (
      <Card className={cn("border-muted bg-muted/30", className)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {userName ? `Oi ${userName}!` : 'Olá!'} Complete seu perfil para ter dados pré-preenchidos
                </p>
                <p className="text-xs text-muted-foreground">
                  Com mais informações, a Clara pode agilizar suas simulações
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Preencher manualmente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-transparent", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">
              {userName ? `${userName}, preparei isso pra você` : 'Clara preparou isso pra você'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Preencher sozinho
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Campos pré-preenchidos */}
        {preFilled.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Dados identificados
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {preFilled.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50"
                >
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{field.label}</p>
                    <p className="text-sm font-medium truncate">
                      {Array.isArray(field.value) 
                        ? field.value.slice(0, 2).join(', ') + (field.value.length > 2 ? '...' : '')
                        : typeof field.value === 'number'
                          ? new Intl.NumberFormat('pt-BR', field.key.includes('faturamento') ? { style: 'currency', currency: 'BRL' } : {}).format(field.value)
                          : field.value
                      }
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] shrink-0",
                      field.confidence === 'high' && "bg-primary/10 text-primary",
                      field.confidence === 'medium' && "bg-accent text-accent-foreground",
                      field.confidence === 'low' && "bg-muted text-muted-foreground",
                    )}
                  >
                    {field.source === 'profile' ? 'Perfil' : 
                     field.source === 'dre' ? 'DRE' : 
                     field.source === 'credits' ? 'XMLs' : 
                     field.source === 'memory' ? 'Histórico' : 'Manual'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perguntas que faltam */}
        {missing.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              📝 Preciso confirmar
            </p>
            <div className="space-y-3">
              {missing.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'select' && field.options ? (
                    <Select
                      value={answers[field.key] || ''}
                      onValueChange={(value) => handleAnswerChange(field.key, value)}
                    >
                      <SelectTrigger id={field.key} className="bg-background">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'number' ? (
                    <Input
                      id={field.key}
                      type="number"
                      placeholder={field.placeholder}
                      value={answers[field.key] || ''}
                      onChange={(e) => handleAnswerChange(field.key, Number(e.target.value))}
                      className="bg-background"
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type="text"
                      placeholder={field.placeholder}
                      value={answers[field.key] || ''}
                      onChange={(e) => handleAnswerChange(field.key, e.target.value)}
                      className="bg-background"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleUseData}
            disabled={!canProceed}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Usar esses dados
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          Você pode ajustar qualquer valor depois
        </p>
      </CardContent>
    </Card>
  );
}
