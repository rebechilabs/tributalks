import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Senhas não conferem",
        description: "Verifique se as senhas digitadas são iguais.",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.senha, formData.nome);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao TribuTech. Vamos configurar seu perfil.",
      });
      navigate('/onboarding');
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message === 'User already registered' 
          ? 'Este e-mail já está cadastrado' 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            Criar Conta no TribuTech
          </h1>
          <p className="text-muted-foreground mb-8">
            Comece sua jornada de inteligência tributária
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="João Silva"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={formData.confirmarSenha}
                onChange={(e) => handleChange("confirmarSenha", e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="termos"
                checked={formData.aceitaTermos}
                onCheckedChange={(checked) => handleChange("aceitaTermos", checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="termos" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Li e aceito os{" "}
                <Link to="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={!formData.aceitaTermos || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          {/* Links */}
          <p className="mt-6 text-center text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12" style={{ background: 'var(--gradient-primary)' }}>
        <div className="max-w-md text-primary-foreground">
          <div className="w-24 h-24 rounded-2xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center mb-8">
            <Calculator className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Sua jornada começa aqui
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Acesse ferramentas poderosas de inteligência tributária desenvolvidas para empresas como a sua.
          </p>
          <ul className="space-y-3 text-primary-foreground/80">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              Calculadoras personalizadas
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              Simulações ilimitadas
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              Histórico completo
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
