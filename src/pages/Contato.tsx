import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-tributalks.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Clock, 
  Loader2,
  Send,
  Linkedin,
  Instagram,
  Youtube,
  Phone
} from "lucide-react";

const contatoSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  assunto: z.string().min(1, "Selecione um assunto"),
  mensagem: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(2000, "Mensagem muito longa"),
  aceitaPrivacidade: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar a Política de Privacidade",
  }),
});

type ContatoFormData = z.infer<typeof contatoSchema>;

const ASSUNTOS = [
  "Dúvida sobre a plataforma",
  "Suporte técnico",
  "Cobrança e pagamentos",
  "Cancelamento",
  "Parceria comercial",
  "Imprensa",
  "Privacidade e dados (LGPD)",
  "Outro",
];

const FAQ_ITEMS = [
  {
    pergunta: "Como faço para cancelar minha assinatura?",
    resposta: "Acesse Configurações > Assinatura > Cancelar. O acesso continua até o fim do período pago.",
  },
  {
    pergunta: "Como altero meu plano?",
    resposta: "Acesse Perfil > Assinatura > Alterar plano. A mudança é imediata.",
  },
  {
    pergunta: "Esqueci minha senha, o que faço?",
    resposta: 'Na tela de login, clique em "Esqueci minha senha" e siga as instruções enviadas para seu e-mail.',
  },
  {
    pergunta: "Como agendar minhas consultorias (Premium)?",
    resposta: 'Acesse o menu Consultorias no painel e clique em "Agendar". Você será direcionado para escolher um horário disponível.',
  },
  {
    pergunta: "Os cálculos são garantidos?",
    resposta: "Os valores são estimativas educativas. Para decisões importantes, consulte um profissional qualificado.",
  },
];

export default function Contato() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      nome: "",
      email: "",
      assunto: "",
      mensagem: "",
      aceitaPrivacidade: false,
    },
  });

  const aceitaPrivacidade = watch("aceitaPrivacidade");

  const onSubmit = async (data: ContatoFormData) => {
    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await supabase.from("contatos").insert({
        nome: data.nome,
        email: data.email,
        assunto: data.assunto,
        mensagem: data.mensagem,
      });

      if (dbError) throw dbError;

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke("send-contact-email", {
          body: {
            nome: data.nome,
            email: data.email,
            assunto: data.assunto,
            mensagem: data.mensagem,
          },
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't fail the form submission if email fails
        }
      } catch (emailErr) {
        console.error("Email service error:", emailErr);
      }

      setSubmitted(true);
      toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
      reset();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TribuTalks" className="h-8" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">FALE CONOSCO</h1>
          <p className="text-muted-foreground">Estamos aqui para ajudar.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Informações de Contato */}
          <div className="bg-card border border-border rounded-2xl p-8 space-y-8">
            <h2 className="text-xl font-semibold text-foreground">INFORMAÇÕES DE CONTATO</h2>

            {/* E-mails */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Mail className="h-5 w-5" />
                <span className="font-medium">E-MAIL</span>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <span className="text-foreground/70">Suporte geral:</span>
                  <br />
                  <a href="mailto:suporte@tributalks.com.br" className="hover:text-primary transition-colors">
                    suporte@tributalks.com.br
                  </a>
                </p>
                <p>
                  <span className="text-foreground/70">Privacidade e dados:</span>
                  <br />
                  <a href="mailto:privacidade@tributalks.com.br" className="hover:text-primary transition-colors">
                    privacidade@tributalks.com.br
                  </a>
                </p>
                <p>
                  <span className="text-foreground/70">Comercial e parcerias:</span>
                  <br />
                  <a href="mailto:comercial@tributalks.com.br" className="hover:text-primary transition-colors">
                    comercial@tributalks.com.br
                  </a>
                </p>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">ENDEREÇO</span>
              </div>
              <div className="text-muted-foreground">
                <p className="text-foreground font-medium">Rebechi & Silva Produções</p>
                <p>Avenida Marquês de São Vicente, 1619</p>
                <p>Conjunto 2712 - Barra Funda</p>
                <p>São Paulo/SP - CEP: 01139-003</p>
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Phone className="h-5 w-5" />
                <span className="font-medium">TELEFONE</span>
              </div>
              <a 
                href="tel:+5511914523971" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                +55 11 91452-3971
              </a>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <span className="font-medium text-primary">REDES SOCIAIS</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/company/tributalks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/tributech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@tributech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Horário */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Clock className="h-5 w-5" />
                <span className="font-medium">HORÁRIO DE ATENDIMENTO</span>
              </div>
              <div className="text-muted-foreground space-y-1">
                <p>Segunda a sexta</p>
                <p>9h às 18h (horário de São Paulo)</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm">
                    <span className="text-foreground/70">Prazo de resposta:</span>
                  </p>
                  <p className="text-sm">• Básico/Pro: até 48h úteis</p>
                  <p className="text-sm">• Premium: prioritário</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">ENVIE SUA MENSAGEM</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Mensagem enviada!</h3>
                <p className="text-muted-foreground mb-6">
                  Recebemos sua mensagem e responderemos em breve.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    {...register("nome")}
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && (
                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto *</Label>
                  <Select onValueChange={(value) => setValue("assunto", value)}>
                    <SelectTrigger className={errors.assunto ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSUNTOS.map((assunto) => (
                        <SelectItem key={assunto} value={assunto}>
                          {assunto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assunto && (
                    <p className="text-sm text-destructive">{errors.assunto.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem *</Label>
                  <Textarea
                    id="mensagem"
                    placeholder="Escreva sua mensagem..."
                    rows={6}
                    {...register("mensagem")}
                    className={`resize-none ${errors.mensagem ? "border-destructive" : ""}`}
                  />
                  {errors.mensagem && (
                    <p className="text-sm text-destructive">{errors.mensagem.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="aceitaPrivacidade"
                    checked={aceitaPrivacidade}
                    onCheckedChange={(checked) => setValue("aceitaPrivacidade", checked === true)}
                  />
                  <Label htmlFor="aceitaPrivacidade" className="text-sm leading-relaxed cursor-pointer">
                    Aceito a{" "}
                    <Link to="/privacidade" className="text-primary hover:underline">
                      Política de Privacidade
                    </Link>
                  </Label>
                </div>
                {errors.aceitaPrivacidade && (
                  <p className="text-sm text-destructive">{errors.aceitaPrivacidade.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar mensagem
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            PERGUNTAS FREQUENTES
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  {item.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 TribuTalks. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="hover:text-foreground transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
