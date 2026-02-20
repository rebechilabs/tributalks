import { useState } from 'react';
import { Package, Briefcase, Search, Plus, Trash2, Tag, ArrowRight, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { NCMSearchModal } from '@/components/rtc/NCMSearchModal';

// Categorias de serviços do CalculadoraNBS
const SERVICOS_CATEGORIAS = [
  { codigo: "PADRAO", nome: "Serviços em Geral", aliquota: 26.5 },
  { codigo: "SAUDE", nome: "Serviços de Saúde", aliquota: 15.9, reducao: 40 },
  { codigo: "EDUCACAO", nome: "Serviços de Educação", aliquota: 15.9, reducao: 40 },
  { codigo: "TRANSPORTE_PASSAGEIROS", nome: "Transporte de Passageiros", aliquota: 15.9, reducao: 40 },
  { codigo: "TRANSPORTE_CARGAS", nome: "Transporte de Cargas", aliquota: 26.5 },
  { codigo: "TI", nome: "Tecnologia da Informação", aliquota: 26.5 },
  { codigo: "ADVOCACIA", nome: "Serviços Advocatícios", aliquota: 26.5 },
  { codigo: "CONTABILIDADE", nome: "Serviços Contábeis", aliquota: 26.5 },
  { codigo: "ENGENHARIA", nome: "Engenharia e Arquitetura", aliquota: 26.5 },
  { codigo: "ALIMENTACAO", nome: "Alimentação Preparada", aliquota: 26.5 },
  { codigo: "HOTELARIA", nome: "Hotelaria e Turismo", aliquota: 15.9, reducao: 40 },
  { codigo: "FINANCEIROS", nome: "Serviços Financeiros", aliquota: 26.5 },
];

export interface ProductCatalogItem {
  id: string;
  tipo: 'produto' | 'servico';
  ncm_code?: string;
  ncm_descricao?: string;
  nbs_categoria?: string;
  nome: string;
  percentual_receita: number;
}

interface ProductCatalogStepProps {
  items: ProductCatalogItem[];
  onChange: (items: ProductCatalogItem[]) => void;
  onSkip: () => void;
  onFinish: () => void;
  loading?: boolean;
}

export function ProductCatalogStep({ items, onChange, onSkip, onFinish, loading }: ProductCatalogStepProps) {
  const [tipo, setTipo] = useState<'produto' | 'servico'>('produto');
  const [ncmModalOpen, setNcmModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [ncmCode, setNcmCode] = useState('');
  const [ncmDescricao, setNcmDescricao] = useState('');
  const [nbsCategoria, setNbsCategoria] = useState('');
  const [percentual, setPercentual] = useState('');

  const handleNcmSelect = (ncm: string, descricao: string) => {
    setNcmCode(ncm);
    setNcmDescricao(descricao);
    if (!nome) {
      setNome(descricao.substring(0, 50));
    }
  };

  const handleAddItem = () => {
    if (tipo === 'produto' && !ncmCode) return;
    if (tipo === 'servico' && !nbsCategoria) return;
    if (!nome.trim()) return;

    const newItem: ProductCatalogItem = {
      id: crypto.randomUUID(),
      tipo,
      nome: nome.trim(),
      percentual_receita: parseFloat(percentual) || 0,
      ...(tipo === 'produto' ? { ncm_code: ncmCode, ncm_descricao: ncmDescricao } : { nbs_categoria: nbsCategoria }),
    };

    onChange([...items, newItem]);
    
    // Reset form
    setNome('');
    setNcmCode('');
    setNcmDescricao('');
    setNbsCategoria('');
    setPercentual('');
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const formatNcm = (ncm: string) => {
    const clean = ncm.replace(/\D/g, '').padEnd(8, '0');
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`;
  };

  const getCategoriaLabel = (codigo: string) => {
    return SERVICOS_CATEGORIAS.find(c => c.codigo === codigo)?.nome || codigo;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Seus Principais Produtos/Serviços
          <Badge variant="secondary" className="ml-2">Opcional</Badge>
        </h3>
        <p className="text-sm text-muted-foreground">
          Informe o que você vende para cálculos mais precisos na Reforma Tributária. 
          Você pode pular esta etapa se preferir.
        </p>
      </div>

      {/* Tipo seletor */}
      <div className="space-y-3">
        <Label>O que você vende?</Label>
        <RadioGroup 
          value={tipo} 
          onValueChange={(v) => setTipo(v as 'produto' | 'servico')}
          className="grid grid-cols-2 gap-4"
        >
          <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${tipo === 'produto' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
            <RadioGroupItem value="produto" id="produto" />
            <Label htmlFor="produto" className="cursor-pointer flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos (NCM)
            </Label>
          </div>
          <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${tipo === 'servico' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
            <RadioGroupItem value="servico" id="servico" />
            <Label htmlFor="servico" className="cursor-pointer flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Serviços (NBS)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Formulário de adição */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 space-y-4">
          {tipo === 'produto' ? (
            <>
              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Notebook, Café, Camiseta..."
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setNcmModalOpen(true)}
                    className="shrink-0"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar NCM
                  </Button>
                </div>
              </div>
              {ncmCode && (
                <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">{formatNcm(ncmCode)}</Badge>
                  <span className="text-sm text-muted-foreground truncate">{ncmDescricao}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Categoria do Serviço</Label>
                <Select value={nbsCategoria} onValueChange={setNbsCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
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
              </div>
              <div className="space-y-2">
                <Label>Descrição do serviço (opcional)</Label>
                <Input
                  placeholder="Ex: Desenvolvimento de software, Consultoria..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label>Quanto representa do faturamento? (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Informe o percentual aproximado que este item representa do seu faturamento total. Ex: se metade da receita vem deste produto, coloque 50.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              placeholder="Ex: 30"
              min="0"
              max="100"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
            />
          </div>

          <Button 
            type="button"
            onClick={handleAddItem}
            disabled={(tipo === 'produto' && !ncmCode) || (tipo === 'servico' && !nbsCategoria)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      {/* Lista de itens adicionados */}
      {items.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Itens adicionados ({items.length})</Label>
          <div className="space-y-2">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.tipo === 'produto' ? (
                    <Package className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-accent-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.tipo === 'produto' && item.ncm_code && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatNcm(item.ncm_code)}
                        </Badge>
                      )}
                      {item.tipo === 'servico' && item.nbs_categoria && (
                        <Badge variant="secondary" className="text-xs">
                          {getCategoriaLabel(item.nbs_categoria)}
                        </Badge>
                      )}
                      {item.percentual_receita > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({item.percentual_receita}%)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.nome}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="ghost" onClick={onSkip} disabled={loading}>
          Pular esta etapa
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button onClick={onFinish} disabled={loading}>
          {loading ? 'Processando...' : 'Finalizar DRE'}
        </Button>
      </div>

      {/* NCM Search Modal */}
      <NCMSearchModal
        open={ncmModalOpen}
        onOpenChange={setNcmModalOpen}
        onSelect={handleNcmSelect}
      />
    </div>
  );
}
