import { useState, useEffect, useCallback } from "react";

export interface Municipio {
  nome: string;
  codigo_ibge: string;
}

interface UseMunicipiosResult {
  municipios: Municipio[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache for municipalities to avoid repeated API calls
const municipiosCache: Record<string, { data: Municipio[]; timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useMunicipios(uf: string): UseMunicipiosResult {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMunicipios = useCallback(async () => {
    if (!uf || uf.length !== 2) {
      setMunicipios([]);
      setError(null);
      return;
    }

    const upperUf = uf.toUpperCase();

    // Check cache first
    const cached = municipiosCache[upperUf];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setMunicipios(cached.data);
      setError(null);
      return;
    }

    // Also check sessionStorage for persistence across page reloads
    const sessionKey = `municipios_${upperUf}`;
    const sessionData = sessionStorage.getItem(sessionKey);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
          setMunicipios(parsed.data);
          municipiosCache[upperUf] = parsed;
          setError(null);
          return;
        }
      } catch {
        // Invalid cache, continue to fetch
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gov-data-api/municipios/${upperUf}`;
      
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro ao buscar municípios' }));
        throw new Error(errorData.error || `Erro ${res.status}`);
      }

      const data: Municipio[] = await res.json();
      
      // Update caches
      const cacheEntry = { data, timestamp: Date.now() };
      municipiosCache[upperUf] = cacheEntry;
      sessionStorage.setItem(sessionKey, JSON.stringify(cacheEntry));
      
      setMunicipios(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar municípios';
      setError(errorMessage);
      setMunicipios([]);
    } finally {
      setIsLoading(false);
    }
  }, [uf]);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  return { municipios, isLoading, error, refetch: fetchMunicipios };
}
