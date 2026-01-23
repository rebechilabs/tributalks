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

// Páginas protegidas
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Historico from "./pages/Historico";
import TribuBot from "./pages/TribuBot";
import Comunidade from "./pages/Comunidade";
import Consultorias from "./pages/Consultorias";
import Configuracoes from "./pages/Configuracoes";

// Calculadoras
import SplitPayment from "./pages/calculadora/SplitPayment";
import ComparativoRegimes from "./pages/calculadora/ComparativoRegimes";

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
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
