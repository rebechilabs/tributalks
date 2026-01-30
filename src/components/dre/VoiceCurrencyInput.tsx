import { useState, useEffect } from 'react';
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
  const [localValue, setLocalValue] = useState(value === 0 ? '' : formatCurrency(value));

  function formatCurrency(num: number): string {
    if (num === 0) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseCurrency(str: string): number {
    // Remove tudo exceto dígitos, vírgula e ponto
    const cleaned = str.replace(/[^\d,.-]/g, '');
    // Converte formato brasileiro (1.234,56) para número
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  // Update local value when prop changes externally
  useEffect(() => {
    const formatted = value === 0 ? '' : formatCurrency(value);
    if (parseCurrency(localValue) !== value) {
      setLocalValue(formatted);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Permite apenas números, vírgula e ponto durante digitação
    const sanitized = rawValue.replace(/[^\d,.]/g, '');
    setLocalValue(sanitized);
    
    const numValue = parseCurrency(sanitized);
    onChange(numValue);
  };

  const handleBlur = () => {
    // Formata o valor ao sair do campo
    const numValue = parseCurrency(localValue);
    if (numValue > 0) {
      setLocalValue(formatCurrency(numValue));
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
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}
