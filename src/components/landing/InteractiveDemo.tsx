import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DemoStepUpload,
  DemoStepScore,
  DemoStepRadar,
  DemoStepClara,
  DemoStepNexus,
} from "./demo";

const STEPS = [
  { id: 1, component: DemoStepUpload, duration: 3000, label: "Upload XMLs" },
  { id: 2, component: DemoStepScore, duration: 4000, label: "Score Tributário" },
  { id: 3, component: DemoStepRadar, duration: 4000, label: "Radar de Créditos" },
  { id: 4, component: DemoStepClara, duration: 4000, label: "Clara AI" },
  { id: 5, component: DemoStepNexus, duration: 0, label: "Dashboard NEXUS" },
];

interface InteractiveDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function InteractiveDemo({
  open,
  onOpenChange,
  onComplete,
}: InteractiveDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || isLastStep || !open) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, autoPlay, isLastStep, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setAutoPlay(true);
    }
  }, [open]);

  const handleNext = () => {
    setAutoPlay(false);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setAutoPlay(false);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    setAutoPlay(false);
    setCurrentStep(STEPS.length - 1);
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <DemoStepUpload />;
      case 1:
        return <DemoStepScore />;
      case 2:
        return <DemoStepRadar />;
      case 3:
        return <DemoStepClara />;
      case 4:
        return <DemoStepNexus onComplete={handleComplete} />;
      default:
        return <DemoStepUpload />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] max-h-[700px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>🎬</span> TribuTalks Demo
            </h2>
            <p className="text-sm text-muted-foreground">
              Veja como funciona em menos de 1 minuto
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 py-4 px-6 border-b border-border bg-muted/30">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setAutoPlay(false);
                  setCurrentStep(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary w-8"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted-foreground/20"
                }`}
                aria-label={`Ir para ${step.label}`}
              />
              {index < STEPS.length - 1 && (
                <div
                  className={`w-6 h-0.5 mx-1 ${
                    index < currentStep ? "bg-primary/50" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-hidden p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Passo {currentStep + 1} de {STEPS.length}:{" "}
            <span className="font-medium text-foreground">{STEPS[currentStep].label}</span>
          </p>

          <div className="flex items-center gap-2">
            {!isLastStep && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Pular Demo
              </Button>
            )}
            
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
            )}

            {!isLastStep && (
              <Button size="sm" onClick={handleNext}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
