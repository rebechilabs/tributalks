import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  CheckCircle2, 
  Quote,
  Package, 
  Heart, 
  Factory, 
  Code 
} from "lucide-react";
import { getCaseStudyBySlug } from "@/data/caseStudies";
import { CaseStudyPdf } from "@/components/cases/CaseStudyPdf";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Heart,
  Factory,
  Code,
};

export default function EstudoCasoDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined;
  
  if (!caseStudy) {
    return <Navigate to="/casos" replace />;
  }

  const Icon = iconMap[caseStudy.sectorIcon] || Package;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await CaseStudyPdf(caseStudy);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          {/* Back Button */}
          <Link to="/casos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Estudos de Caso
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {caseStudy.company}
                  </h1>
                  {caseStudy.featured && (
                    <Badge className="bg-primary/10 text-primary">Destaque</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{caseStudy.sector}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? "Gerando..." : "Baixar PDF"}
            </Button>
          </div>

          {/* Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {caseStudy.results.map((result) => (
              <div 
                key={result.metric}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-primary mb-1">
                  {result.value}
                </div>
                <div className="text-sm font-medium text-foreground mb-1">
                  {result.metric}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.description}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline and Tools */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {caseStudy.timeline}
            </div>
            <div className="flex flex-wrap gap-2">
              {caseStudy.toolsUsed.map((tool) => (
                <Badge key={tool} variant="outline">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-success" />
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <Quote className="w-8 h-8 text-primary mb-4" />
            <p className="text-lg text-foreground italic mb-4">
              "{caseStudy.testimonial.quote}"
            </p>
            <div>
              <div className="font-semibold text-foreground">
                {caseStudy.testimonial.author}
              </div>
              <div className="text-sm text-muted-foreground">
                {caseStudy.testimonial.role}
              </div>
            </div>
          </div>

          {/* Full Story */}
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground mb-4">
              A História Completa
            </h2>
            <div className="text-muted-foreground space-y-4">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-muted-foreground">{children}</p>,
                  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-6 mb-3">{children}</h2>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                }}
              >
                {caseStudy.fullStory}
              </ReactMarkdown>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-card border border-border rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Quer resultados como esse?
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece seu diagnóstico tributário gratuitamente e descubra o potencial de economia da sua empresa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/cadastro">
                <Button size="lg" className="gap-2">
                  Começar diagnóstico grátis
                </Button>
              </Link>
              <Link to="/casos">
                <Button size="lg" variant="outline">
                  Ver outros casos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
