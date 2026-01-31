import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, Info, Briefcase, AlertTriangle, 
  ArrowRight, FileText, HelpCircle, CheckCircle2 
} from "lucide-react";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";
import { FloatingAssistant } from "@/components/common/FloatingAssistant";
import { useToast } from "@/hooks/use-toast";

// Categorias de serviços com alíquotas diferenciadas conforme LC 214/2025
const SERVICOS_CATEGORIAS = [
  {
    codigo: "PADRAO",
    nome: "Serviços em Geral",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Alíquota padrão para serviços não listados em categorias especiais"
  },
  {
    codigo: "SAUDE",
    nome: "Serviços de Saúde",
    aliquotaCBS: 5.28,
    aliquotaIBS: 10.62,
    reducao: 40,
    descricao: "Hospitais, clínicas, laboratórios, consultórios médicos e odontológicos"
  },
  {
    codigo: "EDUCACAO",
    nome: "Serviços de Educação",
    aliquotaCBS: 5.28,
    aliquotaIBS: 10.62,
    reducao: 40,
    descricao: "Escolas, universidades, cursos técnicos e profissionalizantes"
  },
  {
    codigo: "TRANSPORTE_PASSAGEIROS",
    nome: "Transporte de Passageiros",
    aliquotaCBS: 5.28,
    aliquotaIBS: 10.62,
    reducao: 40,
    descricao: "Transporte coletivo urbano, rodoviário, ferroviário e aéreo de passageiros"
  },
  {
    codigo: "TRANSPORTE_CARGAS",
    nome: "Transporte de Cargas",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Transporte rodoviário, ferroviário, aéreo e marítimo de cargas"
  },
  {
    codigo: "TI",
    nome: "Tecnologia da Informação",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Desenvolvimento de software, consultoria em TI, processamento de dados"
  },
  {
    codigo: "ADVOCACIA",
    nome: "Serviços Advocatícios",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Advocacia, consultoria jurídica, assessoria legal",
    nbs: "1.0105"
  },
  {
    codigo: "CONTABILIDADE",
    nome: "Serviços Contábeis",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Contabilidade, auditoria, consultoria fiscal e tributária"
  },
  {
    codigo: "ENGENHARIA",
    nome: "Engenharia e Arquitetura",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Projetos, consultorias técnicas, supervisão de obras"
  },
  {
    codigo: "ALIMENTACAO",
    nome: "Alimentação Preparada",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Restaurantes, bares, lanchonetes, delivery de comida"
  },
  {
    codigo: "HOTELARIA",
    nome: "Hotelaria e Turismo",
    aliquotaCBS: 5.28,
    aliquotaIBS: 10.62,
    reducao: 40,
    descricao: "Hotéis, pousadas, agências de turismo, guias turísticos"
  },
  {
    codigo: "FINANCEIROS",
    nome: "Serviços Financeiros",
    aliquotaCBS: 8.8,
    aliquotaIBS: 17.7,
    descricao: "Bancos, corretoras, seguradoras (não isentos)"
  },
];

interface ResultadoCalculo {
  valorServico: number;
  categoria: typeof SERVICOS_CATEGORIAS[0];
  cbs: number;
  ibs: number;
  total: number;
  aliquotaEfetiva: number;
  valorLiquido: number;
}

