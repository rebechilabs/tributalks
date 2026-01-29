import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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

// Páginas protegidas
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Historico from "./pages/Historico";
import TribuBot from "./pages/TribuBot";
import Comunidade from "./pages/Comunidade";
import Configuracoes from "./pages/Configuracoes";
import NoticiasReforma from "./pages/NoticiasReforma";
import AdminNoticias from "./pages/AdminNoticias";
import ImportarXML from "./pages/ImportarXML";
import XMLResultados from "./pages/XMLResultados";
import RadarCreditos from "./pages/RadarCreditos";
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

// Calculadoras
import SplitPayment from "./pages/calculadora/SplitPayment";
import ComparativoRegimes from "./pages/calculadora/ComparativoRegimes";
import CalculadoraRTC from "./pages/calculadora/CalculadoraRTC";
import CalculadoraNBS from "./pages/calculadora/CalculadoraNBS";

// Painel Executivo
import PainelExecutivo from "./pages/PainelExecutivo";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPilulas from "./pages/admin/AdminPilulas";
import AdminPrazos from "./pages/admin/AdminPrazos";
import AdminUsuarios from "./pages/admin/AdminUsuarios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
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
            
            {/* Protegidas */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
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
              path="/tribubot" 
              element={
                <ProtectedRoute>
                  <TribuBot />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/comunidade" 
              element={
                <ProtectedRoute>
                  <Comunidade />
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

            {/* Calculadoras */}
            <Route 
              path="/calculadora/split-payment" 
              element={
                <ProtectedRoute>
                  <SplitPayment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculadora/comparativo-regimes" 
              element={
                <ProtectedRoute>
                  <ComparativoRegimes />
                </ProtectedRoute>
              } 
            />
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
            
            {/* XML Import */}
            <Route 
              path="/dashboard/importar-xml" 
              element={
                <ProtectedRoute>
                  <ImportarXML />
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
              path="/dashboard/radar-creditos" 
              element={
                <ProtectedRoute>
                  <RadarCreditos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/dre" 
              element={
                <ProtectedRoute>
                  <DRE />
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
              path="/dashboard/score-tributario" 
              element={
                <ProtectedRoute>
                  <ScoreTributario />
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
              path="/dashboard/oportunidades" 
              element={
                <ProtectedRoute>
                  <Oportunidades />
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
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
