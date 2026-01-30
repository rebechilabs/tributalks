import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  Target, 
  Calculator, 
  BarChart3, 
  LayoutDashboard,
  HelpCircle,
  ExternalLink,
  Lock
} from "lucide-react";
import { TOOLS_MANUAL, getToolsByCategory, type ToolManualEntry } from "@/data/toolsManual";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  entender: { 
    label: "1. Entender", 
    icon: <Target className="h-4 w-4" />,
    description: "Ferramentas para entender o cenário da Reforma Tributária"
  },
  simular: { 
    label: "2. Simular", 
    icon: <Calculator className="h-4 w-4" />,
    description: "Calculadoras e simuladores para projetar impactos"
  },
  diagnosticar: { 
    label: "3. Diagnosticar", 
    icon: <BarChart3 className="h-4 w-4" />,
    description: "Ferramentas de diagnóstico com dados reais"
  },
  comandar: { 
    label: "4. Comandar", 
    icon: <LayoutDashboard className="h-4 w-4" />,
    description: "Dashboards executivos para tomada de decisão"
  },
  extras: { 
    label: "Extras", 
    icon: <BookOpen className="h-4 w-4" />,
    description: "Funcionalidades adicionais e configurações"
  },
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE: { label: "Grátis", color: "bg-muted text-muted-foreground" },
  STARTER: { label: "Starter", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  NAVIGATOR: { label: "Navigator", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  PROFESSIONAL: { label: "Professional", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  ENTERPRISE: { label: "Enterprise", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
};

function ToolCard({ tool }: { tool: ToolManualEntry }) {
  const planInfo = PLAN_LABELS[tool.minPlan];
  
  const handleAskClara = () => {
    window.dispatchEvent(new CustomEvent('openClaraWithQuestion', { 
      detail: { 
        question: `Me explique detalhadamente como usar o ${tool.name} e como preencher cada campo.`
      } 
    }));
  };
  
  return (
    <AccordionItem value={tool.slug} className="border rounded-lg mb-2 px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{tool.name}</span>
              <Badge variant="outline" className={`text-xs ${planInfo.color}`}>
                {planInfo.label}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground font-normal">
              {tool.shortDescription}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-4">
          {/* Descrição completa */}
          <div>
            <h4 className="font-medium text-sm mb-2">O que é</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {tool.fullDescription}
            </p>
          </div>
          
          {/* Quando usar */}
          <div>
            <h4 className="font-medium text-sm mb-2">Quando usar</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tool.whenToUse.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Como funciona */}
          <div>
            <h4 className="font-medium text-sm mb-2">Como funciona</h4>
            <ol className="text-sm text-muted-foreground space-y-1">
              {tool.howItWorks.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-medium">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          
          {/* Campos */}
          {tool.fields && tool.fields.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Campos para preencher</h4>
              <div className="space-y-3">
                {tool.fields.map((field, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                    <div className="font-medium text-sm">{field.name}</div>
                    <div className="text-sm text-muted-foreground">{field.description}</div>
                    {field.example && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Exemplo:</span> {field.example}
                      </div>
                    )}
                    {field.tips && (
                      <div className="text-xs text-primary mt-1 flex items-start gap-1">
                        <span>💡</span> {field.tips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Output */}
          <div>
            <h4 className="font-medium text-sm mb-2">O que você recebe</h4>
            <p className="text-sm text-muted-foreground">{tool.outputDescription}</p>
          </div>
          
          {/* Próximos passos */}
          {tool.nextSteps && tool.nextSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Próximos passos recomendados</h4>
              <div className="flex flex-wrap gap-2">
                {tool.nextSteps.map(slug => {
                  const nextTool = TOOLS_MANUAL.find(t => t.slug === slug);
                  if (!nextTool) return null;
                  return (
                    <Badge key={slug} variant="secondary" className="text-xs">
                      {nextTool.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleAskClara}>
              <Sparkles className="h-4 w-4 mr-2" />
              Perguntar para Clara
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function Ajuda() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  
  // Filtrar ferramentas por busca
  const filteredTools = TOOLS_MANUAL.filter(tool => {
    const searchLower = search.toLowerCase();
    return (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.shortDescription.toLowerCase().includes(searchLower) ||
      tool.fullDescription.toLowerCase().includes(searchLower)
    );
  });
  
  // Agrupar por categoria
  const toolsByCategory = {
    entender: filteredTools.filter(t => t.category === "entender"),
    simular: filteredTools.filter(t => t.category === "simular"),
    diagnosticar: filteredTools.filter(t => t.category === "diagnosticar"),
    comandar: filteredTools.filter(t => t.category === "comandar"),
    extras: filteredTools.filter(t => t.category === "extras"),
  };
  
  const handleAskClara = () => {
    window.dispatchEvent(new CustomEvent('openClaraFreeChat'));
  };
  
  return (
    <DashboardLayout title="Central de Ajuda">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Manual do Usuário</h1>
              <p className="text-muted-foreground">
                Aprenda a usar cada ferramenta da plataforma
              </p>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="default" onClick={handleAskClara}>
              <Sparkles className="h-4 w-4 mr-2" />
              Perguntar para Clara
            </Button>
            <Link to="/#planos">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver planos
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ferramenta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Tabs por categoria */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="todas" className="text-xs sm:text-sm">
              Todas ({filteredTools.length})
            </TabsTrigger>
            {Object.entries(CATEGORY_LABELS).map(([key, cat]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm gap-1">
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(". ")[1] || cat.label}</span>
                <span className="text-muted-foreground">
                  ({toolsByCategory[key as keyof typeof toolsByCategory]?.length || 0})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Todas as ferramentas */}
          <TabsContent value="todas">
            {Object.entries(CATEGORY_LABELS).map(([key, cat]) => {
              const tools = toolsByCategory[key as keyof typeof toolsByCategory];
              if (!tools || tools.length === 0) return null;
              
              return (
                <div key={key} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    {cat.icon}
                    <h2 className="font-semibold">{cat.label}</h2>
                    <span className="text-sm text-muted-foreground">
                      — {cat.description}
                    </span>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {tools.map(tool => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </TabsContent>
          
          {/* Tabs individuais por categoria */}
          {Object.entries(CATEGORY_LABELS).map(([key, cat]) => (
            <TabsContent key={key} value={key}>
              <div className="mb-4">
                <p className="text-muted-foreground">{cat.description}</p>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {toolsByCategory[key as keyof typeof toolsByCategory]?.map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </Accordion>
              {toolsByCategory[key as keyof typeof toolsByCategory]?.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma ferramenta encontrada para "{search}"</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Empty state */}
        {filteredTools.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos ferramentas para "{search}"
              </p>
              <Button variant="outline" onClick={() => setSearch("")}>
                Limpar busca
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Footer CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold">Ainda tem dúvidas?</h3>
                <p className="text-sm text-muted-foreground">
                  A Clara pode te guiar passo a passo em qualquer ferramenta
                </p>
              </div>
              <Button onClick={handleAskClara}>
                Conversar com Clara
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
