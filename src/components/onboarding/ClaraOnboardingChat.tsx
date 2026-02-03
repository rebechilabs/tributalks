import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Building, DollarSign, FileText, Briefcase, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CnpjData } from "@/hooks/useCnpjLookup";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "clara" | "user";
  content: string;
  options?: OnboardingOption[];
  inputType?: "text" | "cnpj" | "select";
  field?: string;
}

interface OnboardingOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FormData {
  cnpj: string;
  empresa: string;
  estado: string;
  faturamento_mensal: string;
  regime: string;
  setor: string;
  cnae: string;
}

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const REGIMES_OPTIONS: OnboardingOption[] = [
  { value: 'SIMPLES', label: 'Simples Nacional' },
  { value: 'PRESUMIDO', label: 'Lucro Presumido' },
  { value: 'REAL', label: 'Lucro Real' },
];

const SETORES_OPTIONS: OnboardingOption[] = [
  { value: 'industria', label: 'Indústria', icon: <Building className="w-4 h-4" /> },
  { value: 'comercio', label: 'Comércio', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'servicos', label: 'Serviços', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'tecnologia', label: 'Tecnologia', icon: <FileText className="w-4 h-4" /> },
  { value: 'outro', label: 'Outro' },
];

const FATURAMENTO_OPTIONS: OnboardingOption[] = [
  { value: '200000', label: 'R$ 200k - R$ 500k' },
  { value: '500000', label: 'R$ 500k - R$ 1M' },
  { value: '1000000', label: 'R$ 1M - R$ 2,5M' },
  { value: '2500000', label: 'R$ 2,5M - R$ 5M' },
  { value: '5000000', label: 'R$ 5M - R$ 10M' },
  { value: '10000000', label: 'R$ 10M - R$ 25M' },
  { value: '25000000', label: 'R$ 25M - R$ 50M' },
  { value: '50000000', label: 'Acima de R$ 50M' },
];

type OnboardingStep = 
  | "welcome"
  | "empresa"
  | "estado"
  | "faturamento"
  | "regime"
  | "setor"
  | "summary"
  | "complete";

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  welcome: 0,
  empresa: 15,
  estado: 30,
  faturamento: 45,
  regime: 60,
  setor: 75,
  summary: 90,
  complete: 100,
};

