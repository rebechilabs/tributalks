import { useState, useEffect } from 'react';
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceCurrencyInputProps {
  label: string;
  field: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  placeholder?: string;
}

export function VoiceCurrencyInput({ 
  label, 
  field, 
  value, 
  onChange, 
  tooltip, 
  placeholder = '0,00' 
}: VoiceCurrencyInputProps) {
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const [localValue, setLocalValue] = useState(value === 0 ? '' : value.toString());

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value === 0 ? '' : value.toString());
  }, [value]);

  // Process transcript when speech recognition ends
  useEffect(() => {
    if (!isListening && transcript && transcript.trim().length > 0) {
      const timer = setTimeout(() => {
        // Extract only numbers from transcript
        const numbersOnly = transcript.replace(/[^\d]/g, '');
        if (numbersOnly) {
          const numValue = parseFloat(numbersOnly);
          setLocalValue(numbersOnly);
          onChange(numValue);
        }
        resetTranscript();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, onChange, resetTranscript]);

  // Update local value in real-time while listening
  useEffect(() => {
    if (isListening && transcript) {
      // Show only numbers while listening
      const numbersOnly = transcript.replace(/[^\d]/g, '');
      if (numbersOnly) {
        setLocalValue(numbersOnly);
      }
    }
  }, [transcript, isListening]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLocalValue(rawValue);
    const cleaned = rawValue.replace(/[^\d,.-]/g, '').replace(',', '.');
    const numValue = parseFloat(cleaned) || 0;
    onChange(numValue);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
          <Input 
            id={field} 
            type="text" 
            className={`pl-10 ${isListening ? 'border-primary ring-2 ring-primary/20' : ''}`}
            placeholder={placeholder} 
            value={localValue} 
            onChange={handleInputChange}
          />
        </div>
        {isSupported && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                  className={isListening ? 'animate-pulse bg-primary' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListening ? 'Parar ditado' : 'Ditar valor (ex: "um dois três" = 123)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {isListening && (
        <p className="text-xs text-primary animate-pulse">
          🎤 Ouvindo... Dite os números um a um (ex: "cinco zero zero" = 500)
        </p>
      )}
    </div>
  );
}
