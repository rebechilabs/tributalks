import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { ClaraAgentTag } from "./ClaraAgentTag";
import { ClaraContextualSuggestions } from "./ClaraContextualSuggestions";
import { ClaraActionButtons } from "./ClaraActionButton";
import { AntiCopyGuard } from "./AntiCopyGuard";

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string | null;
}

interface ClaraSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: (message?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  hasGreeted: boolean;
  // Voice
  isListening?: boolean;
  isSpeechRecognitionSupported?: boolean;
  isSpeechSynthesisSupported?: boolean;
  autoSpeak?: boolean;
  isSpeaking?: boolean;
  onVoiceToggle?: () => void;
  onSpeakToggle?: () => void;
  // Starters
  starters?: { id: string; shortLabel: string; question: string }[];
  onStarterClick?: (starter: { question: string }) => void;
  // Processing
  isProcessingCommand?: boolean;
  // Command handler for action buttons
  onCommand?: (command: string) => void;
}

export function ClaraSidePanel({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSend,
  onKeyPress,
  isLoading,
  hasGreeted,
  isListening = false,
  isSpeechRecognitionSupported = false,
  isSpeechSynthesisSupported = false,
  autoSpeak = false,
  isSpeaking = false,
  onVoiceToggle,
  onSpeakToggle,
  starters = [],
  onStarterClick,
  isProcessingCommand = false,
  onCommand,
}: ClaraSidePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Focus input when open
  useEffect(() => {
    if (isOpen && hasGreeted && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, hasGreeted, isLoading]);

  const showStarters = messages.length === 1 && hasGreeted && !isLoading;
  const hasVoiceSupport = isSpeechRecognitionSupported || isSpeechSynthesisSupported;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[380px] z-[60] bg-background border-l border-border shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">Clara</h3>
              <p className="text-xs text-muted-foreground">Inteligência Tributária AI-First</p>
            </div>

            {hasVoiceSupport && (
              <div className="flex gap-1">
                {isSpeechSynthesisSupported && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${autoSpeak || isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={onSpeakToggle}
                  >
                    {isSpeaking || autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Contextual Suggestions */}
          <ClaraContextualSuggestions onSuggestionClick={(s) => onSend(s)} />

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 [&_[data-radix-scroll-area-viewport]]:!overflow-y-auto" ref={scrollRef as React.RefObject<HTMLDivElement>}>
            <div className="space-y-3">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                  <p>Olá! Sou a Clara.</p>
                  <p className="text-xs">Inteligência Tributária AI-First</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Agent tag above assistant messages */}
                  {msg.role === "assistant" && msg.agent && (
                    <div className="mb-1">
                      <ClaraAgentTag agent={msg.agent} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <AntiCopyGuard>
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&_strong]:font-semibold">
                          <ReactMarkdown skipHtml>{msg.content}</ReactMarkdown>
                        </div>
                      </AntiCopyGuard>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {/* Action buttons for assistant messages */}
                  {msg.role === "assistant" && (
                    <ClaraActionButtons content={msg.content} onCommand={onCommand} />
                  )}
                </div>
              ))}

              {/* Starters */}
              {showStarters && starters.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Perguntas frequentes:</p>
                  <div className="flex flex-wrap gap-2">
                    {starters.map((starter) => (
                      <button
                        key={starter.id}
                        onClick={() => onStarterClick?.(starter)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all text-left"
                      >
                        {starter.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder={isListening ? "Escutando..." : "Pergunte ou use /ajuda..."}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={onKeyPress}
                disabled={isLoading || isListening || isProcessingCommand}
                className={`text-sm ${isListening ? 'border-primary ring-2 ring-primary/30' : ''}`}
              />
              {isSpeechRecognitionSupported && (
                <Button
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={onVoiceToggle}
                  disabled={isLoading}
                  className={`shrink-0 ${isListening ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <Button
                size="icon"
                onClick={() => onSend()}
                disabled={!input.trim() || isLoading}
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {isListening && (
              <p className="text-xs text-primary mt-2 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                </span>
                Escutando... Fale sua pergunta
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
