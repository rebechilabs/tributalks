import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LatestNews {
  id: string;
  titulo_original: string;
  resumo_executivo: string | null;
  relevancia: string;
  data_publicacao: string;
  fonte: string;
}

export function useLatestNews(limit: number = 5) {
  return useQuery({
    queryKey: ['latest-news', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias_tributarias')
        .select('id, titulo_original, resumo_executivo, relevancia, data_publicacao, fonte')
        .eq('publicado', true)
        .order('data_publicacao', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching latest news:', error);
        throw error;
      }
      
      return (data || []) as LatestNews[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
