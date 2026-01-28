import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface FileItem {
  id: string;
  file: File;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  importId?: string;
}

interface ImportFilesByYearProps {
  files: FileItem[];
  showDetails?: boolean;
}

interface YearGroup {
  year: number;
  files: FileItem[];
  totalSize: number;
}

function extractYearFromFile(file: File): number {
  // Try to extract year from filename
  const yearMatch = file.name.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2018 && year <= new Date().getFullYear()) {
      return year;
    }
  }
  
  // Fallback: use file's last modified date
  const lastModified = new Date(file.lastModified);
  return lastModified.getFullYear();
}

function groupFilesByYear(files: FileItem[]): YearGroup[] {
  const groups = new Map<number, { files: FileItem[]; totalSize: number }>();
  
  for (const fileItem of files) {
    const year = extractYearFromFile(fileItem.file);
    
    if (!groups.has(year)) {
      groups.set(year, { files: [], totalSize: 0 });
    }
    
    const group = groups.get(year)!;
    group.files.push(fileItem);
    group.totalSize += fileItem.file.size;
  }
  
  // Sort by year descending
  return Array.from(groups.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => b.year - a.year);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportFilesByYear({ files, showDetails = true }: ImportFilesByYearProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const yearGroups = groupFilesByYear(files);
  
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  
  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Arquivos por Ano</CardTitle>
          </div>
          <Badge variant="secondary">
            {files.length} arquivos • {formatFileSize(totalSize)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {yearGroups.map((group) => {
          const percentage = (group.files.length / files.length) * 100;
          const isExpanded = expandedYears.has(group.year);
          const completedCount = group.files.filter(f => f.status === 'completed').length;
          const errorCount = group.files.filter(f => f.status === 'error').length;
          
          return (
            <div key={group.year} className="space-y-2">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                onClick={() => showDetails && toggleYear(group.year)}
              >
                {showDetails && (
                  isExpanded 
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{group.year}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {group.files.length} arquivos
                      </span>
                      {completedCount > 0 && (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          {completedCount} ✓
                        </Badge>
                      )}
                      {errorCount > 0 && (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20">
                          {errorCount} ✗
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Expanded file list */}
              {showDetails && isExpanded && (
                <div className="ml-8 space-y-1 max-h-40 overflow-y-auto">
                  {group.files.map((fileItem) => (
                    <div 
                      key={fileItem.id}
                      className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/30"
                    >
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate flex-1">{fileItem.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(fileItem.file.size)}
                      </span>
                      {fileItem.status === 'completed' && (
                        <span className="text-green-500">✓</span>
                      )}
                      {fileItem.status === 'error' && (
                        <span className="text-destructive">✗</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {yearGroups.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Nenhum arquivo na fila
          </p>
        )}
      </CardContent>
    </Card>
  );
}
