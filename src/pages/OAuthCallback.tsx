import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando autorização...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth error
        if (error) {
          setStatus('error');
          setMessage('Autorização negada');
          setErrorDetails(errorDescription || 'O usuário cancelou a autorização ou ocorreu um erro.');
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Parâmetros inválidos');
          setErrorDetails('Código de autorização ou state não encontrados.');
          return;
        }

        // Get stored state from sessionStorage
        const storedState = sessionStorage.getItem('contaazul_oauth_state');
        const connectionName = sessionStorage.getItem('contaazul_connection_name') || 'Conta Azul';

        if (!storedState) {
          setStatus('error');
          setMessage('Sessão expirada');
          setErrorDetails('Por favor, inicie o processo de conexão novamente.');
          return;
        }

        // Validate state matches (CSRF protection)
        if (state !== storedState) {
          setStatus('error');
          setMessage('Erro de segurança');
          setErrorDetails('Estado inválido detectado. Por favor, tente novamente.');
          return;
        }

        setMessage('Trocando código por tokens...');

        // Get current session
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          setStatus('error');
          setMessage('Não autenticado');
          setErrorDetails('Faça login novamente e tente reconectar.');
          return;
        }

        // Exchange code for tokens via edge function - usando fetch direto para incluir action parameter
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contaazul-oauth?action=exchange`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.session.access_token}`,
            },
            body: JSON.stringify({
              code,
              redirect_uri: 'https://tributalks.com.br/oauth/callback',
              state,
              stored_state: storedState,
              connection_name: connectionName,
            }),
          }
        );

        const data = await response.json();

        // Clear stored state
        sessionStorage.removeItem('contaazul_oauth_state');
        sessionStorage.removeItem('contaazul_connection_name');

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao trocar código por tokens');
        }

        if (!data.success) {
          throw new Error(data.error || 'Resposta inválida do servidor');
        }

        setStatus('success');
        setMessage(data.message || 'Conta Azul conectado com sucesso!');

        // Redirect to integrations after 2 seconds
        setTimeout(() => {
          navigate('/integracoes', { replace: true });
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Erro ao processar autorização');
        setErrorDetails(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/integracoes', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'processing' && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle>{message}</CardTitle>
          {status === 'success' && (
            <CardDescription>Redirecionando para integrações...</CardDescription>
          )}
          {errorDetails && (
            <CardDescription className="text-destructive">{errorDetails}</CardDescription>
          )}
        </CardHeader>
        {status === 'error' && (
          <CardContent className="text-center">
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
