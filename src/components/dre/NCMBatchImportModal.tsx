import { useState, useEffect } from 'react';
import { Upload, ClipboardPaste, Check, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ProductCatalogItem } from './ProductCatalogStep';

interface NCMBatchImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: ProductCatalogItem[]) => void;
  existingItems: ProductCatalogItem[];
}

interface NcmFromXml {
  id: string;
  ncm_code: string;
  product_name: string;
  revenue_percentage: number | null;
  selected: boolean;
}

interface ParsedNcm {
  code: string;
  description: string | null;
  valid: boolean;
  loading: boolean;
  selected: boolean;
}

export function NCMBatchImportModal({ open, onOpenChange, onImport, existingItems }: NCMBatchImportModalProps) {
  const [tab, setTab] = useState('xmls');
  
  // Tab XMLs state
  const [xmlNcms, setXmlNcms] = useState<NcmFromXml[]>([]);
  const [loadingXmls, setLoadingXmls] = useState(false);
  
  // Tab Colar state
  const [pasteText, setPasteText] = useState('');
  const [parsedNcms, setParsedNcms] = useState<ParsedNcm[]>([]);
  const [validating, setValidating] = useState(false);

  const formatNcm = (ncm: string) => {
    const clean = ncm.replace(/\D/g, '').padEnd(8, '0');
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`;
  };

  const existingNcmCodes = new Set(
    existingItems.filter(i => i.ncm_code).map(i => i.ncm_code)
  );

  // Load NCMs from XMLs
  useEffect(() => {
    if (open && tab === 'xmls') {
      loadXmlNcms();
    }
  }, [open, tab]);

  const loadXmlNcms = async () => {
    setLoadingXmls(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_ncm_analysis')
        .select('id, ncm_code, product_name, revenue_percentage')
        .eq('user_id', user.id)
        .order('revenue_percentage', { ascending: false, nullsFirst: false });

      if (error) throw error;

      setXmlNcms(
        (data || []).map(d => ({
          ...d,
          selected: !existingNcmCodes.has(d.ncm_code),
        }))
      );
    } catch (err) {
      console.error('Error loading NCMs from XMLs:', err);
      toast.error('Erro ao carregar NCMs dos XMLs');
    } finally {
      setLoadingXmls(false);
    }
  };

  const toggleXmlNcm = (id: string) => {
    setXmlNcms(prev => prev.map(n => n.id === id ? { ...n, selected: !n.selected } : n));
  };

  const toggleAllXmlNcms = (selected: boolean) => {
    setXmlNcms(prev => prev.map(n => ({ ...n, selected })));
  };

  const handleImportFromXmls = () => {
    const selected = xmlNcms.filter(n => n.selected);
    if (selected.length === 0) {
      toast.error('Selecione pelo menos um NCM');
      return;
    }

    const newItems: ProductCatalogItem[] = selected.map(n => ({
      id: crypto.randomUUID(),
      tipo: 'produto',
      nome: n.product_name,
      ncm_code: n.ncm_code,
      ncm_descricao: n.product_name,
      percentual_receita: n.revenue_percentage || 0,
    }));

    onImport(newItems);
    onOpenChange(false);
    toast.success(`${newItems.length} NCM(s) importado(s) com sucesso`);
  };

  // Paste tab logic
  const handleValidate = async () => {
    const rawCodes = pasteText
      .split(/[,;\n]+/)
      .map(c => c.trim().replace(/\D/g, ''))
      .filter(c => c.length >= 4);

    if (rawCodes.length === 0) {
      toast.error('Nenhum código NCM válido encontrado');
      return;
    }

    const unique = [...new Set(rawCodes)];
    setParsedNcms(unique.map(code => ({ code, description: null, valid: false, loading: true, selected: true })));
    setValidating(true);

    // Validate each NCM against the API
    const results = await Promise.allSettled(
      unique.map(async (code) => {
        try {
          const { data, error } = await supabase.functions.invoke('gov-data-api', {
            body: null,
            method: 'GET',
          });
          // Use the proper URL pattern for GET requests
          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
          const url = `https://${projectId}.supabase.co/functions/v1/gov-data-api/ncm/${code}`;
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          });
          
          if (!response.ok) return { code, valid: false, description: null };
          
          const result = await response.json();
          return {
            code,
            valid: true,
            description: result.descricao || result.description || result.nome_ncm || `NCM ${formatNcm(code)}`,
          };
        } catch {
          return { code, valid: false, description: null };
        }
      })
    );

    setParsedNcms(prev => prev.map((ncm, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        return {
          ...ncm,
          valid: result.value.valid,
          description: result.value.description,
          loading: false,
          selected: result.value.valid && !existingNcmCodes.has(ncm.code),
        };
      }
      return { ...ncm, valid: false, loading: false, selected: false };
    }));
    setValidating(false);
  };

  const toggleParsedNcm = (code: string) => {
    setParsedNcms(prev => prev.map(n => n.code === code ? { ...n, selected: !n.selected } : n));
  };

  const handleImportFromPaste = () => {
    const selected = parsedNcms.filter(n => n.selected && n.valid);
    if (selected.length === 0) {
      toast.error('Selecione pelo menos um NCM válido');
      return;
    }

    const newItems: ProductCatalogItem[] = selected.map(n => ({
      id: crypto.randomUUID(),
      tipo: 'produto',
      nome: n.description || `Produto NCM ${formatNcm(n.code)}`,
      ncm_code: n.code,
      ncm_descricao: n.description || undefined,
      percentual_receita: 0,
    }));

    onImport(newItems);
    onOpenChange(false);
    setPasteText('');
    setParsedNcms([]);
    toast.success(`${newItems.length} NCM(s) importado(s) com sucesso`);
  };

  const selectedXmlCount = xmlNcms.filter(n => n.selected).length;
  const validParsedCount = parsedNcms.filter(n => n.valid).length;
  const selectedParsedCount = parsedNcms.filter(n => n.selected && n.valid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importar NCMs em Lote
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xmls">Dos meus XMLs</TabsTrigger>
            <TabsTrigger value="colar">Colar códigos</TabsTrigger>
          </TabsList>

          <TabsContent value="xmls" className="space-y-4">
            {loadingXmls ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando NCMs dos XMLs...
              </div>
            ) : xmlNcms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum NCM encontrado nos seus XMLs.</p>
                <p className="text-xs mt-1">Importe XMLs primeiro na seção CBS/IBS & NCM.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    {xmlNcms.length} NCM(s) encontrado(s)
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllXmlNcms(selectedXmlCount < xmlNcms.length)}
                  >
                    {selectedXmlCount === xmlNcms.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {xmlNcms.map((ncm) => {
                    const alreadyExists = existingNcmCodes.has(ncm.ncm_code);
                    return (
                      <label
                        key={ncm.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          ncm.selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        } ${alreadyExists ? 'opacity-50' : ''}`}
                      >
                        <Checkbox
                          checked={ncm.selected}
                          onCheckedChange={() => toggleXmlNcm(ncm.id)}
                          disabled={alreadyExists}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs shrink-0">
                              {formatNcm(ncm.ncm_code)}
                            </Badge>
                            {ncm.revenue_percentage != null && ncm.revenue_percentage > 0 && (
                              <span className="text-xs text-muted-foreground">({ncm.revenue_percentage}%)</span>
                            )}
                            {alreadyExists && (
                              <Badge variant="secondary" className="text-xs">Já adicionado</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{ncm.product_name}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <Button
                  onClick={handleImportFromXmls}
                  disabled={selectedXmlCount === 0}
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Adicionar {selectedXmlCount} selecionado(s)
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="colar" className="space-y-4">
            <div className="space-y-2">
              <Label>Cole os códigos NCM</Label>
              <Textarea
                placeholder="Ex: 8471.30.19, 0901.21.00, 6109.10.00&#10;&#10;Separe por vírgula, ponto-e-vírgula ou quebra de linha"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleValidate}
              disabled={!pasteText.trim() || validating}
              variant="outline"
              className="w-full"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Validar códigos'
              )}
            </Button>

            {parsedNcms.length > 0 && (
              <>
                <Label className="text-sm text-muted-foreground">
                  {validParsedCount} de {parsedNcms.length} código(s) válido(s)
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {parsedNcms.map((ncm) => (
                    <label
                      key={ncm.code}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        ncm.loading ? 'opacity-50' : ncm.valid
                          ? ncm.selected ? 'border-primary bg-primary/5 cursor-pointer' : 'cursor-pointer hover:bg-muted/50'
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      {ncm.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <Checkbox
                          checked={ncm.selected}
                          onCheckedChange={() => toggleParsedNcm(ncm.code)}
                          disabled={!ncm.valid}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={ncm.valid ? 'outline' : 'destructive'} className="font-mono text-xs">
                            {formatNcm(ncm.code)}
                          </Badge>
                          {!ncm.valid && !ncm.loading && (
                            <span className="text-xs text-destructive">Inválido</span>
                          )}
                        </div>
                        {ncm.description && (
                          <p className="text-sm text-muted-foreground truncate">{ncm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <Button
                  onClick={handleImportFromPaste}
                  disabled={selectedParsedCount === 0}
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Adicionar {selectedParsedCount} selecionado(s)
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
