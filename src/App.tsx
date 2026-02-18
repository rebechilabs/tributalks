import { lazy, Suspense } from "react";
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

// Páginas públicas (carregadas diretamente - são entry points)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import NotFound from "./pages/NotFound";

// Páginas públicas com lazy loading
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Contato = lazy(() => import("./pages/Contato"));
const Connect = lazy(() => import("./pages/Connect"));
const DocumentoComercial = lazy(() => import("./pages/DocumentoComercial"));
const DocumentoOportunidades = lazy(() => import("./pages/DocumentoOportunidades"));
const EstudosCaso = lazy(() => import("./pages/EstudosCaso"));
const EstudoCasoDetalhe = lazy(() => import("./pages/EstudoCasoDetalhe"));
const PagamentoConfirmacao = lazy(() => import("./pages/PagamentoConfirmacao"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));

// Páginas protegidas com lazy loading
const Onboarding = lazy(() => import("./pages/Onboarding"));
const OnboardingAI = lazy(() => import("./pages/OnboardingAI"));
const Setup = lazy(() => import("./pages/Setup"));
const WelcomeAI = lazy(() => import("./pages/WelcomeAI"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Historico = lazy(() => import("./pages/Historico"));
const ClaraAI = lazy(() => import("./pages/ClaraAI"));
const Comunidade = lazy(() => import("./pages/Comunidade"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NoticiasReforma = lazy(() => import("./pages/NoticiasReforma"));
const AdminNoticias = lazy(() => import("./pages/AdminNoticias"));
const AnaliseNotasFiscais = lazy(() => import("./pages/AnaliseNotasFiscais"));
const XMLResultados = lazy(() => import("./pages/XMLResultados"));
const DRE = lazy(() => import("./pages/DRE"));
const DREResultados = lazy(() => import("./pages/DREResultados"));
const ScoreTributario = lazy(() => import("./pages/ScoreTributario"));
const PerfilEmpresa = lazy(() => import("./pages/PerfilEmpresa"));
const Oportunidades = lazy(() => import("./pages/Oportunidades"));
const CbsIbsNcm = lazy(() => import("./pages/CbsIbsNcm"));
const TimelineReforma = lazy(() => import("./pages/TimelineReforma"));
const AnalisadorDocumentos = lazy(() => import("./pages/AnalisadorDocumentos"));
const WorkflowsGuiados = lazy(() => import("./pages/WorkflowsGuiados"));
const ChecklistReforma = lazy(() => import("./pages/ChecklistReforma"));
const Integracoes = lazy(() => import("./pages/Integracoes"));
const Consultorias = lazy(() => import("./pages/Consultorias"));
const Indicar = lazy(() => import("./pages/Indicar"));
const Ajuda = lazy(() => import("./pages/Ajuda"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));

// Calculadoras
const SplitPayment = lazy(() => import("./pages/calculadora/SplitPayment"));
const ComparativoRegimes = lazy(() => import("./pages/calculadora/ComparativoRegimes"));
const CalculadoraRTC = lazy(() => import("./pages/calculadora/CalculadoraRTC"));
const ComparativoRegimesPage = lazy(() => import("./pages/dashboard/ComparativoRegimesPage"));
const CalculadoraNBS = lazy(() => import("./pages/calculadora/CalculadoraNBS"));

// Painel Executivo
const PainelExecutivo = lazy(() => import("./pages/PainelExecutivo"));
const ValuationPage = lazy(() => import("./pages/ValuationPage"));
const Nexus = lazy(() => import("./pages/Nexus"));

// Margem Ativa
const MargemAtiva = lazy(() => import("./pages/dashboard/MargemAtiva"));

// Module Pages
const HomePage = lazy(() => import("./pages/dashboard/HomePage"));
const EntenderPage = lazy(() => import("./pages/dashboard/EntenderPage"));
const RecuperarPage = lazy(() => import("./pages/dashboard/RecuperarPage"));
const PlanejarPage = lazy(() => import("./pages/dashboard/PlanejarPage"));
const PrecificacaoPage = lazy(() => import("./pages/dashboard/PrecificacaoPage"));
const ComandarPage = lazy(() => import("./pages/dashboard/ComandarPage"));
const ConexaoPage = lazy(() => import("./pages/dashboard/ConexaoPage"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMonitoring = lazy(() => import("./pages/admin/AdminMonitoring"));
const AdminPilulas = lazy(() => import("./pages/admin/AdminPilulas"));
const AdminPrazos = lazy(() => import("./pages/admin/AdminPrazos"));
const AdminUsuarios = lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminTrainingData = lazy(() => import("./pages/admin/AdminTrainingData"));
const AdminRAGDashboard = lazy(() => import("./pages/admin/AdminRAGDashboard"));
const AdminAIHealth = lazy(() => import("./pages/admin/AdminAIHealth"));

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
