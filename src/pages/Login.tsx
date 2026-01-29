import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, KeyRound, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoTributech from "@/assets/logo-tributech.png";

type PageState = 'ready' | 'logging-in' | 'redirecting';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [pageState, setPageState] = useState<PageState>('ready');

  // A verificação de sessão existente é feita pelo PublicRoute
  // Login.tsx apenas lida com o formulário de login

  const redirectAfterLogin = async (userId: string) => {
    console.log('[Login] Getting profile for redirect...');
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', userId)
        .maybeSingle();
      
      const destination = profile?.onboarding_complete ? '/dashboard' : '/onboarding';
      console.log('[Login] Redirecting to:', destination);
      
      toast({
        title: "Login realizado!",
        description: "Redirecionando...",
      });
      
      // Usa React Router para navegação SPA (sem reload de página)
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('[Login] Redirect error:', err);
      navigate('/onboarding', { replace: true });
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pageState === 'logging-in' || pageState === 'redirecting') return;
    
    setPageState('logging-in');
    setError(null);

    try {
      console.log('[Login] Attempting password login...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('[Login] SignIn error:', signInError.message);
        if (signInError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
        setPageState('ready');
        return;
      }

      if (!data.user || !data.session) {
        setError('Erro ao fazer login. Tente novamente.');
        setPageState('ready');
        return;
      }

      console.log('[Login] Login successful, user:', data.user.id);
      setPageState('redirecting');
      await redirectAfterLogin(data.user.id);
      
    } catch (err: any) {
      console.error('[Login] Unexpected error:', err);
      setError('Erro inesperado. Tente novamente.');
      setPageState('ready');
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pageState === 'logging-in') return;
    
    setPageState('logging-in');
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      setMagicLinkSent(true);
      setPageState('ready');
      toast({
        title: "Link enviado!",
        description: "Verifique sua caixa de entrada e clique no link para entrar.",
      });
    } catch (err: any) {
      setError('Erro ao enviar link. Verifique o e-mail e tente novamente.');
      setPageState('ready');
    }
  };

  const isPasswordFormValid = email.trim() !== "" && password.trim() !== "";
  const isMagicLinkFormValid = email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isLoading = pageState === 'logging-in';

  // Estado de redirecionamento após login bem-sucedido
  if (pageState === 'redirecting') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <CheckCircle className="w-12 h-12 text-primary" />
        <p className="text-lg font-medium text-foreground">Login realizado!</p>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
      </div>
    );
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Verifique seu e-mail
            </h1>
            <p className="text-muted-foreground mb-6">
              Enviamos um link de acesso para <strong className="text-foreground">{email}</strong>. 
              Clique no link para entrar na sua conta.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Não recebeu? Verifique a pasta de spam.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail("");
              }}
              className="w-full"
            >
              Tentar outro e-mail
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <img src={logoTributech} alt="TribuTalks" className="h-16 w-auto" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground text-center mb-6">
            Acesse sua conta
          </h1>

          {/* Toggle Buttons */}
          <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(false);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                !useMagicLink 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Senha
            </button>
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(true);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                useMagicLink 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              Magic Link
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Password Form */}
          {!useMagicLink && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-secondary border-border focus:border-primary pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={!isPasswordFormValid || isLoading}
              >
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
          )}

          {/* Magic Link Form */}
          {useMagicLink && (
            <form onSubmit={handleMagicLinkLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="magic-email" className="text-sm font-medium text-foreground">
                  E-mail
                </Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-secondary border-border focus:border-primary"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Enviaremos um link de acesso para o seu e-mail. Clique no link para entrar sem precisar de senha.
              </p>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={!isMagicLinkFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link de acesso'
                )}
              </Button>
            </form>
          )}

          {/* Forgot Password Link */}
          {!useMagicLink && (
            <div className="mt-6 text-center">
              <span className="text-muted-foreground text-sm">Esqueceu a senha? </span>
              <Link 
                to="/recuperar-senha" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Recuperar
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-border" />

          {/* Sign Up Link */}
          <p className="text-center text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
