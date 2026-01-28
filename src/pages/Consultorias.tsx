import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, MessageSquare, FileSearch, BarChart3, ArrowRight } from "lucide-react";

const Consultorias = () => {
  const navigate = useNavigate();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/#planos");
    }, 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <DashboardLayout title="Consultorias">
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Consultorias foram descontinuadas
            </h2>
            <p className="text-muted-foreground mb-6">
              Para uma análise tributária completa, agora oferecemos ferramentas de diagnóstico automatizado no <strong>Plano Professional</strong>.
            </p>
            
            <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileSearch className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Análise de XMLs</p>
                  <p className="text-xs text-muted-foreground">Identifique créditos perdidos automaticamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">DRE Inteligente</p>
                  <p className="text-xs text-muted-foreground">Mapeie o impacto da Reforma Tributária</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Clara AI Ilimitada</p>
                  <p className="text-xs text-muted-foreground">Tire dúvidas tributárias 24/7 com IA</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/#planos" className="block">
                <Button className="gap-2 w-full">
                  <Sparkles className="w-4 h-4" />
                  Conhecer Plano Professional
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <a 
                href="https://bit.ly/rescontabilidade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="gap-2 w-full">
                  Falar com R&S Contabilidade
                </Button>
              </a>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Consultorias;