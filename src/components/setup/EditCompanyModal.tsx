import { useState } from "react";
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
import { formatCnpj } from "@/hooks/useCnpjLookup";
import { useCompany, Company } from "@/contexts/CompanyContext";
import { toast } from "sonner";

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export function EditCompanyModal({ open, onOpenChange, company }: EditCompanyModalProps) {
  const { updateCompany } = useCompany();
  
  const [nomeFantasia, setNomeFantasia] = useState(company.nome_fantasia || "");
  const [regimeTributario, setRegimeTributario] = useState(company.regime_tributario || "simples");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateCompany(company.id, {
        nome_fantasia: nomeFantasia || null,
        regime_tributario: regimeTributario,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Editar Empresa
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da empresa. CNPJ e Razão Social não podem ser alterados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Locked fields */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">CNPJ</Label>
            <Input
              value={company.cnpj_principal ? formatCnpj(company.cnpj_principal) : '-'}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Razão Social</Label>
            <Input
              value={company.razao_social || '-'}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Editable fields */}
          <div className="space-y-2">
            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
            <Input
              id="nomeFantasia"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              placeholder="Nome comercial"
            />
          </div>

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
        </div>

        <DialogFooter>
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
