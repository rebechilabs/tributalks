import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Send, Building, DollarSign, FileText, Briefcase, 
  Loader2, Search, CheckCircle2, ArrowRight, PartyPopper,
  MapPin, Receipt, Factory, Store, Laptop, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCnpjLookup, formatCnpj } from "@/hooks/useCnpjLookup";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { AntiCopyGuard } from "@/components/common/AntiCopyGuard";

interface Message {
  id: string;
  role: "clara" | "user";
  content: string;
  options?: OnboardingOption[];
  inputType?: "text" | "cnpj" | "select";
  field?: string;
  showCnpjInput?: boolean;
}

interface OnboardingOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
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
  { value: 'SIMPLES', label: 'Simples Nacional', icon: <Receipt className="w-4 h-4" />, description: 'Até R$ 4,8M/ano' },
  { value: 'PRESUMIDO', label: 'Lucro Presumido', icon: <DollarSign className="w-4 h-4" />, description: 'Margens definidas' },
  { value: 'REAL', label: 'Lucro Real', icon: <FileText className="w-4 h-4" />, description: 'Apuração completa' },
];

const SETORES_OPTIONS: OnboardingOption[] = [
  { value: 'industria', label: 'Indústria', icon: <Factory className="w-5 h-5" /> },
  { value: 'comercio', label: 'Comércio', icon: <Store className="w-5 h-5" /> },
  { value: 'servicos', label: 'Serviços', icon: <Briefcase className="w-5 h-5" /> },
  { value: 'tecnologia', label: 'Tecnologia', icon: <Laptop className="w-5 h-5" /> },
  { value: 'outro', label: 'Outro', icon: <HelpCircle className="w-5 h-5" /> },
];

const FATURAMENTO_OPTIONS: OnboardingOption[] = [
  { value: '200000', label: 'Até R$ 500k/mês' },
  { value: '500000', label: 'R$ 500k - R$ 1M' },
  { value: '1000000', label: 'R$ 1M - R$ 2,5M' },
  { value: '2500000', label: 'R$ 2,5M - R$ 5M' },
  { value: '5000000', label: 'R$ 5M - R$ 10M' },
  { value: '10000000', label: 'Acima de R$ 10M' },
];

type OnboardingStep = 
  | "welcome"
  | "cnpj"
  | "empresa"
  | "estado"
  | "faturamento"
  | "regime"
  | "setor"
  | "summary"
  | "complete";

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  welcome: 0,
  cnpj: 10,
  empresa: 25,
  estado: 40,
  faturamento: 55,
  regime: 70,
  setor: 85,
  summary: 95,
  complete: 100,
};

// Mensagens variadas da Clara para parecer mais humana
const CLARA_REACTIONS = {
  gotIt: ["Entendi!", "Perfeito!", "Ótimo!", "Show!", "Anotado!"],
  almostThere: ["Quase lá!", "Falta pouco!", "Última pergunta!"],
  thinking: ["Deixa eu ver...", "Um momento...", "Processando..."],
};

const getRandomReaction = (type: keyof typeof CLARA_REACTIONS) => {
  const options = CLARA_REACTIONS[type];
  return options[Math.floor(Math.random() * options.length)];
};

