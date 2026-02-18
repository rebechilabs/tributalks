import { useLocation } from "react-router-dom";

const ROUTE_SUGGESTIONS: Record<string, string[]> = {
  "/dashboard/dre": ["Como está minha margem?", "O que posso melhorar?"],
  "/dashboard/score-tributario": ["Como melhorar meu score?", "O que significa cada dimensão?"],
  "/dashboard/recuperar/radar": ["Encontrou créditos?", "Tem algo prestes a prescrever?"],
  "/dashboard/radar-creditos": ["Encontrou créditos?", "Tem algo prestes a prescrever?"],
  "/dashboard/planejar/oportunidades": ["Quais oportunidades tenho?", "Quanto posso economizar?"],
  "/dashboard/oportunidades": ["Quais oportunidades tenho?", "Quanto posso economizar?"],
  "/dashboard/home": ["Me dá um resumo", "Por onde começar?"],
  "/dashboard/precificar/margem-ativa": ["Qual minha margem real?", "Impacto da reforma no preço?"],
  "/dashboard/entender/comparativo": ["Qual regime é melhor?", "Simula mudança pra Lucro Real?"],
};

interface ClaraContextualSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ClaraContextualSuggestions({ onSuggestionClick }: ClaraContextualSuggestionsProps) {
  const location = useLocation();
  
  const suggestions = ROUTE_SUGGESTIONS[location.pathname] || ROUTE_SUGGESTIONS["/dashboard/home"] || [];

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pt-2">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSuggestionClick(suggestion)}
          className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
