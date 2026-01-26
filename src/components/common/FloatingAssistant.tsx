import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup Card */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">TribuBot</h3>
                <p className="text-sm text-muted-foreground">
                  Olá! Precisa de ajuda para preencher algum campo ou entender os cálculos?
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Link to="/dashboard/tribubot" onClick={() => setIsOpen(false)}>
                <Button className="w-full gap-2" size="sm">
                  <Sparkles className="w-4 h-4" />
                  Abrir TribuBot
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Tire dúvidas sobre tributação, reforma e cálculos
              </p>
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
            : "bg-primary hover:bg-primary/90"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      {/* Pulse indicator when closed */}
      {!isOpen && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
