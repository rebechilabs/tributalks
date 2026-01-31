import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, Loader2, Search, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMunicipios } from "@/hooks/useMunicipios";
import { PriceComparisonCard } from "./PriceComparisonCard";
import { Badge } from "@/components/ui/badge";

interface PriceGuardFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface RtcRates {
  cbs: number;
  ibsUf: number;
  ibsMun: number;
  is: number;
  fonte: 'api_rtc' | 'manual' | 'estimativa';
}

export function PriceGuardForm({ onSubmit, onCancel }: PriceGuardFormProps) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [fetchingRtc, setFetchingRtc] = useState(false);
  
  // Form state
  const [skuCode, setSkuCode] = useState("");
  const [productName, setProductName] = useState("");
  const [ncmCode, setNcmCode] = useState("");
  const [uf, setUf] = useState("SP");
  const [municipioIbge, setMunicipioIbge] = useState<string>("");
  const [precoAtual, setPrecoAtual] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");
  const [despesaProporcional, setDespesaProporcional] = useState("");
  const [margemAtualPercent, setMargemAtualPercent] = useState("18");
  const [aliquotaPisCofins, setAliquotaPisCofins] = useState("9.25");
  const [aliquotaIcms, setAliquotaIcms] = useState("18");
  const [creditoInsumo, setCreditoInsumo] = useState("");
  const [precoConcorrente, setPrecoConcorrente] = useState("");

  // RTC rates state
  const [rtcRates, setRtcRates] = useState<RtcRates | null>(null);

  // Municipalities hook
  const { municipios, isLoading: loadingMunicipios } = useMunicipios(uf);

  // Results state
  const [results, setResults] = useState<{
    preco2027: number;
    variacaoPercent: number;
    aliquotaTotal: number;
    gapCompetitivo: number;
  } | null>(null);

  // Fetch RTC rates from API
  const fetchRtcRates = useCallback(async () => {
    if (!ncmCode || ncmCode.length < 8) {
      toast.error("Informe um NCM válido com 8 dígitos");
      return;
    }
    if (!municipioIbge) {
      toast.error("Selecione um município");
      return;
    }

    setFetchingRtc(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-rtc', {
        body: { 
          ncm: ncmCode, 
          municipio_codigo_ibge: parseInt(municipioIbge)
        }
      });

      if (error) {
        console.error('Erro ao buscar RTC:', error);
        toast.error("Erro ao buscar alíquotas. Usando valores estimados.");
        setRtcRates({
          cbs: 8.8,
          ibsUf: 8.85,
          ibsMun: 8.85,
          is: 0,
          fonte: 'estimativa'
        });
        return;
      }

      if (data?.aliquotas) {
        setRtcRates({
          cbs: data.aliquotas.cbs || 8.8,
          ibsUf: data.aliquotas.ibs_uf || 8.85,
          ibsMun: data.aliquotas.ibs_mun || 8.85,
          is: data.aliquotas.is || 0,
          fonte: 'api_rtc'
        });
        toast.success("Alíquotas oficiais carregadas com sucesso!");
      } else {
        setRtcRates({
          cbs: 8.8,
          ibsUf: 8.85,
          ibsMun: 8.85,
          is: 0,
          fonte: 'estimativa'
        });
        toast.info("NCM não encontrado na API. Usando alíquotas estimadas.");
      }
    } catch (error) {
      console.error('Erro ao buscar RTC:', error);
      toast.error("Erro ao buscar alíquotas");
    } finally {
      setFetchingRtc(false);
    }
  }, [ncmCode, municipioIbge]);

  const handleCalculate = async () => {
    if (!productName || !precoAtual || !custoUnitario) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setCalculating(true);
    try {
      // Use RTC rates if available, otherwise use defaults
      const aliquotaCBS = rtcRates?.cbs || 8.8;
      const aliquotaIBSUf = rtcRates?.ibsUf || 8.85;
      const aliquotaIBSMun = rtcRates?.ibsMun || 8.85;
      const aliquotaIS = rtcRates?.is || 0;
      const aliquotaTotal = aliquotaCBS + aliquotaIBSUf + aliquotaIBSMun + aliquotaIS;

      const preco = parseFloat(precoAtual) || 0;
      const custo = parseFloat(custoUnitario) || 0;
      const despesa = parseFloat(despesaProporcional) || 0;
      const credito = parseFloat(creditoInsumo) || 0;
      const margem = parseFloat(margemAtualPercent) || 18;
      const concorrente = parseFloat(precoConcorrente) || 0;

      // Gross-up reverso formula
      // Preço 2027 = (Custo + Despesa - Crédito) / (1 - Alíquota) / (1 - Margem)
      const custoLiquido = custo + despesa - credito;
      const fatorTributario = 1 - (aliquotaTotal / 100);
      const fatorMargem = 1 - margem / 100;

      const preco2027 = custoLiquido / fatorTributario / fatorMargem;
      const variacaoPercent = ((preco2027 - preco) / preco) * 100;
      
      // Gap competitivo
      const gapCompetitivo = concorrente > 0 
        ? ((preco2027 - concorrente) / concorrente) * 100
        : 0;

      setResults({
        preco2027,
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
        municipio_ibge: municipioIbge ? parseInt(municipioIbge) : null,
        preco_atual: parseFloat(precoAtual) || 0,
        custo_unitario: parseFloat(custoUnitario) || 0,
        despesa_proporcional: parseFloat(despesaProporcional) || 0,
        margem_atual_percent: parseFloat(margemAtualPercent) || 0,
        aliquota_pis_cofins: parseFloat(aliquotaPisCofins) || 0,
        aliquota_icms: parseFloat(aliquotaIcms) || 0,
        aliquota_cbs: rtcRates?.cbs || 8.8,
        aliquota_ibs_uf: rtcRates?.ibsUf || 8.85,
        aliquota_ibs_mun: rtcRates?.ibsMun || 8.85,
        aliquota_is: rtcRates?.is || 0,
        credito_insumo_estimado: parseFloat(creditoInsumo) || 0,
        credito_fonte: rtcRates?.fonte || 'estimativa',
        preco_2027_necessario: results.preco2027,
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
        </div>
      </div>

      <Separator />

      {/* NCM + Localização para busca RTC */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Localização e NCM (para alíquotas RTC)
          </h3>
          {rtcRates?.fonte === 'api_rtc' && (
            <Badge variant="default" className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Alíquotas Oficiais
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ncmCode">NCM (8 dígitos)</Label>
            <Input 
              id="ncmCode"
              value={ncmCode}
              onChange={(e) => {
                setNcmCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                setRtcRates(null); // Reset rates when NCM changes
              }}
              placeholder="Ex: 69101100"
              maxLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uf">UF</Label>
            <Select value={uf} onValueChange={(value) => {
              setUf(value);
              setMunicipioIbge("");
              setRtcRates(null);
            }}>
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
          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Select 
              value={municipioIbge} 
              onValueChange={(value) => {
                setMunicipioIbge(value);
                setRtcRates(null);
              }}
              disabled={loadingMunicipios || municipios.length === 0}
            >
              <SelectTrigger id="municipio">
                <SelectValue placeholder={loadingMunicipios ? "Carregando..." : "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                {municipios.map(m => (
                  <SelectItem key={m.codigo_ibge} value={m.codigo_ibge}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button 
              onClick={fetchRtcRates}
              disabled={fetchingRtc || !ncmCode || ncmCode.length < 8 || !municipioIbge}
              variant="outline"
              className="w-full"
            >
              {fetchingRtc ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar Alíquota RTC
            </Button>
          </div>
        </div>
        
        {/* RTC Rates Display */}
        {rtcRates && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">CBS</p>
                <p className="font-semibold">{rtcRates.cbs.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">IBS UF</p>
                <p className="font-semibold">{rtcRates.ibsUf.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">IBS Mun</p>
                <p className="font-semibold">{rtcRates.ibsMun.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">IS</p>
                <p className="font-semibold">{rtcRates.is.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Preços e Custos Atuais */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dados do Regime Atual
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
            <Label htmlFor="aliquotaPisCofins">PIS/COFINS Atual (%)</Label>
            <Input 
              id="aliquotaPisCofins"
              type="number"
              step="0.01"
              value={aliquotaPisCofins}
              onChange={(e) => setAliquotaPisCofins(e.target.value)}
              placeholder="9.25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aliquotaIcms">ICMS Atual (%)</Label>
            <Input 
              id="aliquotaIcms"
              type="number"
              step="0.01"
              value={aliquotaIcms}
              onChange={(e) => setAliquotaIcms(e.target.value)}
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
        Calcular Preço 2027+
      </Button>

      {/* Comparison Card */}
      {results && (
        <>
          <Separator />
          <PriceComparisonCard
            precoAtual={parseFloat(precoAtual) || 0}
            preco2027={results.preco2027}
            regimeAtual={{
              pisCofins: parseFloat(aliquotaPisCofins) || 9.25,
              icms: parseFloat(aliquotaIcms) || 18
            }}
            regime2027={{
              cbs: rtcRates?.cbs || 8.8,
              ibsUf: rtcRates?.ibsUf || 8.85,
              ibsMun: rtcRates?.ibsMun || 8.85,
              is: rtcRates?.is || 0
            }}
            margem={parseFloat(margemAtualPercent) || 18}
            fonte={rtcRates?.fonte || 'estimativa'}
            ncm={ncmCode || undefined}
          />

          {/* Gap Competitivo */}
          {results.gapCompetitivo !== 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gap Competitivo</p>
                  <p className="text-xs text-muted-foreground">vs preço do concorrente</p>
                </div>
                <p className={`text-xl font-bold ${results.gapCompetitivo > 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {results.gapCompetitivo >= 0 ? '+' : ''}{results.gapCompetitivo.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
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
