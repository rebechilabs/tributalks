import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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

  // Auto-greet when opening on a tool page
  useEffect(() => {
    if (isOpen && currentTool && !hasGreeted && messages.length === 0) {
      fetchGreeting();
    }
  }, [isOpen, currentTool, hasGreeted, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      const toolName = currentTool?.replace(/-/g, " ") || "ferramenta";
      setMessages([{ 
        role: "assistant", 
        content: `Olá! Sou a Clara, assistente da Tributech. 👋 Posso te ajudar a usar ${toolName}? Me pergunte qualquer coisa!` 
      }]);
      setHasGreeted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
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

  const handleOpen = () => {
    setIsOpen(true);
    // If opening for first time on a tool and no messages, greeting will trigger via useEffect
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Card */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <CardHeader className="p-3 border-b border-border flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">Clara</h3>
              <p className="text-xs text-muted-foreground">Assistente Tributech</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-64 p-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Olá! Sou a Clara.</p>
                    <p className="text-xs">Como posso ajudar?</p>
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
                      {msg.content}
                    </div>
                  </div>
                ))}

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
                  placeholder="Digite sua dúvida..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button 
                  size="icon" 
                  onClick={sendMessage} 
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
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
  );
}
