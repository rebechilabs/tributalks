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
// Páginas públicas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import NotFound from "./pages/NotFound";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import Contato from "./pages/Contato";
import DocumentoComercial from "./pages/DocumentoComercial";
import DocumentoOportunidades from "./pages/DocumentoOportunidades";
import EstudosCaso from "./pages/EstudosCaso";
import EstudoCasoDetalhe from "./pages/EstudoCasoDetalhe";
import PagamentoConfirmacao from "./pages/PagamentoConfirmacao";
import OAuthCallback from "./pages/OAuthCallback";

// Páginas protegidas
import Onboarding from "./pages/Onboarding";
import OnboardingAI from "./pages/OnboardingAI";
import WelcomeAI from "./pages/WelcomeAI";
import Dashboard from "./pages/Dashboard";
import Upgrade from "./pages/Upgrade";
import Perfil from "./pages/Perfil";
import Historico from "./pages/Historico";
import ClaraAI from "./pages/ClaraAI";
import Comunidade from "./pages/Comunidade";
import Configuracoes from "./pages/Configuracoes";
import NoticiasReforma from "./pages/NoticiasReforma";
import AdminNoticias from "./pages/AdminNoticias";
import AnaliseNotasFiscais from "./pages/AnaliseNotasFiscais";
import XMLResultados from "./pages/XMLResultados";
import DRE from "./pages/DRE";
import DREResultados from "./pages/DREResultados";
import ScoreTributario from "./pages/ScoreTributario";
import PerfilEmpresa from "./pages/PerfilEmpresa";
import Oportunidades from "./pages/Oportunidades";
import CbsIbsNcm from "./pages/CbsIbsNcm";
import TimelineReforma from "./pages/TimelineReforma";
import AnalisadorDocumentos from "./pages/AnalisadorDocumentos";
import WorkflowsGuiados from "./pages/WorkflowsGuiados";
import ChecklistReforma from "./pages/ChecklistReforma";
import Integracoes from "./pages/Integracoes";
import Consultorias from "./pages/Consultorias";
import Indicar from "./pages/Indicar";
import Ajuda from "./pages/Ajuda";

// Calculadoras
import SplitPayment from "./pages/calculadora/SplitPayment";
import ComparativoRegimes from "./pages/calculadora/ComparativoRegimes";
import CalculadoraRTC from "./pages/calculadora/CalculadoraRTC";
import SimprontoPage from "./pages/dashboard/SimprontoPage";
import CalculadoraNBS from "./pages/calculadora/CalculadoraNBS";

// Painel Executivo
import PainelExecutivo from "./pages/PainelExecutivo";
import Nexus from "./pages/Nexus";

// Margem Ativa
import MargemAtiva from "./pages/dashboard/MargemAtiva";