export function ClaraOnboardingChat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [cnpjInput, setCnpjInput] = useState("");
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
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lookup: lookupCnpj, isLoading: cnpjLoading } = useCnpjLookup();

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
  const addClaraMessage = useCallback((
    content: string, 
    options?: OnboardingOption[], 
    inputType?: "text" | "cnpj" | "select", 
    field?: string,
    showCnpjInput?: boolean
  ) => {
    setIsTyping(true);
    
    // Tempo de digitação proporcional ao tamanho da mensagem (mais natural)
    const typingTime = Math.min(600 + content.length * 8, 1500);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "clara",
        content,
        options,
        inputType,
        field,
        showCnpjInput,
      }]);
    }, typingTime);
  }, []);

  // Add user message
  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content,
    }]);
  }, []);

  // Get user's first name
  const getUserFirstName = () => {
    if (profile?.empresa) {
      return profile.empresa.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0].split('.')[0];
    }
    return "você";
  };

  // Initialize conversation
  useEffect(() => {
    if (currentStep === "welcome" && messages.length === 0) {
      const greeting = new Date().getHours() < 12 ? "Bom dia" : 
                       new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";
      
      addClaraMessage(
        `${greeting}! 👋 Sou a **Clara**, sua parceira de inteligência tributária.\n\nEm menos de 2 minutos, vou configurar seu perfil para te dar insights **personalizados** sobre a Reforma Tributária. Bora?`,
        [
          { value: "start", label: "Vamos lá! 🚀" },
        ]
      );
    }
  }, [currentStep, messages.length, addClaraMessage]);

  // Handle CNPJ lookup
  const handleCnpjLookup = async () => {
    if (!cnpjInput.trim() || cnpjInput.replace(/\D/g, '').length < 14) {
      toast.error("Digite um CNPJ válido com 14 dígitos");
      return;
    }

    addUserMessage(formatCnpj(cnpjInput));
    
    const data = await lookupCnpj(cnpjInput);
    
    if (data) {
      setFormData(prev => ({
        ...prev,
        cnpj: data.cnpj,
        empresa: data.nome_fantasia || data.razao_social,
        estado: data.uf,
        cnae: data.cnae_fiscal?.toString() || "",
      }));
      
      addClaraMessage(
        `Achei! 🎯\n\n**${data.nome_fantasia || data.razao_social}**\n📍 ${data.municipio}/${data.uf}\n🏷️ ${data.cnae_fiscal_descricao}\n\nSão esses os dados?`,
        [
          { value: "confirm_cnpj", label: "Isso mesmo! ✓" },
          { value: "edit_cnpj", label: "Preciso ajustar" },
        ]
      );
    } else {
      addClaraMessage(
        "Hmm, não consegui encontrar esse CNPJ 🤔\n\nMas sem problemas! Me conta o nome da empresa:",
        undefined,
        "text",
        "empresa"
      );
      setCurrentStep("empresa");
    }
  };

  // Handle step transitions
  const handleStepTransition = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
    
    switch (step) {
      case "cnpj":
        addClaraMessage(
          "Primeiro, me passa o **CNPJ** da empresa. Assim já puxo os dados automaticamente! 🔍",
          [{ value: "no_cnpj", label: "Prefiro digitar manualmente" }],
          undefined,
          undefined,
          true
        );
        break;
        
      case "empresa":
        addClaraMessage(
          "Qual o **nome da empresa**?",
          undefined,
          "text",
          "empresa"
        );
        break;
        
      case "estado":
        addClaraMessage(
          `${getRandomReaction('gotIt')} Em qual **estado** fica a sede?`,
          ESTADOS.map(uf => ({ value: uf, label: uf }))
        );
        break;
        
      case "faturamento":
        addClaraMessage(
          "E qual a **faixa de faturamento mensal**? (Isso me ajuda a calibrar as simulações)",
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
          `${getRandomReaction('almostThere')} Qual o **setor** de atuação?`
        );
        break;
        
      case "summary":
        const faturamentoLabel = FATURAMENTO_OPTIONS.find(f => f.value === formData.faturamento_mensal)?.label || formData.faturamento_mensal;
        const regimeLabel = REGIMES_OPTIONS.find(r => r.value === formData.regime)?.label || formData.regime;
        const setorLabel = SETORES_OPTIONS.find(s => s.value === formData.setor)?.label || formData.setor;
        
        addClaraMessage(
          `Deixa eu confirmar:\n\n🏢 **${formData.empresa}**\n📍 ${formData.estado}\n💰 ${faturamentoLabel}\n📋 ${regimeLabel}\n🏭 ${setorLabel}\n\nTudo certo?`,
          [
            { value: "confirm", label: "Confirmar ✓" },
            { value: "edit", label: "Corrigir algo" },
          ]
        );
        break;
        
      case "complete":
        setShowConfetti(true);
        addClaraMessage(
          `🎉 **Pronto, ${getUserFirstName()}!**\n\nSeu perfil está configurado. Agora vou te levar pro Dashboard — recomendo começar pelo **Score Tributário** pra ter um panorama completo!\n\nQualquer dúvida, é só me chamar no botão ✨`
        );
        break;
    }
  }, [formData, addClaraMessage, getUserFirstName]);

  // Handle option selection
  const handleOptionSelect = useCallback((option: OnboardingOption) => {
    addUserMessage(option.label);
    
    switch (currentStep) {
      case "welcome":
        setTimeout(() => handleStepTransition("cnpj"), 400);
        break;
        
      case "cnpj":
        if (option.value === "no_cnpj") {
          setTimeout(() => handleStepTransition("empresa"), 400);
        } else if (option.value === "confirm_cnpj") {
          setTimeout(() => handleStepTransition("faturamento"), 400);
        } else if (option.value === "edit_cnpj") {
          setTimeout(() => handleStepTransition("empresa"), 400);
        }
        break;
        
      case "estado":
        setFormData(prev => ({ ...prev, estado: option.value }));
        setTimeout(() => handleStepTransition("faturamento"), 400);
        break;
        
      case "faturamento":
        setFormData(prev => ({ ...prev, faturamento_mensal: option.value }));
        setTimeout(() => handleStepTransition("regime"), 400);
        break;
        
      case "regime":
        setFormData(prev => ({ ...prev, regime: option.value }));
        setTimeout(() => handleStepTransition("setor"), 400);
        break;
        
      case "setor":
        setFormData(prev => ({ ...prev, setor: option.value }));
        setTimeout(() => handleStepTransition("summary"), 400);
        break;
        
      case "summary":
        if (option.value === "confirm") {
          handleSubmit();
        } else {
          setTimeout(() => handleStepTransition("empresa"), 400);
        }
        break;
    }
  }, [currentStep, addUserMessage, handleStepTransition]);

  // Handle text input
  const handleTextSubmit = useCallback(() => {
    if (!input.trim()) return;
    
    addUserMessage(input.trim());
    
    if (currentStep === "empresa") {
      setFormData(prev => ({ ...prev, empresa: input.trim() }));
      setInput("");
      // Se já tem estado do CNPJ, pula pra faturamento
      if (formData.estado) {
        setTimeout(() => handleStepTransition("faturamento"), 400);
      } else {
        setTimeout(() => handleStepTransition("estado"), 400);
      }
    }
  }, [input, currentStep, formData.estado, addUserMessage, handleStepTransition]);

  // Handle setor selection (visual cards)
  const handleSetorSelect = (setor: OnboardingOption) => {
    addUserMessage(setor.label);
    setFormData(prev => ({ ...prev, setor: setor.value }));
    setTimeout(() => handleStepTransition("summary"), 400);
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
      
      localStorage.setItem('needs_quick_diagnostic', 'true');
      
      handleStepTransition("complete");
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3500);
      
    } catch (error: any) {
      console.error("Onboarding save error:", error);
      toast.error("Erro ao salvar. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const progress = STEP_PROGRESS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#3B82F6'][i % 5],
                left: `${Math.random() * 100}%`,
              }}
              initial={{ top: -20, rotate: 0, opacity: 1 }}
              animate={{ 
                top: '110%', 
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: 0 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                delay: Math.random() * 0.5,
                ease: "easeOut" 
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border/50 px-4 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">TribuTalks</span>
              <p className="text-xs text-muted-foreground">Configuração do Perfil</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {Math.round(progress)}%
          </Badge>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <Progress value={progress} className="h-1.5 mt-3" />
      </div>

      {/* Chat area */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-5 pb-4 scroll-smooth"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "clara" ? (
                  <div className="flex gap-3 max-w-[90%]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-sm">
                        <CardContent className="p-4">
                          <AntiCopyGuard>
                            <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          </AntiCopyGuard>
                        </CardContent>
                      </Card>
                      
                      {/* CNPJ Input */}
                      {message.showCnpjInput && currentStep === "cnpj" && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2"
                        >
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={cnpjInput}
                              onChange={(e) => setCnpjInput(e.target.value.replace(/\D/g, '').slice(0, 14))}
                              placeholder="00.000.000/0000-00"
                              className="pl-9 font-mono"
                              onKeyDown={(e) => e.key === "Enter" && handleCnpjLookup()}
                              autoFocus
                            />
                          </div>
                          <Button 
                            onClick={handleCnpjLookup} 
                            disabled={cnpjLoading || cnpjInput.length < 14}
                            className="gap-2"
                          >
                            {cnpjLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>Buscar<ArrowRight className="w-4 h-4" /></>
                            )}
                          </Button>
                        </motion.div>
                      )}
                      
                      {/* Options */}
                      {message.options && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex flex-wrap gap-2"
                        >
                          {message.options.map((option) => (
                            <Button
                              key={option.value}
                              variant="outline"
                              size="sm"
                              onClick={() => handleOptionSelect(option)}
                              className={cn(
                                "gap-2 transition-all hover:scale-105 hover:shadow-md",
                                option.description && "flex-col h-auto py-2 px-3"
                              )}
                              disabled={isSubmitting}
                            >
                              <span className="flex items-center gap-2">
                                {option.icon}
                                {option.label}
                              </span>
                              {option.description && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {option.description}
                                </span>
                              )}
                            </Button>
                          ))}
                        </motion.div>
                      )}
                      
                      {/* Setor cards (special UI) */}
                      {currentStep === "setor" && index === messages.length - 1 && !message.options && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                        >
                          {SETORES_OPTIONS.map((setor) => (
                            <button
                              key={setor.value}
                              onClick={() => handleSetorSelect(setor)}
                              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all hover:scale-105 hover:shadow-lg"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                {setor.icon}
                              </div>
                              <span className="text-sm font-medium">{setor.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                      
                      {/* Text input */}
                      {message.inputType === "text" && currentStep === "empresa" && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2"
                        >
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Digite o nome da empresa..."
                            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                            autoFocus
                            className="flex-1"
                          />
                          <Button onClick={handleTextSubmit} size="icon" disabled={!input.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <Card className="bg-primary text-primary-foreground max-w-[85%] shadow-lg shadow-primary/20">
                      <CardContent className="p-3 px-4">
                        <p className="text-sm">{message.content}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
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
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 px-4">
                  <div className="flex gap-1.5 items-center h-5">
                    <motion.span 
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <motion.span 
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.span 
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Loading state */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 py-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
              <span className="text-muted-foreground">Salvando seu perfil...</span>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Footer hint */}
      <footer className="border-t border-border/50 py-3 px-4 bg-background/80 backdrop-blur-sm">
        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          💡 Seus dados são usados apenas para personalizar sua experiência
        </p>
      </footer>
    </div>
  );
}
