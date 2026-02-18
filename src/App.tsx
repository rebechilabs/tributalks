import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PresenceTrackerWrapper } from "./components/PresenceTrackerWrapper";
import { AppVersionChecker } from "./components/AppVersionChecker";
import { GlobalShortcutsProvider } from "./components/GlobalShortcutsProvider";

// Helper: retry dynamic imports to handle stale Vite HMR cache
const lazyWithRetry = (importFn: () => Promise<any>, retries = 3): React.LazyExoticComponent<any> => {
  return lazy(() => {
    const attempt = (attemptsLeft: number): Promise<any> =>
      importFn().catch((error: any) => {
        if (attemptsLeft <= 1) {
          // Last resort: force a full page reload to clear stale cache
          window.location.reload();
          return new Promise(() => {}); // never resolves — page is reloading
        }
        return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
          attempt(attemptsLeft - 1)
        );
      });
    return attempt(retries);
  });
};

// Páginas públicas (carregadas diretamente - são entry points)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import NotFound from "./pages/NotFound";

// Páginas públicas com lazy loading
const Termos = lazyWithRetry(() => import("./pages/Termos"));
const Privacidade = lazyWithRetry(() => import("./pages/Privacidade"));
const Contato = lazyWithRetry(() => import("./pages/Contato"));
const Connect = lazyWithRetry(() => import("./pages/Connect"));
const DocumentoComercial = lazyWithRetry(() => import("./pages/DocumentoComercial"));
const DocumentoOportunidades = lazyWithRetry(() => import("./pages/DocumentoOportunidades"));
const EstudosCaso = lazyWithRetry(() => import("./pages/EstudosCaso"));
const EstudoCasoDetalhe = lazyWithRetry(() => import("./pages/EstudoCasoDetalhe"));
const PagamentoConfirmacao = lazyWithRetry(() => import("./pages/PagamentoConfirmacao"));
const OAuthCallback = lazyWithRetry(() => import("./pages/OAuthCallback"));

