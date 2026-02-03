import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Diamond, Send } from "lucide-react";
import { z } from "zod";

const enterpriseFormSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  nomeEmpresa: z
    .string()
    .trim()
    .min(2, { message: "Nome da empresa deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome da empresa deve ter no máximo 100 caracteres" }),
  whatsapp: z
    .string()
    .trim()
    .min(10, { message: "WhatsApp deve ter pelo menos 10 dígitos" })
    .max(20, { message: "WhatsApp deve ter no máximo 20 caracteres" })
    .regex(/^[\d\s()+-]+$/, { message: "WhatsApp deve conter apenas números e caracteres válidos" }),
});

interface EnterpriseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnterpriseModal({ open, onOpenChange }: EnterpriseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    nomeEmpresa: "",
    whatsapp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = enterpriseFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          nome: formData.nomeCompleto,
          email: "enterprise@tributalks.com.br", // placeholder, o importante são os dados
          assunto: "Interesse no Plano Enterprise",
          mensagem: `
**Quero saber mais sobre o Plano Enterprise**

📋 Dados do interessado:
- Nome Completo: ${formData.nomeCompleto}
- Empresa: ${formData.nomeEmpresa}
- WhatsApp: ${formData.whatsapp}

Solicitação enviada via formulário da Landing Page.
          `.trim(),
        },
      });

      if (error) throw error;

      toast.success("Solicitação enviada com sucesso!", {
        description: "Nossa equipe entrará em contato em breve.",
      });

      // Reset form and close modal
      setFormData({ nomeCompleto: "", nomeEmpresa: "", whatsapp: "" });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending enterprise request:", error);
      toast.error("Erro ao enviar solicitação", {
        description: "Tente novamente ou entre em contato pelo WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Diamond className="w-6 h-6 text-primary" />
            <DialogTitle className="text-xl">Plano Enterprise</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Para grupos econômicos ou faturamento R$ 10M+. Preencha os dados abaixo 
            e nossa equipe entrará em contato com uma proposta personalizada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">
              Nome Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nomeCompleto"
              placeholder="Seu nome completo"
              value={formData.nomeCompleto}
              onChange={handleChange("nomeCompleto")}
              disabled={isSubmitting}
              className={errors.nomeCompleto ? "border-destructive" : ""}
            />
            {errors.nomeCompleto && (
              <p className="text-xs text-destructive">{errors.nomeCompleto}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeEmpresa">
              Nome da Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nomeEmpresa"
              placeholder="Nome da sua empresa"
              value={formData.nomeEmpresa}
              onChange={handleChange("nomeEmpresa")}
              disabled={isSubmitting}
              className={errors.nomeEmpresa ? "border-destructive" : ""}
            />
            {errors.nomeEmpresa && (
              <p className="text-xs text-destructive">{errors.nomeEmpresa}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">
              WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="whatsapp"
              placeholder="(11) 99999-9999"
              value={formData.whatsapp}
              onChange={handleChange("whatsapp")}
              disabled={isSubmitting}
              className={errors.whatsapp ? "border-destructive" : ""}
            />
            {errors.whatsapp && (
              <p className="text-xs text-destructive">{errors.whatsapp}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Quero saber mais sobre o Plano Enterprise
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Todos os campos são obrigatórios. Seus dados estão protegidos.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
