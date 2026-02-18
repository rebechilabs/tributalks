import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [localValue, setLocalValue] = useState(() => {
    if (value === 0) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });
  const isFocusedRef = useRef(false);

  // Sync localValue when external value changes (e.g. ERP data, reset)
  useEffect(() => {
    if (isFocusedRef.current) return;
    if (value === 0) {
      setLocalValue('');
    } else {
      setLocalValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }, [value]);

  function parseCurrency(str: string): number {
    const cleaned = str.replace(/[^\d,.-]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLocalValue(rawValue);
    
    const numValue = parseCurrency(rawValue);
    onChange(numValue);
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    const numValue = parseCurrency(localValue);
    if (numValue > 0) {
      setLocalValue(numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setLocalValue('');
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
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
        <Input 
          id={field} 
          type="text" 
          inputMode="decimal"
          className="pl-10"
          placeholder={placeholder} 
          value={localValue} 
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}
