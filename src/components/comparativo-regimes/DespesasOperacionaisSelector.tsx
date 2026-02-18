import { useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_DESPESAS } from "@/types/despesasOperacionais";

interface DespesasOperacionaisSelectorProps {
  valores: Record<string, number>;
  onChange: (valores: Record<string, number>) => void;
}

export function DespesasOperacionaisSelector({ valores, onChange }: DespesasOperacionaisSelectorProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [customExpenses, setCustomExpenses] = useState<{ id: string; nome: string }[]>([]);
  const [newCustomName, setNewCustomName] = useState('');

  // Calcular total
  const total = useMemo(() => {
    return Object.values(valores).reduce((sum, val) => sum + (val || 0), 0);
  }, [valores]);

  // Formatar valor para exibição
  const formatarParaExibicao = (valor: number | undefined): string => {
    if (!valor) return '';
    return new Intl.NumberFormat('pt-BR').format(valor);
  };

  // Formatar total para exibição
  const formatarTotal = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  // Handler para toggle de despesa
  const handleToggle = (id: string, checked: boolean) => {
    const novosValores = { ...valores };
    if (checked) {
      novosValores[id] = 0;
    } else {
      delete novosValores[id];
    }
    onChange(novosValores);
  };

  // Handler para mudança de valor
  const handleValueChange = (id: string, valorStr: string) => {
    const apenasNumeros = valorStr.replace(/\D/g, '');
    const valorNum = parseInt(apenasNumeros) || 0;
    onChange({ ...valores, [id]: valorNum });
  };

  // Adicionar despesa personalizada
  const handleAddCustomExpense = () => {
    if (!newCustomName.trim()) return;
    
    const customId = `custom_${Date.now()}`;
    setCustomExpenses(prev => [...prev, { id: customId, nome: newCustomName.trim() }]);
    onChange({ ...valores, [customId]: 0 });
    setNewCustomName('');
  };

  // Remover despesa personalizada
  const handleRemoveCustomExpense = (id: string) => {
    setCustomExpenses(prev => prev.filter(e => e.id !== id));
    const novosValores = { ...valores };
    delete novosValores[id];
    onChange(novosValores);
  };

  // Contar itens selecionados por categoria
  const contarSelecionados = (categoriaId: string): number => {
    const categoria = CATEGORIAS_DESPESAS.find(c => c.id === categoriaId);
    if (!categoria) return 0;
    return categoria.items.filter(item => item.id in valores).length;
  };

  // Calcular subtotal por categoria
  const calcularSubtotal = (categoriaId: string): number => {
    const categoria = CATEGORIAS_DESPESAS.find(c => c.id === categoriaId);
    if (!categoria) return 0;
    return categoria.items.reduce((sum, item) => sum + (valores[item.id] || 0), 0);
  };

  // Calcular subtotal de despesas personalizadas
  const customSubtotal = useMemo(() => {
    return customExpenses.reduce((sum, exp) => sum + (valores[exp.id] || 0), 0);
  }, [customExpenses, valores]);

  return (
    <div className="space-y-4">
      {/* Header com total */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Label className="text-base font-medium">Despesas Operacionais (valores anuais)</Label>
        <span className="text-lg font-bold text-primary">
          {formatarTotal(total)}/ano
        </span>
      </div>

      {/* Accordion de categorias */}
      <Accordion
        type="multiple"
        value={openCategories}
        onValueChange={setOpenCategories}
        className="space-y-2"
      >
        {CATEGORIAS_DESPESAS.map((categoria) => {
          const selecionados = contarSelecionados(categoria.id);
          const subtotal = calcularSubtotal(categoria.id);
          
          return (
            <AccordionItem
              key={categoria.id}
              value={categoria.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="text-sm font-medium text-left">{categoria.nome}</span>
                  <div className="flex items-center gap-3">
                    {selecionados > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {selecionados} item{selecionados > 1 ? 's' : ''} • {formatarTotal(subtotal)}
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  {categoria.items.map((item) => {
                    const isSelected = item.id in valores;
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <Checkbox
                          id={item.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleToggle(item.id, !!checked)}
                        />
                        <label
                          htmlFor={item.id}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          {item.nome}
                        </label>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm">R$</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={formatarParaExibicao(valores[item.id])}
                              onChange={(e) => handleValueChange(item.id, e.target.value)}
                              className="w-32 h-8 text-right"
                            />
                            <span className="text-muted-foreground text-xs">/ano</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Campo para despesa personalizada */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Não encontrou na lista?</Label>
          {customExpenses.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {customExpenses.length} item{customExpenses.length > 1 ? 's' : ''} • {formatarTotal(customSubtotal)}
            </span>
          )}
        </div>
        
        {/* Lista de despesas personalizadas */}
        {customExpenses.length > 0 && (
          <div className="space-y-3">
            {customExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveCustomExpense(expense.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-sm">{expense.nome}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">R$</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatarParaExibicao(valores[expense.id])}
                    onChange={(e) => handleValueChange(expense.id, e.target.value)}
                    className="w-32 h-8 text-right"
                  />
                  <span className="text-muted-foreground text-xs">/ano</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input para adicionar nova despesa */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Digite o nome da despesa..."
            value={newCustomName}
            onChange={(e) => setNewCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomExpense();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomExpense}
            disabled={!newCustomName.trim()}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Alerta de subjetividade */}
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm">
          <strong>Atenção:</strong> A creditação de despesas para PIS/COFINS é subjetiva e depende da comprovação de que são essenciais e relevantes à atividade da empresa. Esta análise requer parecer de um advogado tributarista habilitado.
        </AlertDescription>
      </Alert>
    </div>
  );
}
