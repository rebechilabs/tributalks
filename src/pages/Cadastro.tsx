import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Eye, EyeOff, Gift } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import logoTributalks from "@/assets/logo-tributalks.png";
import { supabase } from "@/integrations/supabase/client";

const Cadastro = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
    aceitaNewsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validRefCode, setValidRefCode] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Valida código de indicação ao carregar
  useEffect(() => {
    const validateRef = async () => {
      if (!refCode) return;
      
      const { data } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('code', refCode.toUpperCase())
        .maybeSingle();
      
      if (data) {
        setValidRefCode(data.code);
      }
    };
    
    validateRef();
  }, [refCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (formData.senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "Senhas não conferem";
    }

    if (!formData.aceitaTermos) {
      newErrors.aceitaTermos = "Você deve aceitar os termos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.senha, formData.nome);
      
      // Registra a indicação se houver código válido
      if (validRefCode) {
        // Busca o usuário recém-criado
        const { data: { user: newUser } } = await supabase.auth.getUser();
        
        if (newUser) {
          // Busca o indicador
          const { data: refData } = await supabase
            .from('referral_codes')
            .select('user_id, total_referrals')
            .eq('code', validRefCode)
            .single();
          
          if (refData && refData.user_id !== newUser.id) {
            // Insere a indicação
            await supabase
              .from('referrals')
              .insert({
                referrer_id: refData.user_id,
                referred_id: newUser.id,
                referral_code: validRefCode,
                status: 'pending',
              });
            
            // Incrementa contador
            await supabase
              .from('referral_codes')
              .update({ total_referrals: (refData.total_referrals || 0) + 1 })
              .eq('user_id', refData.user_id);
          }
        }
      }
      
      // Inscrição na newsletter (silenciosa, não bloqueia fluxo)
      if (formData.aceitaNewsletter) {
        try {
          await supabase.functions.invoke('subscribe-newsletter', {
            body: { email: formData.email }
          });
        } catch (e) {
          console.error('Newsletter subscription failed:', e);
        }
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: validRefCode 
          ? "Você foi indicado por um amigo! Bem-vindo ao TribuTalks." 
          : "Bem-vindo ao TribuTalks. Vamos configurar seu perfil.",
      });
      navigate('/onboarding');
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        setGeneralError('Este e-mail já está cadastrado');
      } else {
        setGeneralError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isFormValid = formData.nome.trim() !== "" && 
    formData.email.trim() !== "" && 
    formData.senha.trim() !== "" && 
    formData.confirmarSenha.trim() !== "" && 
    formData.aceitaTermos;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoTributalks} alt="TribuTalks" className="h-16 w-auto" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Crie sua conta
          </h1>
          
          {/* Referral Badge */}
          {validRefCode && (
            <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 justify-center">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Indicado por um amigo!
              </span>
            </div>
          )}

          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{generalError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-foreground">
                Nome completo
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="João Silva"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
                disabled={isLoading}
                className={`h-12 bg-secondary border-border focus:border-primary ${errors.nome ? 'border-destructive' : ''}`}
              />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={isLoading}
                className={`h-12 bg-secondary border-border focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => handleChange("senha", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 bg-secondary border-border focus:border-primary pr-12 ${errors.senha ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
              {errors.senha && <p className="text-xs text-destructive">{errors.senha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-sm font-medium text-foreground">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmarSenha}
                  onChange={(e) => handleChange("confirmarSenha", e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-12 bg-secondary border-border focus:border-primary pr-12 ${errors.confirmarSenha ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmarSenha && <p className="text-xs text-destructive">{errors.confirmarSenha}</p>}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="termos"
                checked={formData.aceitaTermos}
                onCheckedChange={(checked) => handleChange("aceitaTermos", checked as boolean)}
                disabled={isLoading}
                className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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

            <div className="flex items-start gap-3">
              <Checkbox
                id="newsletter"
                checked={formData.aceitaNewsletter}
                onCheckedChange={(checked) => handleChange("aceitaNewsletter", checked as boolean)}
                disabled={isLoading}
                className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="newsletter" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Quero receber a TribuTalks News (novidades e dicas tributárias)
              </Label>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t border-border" />

          {/* Sign In Link */}
          <p className="text-center text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;