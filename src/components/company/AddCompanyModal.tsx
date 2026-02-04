import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompany } from "@/contexts/CompanyContext";
import { useCnpjLookup, formatCnpj } from "@/hooks/useCnpjLookup";
import { toast } from "sonner";

const formSchema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido").max(18),
  razao_social: z.string().min(1, "Razão Social é obrigatória"),
  nome_fantasia: z.string().optional(),
  regime_tributario: z.enum(["simples", "presumido", "real", "mei"]),
});

type FormData = z.infer<typeof formSchema>;

interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCompanyModal({ open, onOpenChange }: AddCompanyModalProps) {
  const { addCompany, companies, maxCompanies } = useCompany();
  const { lookup, isLoading: isLookingUp } = useCnpjLookup();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      regime_tributario: "simples",
    },
  });

  const handleCnpjLookup = async () => {
    const cnpj = form.getValues("cnpj");
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      toast.error("Digite um CNPJ válido com 14 dígitos");
      return;
    }

    // Check if CNPJ already exists
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    const exists = companies.some(c => c.cnpj_principal?.replace(/\D/g, '') === cleanedCnpj);
    if (exists) {
      toast.error("Este CNPJ já está cadastrado");
      return;
    }

    const data = await lookup(cnpj);
    if (data) {
      form.setValue("razao_social", data.razao_social);
      form.setValue("nome_fantasia", data.nome_fantasia || "");
      toast.success("Dados encontrados!");
    } else {
      toast.error("CNPJ não encontrado ou erro na consulta");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const cleanedCnpj = data.cnpj.replace(/\D/g, '');
      
      // Check again if CNPJ already exists
      const exists = companies.some(c => c.cnpj_principal?.replace(/\D/g, '') === cleanedCnpj);
      if (exists) {
        toast.error("Este CNPJ já está cadastrado");
        return;
      }

      const company = await addCompany({
        cnpj_principal: cleanedCnpj,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia || null,
        regime_tributario: data.regime_tributario,
      });

      if (company) {
        toast.success("Empresa adicionada com sucesso!");
        form.reset();
        onOpenChange(false);
      } else {
        toast.error("Erro ao adicionar empresa");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Erro ao adicionar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  // Format CNPJ as user types
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    
    // Format: XX.XXX.XXX/XXXX-XX
    if (value.length > 12) {
      value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12)}`;
    } else if (value.length > 8) {
      value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8)}`;
    } else if (value.length > 5) {
      value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}.${value.slice(2)}`;
    }
    
    form.setValue("cnpj", value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Adicionar Nova Empresa
          </DialogTitle>
          <DialogDescription>
            Adicione uma empresa ao seu grupo ({companies.length + 1} de {maxCompanies})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* CNPJ Field with Lookup */}
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={handleCnpjChange}
                        maxLength={18}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCnpjLookup}
                      disabled={isLookingUp}
                    >
                      {isLookingUp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="ml-1 hidden sm:inline">Buscar</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Razão Social */}
            <FormField
              control={form.control}
              name="razao_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome Fantasia */}
            <FormField
              control={form.control}
              name="nome_fantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome fantasia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Regime Tributário */}
            <FormField
              control={form.control}
              name="regime_tributario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regime Tributário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o regime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mei">MEI</SelectItem>
                      <SelectItem value="simples">Simples Nacional</SelectItem>
                      <SelectItem value="presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Empresa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
