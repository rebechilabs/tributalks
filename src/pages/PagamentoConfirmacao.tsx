import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, ArrowRight, RefreshCw, Home, Loader2, UserPlus, Building2, Target, Check } from "lucide-react";
import { motion } from "framer-motion";

type PaymentStatus = "approved" | "pending" | "rejected" | "unknown";

interface ProfileData {
  onboarding_complete: boolean | null;
}

const STATUS_CONFIG: Record<PaymentStatus, {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  redirectDelay: number | null;
  showRetry: boolean;
}> = {
  approved: {
    icon: CheckCircle2,
    title: "Pagamento Confirmado! 🎉",
    description: "Seu plano já está ativo. Você será redirecionado em instantes.",
    color: "text-success",
    bgColor: "bg-success/10",
    redirectDelay: 4000,
    showRetry: false,
  },
  pending: {
    icon: Clock,
    title: "Pagamento em Processamento ⏳",
    description: "Seu pagamento está sendo processado. Você receberá uma notificação quando for confirmado.",
    color: "text-warning",
    bgColor: "bg-warning/10",
    redirectDelay: 5000,
    showRetry: false,
  },
  rejected: {
    icon: XCircle,
    title: "Pagamento Não Aprovado ❌",
    description: "Houve um problema com seu pagamento. Por favor, tente novamente ou escolha outro método.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    redirectDelay: null,
    showRetry: true,
  },
  unknown: {
    icon: Clock,
    title: "Verificando Status...",
    description: "Estamos verificando o status do seu pagamento.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    redirectDelay: 5000,
    showRetry: false,
  },
};

export default function PagamentoConfirmacao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const hasInitialized = useRef(false);

  // Parse Mercado Pago redirect parameters
  const status = searchParams.get("status") || searchParams.get("collection_status");
  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const paymentType = searchParams.get("payment_type");

  // Determine payment status
  const getPaymentStatus = (): PaymentStatus => {
    if (!status) return "unknown";
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === "approved") return "approved";
    if (normalizedStatus === "pending" || normalizedStatus === "in_process" || normalizedStatus === "authorized") return "pending";
    if (normalizedStatus === "rejected" || normalizedStatus === "cancelled" || normalizedStatus === "refunded") return "rejected";
    
    return "unknown";
  };

  const paymentStatus = getPaymentStatus();
  const config = STATUS_CONFIG[paymentStatus];
  const Icon = config.icon;

  // Fetch profile directly from Supabase (avoids AuthProvider dependency for public route)
  useEffect(() => {
    const fetchProfile = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        console.log('[PagamentoConfirmacao] Checking session...');
        
        // Small delay to give webhook time to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('[PagamentoConfirmacao] User found, fetching profile...');
          const { data: profileData } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('user_id', user.id)
            .maybeSingle();
          
          console.log('[PagamentoConfirmacao] Profile:', profileData);
          setProfile(profileData);
        } else {
          console.log('[PagamentoConfirmacao] No user session');
        }
      } catch (error) {
        console.error('[PagamentoConfirmacao] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Determine target URL based on profile state
  const getTargetUrl = () => {
    if (!profile) return "/login";
    return profile.onboarding_complete ? "/dashboard" : "/onboarding";
  };

  // Auto-redirect countdown - only starts after profile is loaded
  useEffect(() => {
    if (isLoading) return;
    
    if (config.redirectDelay) {
      const seconds = Math.ceil(config.redirectDelay / 1000);
      setCountdown(seconds);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            const targetUrl = getTargetUrl();
            console.log('[PagamentoConfirmacao] Redirecting to:', targetUrl);
            navigate(targetUrl);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [config.redirectDelay, navigate, isLoading, profile]);

  // Show loading while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando seu pagamento...</p>
        </div>
      </div>
    );
  }

  const targetUrl = getTargetUrl();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
              <Icon className={`w-10 h-10 ${config.color}`} />
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {config.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Payment Details */}
            {paymentId && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID do pagamento:</span>
                  <span className="font-mono text-xs">{paymentId}</span>
                </div>
                {paymentType && (
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="capitalize">{paymentType.replace("_", " ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Onboarding Steps Preview */}
            {(paymentStatus === "approved" || paymentStatus === "pending" || paymentStatus === "unknown") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Próximos passos
                </p>
                {[
                  { icon: UserPlus, label: "Criar sua conta", desc: "E-mail e senha" },
                  { icon: Building2, label: "Configurar empresa", desc: "CNPJ e dados fiscais" },
                  { icon: Target, label: "Escolher prioridade", desc: "Foco da sua gestão tributária" },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    <step.icon className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  ⏱ Leva menos de 2 minutos
                </p>
              </motion.div>
            )}

            {/* Countdown for auto-redirect */}
            {countdown !== null && countdown > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Redirecionando em {countdown} segundo{countdown !== 1 ? "s" : ""}...
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {config.showRetry && (
                <Button asChild variant="default" className="w-full">
                  <Link to="/#planos">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Link>
                </Button>
              )}

              <Button
                variant={config.showRetry ? "outline" : "default"}
                className="w-full"
                onClick={() => navigate(targetUrl)}
              >
                {config.showRetry ? (
                  <>
                    <Home className="w-4 h-4 mr-2" />
                    Continuar
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Help text for pending */}
            {paymentStatus === "pending" && (
              <p className="text-xs text-center text-muted-foreground">
                Pagamentos via PIX ou boleto podem levar alguns minutos para serem confirmados.
                Você receberá um e-mail quando o pagamento for processado.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Logo/Branding */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          TribuTalks • Inteligência Tributária
        </p>
      </motion.div>
    </div>
  );
}
