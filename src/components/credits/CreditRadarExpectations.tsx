import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  FileCode2, 
  Database, 
  FileCheck, 
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Target,
  AlertTriangle,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface CreditType {
  name: string;
  description: string;
}

interface DocumentCard {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
  credits: CreditType[];
  result: string;
}

const documentCards: DocumentCard[] = [
  {
    id: 'xml',
    icon: <FileCode2 className="h-6 w-6" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    title: 'XMLs de NF-e',
    subtitle: 'Notas fiscais de entrada e saída',
    description: 'O arquivo XML armazena todas as informações das notas fiscais eletrônicas emitidas e recebidas pela empresa: fornecedor, produtos, valores, impostos destacados, alíquotas aplicadas e NCM dos produtos.',
    credits: [
      { name: 'PIS/COFINS sobre insumos', description: 'Créditos não aproveitados em compras de energia elétrica, fretes, embalagens, manutenção de máquinas, combustíveis e outros insumos da atividade' },
      { name: 'ICMS-ST pago a maior', description: 'Diferenças entre o ICMS retido por substituição tributária e o valor efetivamente devido, especialmente em operações interestaduais' },
      { name: 'IPI creditável', description: 'Créditos de IPI em operações de revenda ou industrialização que não foram aproveitados' },
      { name: 'Divergências de alíquotas', description: 'Diferenças entre a alíquota destacada na nota e a alíquota correta para aquele produto/operação' },
      { name: 'NCM incorreto', description: 'Produtos classificados com NCM errado, gerando tributação maior do que a devida' },
    ],
    result: 'Identificação de créditos tributários não aproveitados nos últimos 5 anos, com valores detalhados por tributo e período.',
  },
  {
    id: 'sped',
    icon: <Database className="h-6 w-6" />,
    iconBg: 'bg-purple-500/10 text-purple-500',
    title: 'SPED Fiscal e Contribuições',
    subtitle: 'EFD-ICMS/IPI e EFD-Contribuições',
    description: 'O SPED é a escrituração fiscal digital completa da empresa. O EFD-ICMS/IPI contém todas as operações de ICMS e IPI. O EFD-Contribuições contém a apuração de PIS e COFINS. Juntos, formam o retrato fiscal completo do negócio.',
    credits: [
      { name: 'Créditos extemporâneos de PIS/COFINS', description: 'Créditos que poderiam ter sido aproveitados em períodos anteriores e ainda podem ser recuperados via retificação' },
      { name: 'Erros de classificação fiscal', description: 'NCMs cadastrados incorretamente que geraram tributação indevida' },
      { name: 'Base de cálculo incorreta', description: 'Valores que não deveriam compor a base de cálculo dos tributos (ex: ICMS na base de PIS/COFINS após exclusão)' },
      { name: 'Créditos presumidos não aproveitados', description: 'Benefícios fiscais setoriais (agroindústria, exportação, etc.) que a empresa tinha direito mas não utilizou' },
      { name: 'Receitas tributadas indevidamente', description: 'Receitas que deveriam ser isentas, não tributadas ou com alíquota zero' },
    ],
    result: 'Mapa completo de oportunidades de recuperação, com rastreabilidade por período, tributo e origem do crédito.',
  },
  {
    id: 'dctf',
    icon: <FileCheck className="h-6 w-6" />,
    iconBg: 'bg-amber-500/10 text-amber-500',
    title: 'DCTF',
    subtitle: 'Declaração de Débitos e Créditos Tributários Federais',
    description: 'A DCTF é a declaração mensal enviada à Receita Federal informando todos os tributos federais devidos e a forma como foram pagos (DARF, compensação, parcelamento). É o "extrato" da relação tributária federal da empresa.',
    credits: [
      { name: 'Pagamentos em duplicidade', description: 'DARFs pagos mais de uma vez para o mesmo período/tributo' },
      { name: 'Pagamentos a maior', description: 'Valores pagos acima do efetivamente devido' },
      { name: 'Compensações não realizadas', description: 'Saldos credores que poderiam ter sido usados para compensar débitos, mas ficaram "parados"' },
      { name: 'Saldos credores não utilizados', description: 'Créditos reconhecidos pela Receita Federal que nunca foram aproveitados' },
      { name: 'Divergências DCTF x DARF', description: 'Diferenças entre o valor declarado e o valor efetivamente pago' },
    ],
    result: 'Identificação de valores pagos indevidamente ao Fisco Federal, com possibilidade de restituição em dinheiro ou compensação com tributos futuros.',
  },
  {
    id: 'pgdas',
    icon: <Calculator className="h-6 w-6" />,
    iconBg: 'bg-green-500/10 text-green-500',
    title: 'PGDAS-D',
    subtitle: 'Programa Gerador do Documento de Arrecadação do Simples Nacional',
    description: 'O PGDAS é o sistema onde as empresas do Simples Nacional fazem a apuração mensal dos tributos. Ele calcula automaticamente o DAS (documento de arrecadação) com base nas receitas informadas e no anexo de enquadramento.',
    credits: [
      { name: 'Enquadramento incorreto de atividades', description: 'Atividades classificadas em anexos com alíquotas maiores do que o correto' },
      { name: 'Fator R não aplicado', description: 'Empresas de serviços que poderiam estar no Anexo III (alíquota menor) por terem folha de pagamento relevante, mas foram tributadas no Anexo V' },
      { name: 'Alíquotas aplicadas indevidamente', description: 'Erros no cálculo progressivo das alíquotas do Simples' },
      { name: 'Sublimites estaduais não observados', description: 'Empresas que ultrapassaram o sublimite estadual e pagaram ICMS/ISS incorretamente' },
      { name: 'ICMS-ST passível de restituição', description: 'Substituição tributária paga por empresas do Simples que têm direito à restituição' },
      { name: 'Receitas segregadas incorretamente', description: 'Receitas de revenda, industrialização e serviços misturadas de forma errada' },
    ],
    result: 'Recálculo do Simples Nacional dos últimos 5 anos, identificando diferenças a restituir ou compensar.',
  },
];

export function CreditRadarExpectations() {
  const [openCards, setOpenCards] = useState<string[]>([]);

  const toggleCard = (id: string) => {
    setOpenCards(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-lg">O que o Radar identifica em cada documento?</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentCards.map((doc) => (
          <Collapsible 
            key={doc.id} 
            open={openCards.includes(doc.id)}
            onOpenChange={() => toggleCard(doc.id)}
          >
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${doc.iconBg}`}>
                      {doc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                        {openCards.includes(doc.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {doc.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* O que contém */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      O que contém
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                  
                  {/* Créditos identificados */}
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      O que o Radar identifica
                    </p>
                    <div className="space-y-2">
                      {doc.credits.map((credit, index) => (
                        <div 
                          key={index}
                          className="border rounded-lg p-3 bg-background"
                        >
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{credit.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {credit.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Resultado esperado */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      Resultado esperado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doc.result}
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
