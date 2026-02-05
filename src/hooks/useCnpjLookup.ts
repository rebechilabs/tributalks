import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CnpjData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  uf: string;
  municipio: string;
  cep: string;
  situacao_cadastral: string;
  porte: string;
  natureza_juridica: string;
  capital_social: number;
}

interface UseCnpjLookupResult {
  lookup: (cnpj: string) => Promise<CnpjData | null>;
  isLoading: boolean;
  data: CnpjData | null;
  error: string | null;
  reset: () => void;
}

// Clean CNPJ to digits only
function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

// Validate CNPJ format
function validateCnpjFormat(cnpj: string): boolean {
  const cleaned = cleanCnpj(cnpj);
  if (cleaned.length !== 14) return false;
  
  // Check for invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  return true;
}

// Format CNPJ for display
export function formatCnpj(cnpj: string): string {
  const cleaned = cleanCnpj(cnpj);
  if (cleaned.length !== 14) return cnpj;
  
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function useCnpjLookup(): UseCnpjLookupResult {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CnpjData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const lookup = useCallback(async (cnpj: string): Promise<CnpjData | null> => {
    const cleanedCnpj = cleanCnpj(cnpj);
    
    if (!validateCnpjFormat(cleanedCnpj)) {
      setError('CNPJ inválido: deve conter 14 dígitos');
      setData(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gov-data-api/cnpj/${cleanedCnpj}`;
      
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro ao buscar CNPJ' }));
        throw new Error(errorData.error || `Erro ${res.status}`);
      }

      const cnpjData: CnpjData = await res.json();
      setData(cnpjData);
      setError(null);
      return cnpjData;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao consultar CNPJ';
      setError(errorMessage);
      setData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { lookup, isLoading, data, error, reset };
}
