import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao TribuTech.",
      });
      // Navigation will be handled by auth state change
      navigate(profile?.onboarding_complete ? '/dashboard' : '/onboarding');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos' 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TribuTech</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Entrar no TribuTech
          </h1>
          <p className="text-muted-foreground mb-8">
            Acesse suas calculadoras e simulações
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4 text-center">
            <Link 
              to="/recuperar-senha" 
              className="text-sm text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
            <p className="text-muted-foreground">
              Não tem conta?{" "}
              <Link to="/cadastro" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12" style={{ background: 'var(--gradient-primary)' }}>
        <div className="max-w-md text-center text-primary-foreground">
          <div className="w-24 h-24 rounded-2xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Calculator className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Bem-vindo de volta!
          </h2>
          <p className="text-primary-foreground/80">
            Acesse suas ferramentas de inteligência tributária e continue tomando decisões estratégicas para sua empresa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
