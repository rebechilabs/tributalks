import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getToolBySlug, generateToolHelpPrompt } from "@/data/toolsManual";

interface HelpButtonProps {
  toolSlug: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

/**
 * Botão de ajuda contextual que abre a Clara AI com explicação da ferramenta
 * 
 * @example
 * <HelpButton toolSlug="score-tributario" />
 */
export function HelpButton({ toolSlug, className, size = "icon" }: HelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const tool = getToolBySlug(toolSlug);
  
  if (!tool) {
    console.warn(`HelpButton: Tool not found for slug "${toolSlug}"`);
    return null;
  }
  
  const handleClick = () => {
    // Gera o prompt completo e abre Clara com ele
    const helpPrompt = generateToolHelpPrompt(tool);
    
    // Dispara evento para abrir Clara com a explicação
    window.dispatchEvent(new CustomEvent('openClaraWithQuestion', { 
      detail: { 
        question: `Me explique como usar o ${tool.name} e como preencher cada campo.`
      } 
    }));
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={className}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <HelpCircle 
              className={`h-4 w-4 transition-colors ${
                isHovered ? "text-primary" : "text-muted-foreground"
              }`} 
            />
            <span className="sr-only">Ajuda sobre {tool.name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            Clique para Clara explicar como usar
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
