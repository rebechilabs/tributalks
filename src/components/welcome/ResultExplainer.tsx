import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ResultExplainerProps {
  toolId: string;
  toolName: string;
  result: any;
  isOpen: boolean;
  onClose: () => void;
}

interface ExplanationSection {
  type: "positive" | "warning" | "tip";
  title: string;
  content: string;
}

export function ResultExplainer({
  toolId,
  toolName,
  result,
  isOpen,
  onClose,
}: ResultExplainerProps) {
  const [explanation, setExplanation] = useState<ExplanationSection[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar explicação da Clara quando abrir
  const fetchExplanation = async () => {
    if (explanation) return; // Já tem explicação

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "clara-assistant",
        {
          body: {
            message: `Explique os resultados do ${toolName} de forma simples e acionável. Dados: ${JSON.stringify(result)}`,
            context: {
              currentScreen: toolId,
              mode: "explain_result",
            },
          },
        }
      );

      if (fnError) throw fnError;

      // Parse da resposta em seções
      const sections = parseExplanation(data?.response || "");
      setExplanation(sections);
    } catch (err) {
      console.error("Error fetching explanation:", err);
      setError("Não consegui gerar a explicação. Tente novamente.");
      
      // Fallback com explicação genérica
      setExplanation(getGenericExplanation(toolId, result));
    } finally {
      setIsLoading(false);
    }
  };

  // Parse resposta em seções estruturadas
  const parseExplanation = (text: string): ExplanationSection[] => {
    // Simplificado - na prática, a IA retornaria um JSON estruturado
    const sections: ExplanationSection[] = [];

    if (text.includes("✅") || text.toLowerCase().includes("bom") || text.toLowerCase().includes("ok")) {
      sections.push({
        type: "positive",
        title: "O que está bom",
        content: text.split("⚠️")[0] || text.substring(0, 200),
      });
    }

    if (text.includes("⚠️") || text.toLowerCase().includes("atenção") || text.toLowerCase().includes("melhorar")) {
      const warningPart = text.split("⚠️")[1]?.split("💡")[0] || "";
      if (warningPart) {
        sections.push({
          type: "warning",
          title: "Pontos de atenção",
          content: warningPart.substring(0, 200),
        });
      }
    }

    if (text.includes("💡") || text.toLowerCase().includes("sugest") || text.toLowerCase().includes("próximo")) {
      const tipPart = text.split("💡")[1] || "";
      sections.push({
        type: "tip",
        title: "Próximo passo",
        content: tipPart.substring(0, 200) || "Continue para a próxima ferramenta do seu plano.",
      });
    }

    // Se não parseou nada, retorna texto como dica
    if (sections.length === 0) {
      sections.push({
        type: "tip",
        title: "Análise da Clara",
        content: text.substring(0, 300),
      });
    }

    return sections;
  };

  // Explicação genérica como fallback
  const getGenericExplanation = (tool: string, data: any): ExplanationSection[] => {
    switch (tool) {
      case "score":
        const score = data?.score || data?.total || 0;
        return [
          {
            type: score >= 70 ? "positive" : "warning",
            title: score >= 70 ? "Score Bom" : "Score precisa de atenção",
            content:
              score >= 70
                ? "Sua empresa está em boa forma fiscal. Continue mantendo as boas práticas."
                : "Há oportunidades de melhoria na sua gestão fiscal. Veja os detalhes abaixo.",
          },
          {
            type: "tip",
            title: "Próximo passo",
            content:
              "Use o Radar de Créditos para identificar valores que você pode recuperar.",
          },
        ];
      default:
        return [
          {
            type: "tip",
            title: "Resultado processado",
            content:
              "Seu resultado foi salvo. Continue explorando as outras ferramentas do seu plano.",
          },
        ];
    }
  };

  // Busca explicação quando modal abre
  if (isOpen && !explanation && !isLoading && !error) {
    fetchExplanation();
  }

  const getIcon = (type: "positive" | "warning" | "tip") => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: "positive" | "warning" | "tip") => {
    switch (type) {
      case "positive":
        return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
      case "tip":
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            Clara explica: {toolName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Analisando resultados...
              </span>
            </div>
          )}

          {error && !explanation && (
            <div className="text-center py-4 text-muted-foreground">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setError(null);
                  fetchExplanation();
                }}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {explanation && (
            <AnimatePresence>
              {explanation.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border ${getBgColor(section.type)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getIcon(section.type)}
                        <div>
                          <h4 className="font-medium mb-1">{section.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {section.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente de botão para usar nos resultados
export function ResultExplainerButton({
  toolId,
  toolName,
  result,
}: {
  toolId: string;
  toolName: string;
  result: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Bot className="w-4 h-4" />
        Clara explica
      </Button>

      <ResultExplainer
        toolId={toolId}
        toolName={toolName}
        result={result}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
