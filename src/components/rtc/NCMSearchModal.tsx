import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Loader2 } from "lucide-react";
import { NCM_POPULARES } from "./rtcConstants";

interface NCMItem {
  ncm: string;
  descricao: string;
}

interface NCMSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ncm: string, descricao: string) => void;
}

const STORAGE_KEY = "tributech_ncm_recentes";
const MAX_RECENTES = 5;

export function NCMSearchModal({ open, onOpenChange, onSelect }: NCMSearchModalProps) {
  const [search, setSearch] = useState("");
  const [ncmList, setNcmList] = useState<NCMItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentes, setRecentes] = useState<NCMItem[]>([]);

  // Load recent NCMs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentes(JSON.parse(stored));
      } catch {
        setRecentes([]);
      }
    }
  }, [open]);

  // Fetch NCM list from API (with cache)
  useEffect(() => {
    const fetchNCMs = async () => {
      const cached = sessionStorage.getItem("ncm_list_cache");
      if (cached) {
        setNcmList(JSON.parse(cached));
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/ncm"
        );
        if (response.ok) {
          const data = await response.json();
          const items: NCMItem[] = data.map((item: { ncm: string; descricao: string }) => ({
            ncm: item.ncm,
            descricao: item.descricao,
          }));
          setNcmList(items);
          sessionStorage.setItem("ncm_list_cache", JSON.stringify(items));
        }
      } catch (error) {
        console.error("Erro ao buscar NCMs:", error);
        // Fallback to popular NCMs
        setNcmList(NCM_POPULARES);
      } finally {
        setLoading(false);
      }
    };

    if (open && ncmList.length === 0) {
      fetchNCMs();
    }
  }, [open, ncmList.length]);

  // Filter results based on search
  const filteredResults = useMemo(() => {
    if (!search.trim()) {
      return NCM_POPULARES;
    }

    const searchLower = search.toLowerCase();
    const searchClean = search.replace(/\D/g, "");

    return ncmList
      .filter(
        (item) =>
          item.ncm.includes(searchClean) ||
          item.descricao.toLowerCase().includes(searchLower)
      )
      .slice(0, 50);
  }, [search, ncmList]);

  const handleSelect = (item: NCMItem) => {
    // Save to recent
    const newRecentes = [
      item,
      ...recentes.filter((r) => r.ncm !== item.ncm),
    ].slice(0, MAX_RECENTES);
    setRecentes(newRecentes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecentes));

    onSelect(item.ncm, item.descricao);
    onOpenChange(false);
    setSearch("");
  };

  const formatNCM = (ncm: string) => {
    const clean = ncm.replace(/\D/g, "").padEnd(8, "0");
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Buscar NCM</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite o código NCM ou descrição do produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-border"
            autoFocus
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando NCMs...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recent NCMs */}
              {!search && recentes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Usados recentemente
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentes.map((item) => (
                      <button
                        key={item.ncm}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors text-left"
                      >
                        <Badge variant="secondary" className="font-mono">
                          {formatNCM(item.ncm)}
                        </Badge>
                        <span className="text-sm text-foreground truncate">
                          {item.descricao}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search results or popular */}
              <div>
                <span className="text-sm font-medium text-muted-foreground mb-2 block">
                  {search ? `Resultados (${filteredResults.length})` : "NCMs Populares"}
                </span>
                <div className="space-y-1">
                  {filteredResults.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhum NCM encontrado para "{search}"
                    </p>
                  ) : (
                    filteredResults.map((item) => (
                      <button
                        key={item.ncm}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors text-left group"
                      >
                        <Badge
                          variant="outline"
                          className="font-mono group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          {formatNCM(item.ncm)}
                        </Badge>
                        <span className="text-sm text-foreground truncate">
                          {item.descricao}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
