import { useState } from "react";
import { LucideIcon, Check, HelpCircle, ChevronRight, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ScoreCardProps {
  title: string;
  icon: LucideIcon;
  status: 'complete' | 'incomplete' | 'warning';
  helpText?: string;
  
  // Info tooltip com explicação detalhada
  infoTooltip?: {
    title: string;
    content: string;
  };
  
  // Para cards automáticos
  autoData?: {
    value: string | number;
    subtitle?: string;
    linkText?: string;
    linkTo?: string;
  };
  
  // Para cards com pergunta
  question?: {
    text: string;
    options: { value: string; label: string }[];
    currentValue?: string;
    onAnswer: (value: string) => void;
    hint?: string;
  };
}

const statusConfig = {
  complete: {
    icon: Check,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-500',
  },
  incomplete: {
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-500',
  },
};

export function ScoreCard({ 
  title, 
  icon: Icon, 
  status, 
  helpText,
  infoTooltip,
  autoData,
  question,
}: ScoreCardProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(question?.currentValue);
  const [isExpanded, setIsExpanded] = useState(!question?.currentValue && status === 'incomplete');
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleConfirm = () => {
    if (selectedValue && question?.onAnswer) {
      question.onAnswer(selectedValue);
      setIsExpanded(false);
    }
  };

  // Card automático (dados de outras ferramentas)
  if (autoData) {
    return (
      <Card className={cn("border", config.border, config.bg)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
              <CardTitle className="text-sm font-medium uppercase tracking-wide">
                {title}
              </CardTitle>
            </div>
            {helpText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{helpText}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-bold">{autoData.value}</p>
            {autoData.subtitle && (
              <p className="text-sm text-muted-foreground">{autoData.subtitle}</p>
            )}
            {autoData.linkTo && autoData.linkText && (
              <Link 
                to={autoData.linkTo}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
              >
                {autoData.linkText}
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card com pergunta (resposta manual)
  if (question) {
    // Se já respondeu e não está expandido, mostra resumo
    if (question.currentValue && !isExpanded) {
      const selectedOption = question.options.find(o => o.value === question.currentValue);
      return (
        <Card className={cn("border", config.border, config.bg)}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
                <CardTitle className="text-sm font-medium uppercase tracking-wide">
                  {title}
                </CardTitle>
                {infoTooltip && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                        <Info className="h-4 w-4 text-primary cursor-pointer" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">{infoTooltip.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {infoTooltip.content}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              {helpText && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="font-medium">{selectedOption?.label}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-fit p-0 h-auto text-primary hover:underline"
                onClick={() => setIsExpanded(true)}
              >
                Alterar resposta
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Card expandido com pergunta
    return (
      <Card className={cn("border", config.border, config.bg)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium uppercase tracking-wide">
                {title}
              </CardTitle>
              {infoTooltip && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <Info className="h-4 w-4 text-primary cursor-pointer" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{infoTooltip.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {infoTooltip.content}
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {helpText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{helpText}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium">{question.text}</p>
            
            <RadioGroup 
              value={selectedValue} 
              onValueChange={setSelectedValue}
              className="gap-2"
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${title}-${option.value}`} />
                  <Label 
                    htmlFor={`${title}-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {question.hint && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                💡 {question.hint}
              </p>
            )}

            <Button 
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedValue}
              className="w-full"
            >
              Confirmar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
