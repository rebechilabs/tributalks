import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Sparkles, Send, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
- **TribuBot** (10 msgs/dia) - Use a IA para esclarecer dúvidas específicas durante suas análises

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
✅ TribuBot ilimitado
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
- TribuBot ilimitado + Comunidade
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

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

    window.addEventListener('openClaraWithQuestion', handleOpenWithQuestion as EventListener);
    window.addEventListener('openClaraWithWelcome', handleOpenWithWelcome as EventListener);
    return () => {
      window.removeEventListener('openClaraWithQuestion', handleOpenWithQuestion as EventListener);
      window.removeEventListener('openClaraWithWelcome', handleOpenWithWelcome as EventListener);
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
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
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-[420px] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <CardHeader className="p-3 border-b border-border flex flex-row items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
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
                    className={`h-8 w-8 ${autoSpeak || isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={handleSpeakToggle}
                    title={isSpeaking ? "Parar leitura" : autoSpeak ? "Desativar leitura automática" : "Ativar leitura automática"}
                  >
                    {isSpeaking || autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            )}
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-80 p-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Olá! Sou a Clara.</p>
                    <p className="text-xs">Especialista em Reforma Tributária</p>
                  </div>
                )}
                
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {/* Conversation Starters */}
                {showStarters && starters.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Perguntas frequentes:</p>
                    <div className="flex flex-wrap gap-2">
                      {starters.map((starter) => (
                        <button
                          key={starter.id}
                          onClick={() => handleStarterClick(starter)}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-left"
                        >
                          {starter.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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
                  placeholder={isListening ? "Escutando..." : "Pergunte sobre a Reforma Tributária..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || isListening}
                  className={`text-sm ${isListening ? 'border-primary animate-pulse' : ''}`}
                />
                
                {/* Microphone button */}
                {isSpeechRecognitionSupported && (
                  <Button 
                    size="icon" 
                    variant={isListening ? "default" : "outline"}
                    onClick={handleVoiceToggle}
                    disabled={isLoading}
                    className={`shrink-0 ${isListening ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                    title={isListening ? "Parar gravação" : "Falar com a Clara"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                
                <Button 
                  size="icon" 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Voice status indicator */}
              {isListening && (
                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  Escutando... Fale sua pergunta
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button with tooltip */}
      <div className="relative">
        {/* Tooltip bubble */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-card border border-primary/30 rounded-lg px-4 py-2 shadow-lg whitespace-nowrap">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Tire suas dúvidas aqui!
              </p>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-primary/30" />
          </div>
        )}

        <Button
          size="lg"
          className={`rounded-full w-14 h-14 shadow-lg transition-all ${
            isOpen 
              ? "bg-muted hover:bg-muted text-muted-foreground" 
              : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          }`}
          onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </Button>

        {/* Pulse indicator when closed */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
