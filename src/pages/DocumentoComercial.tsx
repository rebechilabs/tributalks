import { TribuTalksPitchPdf } from "@/components/docs/TribuTalksPitchPdf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DocumentoComercial = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Documento Comercial TribuTalks</CardTitle>
            <CardDescription className="text-base">
              Visão completa da plataforma para apresentação comercial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Ferramentas</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">14</div>
                <div className="text-sm text-muted-foreground">Edge Functions</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">37+</div>
                <div className="text-sm text-muted-foreground">Oportunidades</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">4</div>
                <div className="text-sm text-muted-foreground">Planos</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">O que está incluído:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Visão Geral</Badge>
                <Badge variant="outline">12 Ferramentas Detalhadas</Badge>
                <Badge variant="outline">Inputs & Outputs</Badge>
                <Badge variant="outline">Arquitetura Técnica</Badge>
                <Badge variant="outline">14 Edge Functions</Badge>
                <Badge variant="outline">Papel da IA</Badge>
                <Badge variant="outline">Modelo de Negócio</Badge>
                <Badge variant="outline">Público-Alvo</Badge>
                <Badge variant="outline">Diferenciais</Badge>
                <Badge variant="outline">Roadmap 2026</Badge>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <TribuTalksPitchPdf />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              O PDF será gerado localmente no seu navegador com ~10 páginas detalhadas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentoComercial;
