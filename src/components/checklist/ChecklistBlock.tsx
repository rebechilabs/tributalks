import { 
  Server, 
  FileText, 
  FileCheck, 
  Wallet, 
  TrendingUp, 
  Users, 
  Calendar,
  LucideIcon 
} from "lucide-react";
import { ChecklistBlock as ChecklistBlockType, ChecklistResponse } from "@/data/checklistReformaItems";
import { ChecklistItemComponent } from "./ChecklistItem";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, LucideIcon> = {
  Server,
  FileText,
  FileCheck,
  Wallet,
  TrendingUp,
  Users,
  Calendar
};

interface ChecklistBlockProps {
  block: ChecklistBlockType;
  blockIndex: number;
  totalBlocks: number;
  responses: Record<string, ChecklistResponse>;
  notes: Record<string, string>;
  onResponseChange: (itemKey: string, response: ChecklistResponse) => void;
  onNotesChange: (itemKey: string, notes: string) => void;
}

export function ChecklistBlockComponent({
  block,
  blockIndex,
  totalBlocks,
  responses,
  notes,
  onResponseChange,
  onNotesChange
}: ChecklistBlockProps) {
  const Icon = iconMap[block.icon] || FileText;
  
  const answeredCount = block.items.filter(item => responses[item.key]).length;
  const progressPercent = (answeredCount / block.items.length) * 100;

  return (
    <div className="space-y-6">
      {/* Block Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">
              Bloco {blockIndex + 1} de {totalBlocks}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{block.title}</h2>
          <p className="text-sm text-muted-foreground">{block.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="flex-1 h-2" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {answeredCount} de {block.items.length}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {block.items.map((item, index) => (
          <ChecklistItemComponent
            key={item.key}
            item={item}
            response={responses[item.key]}
            notes={notes[item.key] || ''}
            onResponseChange={(response) => onResponseChange(item.key, response)}
            onNotesChange={(notesValue) => onNotesChange(item.key, notesValue)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
