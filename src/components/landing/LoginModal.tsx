import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Mail, KeyRound, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoTributalks from "@/assets/logo-tributalks.png";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalState = 'ready' | 'logging-in' | 'redirecting' | 'magic-link-sent';

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [modalState, setModalState] = useState<ModalState>('ready');

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setModalState('ready');
    setUseMagicLink(false);
  };

  const handleClose = () => {
    if (modalState === 'logging-in' || modalState === 'redirecting') return;
    resetForm();
    onOpenChange(false);
  };

  const redirectAfterLogin = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', userId)
        .maybeSingle();
      
      const destination = profile?.onboarding_complete ? '/dashboard' : '/onboarding';
      
      toast({
        title: "Login realizado!",
        description: "Redirecionando...",
      });
      
      onOpenChange(false);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('[LoginModal] Redirect error:', err);
      onOpenChange(false);
      navigate('/onboarding', { replace: true });
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState !== 'ready') return;
    
    setModalState('logging-in');
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
        setModalState('ready');
        return;
      }

      if (!data.user || !data.session) {
        setError('Erro ao fazer login. Tente novamente.');
        setModalState('ready');
        return;
      }

      setModalState('redirecting');
      await redirectAfterLogin(data.user.id);
      
    } catch (err: any) {
      console.error('[LoginModal] Unexpected error:', err);
      setError('Erro inesperado. Tente novamente.');
      setModalState('ready');
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState !== 'ready') return;
    
    setModalState('logging-in');
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      setModalState('magic-link-sent');
      toast({
        title: "Link enviado!",
        description: "Verifique sua caixa de entrada e clique no link para entrar.",
      });
    } catch (err: any) {
      setError('Erro ao enviar link. Verifique o e-mail e tente novamente.');
      setModalState('ready');
    }
  };

  const isPasswordFormValid = email.trim() !== "" && password.trim() !== "";
  const isMagicLinkFormValid = email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isLoading = modalState === 'logging-in';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Redirecting State */}
        {modalState === 'redirecting' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <CheckCircle className="w-12 h-12 text-primary" />
            <p className="text-lg font-medium text-foreground">Login realizado!</p>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        )}

        {/* Magic Link Sent State */}
        {modalState === 'magic-link-sent' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">
              Verifique seu e-mail
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Enviamos um link de acesso para <strong className="text-foreground">{email}</strong>. 
              Clique no link para entrar.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Não recebeu? Verifique a pasta de spam.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setModalState('ready');
                setEmail("");
              }}
              className="w-full"
            >
              Tentar outro e-mail
            </Button>
          </div>
        )}

        {/* Login Form */}
        {(modalState === 'ready' || modalState === 'logging-in') && (
          <>
            <DialogHeader className="p-6 pb-0">
              <div className="flex justify-center mb-4">
                <img src={logoTributalks} alt="TribuTalks" className="h-12 w-auto" />
              </div>
              <DialogTitle className="text-xl text-center">
                Acesse sua conta
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 pt-4">
              {/* Toggle Buttons */}
              <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUseMagicLink(false);
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
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
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Password Form */}
              {!useMagicLink && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-email" className="text-sm font-medium">
                      E-mail
                    </Label>
                    <Input
                      id="modal-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modal-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="modal-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 bg-secondary border-border pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
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
                <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-magic-email" className="text-sm font-medium">
                      E-mail
                    </Label>
                    <Input
                      id="modal-magic-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 bg-secondary border-border"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Enviaremos um link de acesso para o seu e-mail.
                  </p>

                  <Button 
                    type="submit" 
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
                <div className="mt-4 text-center">
                  <Link 
                    to="/recuperar-senha" 
                    className="text-sm text-primary hover:underline"
                    onClick={() => onOpenChange(false)}
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              )}

              {/* Divider */}
              <div className="my-4 border-t border-border" />

              {/* Sign Up Link */}
              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link 
                  to="/cadastro" 
                  className="text-primary hover:underline font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
