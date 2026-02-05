/**
 * Credit Report Dialog Component
 * Modal for generating PDF credit reports
 * Supports Visual, Executive, and Executive V2 (complete) formats
 */

import { useState } from 'react';
import { Download, FileText, Loader2, X, CheckCircle2, AlertCircle, FileBarChart, FileCheck, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreditReport } from '@/hooks/useCreditReport';
import { generateTribuTalksCreditReport } from '@/lib/pdf/CreditReportGenerator';
import { generateExecutiveCreditReport } from '@/lib/pdf/ExecutiveReportGenerator';
import { generateExecutiveReportV2 } from '@/lib/pdf/ExecutiveReportV2Generator';
import { formatCurrency, formatCNPJ } from '@/lib/pdf/TribuTalksPdfStyles';
import logoImage from '@/assets/logo-rebechi-silva.png';
import logoRsPdf from '@/assets/logo-rs-pdf.png';

interface CreditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditReportDialog({ open, onOpenChange }: CreditReportDialogProps) {
  const { data, isLoading, isReady } = useCreditReport();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Report options
  const [formato, setFormato] = useState<'visual' | 'executivo' | 'executivo-v2'>('executivo-v2');
  const [tema, setTema] = useState<'escuro' | 'claro'>('escuro');
  const [incluirDetalhes, setIncluirDetalhes] = useState(true);
  const [incluirInconsistencias, setIncluirInconsistencias] = useState(true);
  const [incluirOportunidades, setIncluirOportunidades] = useState(true);

  // Helper to load logo as base64
  const loadLogoBase64 = async (logoSrc: string): Promise<string | null> => {
    try {
      const response = await fetch(logoSrc);
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      console.warn('Could not load logo image');
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!data || !isReady) return;
    
    setIsGenerating(true);
    setError(null);
    setGenerated(false);

    try {
      if (formato === 'executivo') {
        // Generate Executive Report (text-only, no logo needed)
        await generateExecutiveCreditReport(data, {
          maxCreditsPerTax: 15,
          includeOpportunities: incluirOportunidades,
        });
      } else if (formato === 'executivo-v2') {
        // Generate Executive V2 Report (complete with all 7 sections)
        const logoBase64 = await loadLogoBase64(logoRsPdf);
        await generateExecutiveReportV2(data, logoBase64, {
          maxCreditsPerTax: 15,
          includeOpportunities: incluirOportunidades,
        });
      } else {
        // Generate Visual Report (with graphics and logo)
        const logoBase64 = await loadLogoBase64(logoImage);

        await generateTribuTalksCreditReport(data, logoBase64, {
          tema,
          formato: formato as 'visual' | 'executivo',
          incluirDetalhes,
          incluirInconsistencias,
          incluirOportunidades,
          maxNotasPorTributo: 20,
        });
      }

      setGenerated(true);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Ocorreu um erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setGenerated(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar Relatório de Créditos
          </DialogTitle>
          <DialogDescription>
            Relatório profissional em PDF com análise detalhada dos créditos tributários identificados.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando dados...</span>
          </div>
        ) : !isReady ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Nenhum crédito identificado para gerar relatório.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Importe XMLs e execute a análise de créditos primeiro.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Company Info Preview */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Empresa</h4>
              <p className="font-semibold">{data?.empresa.razaoSocial}</p>
              {data?.empresa.cnpj && (
                <p className="text-sm text-muted-foreground">
                  CNPJ: {formatCNPJ(data.empresa.cnpj)}
                </p>
              )}
            </div>

            {/* Summary Preview */}
            <div className="rounded-lg border bg-primary/5 p-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Total Recuperável
              </h4>
              <p className="text-2xl font-bold text-primary">
                {data && formatCurrency(data.sumario.totalRecuperavel)}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{data?.sumario.totalCreditos} créditos</Badge>
                <Badge variant="outline">{data?.estatisticas.totalXmlsAnalisados} XMLs</Badge>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label>Formato do Relatório</Label>
              <RadioGroup
                value={formato}
                onValueChange={(value) => setFormato(value as 'visual' | 'executivo' | 'executivo-v2')}
                className="grid grid-cols-1 gap-3"
              >
                <div className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${formato === 'executivo-v2' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <RadioGroupItem value="executivo-v2" id="executivo-v2" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="executivo-v2" className="cursor-pointer font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Executivo Completo
                      <Badge variant="outline" className="ml-1 text-xs">Recomendado</Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      7 seções com tabelas, gráficos e anexos de rastreabilidade completos. Ideal para auditoria.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${formato === 'executivo' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="executivo" id="executivo" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="executivo" className="cursor-pointer font-medium flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        Executivo
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Texto limpo. Ideal para CEO.
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${formato === 'visual' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="visual" id="visual" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="visual" className="cursor-pointer font-medium flex items-center gap-2">
                        <FileBarChart className="h-4 w-4" />
                        Visual
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Com gráficos e cores.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Theme Selection - Only for Visual format */}
            {formato === 'visual' && (
              <div className="space-y-3">
                <Label>Tema do Relatório</Label>
                <RadioGroup
                  value={tema}
                  onValueChange={(value) => setTema(value as 'escuro' | 'claro')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="escuro" id="escuro" />
                    <Label htmlFor="escuro" className="cursor-pointer">
                      Escuro (Digital)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="claro" id="claro" />
                    <Label htmlFor="claro" className="cursor-pointer">
                      Claro (Impressão)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <Label>Seções do Relatório</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="detalhes"
                    checked={incluirDetalhes}
                    onCheckedChange={(checked) => setIncluirDetalhes(checked as boolean)}
                  />
                  <Label htmlFor="detalhes" className="cursor-pointer text-sm">
                    Detalhamento por tributo com notas fiscais
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inconsistencias"
                    checked={incluirInconsistencias}
                    onCheckedChange={(checked) => setIncluirInconsistencias(checked as boolean)}
                  />
                  <Label htmlFor="inconsistencias" className="cursor-pointer text-sm">
                    Mapa de inconsistências fiscais
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oportunidades"
                    checked={incluirOportunidades}
                    onCheckedChange={(checked) => setIncluirOportunidades(checked as boolean)}
                  />
                  <Label htmlFor="oportunidades" className="cursor-pointer text-sm">
                    Oportunidades e Quick Wins
                  </Label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {generated && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm text-primary">
                  Relatório gerado com sucesso! O download foi iniciado.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating || !isReady}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
