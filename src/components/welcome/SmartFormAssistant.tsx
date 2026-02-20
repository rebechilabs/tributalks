import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export interface PrefillField {
  key: string;
  label: string;
  value: any;
  source: "profile" | "dre" | "credits" | "memory" | "manual";
  confidence: "high" | "medium" | "low";
  editable?: boolean;
  sourceLabel?: string;
}

export interface MissingField {
  key: string;
  label: string;
  required?: boolean;
}

interface SmartFormAssistantProps {
  toolId: string;
  prefillData: PrefillField[];
  missingFields: MissingField[];
  onFieldFocus?: (fieldName: string) => void;
  contextualTip?: string;
}

function AssistantContent({
  prefillData,
  missingFields,
  contextualTip,
}: {
  prefillData: PrefillField[];
  missingFields: MissingField[];
  contextualTip?: string;
}) {
  const filledCount = prefillData.length;
  const missingCount = missingFields.filter((f) => f.required).length;

  return (
    <div className="space-y-4">
      {/* Campos preenchidos */}
      {filledCount > 0 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium text-sm">
              {filledCount} {filledCount === 1 ? "campo preenchido" : "campos preenchidos"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {prefillData.slice(0, 5).map((field) => (
              <Badge
                key={field.key}
                variant="secondary"
                className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
              >
                {field.label}
              </Badge>
            ))}
            {filledCount > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{filledCount - 5}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Campos faltando */}
      {missingCount > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium text-sm">
              {missingCount} {missingCount === 1 ? "campo necessário" : "campos necessários"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {missingFields
              .filter((f) => f.required)
              .slice(0, 3)
              .map((field) => (
                <Badge
                  key={field.key}
                  variant="outline"
                  className="text-xs border-amber-300 dark:border-amber-700"
                >
                  {field.label}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Dica contextual */}
      {contextualTip && (
        <div className="text-sm text-muted-foreground flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>{contextualTip}</span>
        </div>
      )}

      {/* Mensagem padrão se não há nada para mostrar */}
      {filledCount === 0 && missingCount === 0 && !contextualTip && (
        <p className="text-sm text-muted-foreground">
          💡 Estou aqui para ajudar! Me pergunte qualquer dúvida sobre os
          campos.
        </p>
      )}
    </div>
  );
}

export function SmartFormAssistant({
  toolId,
  prefillData,
  missingFields,
  onFieldFocus,
  contextualTip,
}: SmartFormAssistantProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [hasShownInitial, setHasShownInitial] = useState(false);

  const hasMissingRequired = missingFields.some(f => f.required);

  // Só mostra automaticamente se há campos faltando
  useEffect(() => {
    if (hasMissingRequired && !hasShownInitial) {
      setShowCard(true);
      setHasShownInitial(true);
      
      // Auto-hide após 10 segundos em desktop
      if (!isMobile) {
        const timer = setTimeout(() => setShowCard(false), 10000);
        return () => clearTimeout(timer);
      }
    } else if (!hasMissingRequired) {
      setShowCard(false);
    }
  }, [hasMissingRequired, hasShownInitial, isMobile]);

  // Mobile: FAB + Bottom Sheet
  if (isMobile) {
    return (
      <>
        {/* FAB */}
        <Button
          className="fixed bottom-20 right-4 rounded-full w-12 h-12 shadow-lg z-40"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="w-5 h-5" />
          {prefillData.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
              {prefillData.length}
            </Badge>
          )}
        </Button>

        {/* Bottom Sheet */}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Clara - Assistente
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <AssistantContent
                prefillData={prefillData}
                missingFields={missingFields}
                contextualTip={contextualTip}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: Card flutuante
  return (
    <AnimatePresence>
      {showCard && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 w-80 z-40"
        >
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-medium">Clara</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => setShowCard(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <AssistantContent
                prefillData={prefillData}
                missingFields={missingFields}
                contextualTip={contextualTip}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mini FAB quando card está fechado */}
      {!showCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <Button
            className="rounded-full w-10 h-10 shadow-lg"
            onClick={() => setShowCard(true)}
          >
            <Bot className="w-5 h-5" />
            {prefillData.length > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                {prefillData.length}
              </Badge>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