// Páginas protegidas com lazy loading
const Onboarding = lazyWithRetry(() => import("./pages/Onboarding"));
const OnboardingAI = lazyWithRetry(() => import("./pages/OnboardingAI"));
const Setup = lazyWithRetry(() => import("./pages/Setup"));
const WelcomeAI = lazyWithRetry(() => import("./pages/WelcomeAI"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const Upgrade = lazyWithRetry(() => import("./pages/Upgrade"));
const Perfil = lazyWithRetry(() => import("./pages/Perfil"));
const Historico = lazyWithRetry(() => import("./pages/Historico"));
const ClaraAI = lazyWithRetry(() => import("./pages/ClaraAI"));
const Comunidade = lazyWithRetry(() => import("./pages/Comunidade"));
const Configuracoes = lazyWithRetry(() => import("./pages/Configuracoes"));
const NoticiasReforma = lazyWithRetry(() => import("./pages/NoticiasReforma"));
const AdminNoticias = lazyWithRetry(() => import("./pages/AdminNoticias"));
const AnaliseNotasFiscais = lazyWithRetry(() => import("./pages/AnaliseNotasFiscais"));
const XMLResultados = lazyWithRetry(() => import("./pages/XMLResultados"));
const DRE = lazyWithRetry(() => import("./pages/DRE"));
const DREResultados = lazyWithRetry(() => import("./pages/DREResultados"));
const ScoreTributario = lazyWithRetry(() => import("./pages/ScoreTributario"));
const PerfilEmpresa = lazyWithRetry(() => import("./pages/PerfilEmpresa"));
const Oportunidades = lazyWithRetry(() => import("./pages/Oportunidades"));
const CbsIbsNcm = lazyWithRetry(() => import("./pages/CbsIbsNcm"));
const TimelineReforma = lazyWithRetry(() => import("./pages/TimelineReforma"));
const AnalisadorDocumentos = lazyWithRetry(() => import("./pages/AnalisadorDocumentos"));
const WorkflowsGuiados = lazyWithRetry(() => import("./pages/WorkflowsGuiados"));
const ChecklistReforma = lazyWithRetry(() => import("./pages/ChecklistReforma"));
const Integracoes = lazyWithRetry(() => import("./pages/Integracoes"));
const Consultorias = lazyWithRetry(() => import("./pages/Consultorias"));
const Indicar = lazyWithRetry(() => import("./pages/Indicar"));
const Ajuda = lazyWithRetry(() => import("./pages/Ajuda"));
const NewsletterPage = lazyWithRetry(() => import("./pages/NewsletterPage"));

// Calculadoras
const SplitPayment = lazyWithRetry(() => import("./pages/calculadora/SplitPayment"));
const ComparativoRegimes = lazyWithRetry(() => import("./pages/calculadora/ComparativoRegimes"));
const CalculadoraRTC = lazyWithRetry(() => import("./pages/calculadora/CalculadoraRTC"));
const ComparativoRegimesPage = lazyWithRetry(() => import("./pages/dashboard/ComparativoRegimesPage"));
const CalculadoraNBS = lazyWithRetry(() => import("./pages/calculadora/CalculadoraNBS"));

// Painel Executivo
const PainelExecutivo = lazyWithRetry(() => import("./pages/PainelExecutivo"));
const ValuationPage = lazyWithRetry(() => import("./pages/ValuationPage"));
const Nexus = lazyWithRetry(() => import("./pages/Nexus"));

// Margem Ativa
const MargemAtiva = lazyWithRetry(() => import("./pages/dashboard/MargemAtiva"));

// Module Pages
const HomePage = lazyWithRetry(() => import("./pages/dashboard/HomePage"));
const EntenderPage = lazyWithRetry(() => import("./pages/dashboard/EntenderPage"));
const RecuperarPage = lazyWithRetry(() => import("./pages/dashboard/RecuperarPage"));
const PlanejarPage = lazyWithRetry(() => import("./pages/dashboard/PlanejarPage"));
const PrecificacaoPage = lazyWithRetry(() => import("./pages/dashboard/PrecificacaoPage"));
const ComandarPage = lazyWithRetry(() => import("./pages/dashboard/ComandarPage"));
const ConexaoPage = lazyWithRetry(() => import("./pages/dashboard/ConexaoPage"));

// Admin
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const AdminMonitoring = lazyWithRetry(() => import("./pages/admin/AdminMonitoring"));
const AdminPilulas = lazyWithRetry(() => import("./pages/admin/AdminPilulas"));
const AdminPrazos = lazyWithRetry(() => import("./pages/admin/AdminPrazos"));
const AdminUsuarios = lazyWithRetry(() => import("./pages/admin/AdminUsuarios"));
const AdminTrainingData = lazyWithRetry(() => import("./pages/admin/AdminTrainingData"));
const AdminRAGDashboard = lazyWithRetry(() => import("./pages/admin/AdminRAGDashboard"));
const AdminAIHealth = lazyWithRetry(() => import("./pages/admin/AdminAIHealth"));

const queryClient = new QueryClient();

// Wrapper component for lazy-loaded routes
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner text="Carregando..." />}>
    {children}
  </Suspense>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
          <GlobalShortcutsProvider>
          <ConnectionStatus />
          <AppVersionChecker />
          <PresenceTrackerWrapper />
          <Toaster />
          <Sonner />
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
            
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/termos" element={<LazyRoute><Termos /></LazyRoute>} />
            <Route path="/privacidade" element={<LazyRoute><Privacidade /></LazyRoute>} />
            <Route path="/contato" element={<LazyRoute><Contato /></LazyRoute>} />
            <Route path="/connect" element={<LazyRoute><Connect /></LazyRoute>} />
            <Route path="/documento-comercial" element={<LazyRoute><DocumentoComercial /></LazyRoute>} />
            <Route path="/documento-oportunidades" element={<LazyRoute><DocumentoOportunidades /></LazyRoute>} />
            <Route path="/casos" element={<LazyRoute><EstudosCaso /></LazyRoute>} />
            <Route path="/casos/:slug" element={<LazyRoute><EstudoCasoDetalhe /></LazyRoute>} />
            <Route path="/pagamento/confirmacao" element={<LazyRoute><PagamentoConfirmacao /></LazyRoute>} />
            <Route path="/oauth/callback" element={<LazyRoute><OAuthCallback /></LazyRoute>} />
            <Route path="/integracoes" element={<ProtectedRoute><LazyRoute><Integracoes /></LazyRoute></ProtectedRoute>} />
            
            {/* Protegidas */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <LazyRoute><OnboardingAI /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            {/* Onboarding tradicional (fallback) */}
            <Route 
              path="/onboarding-classic" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <LazyRoute><Onboarding /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            {/* Setup page for company registration */}
            <Route 
              path="/setup" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <LazyRoute><Setup /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            {/* Welcome AI-First - 1 pergunta */}
            <Route 
              path="/welcome" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <LazyRoute><WelcomeAI /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard - redirect to home for Professional */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Dashboard /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Home Inteligente */}
            <Route 
              path="/dashboard/home" 
              element={
                <ProtectedRoute>
                  <LazyRoute><HomePage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Module Landing Pages */}
            <Route 
              path="/dashboard/entender" 
              element={
                <ProtectedRoute>
                  <LazyRoute><EntenderPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/recuperar" 
              element={
                <ProtectedRoute>
                  <LazyRoute><RecuperarPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/precificacao" 
              element={
                <ProtectedRoute>
                  <LazyRoute><PrecificacaoPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/comandar" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ComandarPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/planejar" 
              element={
                <ProtectedRoute>
                  <LazyRoute><PlanejarPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/conexao" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ConexaoPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Tools under ENTENDER module */}
            <Route 
              path="/dashboard/entender/dre" 
              element={
                <ProtectedRoute>
                  <LazyRoute><DRE /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/entender/score" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ScoreTributario /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/entender/comparativo" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ComparativoRegimesPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            {/* Redirect legacy simpronto route */}
            <Route 
              path="/dashboard/entender/simpronto" 
              element={<Navigate to="/dashboard/entender/comparativo" replace />}
            />
            
            {/* Tools under RECUPERAR module */}
            <Route 
              path="/dashboard/recuperar/radar" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AnaliseNotasFiscais /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/planejar/oportunidades" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Oportunidades /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Tools under PRECIFICACAO module */}
            <Route 
              path="/dashboard/precificacao/margem" 
              element={
                <ProtectedRoute>
                  <LazyRoute><MargemAtiva /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/precificacao/split" 
              element={
                <ProtectedRoute>
                  <LazyRoute><SplitPayment /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/precificacao/priceguard" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/precificacao/margem?tab=priceguard" replace />
                </ProtectedRoute>
              } 
            />
            
            {/* Tools under COMANDAR module */}
            <Route 
              path="/dashboard/comandar/nexus" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Nexus /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/comandar/valuation" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ValuationPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/comandar/relatorios" 
              element={
                <ProtectedRoute>
                  {/* Placeholder for Relatórios PDF - coming soon */}
                  <LazyRoute><ComandarPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* LEGACY ROUTES - Redirects for backwards compatibility */}
            <Route path="/dashboard/dre" element={<Navigate to="/dashboard/entender/dre" replace />} />
            <Route path="/dashboard/score-tributario" element={<Navigate to="/dashboard/entender/score" replace />} />
            <Route path="/calculadora/comparativo-regimes" element={<Navigate to="/dashboard/entender/comparativo" replace />} />
            <Route path="/dashboard/analise-notas" element={<Navigate to="/dashboard/recuperar/radar" replace />} />
            <Route path="/dashboard/importar-xml" element={<Navigate to="/dashboard/recuperar/radar" replace />} />
            <Route path="/dashboard/radar-creditos" element={<Navigate to="/dashboard/recuperar/radar" replace />} />
            <Route path="/dashboard/oportunidades" element={<Navigate to="/dashboard/planejar/oportunidades" replace />} />
            <Route path="/dashboard/recuperar/oportunidades" element={<Navigate to="/dashboard/planejar/oportunidades" replace />} />
            <Route path="/dashboard/margem-ativa" element={<Navigate to="/dashboard/precificacao/margem" replace />} />
            <Route path="/calculadora/split-payment" element={<Navigate to="/dashboard/precificacao/split" replace />} />
            <Route path="/dashboard/nexus" element={<Navigate to="/dashboard/comandar/nexus" replace />} />
            
            {/* Other protected routes (kept as-is) */}
            <Route 
              path="/dashboard/executivo" 
              element={
                <ProtectedRoute>
                  <LazyRoute><PainelExecutivo /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/noticias" 
              element={
                <ProtectedRoute>
                  <LazyRoute><NoticiasReforma /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/timeline-reforma" 
              element={
                <ProtectedRoute>
                  <LazyRoute><TimelineReforma /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Perfil /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/historico" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Historico /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clara-ai" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ClaraAI /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            {/* Redirect legado /tribubot → /clara-ai */}
            <Route path="/tribubot" element={<ProtectedRoute><LazyRoute><ClaraAI /></LazyRoute></ProtectedRoute>} />
            <Route 
              path="/comunidade" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Comunidade /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/newsletter" 
              element={
                <ProtectedRoute>
                  <LazyRoute><NewsletterPage /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/indicar" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Indicar /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Configuracoes /></LazyRoute>
                </ProtectedRoute>
              } 
            />

            {/* Calculadoras (legacy paths kept for external links) */}
            <Route 
              path="/calculadora/rtc" 
              element={
                <ProtectedRoute>
                  <LazyRoute><CalculadoraRTC /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculadora/servicos" 
              element={
                <ProtectedRoute>
                  <LazyRoute><CalculadoraNBS /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/xml-resultados" 
              element={
                <ProtectedRoute>
                  <LazyRoute><XMLResultados /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/dre-resultados" 
              element={
                <ProtectedRoute>
                  <LazyRoute><DREResultados /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/perfil-empresa" 
              element={
                <ProtectedRoute>
                  <LazyRoute><PerfilEmpresa /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/cbs-ibs-ncm" 
              element={
                <ProtectedRoute>
                  <LazyRoute><CbsIbsNcm /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/analisador-documentos" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AnalisadorDocumentos /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/workflows" 
              element={
                <ProtectedRoute>
                  <LazyRoute><WorkflowsGuiados /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/checklist-reforma" 
              element={
                <ProtectedRoute>
                  <LazyRoute><ChecklistReforma /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/integracoes" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Integracoes /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consultorias" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Consultorias /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            {/* Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminDashboard /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/monitoring" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminMonitoring /></LazyRoute>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/pilulas" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminPilulas /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/prazos" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminPrazos /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminUsuarios /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/noticias" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminNoticias /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/training-data" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminTrainingData /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/rag" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminRAGDashboard /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ai-health" 
              element={
                <ProtectedRoute>
                  <LazyRoute><AdminAIHealth /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ajuda" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Ajuda /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upgrade" 
              element={
                <ProtectedRoute>
                  <LazyRoute><Upgrade /></LazyRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </GlobalShortcutsProvider>
          </CompanyProvider>
        </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
