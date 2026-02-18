import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Upload, CheckCircle2, Circle, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REGIME_CONFIGS, type RegimeType, type DocStatus } from './regimeConfig';
import { SpedUploader } from '@/components/sped';
import { DctfUploader } from '@/components/dctf';
import { PgdasUploader } from '@/components/pgdas';

interface DocumentUploadStepProps {
  regime: RegimeType;
  uploadedDocs: Record<string, DocStatus>;
  onDocStatusChange: (docId: string, status: DocStatus) => void;
  onBack: () => void;
  onNext: () => void;
  /** XML drag-drop handler */
  onXmlFiles: (files: File[]) => void;
  xmlCount: number;
}

export function DocumentUploadStep({
  regime,
  uploadedDocs,
  onDocStatusChange,
  onBack,
  onNext,
  onXmlFiles,
  xmlCount,
}: DocumentUploadStepProps) {
  const config = REGIME_CONFIGS[regime];
  const [isDragging, setIsDragging] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const requiredDocs = config.documents.filter((d) => d.required);
  const hasRequiredUploads = requiredDocs.every(
    (d) => uploadedDocs[d.id] === 'uploaded' || (d.id === 'xml-nfe' && xmlCount > 0)
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.name.endsWith('.xml') || file.name.endsWith('.zip')
      );
      if (droppedFiles.length > 0) {
        onXmlFiles(droppedFiles);
      }
    },
    [onXmlFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.name.endsWith('.xml') || file.name.endsWith('.zip')
      );
      onXmlFiles(selectedFiles);
    }
  };

  const getStatusIcon = (docId: string, required: boolean) => {
    const status = uploadedDocs[docId];
    if (status === 'uploaded' || (docId === 'xml-nfe' && xmlCount > 0)) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (!required) {
      return <Zap className="h-5 w-5 text-yellow-500" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusLabel = (docId: string, required: boolean) => {
    const status = uploadedDocs[docId];
    if (status === 'uploaded' || (docId === 'xml-nfe' && xmlCount > 0)) {
      return docId === 'xml-nfe' ? `${xmlCount} arquivo(s)` : 'Enviado';
    }
    return required ? 'Pendente' : 'Recomendado';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Envie seus documentos</h2>
        <p className="text-muted-foreground text-sm">
          Documentos necessários para o regime <strong>{config.label}</strong>
        </p>
      </div>

      {/* Helper text */}
      <div className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border">
        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">{config.helperText}</p>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {config.documents.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(doc.id, doc.required)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{doc.label}</span>
                    {doc.required && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        *Obrigatório
                      </Badge>
                    )}
                    {!doc.required && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{getStatusLabel(doc.id, doc.required)}</span>
            </div>

            {/* Expanded upload area */}
            {expandedDoc === doc.id && (
              <CardContent className="pt-0 pb-4 px-4 border-t">
                {doc.uploaderType === 'xml' && (
                  <div className="mt-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-primary/50'
                      )}
                      onClick={() => document.getElementById('xml-file-input')?.click()}
                    >
                      <input
                        id="xml-file-input"
                        type="file"
                        multiple
                        accept=".xml,.zip"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Arraste XMLs aqui ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        NFe, NFSe, CTe • Aceita .xml e .zip
                      </p>
                    </div>
                    {xmlCount > 0 && (
                      <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {xmlCount} arquivo(s) na fila
                      </p>
                    )}
                  </div>
                )}

                {doc.uploaderType === 'sped' && (
                  <div className="mt-3">
                    <SpedUploader />
                  </div>
                )}

                {doc.uploaderType === 'dctf' && (
                  <div className="mt-3">
                    <DctfUploader />
                  </div>
                )}

                {doc.uploaderType === 'pgdas' && (
                  <div className="mt-3">
                    <PgdasUploader />
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onNext} disabled={!hasRequiredUploads}>
          Próximo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
