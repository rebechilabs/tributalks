import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useClaraShortcut } from "@/hooks/useKeyboardShortcuts";
import { useClaraContext, formatContextForAPI } from "@/hooks/useClaraContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useAuth } from "@/hooks/useAuth";
import { ClaraFloatingButton } from "./ClaraFloatingButton";
import { ClaraOnboardingTooltip } from "./ClaraProactive";
import { ClaraActionsDrawer } from "@/components/clara/ClaraActionsDrawer";
import { useClaraAutonomousActions } from "@/hooks/clara";
import { ClaraSidePanel, type ChatAttachment } from "./ClaraSidePanel";

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string | null;
  attachments?: { url: string; name: string; type: string }[];
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
  "/dashboard/planejar/oportunidades": "oportunidades",
  "/clara-ai": "clara_ai",
  "/dashboard/noticias": "noticias",
  "/dashboard/timeline": "timeline",
  "/dashboard/painel-executivo": "painel-executivo",
  "/dashboard/perfil-empresa": "perfil-empresa",
};

// Mapeamento de planos legados
const LEGACY_PLAN_MAP: Record<string, string> = {
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

// Mensagens de boas-vindas por plano
const GETTING_STARTED_MESSAGES: Record<string, string> = {
  STARTER: `Ótima pergunta! Vamos começar do jeito certo.

No plano Starter, você tem acesso a ferramentas essenciais para dar seus primeiros passos na Reforma Tributária:

**Suas ferramentas disponíveis:**

- **Score Tributário** - Descubra o nível de complexidade tributária da sua empresa
- **Simulador Split Payment** - Entenda a nova forma automática de pagamento de impostos
- **Comparativo de Regimes** - Compare Simples Nacional, Lucro Presumido e Lucro Real
- **Calculadora RTC** - Simule como CBS, IBS e Imposto Seletivo impactam sua operação

**Por onde começar?**

Recomendo fortemente o **Score Tributário**. Em poucos minutos, você terá:
- Um panorama claro da sua situação tributária atual
- Identificação dos principais riscos e oportunidades
- Orientação sobre quais ferramentas explorar em seguida

Quer que eu te guie passo a passo no preenchimento do Score Tributário? Ou prefere conhecer outra ferramenta primeiro?

> *Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.*`,

  NAVIGATOR: `Excelente! Você tem acesso completo ao TribuTalks Inteligência Tributária. Vou te orientar na jornada ideal:

**JORNADA RECOMENDADA:**

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

**Minha recomendação de início:**

Dedique 1 hora para completar:
1. Timeline 2026-2033 (15 min)
2. Score Tributário (30 min)
3. Calculadora RTC (15 min)

Isso te dará uma base sólida para entender seu cenário e próximos passos.

Quer começar pela Timeline ou prefere ir direto ao Score Tributário? Posso te guiar em cada ferramenta passo a passo.

> *Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.*`,

  PROFESSIONAL: `Perfeito! Você tem a plataforma completa com diagnóstico automatizado e inteligência artificial ilimitada.

**WORKFLOWS GUIADOS + AUTOMAÇÃO COMPLETA:**

Você tem acesso a 4 Workflows Guiados - jornadas estruturadas que conectam diferentes ferramentas da plataforma de forma lógica e eficiente, como um roteiro personalizado para cada objetivo.

**Seus Workflows (versão turbinada):**

**1. Diagnóstico Tributário Completo** *(destaque)*
Análise automática e profunda com importação ilimitada de XMLs.
→ Importador de XMLs automatizado → Radar de Créditos → DRE Inteligente → Oportunidades Tributárias (37+)
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

**EXCLUSIVIDADES DO PROFISSIONAL:**
- Importador de XMLs ilimitado
- Radar de Créditos Fiscais
- DRE Inteligente
- 37+ Oportunidades Tributárias
- Relatórios PDF Profissionais
- Clara AI ilimitada
- Comunidade exclusiva
- Alertas por Email

**Quick Start Recomendado (90 minutos):**

**Passo 1:** Execute o Workflow 1 completo com seus XMLs reais (45 min)
**Passo 2:** Analise os resultados do Radar de Créditos e DRE Inteligente (30 min)
**Passo 3:** Execute o Workflow 2 com os insights obtidos (15 min)

*Resultado: Diagnóstico completo + plano de ação baseado na sua realidade.*

Por qual Workflow quer começar? Ou prefere que eu te ajude a importar seus XMLs primeiro?

> *Lembre-se: antes de implementar qualquer estratégia tributária em sua empresa, converse com seu contador ou advogado tributarista para avaliar sua situação específica.*`,

  ENTERPRISE: `Excelente escolha! Você tem a plataforma completa + acompanhamento especializado da Rebechi & Silva Advogados.

**TUDO DO PROFISSIONAL + CONSULTORIA ESTRATÉGICA:**

**Você tem acesso a:**
- Todos os 4 Workflows Guiados (versão completa)
- Importador de XMLs, Radar de Créditos, DRE Inteligente
- 37+ Oportunidades Tributárias mapeadas
- Clara AI ilimitada + Comunidade
- Relatórios PDF Profissionais

**EXCLUSIVIDADES ENTERPRISE:**

**FASE 1 - Diagnóstico Estratégico com Especialista**
- Diagnóstico completo personalizado - Advogado tributarista analisa sua situação específica
- Painel Executivo - Dashboard com KPIs tributários em tempo real
- Análise por CNPJ - Simulações considerando todas as particularidades da sua empresa

**FASE 2 - Acompanhamento Contínuo**
- Reuniões mensais estratégicas - Alinhamento periódico com especialista dedicado
- Consultorias ilimitadas - Acesso direto aos advogados tributaristas sempre que precisar
- Suporte prioritário - Atendimento preferencial em todas as demandas

**FASE 3 - Implementação Assistida**
- Implementação guiada - Apoio prático na execução das estratégias definidas
- Histórico completo - Rastreabilidade de todas as análises, decisões e recomendações
- Configurações personalizadas - Plataforma ajustada às necessidades específicas do seu negócio

**Próximos Passos Recomendados:**

**Agora:**
1. Acesse **Enterprise > Consultorias** e agende sua primeira reunião de diagnóstico
2. Enquanto aguarda, execute o Workflow 1 e importe seus XMLs
3. Acesse o **Painel Executivo** para visualizar seus indicadores em tempo real

**Na primeira reunião:**
- Apresentaremos análise preliminar com base nos dados da plataforma
- Definiremos estratégia personalizada para sua empresa
- Estabeleceremos cronograma de implementação e próximos encontros

**Quer agendar sua reunião de diagnóstico agora?**

Entre em contato pelo menu **Enterprise > Consultorias** ou me avise que direciono você para o time da Rebechi & Silva.

Posso te ajudar a preparar os dados para a consultoria? Ou prefere que eu explique alguma ferramenta específica da plataforma?

> *No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas. Use esse benefício sem moderação para maximizar seus resultados.*`
};

export function FloatingAssistant() {
  const { profile } = useAuth();
  const { context: claraContext, trackAction, trackResult } = useClaraContext();
  const { pendingCount } = useClaraAutonomousActions();
  const [isOpen, setIsOpen] = useState(false);
  const [isActionsDrawerOpen, setIsActionsDrawerOpen] = useState(false);
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

  // Focus and scroll are now handled by ClaraSidePanel

  // Scroll handled by ClaraSidePanel

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
    const rawPlan = profile?.plano || 'STARTER';
    const currentPlan = LEGACY_PLAN_MAP[rawPlan] || 'STARTER';
    const message = GETTING_STARTED_MESSAGES[currentPlan] || GETTING_STARTED_MESSAGES.STARTER;
    
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
        content: `Olá! Sou a **Clara**, sua consultora especializada em Reforma Tributária.\n\nPosso te ajudar com dúvidas sobre a reforma, impostos, cronograma ou qualquer ferramenta do TribuTalks. Como posso ajudar?` 
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

  const sendMessage = async (messageText?: string, attachments?: ChatAttachment[]) => {
    const userMessage = messageText || input.trim();
    if ((!userMessage && (!attachments || attachments.length === 0)) || isLoading) return;

    setInput("");
    
    // Upload attachments if any
    let uploadedAttachments: { url: string; name: string; type: string }[] = [];
    if (attachments && attachments.length > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Faça login para enviar arquivos.");
          return;
        }

        for (const att of attachments) {
          const filePath = `${user.id}/${Date.now()}_${att.name}`;
          const { error: uploadError } = await supabase.storage
            .from("clara-attachments")
            .upload(filePath, att.file);
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("clara-attachments")
            .getPublicUrl(filePath);

          uploadedAttachments.push({
            url: urlData.publicUrl,
            name: att.name,
            type: att.type,
          });
        }
      } catch (err) {
        console.error("Error uploading attachments:", err);
        toast.error("Erro ao enviar arquivos.");
      }
    }

    const displayMessage = userMessage || `📎 ${uploadedAttachments.map(a => a.name).join(", ")}`;
    setMessages(prev => [...prev, { 
      role: "user", 
      content: displayMessage, 
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined 
    }]);
    setIsLoading(true);

    try {
      // Check for slash commands first
      if (userMessage && userMessage.startsWith("/")) {
        const commandResponse = await handleSlashCommand(userMessage);
        if (commandResponse) {
          setMessages(prev => [...prev, { role: "assistant", content: commandResponse }]);
          setIsLoading(false);
          return;
        }
      }

      // Build message content with attachment info
      let messageContent = userMessage || "";
      if (uploadedAttachments.length > 0) {
        const attachmentInfo = uploadedAttachments.map(a => 
          `[Arquivo anexado: ${a.name} (${a.type}) - ${a.url}]`
        ).join("\n");
        messageContent = messageContent 
          ? `${messageContent}\n\n${attachmentInfo}` 
          : attachmentInfo;
      }

      const { data, error } = await supabase.functions.invoke("clara-assistant", {
        body: { 
          messages: [...messages, { role: "user", content: messageContent }],
          toolSlug: currentTool,
          isGreeting: false,
          navigationContext: formatContextForAPI(claraContext),
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
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

      setMessages(prev => [...prev, { role: "assistant", content: data.message, agent: data.agent || null }]);
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


  return (
    <>
      {/* Side Panel */}
      <ClaraSidePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSend={sendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
        hasGreeted={hasGreeted}
        isListening={isListening}
        isSpeechRecognitionSupported={isSpeechRecognitionSupported}
        isSpeechSynthesisSupported={isSpeechSynthesisSupported}
        autoSpeak={autoSpeak}
        isSpeaking={isSpeaking}
        onVoiceToggle={handleVoiceToggle}
        onSpeakToggle={handleSpeakToggle}
        starters={starters}
        onStarterClick={handleStarterClick}
        isProcessingCommand={isProcessingCommand}
        onCommand={(cmd) => handleSlashCommand(`/${cmd}`)}
      />

      {/* Onboarding Tooltip */}
      <ClaraOnboardingTooltip />

      {/* Actions Drawer */}
      <ClaraActionsDrawer 
        isOpen={isActionsDrawerOpen} 
        onClose={() => setIsActionsDrawerOpen(false)} 
      />

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ClaraFloatingButton
          isOpen={isOpen}
          onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
          pendingActionsCount={pendingCount}
          onActionsClick={() => setIsActionsDrawerOpen(true)}
        />
      </div>
    </>
  );
}