export function ClaraOnboardingChat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState<FormData>({
    cnpj: "",
    empresa: "",
    estado: "",
    faturamento_mensal: "",
    regime: "",
    setor: "",
    cnae: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Pre-populate from profile if available
  useEffect(() => {
    if (profile) {
      if (profile.onboarding_complete) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setFormData(prev => ({
        ...prev,
        empresa: profile.empresa || "",
        estado: profile.estado || "",
        faturamento_mensal: profile.faturamento_mensal?.toString() || "",
        regime: profile.regime || "",
        setor: profile.setor || "",
        cnae: profile.cnae || "",
      }));
    }
  }, [profile, navigate]);

  // Add Clara message with typing effect
  const addClaraMessage = useCallback((content: string, options?: OnboardingOption[], inputType?: "text" | "cnpj" | "select", field?: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "clara",
        content,
        options,
        inputType,
        field,
      }]);
    }, 800 + Math.random() * 400);
  }, []);

  // Add user message
  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content,
    }]);
  }, []);

  // Initialize conversation
  useEffect(() => {
    if (currentStep === "welcome" && messages.length === 0) {
      const userName = profile?.empresa ? ` da ${profile.empresa}` : "";
      addClaraMessage(
        `Olá! 👋 Sou a **Clara**, sua consultora de inteligência tributária.\n\nVou te guiar rapidamente para configurar seu perfil${userName}. Isso me ajuda a dar orientações **personalizadas** sobre a Reforma Tributária.\n\nVamos começar?`,
        [
          { value: "start", label: "Vamos lá! 🚀" },
          { value: "skip", label: "Pular por agora" },
        ]
      );
    }
  }, [currentStep, messages.length, profile?.empresa, addClaraMessage]);

  // Handle step transitions
  const handleStepTransition = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
    
    switch (step) {
      case "empresa":
        addClaraMessage(
          "Qual o **nome da sua empresa**? Pode digitar abaixo ou me passar o CNPJ que eu busco automaticamente 😊",
          undefined,
          "text",
          "empresa"
        );
        break;
        
      case "estado":
        addClaraMessage(
          "Em qual **estado** fica a sede principal?",
          ESTADOS.slice(0, 10).map(uf => ({ value: uf, label: uf })).concat([
            { value: "outros", label: "Ver todos estados..." }
          ])
        );
        break;
        
      case "faturamento":
        addClaraMessage(
          "Para calibrar as simulações, qual a **faixa de faturamento mensal**?",
          FATURAMENTO_OPTIONS
        );
        break;
        
      case "regime":
        addClaraMessage(
          "Qual o **regime tributário** atual?",
          REGIMES_OPTIONS
        );
        break;
        
      case "setor":
        addClaraMessage(
          "Quase lá! Qual o **setor principal** de atuação?",
          SETORES_OPTIONS
        );
        break;
        
      case "summary":
        const summary = `Perfeito! Deixa eu confirmar:\n\n` +
          `🏢 **Empresa:** ${formData.empresa}\n` +
          `📍 **Estado:** ${formData.estado}\n` +
          `💰 **Faturamento:** ${FATURAMENTO_OPTIONS.find(f => f.value === formData.faturamento_mensal)?.label || formData.faturamento_mensal}\n` +
          `📋 **Regime:** ${REGIMES_OPTIONS.find(r => r.value === formData.regime)?.label || formData.regime}\n` +
          `🏭 **Setor:** ${SETORES_OPTIONS.find(s => s.value === formData.setor)?.label || formData.setor}\n\n` +
          `Está tudo certo?`;
        
        addClaraMessage(summary, [
          { value: "confirm", label: "Confirmar e continuar ✓" },
          { value: "edit", label: "Corrigir algo" },
        ]);
        break;
        
      case "complete":
        addClaraMessage(
          "🎉 **Pronto!** Seu perfil está configurado.\n\nAgora vou te levar para o Dashboard. Recomendo começar pelo **Score Tributário** — em 2 minutos você terá um panorama completo da sua situação!\n\nPosso te ajudar a qualquer momento. É só clicar no botão ✨ no canto da tela."
        );
        break;
    }
  }, [formData, addClaraMessage]);

  // Handle option selection
  const handleOptionSelect = useCallback((option: OnboardingOption) => {
    addUserMessage(option.label);
    
    switch (currentStep) {
      case "welcome":
        if (option.value === "start") {
          setTimeout(() => handleStepTransition("empresa"), 500);
        } else {
          // Skip - save minimal and redirect
          handleSkip();
        }
        break;
        
      case "estado":
        if (option.value === "outros") {
          // Show all states
          addClaraMessage(
            "Escolha seu estado:",
            ESTADOS.map(uf => ({ value: uf, label: uf }))
          );
        } else {
          setFormData(prev => ({ ...prev, estado: option.value }));
          setTimeout(() => handleStepTransition("faturamento"), 500);
        }
        break;
        
      case "faturamento":
        setFormData(prev => ({ ...prev, faturamento_mensal: option.value }));
        setTimeout(() => handleStepTransition("regime"), 500);
        break;
        
      case "regime":
        setFormData(prev => ({ ...prev, regime: option.value }));
        setTimeout(() => handleStepTransition("setor"), 500);
        break;
        
      case "setor":
        setFormData(prev => ({ ...prev, setor: option.value }));
        setTimeout(() => handleStepTransition("summary"), 500);
        break;
        
      case "summary":
        if (option.value === "confirm") {
          handleSubmit();
        } else {
          // Go back to empresa
          setTimeout(() => handleStepTransition("empresa"), 500);
        }
        break;
    }
  }, [currentStep, addUserMessage, handleStepTransition]);

  // Handle text input
  const handleTextSubmit = useCallback(() => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    
    if (currentStep === "empresa") {
      setFormData(prev => ({ ...prev, empresa: input.trim() }));
      setInput("");
      setTimeout(() => handleStepTransition("estado"), 500);
    }
  }, [input, currentStep, addUserMessage, handleStepTransition]);

  // Handle skip
  const handleSkip = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("user_id", user.id);
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      navigate('/dashboard', { replace: true });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData = {
        empresa: formData.empresa.trim(),
        estado: formData.estado,
        faturamento_mensal: parseFloat(formData.faturamento_mensal) || null,
        regime: formData.regime as 'SIMPLES' | 'PRESUMIDO' | 'REAL',
        setor: formData.setor as 'industria' | 'comercio' | 'servicos' | 'tecnologia' | 'outro',
        cnae: formData.cnae?.trim() || null,
        onboarding_complete: true,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Store flag for quick diagnostic
      localStorage.setItem('needs_quick_diagnostic', 'true');
      
      handleStepTransition("complete");
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000);
      
    } catch (error: any) {
      console.error("Onboarding save error:", error);
      toast.error("Erro ao salvar. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const progress = STEP_PROGRESS[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">TribuTalks</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(progress)}% configurado
          </div>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <Progress value={progress} className="h-1 mt-2" />
      </div>

      {/* Chat area */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "clara" ? (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <Card className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Options */}
                      {message.options && (
                        <div className="flex flex-wrap gap-2">
                          {message.options.map((option) => (
                            <Button
                              key={option.value}
                              variant="outline"
                              size="sm"
                              onClick={() => handleOptionSelect(option)}
                              className="gap-2"
                              disabled={isSubmitting}
                            >
                              {option.icon}
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Text input */}
                      {message.inputType === "text" && currentStep === "empresa" && (
                        <div className="flex gap-2">
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Digite o nome da empresa..."
                            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                            autoFocus
                          />
                          <Button onClick={handleTextSubmit} size="icon">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-primary text-primary-foreground max-w-[75%]">
                    <CardContent className="p-4">
                      <p>{message.content}</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Loading state */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-muted-foreground"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando seu perfil...</span>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
