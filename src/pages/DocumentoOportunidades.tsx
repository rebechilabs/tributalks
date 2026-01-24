import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Layers, Zap, FileText, Database, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OpportunitiesDocPdf } from '@/components/docs/OpportunitiesDocPdf';

const SECTOR_STATS = [
  { name: 'Agronegócio', icon: '🌾', count: 6, economy: '15-70%' },
  { name: 'Energia Solar', icon: '☀️', count: 5, economy: '25-100%' },
  { name: 'Saúde', icon: '🏥', count: 4, economy: '50-70%' },
  { name: 'Construção Civil', icon: '🏗️', count: 4, economy: '30-75%' },
  { name: 'Transporte', icon: '🚛', count: 5, economy: '15-35%' },
  { name: 'Alimentação', icon: '🍽️', count: 5, economy: '15-40%' },
  { name: 'E-commerce', icon: '🛒', count: 4, economy: '10-50%' },
  { name: 'Educação', icon: '📚', count: 4, economy: '20-60%' },
];

const FEATURES = [
  {
    icon: Target,
    title: 'Matching Automático',
    description: 'Algoritmo cruza perfil da empresa com 50+ oportunidades fiscais'
  },
  {
    icon: Layers,
    title: '8 Setores Cobertos',
    description: 'Agro, Energia, Saúde, Construção, Transporte, Alimentação, E-commerce, Educação'
  },
  {
    icon: Zap,
    title: 'Cálculo de Economia',
    description: 'Estimativa em reais baseada no faturamento real da empresa'
  },
  {
    icon: FileText,
    title: 'Base Legal Completa',
    description: 'Cada oportunidade com legislação, convênios e referências atualizadas'
  },
  {
    icon: Database,
    title: '45+ Campos Setoriais',
    description: 'Wizard coleta dados específicos por setor para matching preciso'
  },
  {
    icon: Code,
    title: 'Edge Functions',
    description: 'Processamento em tempo real via Supabase Edge Functions'
  }
];

export default function DocumentoOportunidades() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Motor de Oportunidades Tributárias</h1>
            <p className="text-muted-foreground">Documentação técnica e comercial do sistema de matching</p>
          </div>
        </div>

        {/* Hero Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Documentação Completa em PDF</CardTitle>
                <CardDescription>
                  Relatório de ~18 páginas com arquitetura, oportunidades por setor e roadmap
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-primary">37+</div>
                <div className="text-sm text-muted-foreground">Oportunidades Setoriais</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-primary">8</div>
                <div className="text-sm text-muted-foreground">Setores Cobertos</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-primary">45+</div>
                <div className="text-sm text-muted-foreground">Campos de Matching</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-primary">~18</div>
                <div className="text-sm text-muted-foreground">Páginas no PDF</div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center pt-4">
              <OpportunitiesDocPdf />
            </div>
          </CardContent>
        </Card>

        {/* Sectors Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Oportunidades por Setor</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SECTOR_STATS.map((sector) => (
              <Card key={sector.name} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{sector.icon}</div>
                  <div className="font-medium text-sm">{sector.name}</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {sector.count} opções
                    </Badge>
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">
                      {sector.economy}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Funcionalidades do Motor</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{feature.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{feature.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Document Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conteúdo do Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">1</Badge>
                  <span>Capa e Resumo Executivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">2</Badge>
                  <span>Arquitetura Técnica do Sistema</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">3</Badge>
                  <span>Detalhamento por Setor (8 seções)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">4</Badge>
                  <span>Wizard de Perfil Empresarial</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">5</Badge>
                  <span>Algoritmo de Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">6</Badge>
                  <span>Roadmap 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">7</Badge>
                  <span>Fontes e Base Legal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">8</Badge>
                  <span>Contracapa e Contato</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>TribuTech - Inteligência Tributária para Empresas que Crescem</p>
          <p className="mt-1">Documento atualizado em Janeiro/2026</p>
        </div>
      </div>
    </div>
  );
}
