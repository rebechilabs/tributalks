import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/useFeatureAccess";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(254, "E-mail muito longo"),
});

type EmailFormData = z.infer<typeof emailSchema>;

type FormState = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const { isEnterprise } = usePlanAccess();

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Hide for Enterprise users (only when logged in)
  if (user && isEnterprise) {
    return null;
  }

  const onSubmit = async (data: EmailFormData) => {
    setFormState("loading");
    setErrorMessage("");

    try {
      const { data: response, error } = await supabase.functions.invoke(
        "subscribe-newsletter",
        {
          body: { email: data.email },
        }
      );

      if (error) {
        console.error("Newsletter subscription error:", error);
        setErrorMessage("Não foi possível processar a inscrição. Tente novamente.");
        setFormState("error");
        return;
      }

      if (response?.error) {
        setErrorMessage(response.error);
        setFormState("error");
        return;
      }

      setFormState("success");
      form.reset();
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      setErrorMessage("Erro de conexão. Tente novamente.");
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Inscrito com sucesso!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Verifique seu e-mail para confirmar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-foreground">
        <Mail className="h-5 w-5 text-primary" />
        <span className="font-semibold">Tributalks News</span>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Toda terça às 07h07 • +4 mil assinantes
      </p>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-2 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-10"
                    disabled={formState === "loading"}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            size="sm"
            className="h-10 px-6"
            disabled={formState === "loading"}
          >
            {formState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Inscrevendo...
              </>
            ) : (
              "Inscrever-se"
            )}
          </Button>
        </form>
      </Form>

      {/* Error message */}
      {formState === "error" && errorMessage && (
        <p className="text-sm text-destructive text-center">{errorMessage}</p>
      )}
    </div>
  );
}
