import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoTributalks from "@/assets/logo-tributalks.png";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) throw error;

      setEmailSent(true);
    } catch (error: any) {
      setError("Erro ao enviar e-mail. Verifique o endereço.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para login
        </Link>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoTributalks} alt="TribuTalks" className="h-16 w-auto" />
          </div>

          {!emailSent ? (
            <>
              {/* Heading */}
              <h1 className="text-2xl font-bold text-foreground text-center mb-4">
                Recuperar senha
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-secondary border-border focus:border-primary"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                  disabled={!email.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 border-t border-border" />

              {/* Back to Login Link */}
              <p className="text-center text-muted-foreground">
                Lembrou a senha?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Voltar para login
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-4">
                  E-mail enviado!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Não recebeu? Verifique o spam ou{" "}
                  <button 
                    onClick={handleTryAgain}
                    className="text-primary hover:underline font-medium"
                  >
                    tente novamente
                  </button>
                </p>

                {/* Divider */}
                <div className="my-6 border-t border-border" />

                {/* Back to Login */}
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-border text-foreground hover:bg-secondary"
                  >
                    Voltar para login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
