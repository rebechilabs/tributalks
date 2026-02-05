import { useState, useEffect } from "react";
import { Loader2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCnpj } from "@/hooks/useCnpjLookup";
import { useCompany, Company } from "@/contexts/CompanyContext";
import { toast } from "sonner";

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

const UF_OPTIONS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", 
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

const PORTE_OPTIONS = [
  { value: "mei", label: "MEI" },
  { value: "micro", label: "Micro Empresa" },
  { value: "pequena", label: "Pequena Empresa" },
  { value: "media", label: "Média Empresa" },
  { value: "grande", label: "Grande Empresa" },
];

const SETOR_OPTIONS = [
  { value: "comercio", label: "Comércio" },
  { value: "industria", label: "Indústria" },
  { value: "servicos", label: "Serviços" },
  { value: "agronegocio", label: "Agronegócio" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "construcao", label: "Construção" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "financeiro", label: "Financeiro" },
  { value: "outro", label: "Outro" },
];

export function EditCompanyModal({ open, onOpenChange, company }: EditCompanyModalProps) {
  const { updateCompany } = useCompany();
  
  // Editable fields
  const [razaoSocial, setRazaoSocial] = useState(company.razao_social || "");
  const [nomeFantasia, setNomeFantasia] = useState(company.nome_fantasia || "");
  const [regimeTributario, setRegimeTributario] = useState(company.regime_tributario || "simples");
  const [ufSede, setUfSede] = useState(company.uf_sede || "");
  const [municipioSede, setMunicipioSede] = useState(company.municipio_sede || "");
  const [setor, setSetor] = useState(company.setor || "");
  const [segmento, setSegmento] = useState(company.segmento || "");
  const [porte, setPorte] = useState(company.porte || "");
  const [numFuncionarios, setNumFuncionarios] = useState(company.num_funcionarios?.toString() || "");
  const [faturamentoAnual, setFaturamentoAnual] = useState(company.faturamento_anual?.toString() || "");
  
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when company changes
  useEffect(() => {
    if (open) {
      setRazaoSocial(company.razao_social || "");
      setNomeFantasia(company.nome_fantasia || "");
      setRegimeTributario(company.regime_tributario || "simples");
      setUfSede(company.uf_sede || "");
      setMunicipioSede(company.municipio_sede || "");
      setSetor(company.setor || "");
      setSegmento(company.segmento || "");
      setPorte(company.porte || "");
      setNumFuncionarios(company.num_funcionarios?.toString() || "");
      setFaturamentoAnual(company.faturamento_anual?.toString() || "");
    }
  }, [open, company]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateCompany(company.id, {
        razao_social: razaoSocial || null,
        nome_fantasia: nomeFantasia || null,
        regime_tributario: regimeTributario,
        uf_sede: ufSede || null,
        municipio_sede: municipioSede || null,
        setor: setor || null,
        segmento: segmento || null,
        porte: porte || null,
        num_funcionarios: numFuncionarios ? parseInt(numFuncionarios) : null,
        faturamento_anual: faturamentoAnual ? parseFloat(faturamentoAnual) : null,
      });

      if (success) {
        toast.success("Empresa atualizada com sucesso!");
        onOpenChange(false);
      } else {
        toast.error("Erro ao atualizar empresa");
      }
    } catch (err) {
      console.error('Error updating company:', err);
      toast.error("Erro ao atualizar empresa");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('pt-BR').format(parseInt(num));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Editar Empresa
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da empresa. O CNPJ não pode ser alterado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* CNPJ - Locked */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">CNPJ (não editável)</Label>
              <Input
                value={company.cnpj_principal ? formatCnpj(company.cnpj_principal) : '-'}
                disabled
                className="bg-muted font-mono"
              />
            </div>

            <Separator />

            {/* Identification Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Identificação</h4>
              
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input
                  id="razaoSocial"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Nome jurídico completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Nome comercial"
                />
              </div>
            </div>

            <Separator />

            {/* Location Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Localização</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ufSede">UF</Label>
                  <Select value={ufSede} onValueChange={setUfSede}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipioSede">Município</Label>
                  <Input
                    id="municipioSede"
                    value={municipioSede}
                    onChange={(e) => setMunicipioSede(e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Characterization Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Caracterização</h4>
              
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="porte">Porte</Label>
                  <Select value={porte} onValueChange={setPorte}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PORTE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor">Setor</Label>
                  <Select value={setor} onValueChange={setSetor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SETOR_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segmento">Segmento</Label>
                <Input
                  id="segmento"
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  placeholder="Ex: E-commerce, Consultoria, etc."
                />
              </div>
            </div>

            <Separator />

            {/* Structure Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Estrutura</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numFuncionarios">Nº Funcionários</Label>
                  <Input
                    id="numFuncionarios"
                    type="number"
                    min="0"
                    value={numFuncionarios}
                    onChange={(e) => setNumFuncionarios(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faturamentoAnual">Faturamento Anual (R$)</Label>
                  <Input
                    id="faturamentoAnual"
                    value={faturamentoAnual ? formatCurrency(faturamentoAnual) : ''}
                    onChange={(e) => setFaturamentoAnual(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
