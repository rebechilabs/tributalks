import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PriceGuardFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function PriceGuardForm({ onSubmit, onCancel }: PriceGuardFormProps) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  // Form state
  const [skuCode, setSkuCode] = useState("");
  const [productName, setProductName] = useState("");
  const [ncmCode, setNcmCode] = useState("");
  const [uf, setUf] = useState("SP");
  const [precoAtual, setPrecoAtual] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");
  const [despesaProporcional, setDespesaProporcional] = useState("");
  const [margemAtualPercent, setMargemAtualPercent] = useState("");
  const [aliquotaPisCofins, setAliquotaPisCofins] = useState("9.25");
  const [aliquotaIcms, setAliquotaIcms] = useState("18");
  const [creditoInsumo, setCreditoInsumo] = useState("");
  const [precoConcorrente, setPrecoConcorrente] = useState("");

  // Results state
  const [results, setResults] = useState<{
    preco2026: number;
    variacaoPercent: number;
    aliquotaTotal: number;
    gapCompetitivo: number;
  } | null>(null);

  const handleCalculate = async () => {
    if (!productName || !precoAtual || !custoUnitario) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setCalculating(true);
    try {
      // Default CBS/IBS rates (will be refined with API call later)
      const aliquotaCBS = 8.8;
      const aliquotaIBSUf = 8.85;
      const aliquotaIBSMun = 8.85;
      const aliquotaTotal = aliquotaCBS + aliquotaIBSUf + aliquotaIBSMun;

      const preco = parseFloat(precoAtual) || 0;
      const custo = parseFloat(custoUnitario) || 0;
      const despesa = parseFloat(despesaProporcional) || 0;
      const credito = parseFloat(creditoInsumo) || 0;
      const margem = parseFloat(margemAtualPercent) || 0;
      const concorrente = parseFloat(precoConcorrente) || 0;

      // Gross-up reverso formula
      // Preço 2026 = (Custo + Despesa - Crédito) / (1 - Alíquota) / (1 - Margem)
      const custoLiquido = custo + despesa - credito;
      const fatorTributario = 1 - (aliquotaTotal / 100);
      const fatorMargem = margem > 0 ? (1 - margem / 100) : 0.82; // Default 18% margin

      const preco2026 = custoLiquido / fatorTributario / fatorMargem;
      const variacaoPercent = ((preco2026 - preco) / preco) * 100;
      
      // Gap competitivo
      const gapCompetitivo = concorrente > 0 
        ? ((preco2026 - concorrente) / concorrente) * 100
        : 0;

      setResults({
        preco2026,
        variacaoPercent,
        aliquotaTotal,
        gapCompetitivo
      });

    } catch (error) {
      console.error('Erro no cálculo:', error);
      toast.error("Erro ao calcular preço");
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!results) {
      toast.error("Calcule o preço primeiro");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        sku_code: skuCode || null,
        product_name: productName,
        ncm_code: ncmCode || null,
        uf,
        preco_atual: parseFloat(precoAtual) || 0,
        custo_unitario: parseFloat(custoUnitario) || 0,
        despesa_proporcional: parseFloat(despesaProporcional) || 0,
        margem_atual_percent: parseFloat(margemAtualPercent) || 0,
        aliquota_pis_cofins: parseFloat(aliquotaPisCofins) || 0,
        aliquota_icms: parseFloat(aliquotaIcms) || 0,
        aliquota_cbs: 8.8,
        aliquota_ibs_uf: 8.85,
        aliquota_ibs_mun: 8.85,
        credito_insumo_estimado: parseFloat(creditoInsumo) || 0,
        credito_fonte: 'manual',
        preco_2026_necessario: results.preco2026,
        variacao_preco_percent: results.variacaoPercent,
        preco_concorrente: parseFloat(precoConcorrente) || null,
        gap_competitivo_percent: results.gapCompetitivo
      });
      toast.success("Simulação salva com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar simulação");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Identificação */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Identificação do Produto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="skuCode">Código SKU (opcional)</Label>
            <Input 
              id="skuCode"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              placeholder="Ex: PROD-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productName">Nome do Produto *</Label>
            <Input 
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Cerâmica Industrial"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ncmCode">NCM (opcional)</Label>
            <Input 
              id="ncmCode"
              value={ncmCode}
              onChange={(e) => setNcmCode(e.target.value)}
              placeholder="Ex: 69101100"
              maxLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uf">UF de Venda</Label>
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger id="uf">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Preços e Custos Atuais */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dados Atuais (2025)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="precoAtual">Preço de Venda Atual (R$) *</Label>
            <Input 
              id="precoAtual"
              type="number"
              step="0.01"
              value={precoAtual}
              onChange={(e) => setPrecoAtual(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custoUnitario">Custo Unitário (R$) *</Label>
            <Input 
              id="custoUnitario"
              type="number"
              step="0.01"
              value={custoUnitario}
              onChange={(e) => setCustoUnitario(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="despesaProporcional">Despesa Proporcional (R$)</Label>
            <Input 
              id="despesaProporcional"
              type="number"
              step="0.01"
              value={despesaProporcional}
              onChange={(e) => setDespesaProporcional(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margemAtualPercent">Margem Desejada (%)</Label>
            <Input 
              id="margemAtualPercent"
              type="number"
              step="0.1"
              value={margemAtualPercent}
              onChange={(e) => setMargemAtualPercent(e.target.value)}
              placeholder="18"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditoInsumo">Crédito de Insumo Estimado (R$)</Label>
            <Input 
              id="creditoInsumo"
              type="number"
              step="0.01"
              value={creditoInsumo}
              onChange={(e) => setCreditoInsumo(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precoConcorrente">Preço do Concorrente (R$)</Label>
            <Input 
              id="precoConcorrente"
              type="number"
              step="0.01"
              value={precoConcorrente}
              onChange={(e) => setPrecoConcorrente(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <Button 
        onClick={handleCalculate} 
        disabled={calculating}
        className="w-full"
        variant="outline"
      >
        {calculating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Calculator className="w-4 h-4 mr-2" />
        )}
        Calcular Preço 2026
      </Button>

      {/* Results */}
      {results && (
        <>
          <Separator />
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
              Resultado da Simulação
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Preço 2026 Necessário</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(results.preco2026)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variação</p>
                <p className={`text-2xl font-bold ${results.variacaoPercent >= 0 ? 'text-warning' : 'text-success'}`}>
                  {results.variacaoPercent >= 0 ? '+' : ''}{results.variacaoPercent.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alíquota CBS/IBS Total</p>
                <p className="text-lg font-semibold">{results.aliquotaTotal.toFixed(1)}%</p>
              </div>
              {results.gapCompetitivo !== 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Gap Competitivo</p>
                  <p className={`text-lg font-semibold ${results.gapCompetitivo > 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {results.gapCompetitivo >= 0 ? '+' : ''}{results.gapCompetitivo.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={loading || !results} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Salvar Simulação
        </Button>
      </div>
    </div>
  );
}
