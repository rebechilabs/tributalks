import { useState, useEffect } from "react";
import { Loader2, Search, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCnpjLookup, formatCnpj } from "@/hooks/useCnpjLookup";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";
import { CnpjInput } from "@/components/common/CnpjInput";

interface CompanySetupFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Infer tax regime based on company size/capital
function inferRegime(porte?: string, capitalSocial?: number): string {
  if (!porte) return 'simples';
  
  const porteLower = porte.toLowerCase();
  if (porteLower.includes('mei')) return 'mei';
  if (porteLower.includes('micro') || (capitalSocial && capitalSocial < 360000)) return 'simples';
  if (porteLower.includes('pequeno') || (capitalSocial && capitalSocial < 4800000)) return 'simples';
  if (capitalSocial && capitalSocial < 78000000) return 'presumido';
  return 'real';
}

export function CompanySetupForm({ onSuccess, onCancel }: CompanySetupFormProps) {
  const { lookup, isLoading: cnpjLoading, data: cnpjData, error: cnpjError, reset } = useCnpjLookup();
  const { addCompany, companies } = useCompany();
  
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [regimeTributario, setRegimeTributario] = useState("simples");
  const [uf, setUf] = useState("");
  const [cnae, setCnae] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // When CNPJ data is fetched, auto-fill fields
  useEffect(() => {
    if (cnpjData) {
      setRazaoSocial(cnpjData.razao_social || "");
      setNomeFantasia(cnpjData.nome_fantasia || "");
      setUf(cnpjData.uf || "");
      setCnae(cnpjData.cnae_fiscal?.toString() || "");
      setRegimeTributario(inferRegime(cnpjData.porte, cnpjData.capital_social));
      setIsAutoFilled(true);
    }
  }, [cnpjData]);

  const handleLookup = async () => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    // Check if CNPJ already exists
    const exists = companies.some(c => c.cnpj_principal?.replace(/\D/g, '') === cleanCnpj);
    if (exists) {
      toast.error("Este CNPJ já está cadastrado");
      return;
    }
    
    if (cleanCnpj.length !== 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return;
    }
    
    await lookup(cleanCnpj);
  };

  const handleSubmit = async () => {
    if (!cnpj || !razaoSocial) {
      toast.error("CNPJ e Razão Social são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      const result = await addCompany({
        cnpj_principal: cnpj.replace(/\D/g, ''),
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia || null,
        regime_tributario: regimeTributario,
      });

      if (result) {
        toast.success("Empresa adicionada com sucesso!");
        onSuccess();
      } else {
        toast.error("Erro ao adicionar empresa");
      }
    } catch (err) {
      console.error('Error adding company:', err);
      toast.error("Erro ao adicionar empresa");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCnpjChange = (value: string) => {
    setCnpj(value);
    // Reset auto-fill state when CNPJ changes
    if (isAutoFilled) {
      setIsAutoFilled(false);
      reset();
    }
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Nova Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CNPJ with lookup */}
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <CnpjInput
                value={cnpj}
                onChange={handleCnpjChange}
                disabled={cnpjLoading}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleLookup}
              disabled={cnpjLoading || cnpj.replace(/\D/g, '').length !== 14}
            >
              {cnpjLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Buscar</span>
            </Button>
          </div>
          {cnpjError && (
            <p className="text-sm text-destructive">{cnpjError}</p>
          )}
        </div>

        {/* Auto-fill indicator */}
        {isAutoFilled && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Dados preenchidos automaticamente pela Receita Federal
          </Badge>
        )}

        {/* Razão Social */}
        <div className="space-y-2">
          <Label htmlFor="razaoSocial">Razão Social *</Label>
          <Input
            id="razaoSocial"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            placeholder="Nome oficial da empresa"
            disabled={isAutoFilled}
            className={isAutoFilled ? "bg-muted" : ""}
          />
        </div>

        {/* Nome Fantasia */}
        <div className="space-y-2">
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input
            id="nomeFantasia"
            value={nomeFantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
            placeholder="Nome comercial (opcional)"
          />
        </div>

        {/* Regime Tributário */}
        <div className="space-y-2">
          <Label htmlFor="regime">Regime Tributário</Label>
          <Select value={regimeTributario} onValueChange={setRegimeTributario}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o regime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mei">MEI</SelectItem>
              <SelectItem value="simples">Simples Nacional</SelectItem>
              <SelectItem value="presumido">Lucro Presumido</SelectItem>
              <SelectItem value="real">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
          {isAutoFilled && (
            <p className="text-xs text-muted-foreground">
              Regime sugerido com base no porte da empresa
            </p>
          )}
        </div>

        {/* Additional info from API */}
        {cnpjData && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <Label className="text-xs text-muted-foreground">UF</Label>
              <p className="text-sm font-medium">{cnpjData.uf || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CNAE</Label>
              <p className="text-sm font-medium">{cnpjData.cnae_fiscal || '-'}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Atividade</Label>
              <p className="text-sm">{cnpjData.cnae_fiscal_descricao || '-'}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !cnpj || !razaoSocial}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Empresa"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