export default function CalculadoraNBS() {
  const { toast } = useToast();
  const [valorServico, setValorServico] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCalcular = () => {
    if (!valorServico || !categoriaSelecionada) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o valor do serviço e selecione a categoria.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const valor = parseFloat(valorServico.replace(/\D/g, "")) / 100;
    const categoria = SERVICOS_CATEGORIAS.find(c => c.codigo === categoriaSelecionada);

    if (!categoria) {
      toast({
        title: "Categoria inválida",
        description: "Selecione uma categoria válida.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Cálculo "por dentro" (alíquota sobre o valor total)
    const cbs = valor * (categoria.aliquotaCBS / 100);
    const ibs = valor * (categoria.aliquotaIBS / 100);
    const total = cbs + ibs;
    const aliquotaEfetiva = categoria.aliquotaCBS + categoria.aliquotaIBS;
    const valorLiquido = valor - total;

    setResultado({
      valorServico: valor,
      categoria,
      cbs,
      ibs,
      total,
      aliquotaEfetiva,
      valorLiquido
    });

    setLoading(false);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(value || "0") / 100;
    setValorServico(formatCurrency(numericValue).replace("R$", "").trim());
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Calculadora de Serviços (NBS)</h1>
              <p className="text-muted-foreground">
                Simule CBS + IBS para prestação de serviços na Reforma Tributária
              </p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Simulação baseada na LC 214/2025</AlertTitle>
          <AlertDescription>
            As alíquotas utilizadas são estimativas baseadas na legislação aprovada. 
            A API oficial da Receita Federal ainda não suporta códigos NBS - esta calculadora 
            usa alíquotas de referência por categoria de serviço.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dados do Serviço
              </CardTitle>
              <CardDescription>
                Informe o valor e a categoria do serviço prestado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor do Serviço (R$)</Label>
                <Input
                  id="valor"
                  placeholder="0,00"
                  value={valorServico}
                  onChange={handleValorChange}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria do Serviço</Label>
                <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria do serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICOS_CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.codigo} value={cat.codigo}>
                        <div className="flex items-center gap-2">
                          <span>{cat.nome}</span>
                          {cat.reducao && (
                            <Badge variant="secondary" className="text-xs">
                              -{cat.reducao}%
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriaSelecionada && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {SERVICOS_CATEGORIAS.find(c => c.codigo === categoriaSelecionada)?.descricao}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleCalcular} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? "Calculando..." : "Calcular Tributos"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className={resultado ? "border-primary/50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resultado da Simulação
              </CardTitle>
              <CardDescription>
                Tributos estimados conforme a Reforma Tributária
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resultado ? (
                <div className="space-y-4">
                  {/* Categoria selecionada */}
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{resultado.categoria.nome}</span>
                      {resultado.categoria.reducao && (
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">
                          Alíquota reduzida ({resultado.categoria.reducao}% off)
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Valor do serviço */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Valor do Serviço</span>
                    <span className="text-lg font-semibold">{formatCurrency(resultado.valorServico)}</span>
                  </div>

                  <Separator />

                  {/* CBS */}
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium">CBS (Federal)</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({resultado.categoria.aliquotaCBS}%)
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatCurrency(resultado.cbs)}
                    </span>
                  </div>

                  {/* IBS */}
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium">IBS (Estadual + Municipal)</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({resultado.categoria.aliquotaIBS}%)
                      </span>
                    </div>
                    <span className="font-semibold text-accent-foreground">
                      {formatCurrency(resultado.ibs)}
                    </span>
                  </div>

                  <Separator />

                  {/* Total de tributos */}
                  <div className="flex justify-between items-center py-2 bg-destructive/10 -mx-4 px-4 rounded">
                    <div>
                      <span className="font-bold">Total de Tributos</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({resultado.aliquotaEfetiva.toFixed(2)}%)
                      </span>
                    </div>
                    <span className="text-lg font-bold text-destructive">
                      {formatCurrency(resultado.total)}
                    </span>
                  </div>

                  {/* Valor líquido */}
                  <div className="flex justify-between items-center py-2 bg-secondary -mx-4 px-4 rounded">
                    <span className="font-bold text-secondary-foreground">Valor Líquido</span>
                    <span className="text-lg font-bold text-secondary-foreground">
                      {formatCurrency(resultado.valorLiquido)}
                    </span>
                  </div>

                  {/* Aviso */}
                  <Alert variant="default" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Esta é uma <strong>simulação estimada</strong>. O valor real pode variar conforme 
                      regulamentação específica, regime tributário da empresa e créditos disponíveis.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mb-4 opacity-50" />
                  <p>Preencha os dados do serviço e clique em "Calcular" para ver os tributos estimados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de alíquotas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Tabela de Alíquotas por Categoria
            </CardTitle>
            <CardDescription>
              Alíquotas de referência conforme LC 214/2025 (CBS + IBS)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Categoria</th>
                    <th className="text-center py-3 px-2">CBS</th>
                    <th className="text-center py-3 px-2">IBS</th>
                    <th className="text-center py-3 px-2">Total</th>
                    <th className="text-center py-3 px-2">Redução</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICOS_CATEGORIAS.map((cat) => (
                    <tr key={cat.codigo} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <span className="font-medium">{cat.nome}</span>
                      </td>
                      <td className="text-center py-3 px-2">{cat.aliquotaCBS}%</td>
                      <td className="text-center py-3 px-2">{cat.aliquotaIBS}%</td>
                      <td className="text-center py-3 px-2 font-semibold">
                        {(cat.aliquotaCBS + cat.aliquotaIBS).toFixed(2)}%
                      </td>
                      <td className="text-center py-3 px-2">
                        {cat.reducao ? (
                          <Badge variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {cat.reducao}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

          <TaxDisclaimer />
        </div>
      </div>
      
      <FloatingAssistant />
    </DashboardLayout>
  );
}