// NEW: Module Pages
import HomePage from "./pages/dashboard/HomePage";
import EntenderPage from "./pages/dashboard/EntenderPage";
import RecuperarPage from "./pages/dashboard/RecuperarPage";
import PrecificacaoPage from "./pages/dashboard/PrecificacaoPage";
import ComandarPage from "./pages/dashboard/ComandarPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import AdminPilulas from "./pages/admin/AdminPilulas";
import AdminPrazos from "./pages/admin/AdminPrazos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminTrainingData from "./pages/admin/AdminTrainingData";
import AdminRAGDashboard from "./pages/admin/AdminRAGDashboard";
import AdminAIHealth from "./pages/admin/AdminAIHealth";
import { PresenceTrackerWrapper } from "./components/PresenceTrackerWrapper";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
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
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/documento-comercial" element={<DocumentoComercial />} />
            <Route path="/documento-oportunidades" element={<DocumentoOportunidades />} />
            <Route path="/casos" element={<EstudosCaso />} />
            <Route path="/casos/:slug" element={<EstudoCasoDetalhe />} />
            <Route path="/pagamento/confirmacao" element={<PagamentoConfirmacao />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/integracoes" element={<ProtectedRoute><Integracoes /></ProtectedRoute>} />
            
            {/* Protegidas */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingAI />
                </ProtectedRoute>
              } 
            />
            {/* Onboarding tradicional (fallback) */}
            <Route 
              path="/onboarding-classic" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            {/* Welcome AI-First - 1 pergunta */}
            <Route 
              path="/welcome" 
              element={
                <ProtectedRoute>
                  <WelcomeAI />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard - redirect to home for Professional */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Home Inteligente */}
            <Route 
              path="/dashboard/home" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Module Landing Pages */}
            <Route 
              path="/dashboard/entender" 
              element={
                <ProtectedRoute>
                  <EntenderPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/recuperar" 
              element={
                <ProtectedRoute>
                  <RecuperarPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/precificacao" 
              element={
                <ProtectedRoute>
                  <PrecificacaoPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/comandar" 
              element={
                <ProtectedRoute>
                  <ComandarPage />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Tools under ENTENDER module */}
            <Route 
              path="/dashboard/entender/dre" 
              element={
                <ProtectedRoute>
                  <DRE />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/entender/score" 
              element={
                <ProtectedRoute>
                  <ScoreTributario />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/entender/comparativo" 
              element={<Navigate to="/dashboard/entender/simpronto" replace />}
            />
            <Route 
              path="/dashboard/entender/simpronto" 
              element={
                <ProtectedRoute>
                  <SimprontoPage />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Tools under RECUPERAR module */}
            <Route 
              path="/dashboard/recuperar/radar" 
              element={
                <ProtectedRoute>
                  <AnaliseNotasFiscais />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/recuperar/oportunidades" 
              element={
                <ProtectedRoute>
                  <Oportunidades />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Tools under PRECIFICACAO module */}
            <Route 
              path="/dashboard/precificacao/margem" 
              element={
                <ProtectedRoute>
                  <MargemAtiva />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/precificacao/split" 
              element={
                <ProtectedRoute>
                  <SplitPayment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/precificacao/priceguard" 
              element={
                <ProtectedRoute>
                  {/* Placeholder for PriceGuard - coming soon */}
                  <PrecificacaoPage />
                </ProtectedRoute>
              } 
            />
            
            {/* NEW: Tools under COMANDAR module */}
            <Route 
              path="/dashboard/comandar/nexus" 
              element={
                <ProtectedRoute>
                  <Nexus />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/comandar/relatorios" 
              element={
                <ProtectedRoute>
                  {/* Placeholder for Relatórios PDF - coming soon */}
                  <ComandarPage />
                </ProtectedRoute>
              } 
            />
            
            {/* LEGACY ROUTES - Redirects for backwards compatibility */}
            <Route path="/dashboard/dre" element={<Navigate to="/dashboard/entender/dre" replace />} />
            <Route path="/dashboard/score-tributario" element={<Navigate to="/dashboard/entender/score" replace />} />
            <Route path="/calculadora/comparativo-regimes" element={<Navigate to="/dashboard/entender/simpronto" replace />} />
            <Route path="/dashboard/analise-notas" element={<Navigate to="/dashboard/recuperar/radar" replace />} />
            <Route path="/dashboard/importar-xml" element={<Navigate to="/dashboard/recuperar/radar" replace />} />
            <Route path="/dashboard/radar-creditos" element={<Navigate to="/dashboard/recuperar/radar" replace />} />
            <Route path="/dashboard/oportunidades" element={<Navigate to="/dashboard/recuperar/oportunidades" replace />} />
            <Route path="/dashboard/margem-ativa" element={<Navigate to="/dashboard/precificacao/margem" replace />} />
            <Route path="/calculadora/split-payment" element={<Navigate to="/dashboard/precificacao/split" replace />} />
            <Route path="/dashboard/nexus" element={<Navigate to="/dashboard/comandar/nexus" replace />} />
            
            {/* Other protected routes (kept as-is) */}
            <Route 
              path="/dashboard/executivo" 
              element={
                <ProtectedRoute>
                  <PainelExecutivo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/noticias" 
              element={
                <ProtectedRoute>
                  <NoticiasReforma />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/timeline-reforma" 
              element={
                <ProtectedRoute>
                  <TimelineReforma />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/historico" 
              element={
                <ProtectedRoute>
                  <Historico />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clara-ai" 
              element={
                <ProtectedRoute>
                  <ClaraAI />
                </ProtectedRoute>
              } 
            />
            {/* Redirect legado /tribubot → /clara-ai */}
            <Route path="/tribubot" element={<ProtectedRoute><ClaraAI /></ProtectedRoute>} />
            <Route 
              path="/comunidade" 
              element={
                <ProtectedRoute>
                  <Comunidade />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/indicar" 
              element={
                <ProtectedRoute>
                  <Indicar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } 
            />

            {/* Calculadoras (legacy paths kept for external links) */}
            <Route 
              path="/calculadora/rtc" 
              element={
                <ProtectedRoute>
                  <CalculadoraRTC />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculadora/servicos" 
              element={
                <ProtectedRoute>
                  <CalculadoraNBS />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/xml-resultados" 
              element={
                <ProtectedRoute>
                  <XMLResultados />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/dre-resultados" 
              element={
                <ProtectedRoute>
              <DREResultados />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/perfil-empresa" 
              element={
                <ProtectedRoute>
                  <PerfilEmpresa />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/cbs-ibs-ncm" 
              element={
                <ProtectedRoute>
                  <CbsIbsNcm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/analisador-documentos" 
              element={
                <ProtectedRoute>
                  <AnalisadorDocumentos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/workflows" 
              element={
                <ProtectedRoute>
                  <WorkflowsGuiados />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/checklist-reforma" 
              element={
                <ProtectedRoute>
                  <ChecklistReforma />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/integracoes" 
              element={
                <ProtectedRoute>
                  <Integracoes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consultorias" 
              element={
                <ProtectedRoute>
                  <Consultorias />
                </ProtectedRoute>
              } 
            />
            {/* Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/monitoring" 
              element={
                <ProtectedRoute>
                  <AdminMonitoring />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/pilulas" 
              element={
                <ProtectedRoute>
                  <AdminPilulas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/prazos" 
              element={
                <ProtectedRoute>
                  <AdminPrazos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute>
                  <AdminUsuarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/noticias" 
              element={
                <ProtectedRoute>
                  <AdminNoticias />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/training-data" 
              element={
                <ProtectedRoute>
                  <AdminTrainingData />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/rag" 
              element={
                <ProtectedRoute>
                  <AdminRAGDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ai-health" 
              element={
                <ProtectedRoute>
                  <AdminAIHealth />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ajuda" 
              element={
                <ProtectedRoute>
                  <Ajuda />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upgrade" 
              element={
                <ProtectedRoute>
                  <Upgrade />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CompanyProvider>
        </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
