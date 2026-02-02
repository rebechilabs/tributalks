import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Lock, Sparkles, Send, Loader2, User, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { CreditDisplay } from "@/components/credits/CreditDisplay";
import { useUserCredits } from "@/hooks/useUserCredits";
import { ClaraFeedbackButtons } from "@/components/clara";

interface Message {
  role: "user" | "assistant";
  content: string;
  userMessage?: string; // Para rastrear a pergunta que gerou esta resposta
}

const SUGGESTIONS = [
  "Como funciona o split payment?",
  "Posso mudar de regime no meio do ano?",
  "O que é uma holding familiar?",
  "Qual a diferença entre Presumido e Real?",
];

const ClaraAI = () => {
  const { profile, user } = useAuth();
  const { credits, consumeCredit, refetch: refetchCredits } = useUserCredits();
  const balance = credits?.balance ?? 0;
  const currentPlan = profile?.plano || "FREE";
  const hasAccess = currentPlan !== "FREE";
  const isUnlimited = ["PROFISSIONAL", "PREMIUM", "ENTERPRISE"].includes(currentPlan);
  const isNavigator = currentPlan === "BASICO";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá! Sou a **Clara AI**, sua consultora tributária virtual. ✨

Posso ajudar com dúvidas sobre:
- Regimes tributários (Simples, Presumido, Real)
- Split Payment e reforma tributária
- PIS, COFINS, IRPJ, CSLL
- Planejamento tributário

Como posso te ajudar hoje?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch daily message count for BASICO plan
  useEffect(() => {
    const fetchDailyCount = async () => {
      if (!user || isUnlimited) return;
      
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("tributbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`);
      
      setDailyCount(count || 0);
    };

    fetchDailyCount();
  }, [user, isUnlimited, messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2].role === "user") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clara-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Erro ao processar mensagem");
      }

      // Check content type to handle both JSON and SSE streaming responses
      const contentType = resp.headers.get("content-type");
      
      // Handle standard JSON response (non-streaming)
      if (contentType?.includes("application/json")) {
        const data = await resp.json();
        if (data.message) {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: data.message 
          }]);
        }
        setDailyCount(prev => prev + 1);
        setIsLoading(false);
        return;
      }

      // Handle SSE streaming response
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Handle remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }

      setDailyCount((prev) => prev + 1);
    } catch (error) {
      console.error("Clara AI error:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem",
        variant: "destructive",
      });
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for bold and lists
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^- (.*)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, "<ul class='list-disc list-inside space-y-1 my-2'>$&</ul>")
      .replace(/\n/g, "<br/>");
    
    // Sanitize HTML to prevent XSS attacks
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['strong', 'ul', 'li', 'br'],
      ALLOWED_ATTR: ['class'],
    });
    
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  };

  if (!hasAccess) {
    return (
      <DashboardLayout title="Clara AI">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Clara AI — IA 24/7
              </h2>
              <p className="text-muted-foreground mb-6">
                Tire dúvidas tributárias em linguagem simples, a qualquer hora.
                Disponível a partir do plano Básico.
              </p>
              <Link to="/#planos">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Fazer upgrade
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clara AI">
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Clara AI</h1>
                <p className="text-xs text-muted-foreground">Sua consultora tributária com IA</p>
              </div>
            </div>
            
            {/* Credit display for Navigator plan */}
            {isNavigator && (
              <CreditDisplay variant="compact" />
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted/50 text-foreground rounded-tl-sm"
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === "assistant" && (
                    <Bot className="w-4 h-4 mt-1 shrink-0 text-primary" />
                  )}
                  <div className="text-sm leading-relaxed">
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                  {msg.role === "user" && (
                    <User className="w-4 h-4 mt-1 shrink-0" />
                  )}
                </div>
                {/* Feedback buttons for assistant messages (skip the first greeting) */}
                {msg.role === "assistant" && i > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <ClaraFeedbackButtons
                      messageContent={messages[i - 1]?.content || ""}
                      responseContent={msg.content}
                      contextScreen="clara-ai"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 sm:px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">💡 Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 sm:px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Rate limit info for Navigator */}
          {isNavigator && (
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>Hoje: {dailyCount}/10</span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {balance} extra{balance !== 1 ? "s" : ""}
                </span>
              </div>
              <Link to="/#planos" className="text-primary hover:underline">
                Upgrade ilimitado
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClaraAI;
