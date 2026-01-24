import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

// Páginas protegidas
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Historico from "./pages/Historico";
import TribuBot from "./pages/TribuBot";
import Comunidade from "./pages/Comunidade";
import Consultorias from "./pages/Consultorias";
import Configuracoes from "./pages/Configuracoes";
import Noticias from "./pages/Noticias";
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
// Calculadoras
import SplitPayment from "./pages/calculadora/SplitPayment";
import ComparativoRegimes from "./pages/calculadora/ComparativoRegimes";
import CalculadoraRTC from "./pages/calculadora/CalculadoraRTC";

// Painel Executivo
import PainelExecutivo from "./pages/PainelExecutivo";

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
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/documento-comercial" element={<DocumentoComercial />} />
            
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
                  <Noticias />
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
              path="/consultorias" 
              element={
                <ProtectedRoute>
                  <Consultorias />
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

            {/* Admin */}
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
