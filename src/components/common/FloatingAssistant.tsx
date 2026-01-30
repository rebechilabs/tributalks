import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Send, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import { useClaraShortcut } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useAuth } from "@/hooks/useAuth";
import { ClaraFloatingButton } from "./ClaraFloatingButton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationStarter {
  id: string;
  question: string;
  shortLabel: string;
}

// Map routes to tool slugs for context
const ROUTE_TO_TOOL: Record<string, string> = {
  "/dashboard/score-tributario": "score-tributario",
  "/calculadora/split-payment": "split-payment",
  "/calculadora/comparativo-regimes": "comparativo-regimes",
  "/calculadora/rtc": "calculadora-rtc",
  "/dashboard/importar-xmls": "importar-xmls",
  "/dashboard/radar-creditos": "radar-creditos",
  "/dashboard/dre": "dre",
  "/dashboard/oportunidades": "oportunidades",
  "/dashboard/tribubot": "tribubot",
  "/dashboard/noticias": "noticias",
  "/dashboard/timeline": "timeline",
  "/dashboard/painel-executivo": "painel-executivo",
  "/dashboard/perfil-empresa": "perfil-empresa",
};

// Mapeamento de planos legados
const LEGACY_PLAN_MAP: Record<string, string> = {
  'FREE': 'FREE',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

// Mensagens de boas-vindas por plano
const GETTING_STARTED_MESSAGES: Record<string, string> = {
  FREE: `Ótima pergunta! Vamos começar do jeito certo.

No plano Grátis, você tem acesso a ferramentas essenciais para dar seus primeiros passos na Reforma Tributária. Cada ferramenta pode ser usada 1 vez para você experimentar:

🎯 **Suas ferramentas disponíveis:**

- **Score Tributário** - Descubra o nível de complexidade tributária da sua empresa
- **Simulador Split Payment** - Entenda a nova forma automática de pagamento de impostos
- **Comparativo de Regimes** - Compare Simples Nacional, Lucro Presumido e Lucro Real
- **Calculadora RTC** - Simule como CBS, IBS e Imposto Seletivo impactam sua operação

💡 **Por onde começar?**

Recomendo fortemente o **Score Tributário**. Em poucos minutos, você terá:
- Um panorama claro da sua situação tributária atual
- Identificação dos principais riscos e oportunidades
- Orientação sobre quais ferramentas explorar em seguida

Quer que eu te guie passo a passo no preenchimento do Score Tributário? Ou prefere conhecer outra ferramenta primeiro?

⚠️ *Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.*`,

  NAVIGATOR: `Excelente! Você tem acesso completo ao GPS da Reforma Tributária. Vou te orientar na jornada ideal:

📍 **JORNADA RECOMENDADA:**

**FASE 1 - Entenda o Cenário** (comece aqui)
- **Timeline 2026-2033** - Visualize todos os prazos e etapas da Reforma que impactam você
- **Notícias da Reforma** - Mantenha-se atualizado com mudanças legislativas
- **Feed + Pílula do Dia** - Receba resumos diários das novidades mais importantes

*Tempo estimado: 30 minutos | Resultado: Visão clara do que está por vir*

**FASE 2 - Avalie sua Situação**
- **Score Tributário** - Identifique o nível de complexidade tributária da sua empresa
- **Comparativo de Regimes** - Valide se Simples, Lucro Presumido ou Real ainda será o melhor para você
- **Calculadora RTC** - Simule o impacto real de CBS, IBS e Imposto Seletivo na sua operação

*Tempo estimado: 1-1,5 hora | Resultado: Diagnóstico da sua situação atual*

**FASE 3 - Simule Impactos**
- **Simulador Split Payment** - Projete como o pagamento automático afetará seu fluxo de caixa
- **Calculadora de Serviços (NBS)** - Se você presta serviços, simule a nova tributação específica

*Tempo estimado: 45 minutos | Resultado: Projeção de impacto financeiro*

**FASE 4 - Tire Dúvidas Específicas**
- **Clara AI** (10 msgs/dia) - Use a IA para esclarecer dúvidas específicas durante suas análises

💡 **Minha recomendação de início:**

Dedique 1 hora para completar:
1. Timeline 2026-2033 (15 min)
2. Score Tributário (30 min)
3. Calculadora RTC (15 min)

Isso te dará uma base sólida para entender seu cenário e próximos passos.

Quer começar pela Timeline ou prefere ir direto ao Score Tributário? Posso te guiar em cada ferramenta passo a passo.

⚠️ *Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.*`,

  PROFESSIONAL: `Perfeito! Você tem a plataforma completa com diagnóstico automatizado e inteligência artificial ilimitada.

🚀 **WORKFLOWS GUIADOS + AUTOMAÇÃO COMPLETA:**

Você tem acesso a 4 Workflows Guiados - jornadas estruturadas que conectam diferentes ferramentas da plataforma de forma lógica e eficiente, como um roteiro personalizado para cada objetivo.

📋 **Seus Workflows (versão turbinada):**

**1. Diagnóstico Tributário Completo ⭐**
Análise automática e profunda com importação ilimitada de XMLs.
→ Importador de XMLs automatizado → Radar de Créditos → DRE Inteligente → Oportunidades Fiscais (37+)
*Diferencial: Processamento ilimitado de notas fiscais e análise contínua*

**2. Preparação para a Reforma**
Entenda impactos com seus dados reais, não apenas simulações.
→ Seus dados reais → Simulações personalizadas → Relatórios PDF profissionais
*Diferencial: Análise baseada em dados reais da sua operação*

**3. Análise de Contratos Societários**
Upload ilimitado para análise profunda de toda estrutura societária.
→ Analisador de Documentos com IA → Identificação automática de oportunidades
*Diferencial: IA analisa documentos sem limite de volume*

**4. Simulação de Preços**
Cálculo preciso com base nos seus XMLs reais de compra e venda.
→ Dados reais de operação → Split Payment real → Precificação otimizada
*Diferencial: Simulação com margem real, não teórica*

🎁 **EXCLUSIVIDADES DO PROFISSIONAL:**
✅ Importador de XMLs ilimitado
✅ Radar de Créditos Fiscais
✅ DRE Inteligente
✅ 37+ Oportunidades Fiscais
✅ Relatórios PDF Profissionais
✅ Clara AI ilimitada
✅ Comunidade exclusiva
✅ Alertas por Email

💡 **Quick Start Recomendado (90 minutos):**

**Passo 1:** Execute o Workflow 1 completo com seus XMLs reais (45 min)
**Passo 2:** Analise os resultados do Radar de Créditos e DRE Inteligente (30 min)
**Passo 3:** Execute o Workflow 2 com os insights obtidos (15 min)

*Resultado: Diagnóstico completo + plano de ação baseado na sua realidade.*

Por qual Workflow quer começar? Ou prefere que eu te ajude a importar seus XMLs primeiro?

⚠️ *Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.*`,

  ENTERPRISE: `Excelente escolha! Você tem a plataforma completa + acompanhamento especializado da Rebechi & Silva Advogados.

🎯 **TUDO DO PROFISSIONAL + CONSULTORIA ESTRATÉGICA:**

✅ **Você tem acesso a:**
- Todos os 4 Workflows Guiados (versão completa)
- Importador de XMLs, Radar de Créditos, DRE Inteligente
- 37+ Oportunidades Fiscais mapeadas
- Clara AI ilimitada + Comunidade
- Relatórios PDF Profissionais

🏆 **EXCLUSIVIDADES ENTERPRISE:**

**FASE 1 - Diagnóstico Estratégico com Especialista**
✅ Diagnóstico completo personalizado - Advogado tributarista analisa sua situação específica
✅ Painel Executivo - Dashboard com KPIs tributários em tempo real
✅ Análise por CNPJ - Simulações considerando todas as particularidades da sua empresa

**FASE 2 - Acompanhamento Contínuo**
✅ Reuniões mensais estratégicas - Alinhamento periódico com especialista dedicado
✅ Consultorias ilimitadas - Acesso direto aos advogados tributaristas sempre que precisar
✅ Suporte prioritário - Atendimento preferencial em todas as demandas

**FASE 3 - Implementação Assistida**
✅ Implementação guiada - Apoio prático na execução das estratégias definidas
✅ Histórico completo - Rastreabilidade de todas as análises, decisões e recomendações
✅ Configurações personalizadas - Plataforma ajustada às necessidades específicas do seu negócio

💡 **Próximos Passos Recomendados:**

**Agora:**
1. Acesse **Enterprise > Consultorias** e agende sua primeira reunião de diagnóstico
2. Enquanto aguarda, execute o Workflow 1 e importe seus XMLs
3. Acesse o **Painel Executivo** para visualizar seus indicadores em tempo real

**Na primeira reunião:**
- Apresentaremos análise preliminar com base nos dados da plataforma
- Definiremos estratégia personalizada para sua empresa
- Estabeleceremos cronograma de implementação e próximos encontros

📞 **Quer agendar sua reunião de diagnóstico agora?**

Entre em contato pelo menu **Enterprise > Consultorias** ou me avise que direciono você para o time da Rebechi & Silva.

Posso te ajudar a preparar os dados para a consultoria? Ou prefere que eu explique alguma ferramenta específica da plataforma?

✨ *Lembre-se: No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas. Use esse benefício sem moderação para maximizar seus resultados.*`
};

export function FloatingAssistant() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [starters, setStarters] = useState<ConversationStarter[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isGettingStarted, setIsGettingStarted] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useClaraShortcut();

  // Voice hooks
  const { 
    transcript, 
    isListening, 
    isSupported: isSpeechRecognitionSupported,
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();
  
  const { 
    speak, 
    stop: stopSpeaking, 
    isSpeaking,
    isSupported: isSpeechSynthesisSupported 
  } = useSpeechSynthesis();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-send when speech recognition ends with text
  useEffect(() => {
    if (!isListening && transcript && transcript.trim().length > 0) {
      // Small delay to ensure transcript is complete
      const timer = setTimeout(() => {
        sendMessage(transcript.trim());
        resetTranscript();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript]);

  // Listen for external events to open Clara with a question
  useEffect(() => {
    const handleOpenWithQuestion = (e: CustomEvent<{ question: string }>) => {
      setPendingQuestion(e.detail.question);
      setIsOpen(true);
    };

    // Listen for "Por onde eu começo?" button
    const handleOpenWithWelcome = (e: CustomEvent<{ type: string }>) => {
      if (e.detail.type === 'getting-started') {
        setIsGettingStarted(true);
        setMessages([]);
        setHasGreeted(false);
        setIsOpen(true);
      }
    };

    // Listen for "Abrir chat livre" button
    const handleOpenFreeChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('openClaraWithQuestion', handleOpenWithQuestion as EventListener);
    window.addEventListener('openClaraWithWelcome', handleOpenWithWelcome as EventListener);
    window.addEventListener('openClaraFreeChat', handleOpenFreeChat as EventListener);
    return () => {
      window.removeEventListener('openClaraWithQuestion', handleOpenWithQuestion as EventListener);
      window.removeEventListener('openClaraWithWelcome', handleOpenWithWelcome as EventListener);
      window.removeEventListener('openClaraFreeChat', handleOpenFreeChat as EventListener);
    };
  }, []);

  // Send pending question after greeting
  useEffect(() => {
    if (pendingQuestion && hasGreeted && !isLoading && messages.length === 1) {
      const question = pendingQuestion;
      setPendingQuestion(null);
      // Small delay to allow UI to render
      setTimeout(() => sendMessage(question), 300);
    }
  }, [pendingQuestion, hasGreeted, isLoading, messages.length]);

  // Fetch conversation starters on mount
  useEffect(() => {
    const fetchStarters = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("clara-assistant", {
          body: { getStarters: true },
        });
        if (!error && data?.starters) {
          setStarters(data.starters);
        }
      } catch (e) {
        console.error("Error fetching starters:", e);
      }
    };
    fetchStarters();
  }, []);

  // Detect current tool from route
  useEffect(() => {
    const toolSlug = ROUTE_TO_TOOL[location.pathname] || null;
    
    // Reset when changing tools
    if (toolSlug !== currentTool) {
      setCurrentTool(toolSlug);
      setMessages([]);
      setHasGreeted(false);
    }
  }, [location.pathname, currentTool]);

  // Auto-greet when opening (or show getting-started message)
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      if (isGettingStarted) {
        showGettingStartedMessage();
      } else {
        fetchGreeting();
      }
    }
  }, [isOpen, hasGreeted, messages.length, isGettingStarted]);

  // Focus input after messages load
  useEffect(() => {
    if (isOpen && hasGreeted && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, hasGreeted, isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      // ScrollArea uses a viewport inside, need to scroll that
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Auto-speak assistant messages
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !isLoading) {
        speak(lastMessage.content);
      }
    }
  }, [messages, autoSpeak, isLoading]);

  // Show personalized getting started message based on plan
  const showGettingStartedMessage = () => {
    const rawPlan = profile?.plano || 'FREE';
    const currentPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';
    const message = GETTING_STARTED_MESSAGES[currentPlan] || GETTING_STARTED_MESSAGES.FREE;
    
    setMessages([{ role: "assistant", content: message }]);
    setHasGreeted(true);
    setIsGettingStarted(false);
  };

  const fetchGreeting = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("clara-assistant", {
        body: { 
          messages: [], 
          toolSlug: currentTool,
          isGreeting: true 
        },
      });

      if (error) throw error;

      setMessages([{ role: "assistant", content: data.message }]);
      setHasGreeted(true);
    } catch (error) {
      console.error("Greeting error:", error);
      // Fallback greeting
      setMessages([{ 
        role: "assistant", 
        content: `Olá! Sou a **Clara**, sua consultora especializada em Reforma Tributária. 👋\n\nPosso te ajudar com dúvidas sobre a reforma, impostos, cronograma ou qualquer ferramenta do GPS Tributário. Como posso ajudar?` 
      }]);
      setHasGreeted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle slash commands
  const handleSlashCommand = useCallback(async (command: string): Promise<string | null> => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === "/resumo" || cmd === "/summary") {
      setIsProcessingCommand(true);
      try {
        const { data, error } = await supabase.functions.invoke("generate-executive-report", {
          body: { format: "text" },
        });
        
        if (error) throw error;
        
        return data?.summary || "Não foi possível gerar o resumo executivo. Verifique se você tem dados de DRE, Score ou XMLs na plataforma.";
      } catch (err) {
        console.error("Error generating summary:", err);
        return "Erro ao gerar resumo. Tente novamente em alguns instantes.";
      } finally {
        setIsProcessingCommand(false);
      }
    }
    
    if (cmd === "/ajuda" || cmd === "/help") {
      return `**Comandos disponíveis:**

- \`/resumo\` - Gera um resumo executivo da sua situação tributária
- \`/ajuda\` - Mostra esta lista de comandos

**Atalho de teclado:**
- \`Cmd+K\` ou \`Ctrl+K\` - Abre a Clara rapidamente

Você também pode me fazer qualquer pergunta sobre a Reforma Tributária!`;
    }
    
    return null; // Not a command
  }, []);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Check for slash commands first
      if (userMessage.startsWith("/")) {
        const commandResponse = await handleSlashCommand(userMessage);
        if (commandResponse) {
          setMessages(prev => [...prev, { role: "assistant", content: commandResponse }]);
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("clara-assistant", {
        body: { 
          messages: [...messages, { role: "user", content: userMessage }],
          toolSlug: currentTool,
          isGreeting: false
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Muitas requisições. Aguarde um momento.");
        } else if (error.message?.includes("401")) {
          toast.error("Faça login para usar a Clara.");
        } else {
          throw error;
        }
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Message error:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStarterClick = (starter: ConversationStarter) => {
    sendMessage(starter.question);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      setAutoSpeak(!autoSpeak);
      if (!autoSpeak && messages.length > 0) {
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
        if (lastAssistantMessage) {
          speak(lastAssistantMessage.content);
        }
      }
    }
  };

  const showStarters = messages.length === 1 && hasGreeted && !isLoading;
  const hasVoiceSupport = isSpeechRecognitionSupported || isSpeechSynthesisSupported;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Card */}
      <div
        className={`absolute bottom-20 right-0 w-80 md:w-[420px] transition-all duration-300 ease-out ${
          isOpen 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <Card className="shadow-2xl border-primary/20 overflow-hidden">
          <CardHeader className="p-3 border-b border-border flex flex-row items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
              <Sparkles className={`w-5 h-5 text-primary-foreground transition-transform duration-500 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">Clara</h3>
              <p className="text-xs text-muted-foreground">Especialista em Reforma Tributária</p>
            </div>
            
            {/* Voice controls */}
            {hasVoiceSupport && (
              <div className="flex gap-1">
                {isSpeechSynthesisSupported && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 transition-colors duration-200 ${autoSpeak || isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={handleSpeakToggle}
                    title={isSpeaking ? "Parar leitura" : autoSpeak ? "Desativar leitura automática" : "Ativar leitura automática"}
                  >
                    {isSpeaking || autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:rotate-90 transition-transform duration-200" 
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-80 p-3 [&_[data-radix-scroll-area-viewport]]:!overflow-y-auto" ref={scrollRef as React.RefObject<HTMLDivElement>}>
              <div className="space-y-3">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground text-sm py-8 animate-fade-in">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p>Olá! Sou a Clara.</p>
                    <p className="text-xs">Especialista em Reforma Tributária</p>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:shadow-md ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&_strong]:font-semibold">
                          <ReactMarkdown skipHtml>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {/* Conversation Starters */}
                {showStarters && starters.length > 0 && (
                  <div className="pt-2 animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2">Perguntas frequentes:</p>
                    <div className="flex flex-wrap gap-2">
                      {starters.map((starter, i) => (
                        <button
                          key={starter.id}
                          onClick={() => handleStarterClick(starter)}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all duration-200 text-left"
                          style={{ animationDelay: `${i * 75}ms` }}
                        >
                          {starter.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder={isListening ? "Escutando..." : "Pergunte ou use /ajuda..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || isListening || isProcessingCommand}
                  className={`text-sm transition-all duration-300 ${isListening ? 'border-primary ring-2 ring-primary/30' : ''}`}
                />
                
                {/* Microphone button */}
                {isSpeechRecognitionSupported && (
                  <Button 
                    size="icon" 
                    variant={isListening ? "default" : "outline"}
                    onClick={handleVoiceToggle}
                    disabled={isLoading}
                    className={`shrink-0 transition-all duration-200 ${isListening ? 'bg-destructive hover:bg-destructive/90 scale-110' : 'hover:scale-105'}`}
                    title={isListening ? "Parar gravação" : "Falar com a Clara"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                
                <Button 
                  size="icon" 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Voice status indicator */}
              {isListening && (
                <p className="text-xs text-primary mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                  Escutando... Fale sua pergunta
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Button */}
      <ClaraFloatingButton
        isOpen={isOpen}
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
      />
    </div>
  );
}
