import { 
  Target, 
  MapPin, 
  FileSearch, 
  Wallet, 
  Clock, 
  Users, 
  ChevronRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Workflow } from "@/pages/WorkflowsGuiados";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  MapPin,
  FileSearch,
  Wallet,
};

interface WorkflowCardProps {
  workflow: Workflow;
  index: number;
  onStart: () => void;
}

export function WorkflowCard({ workflow, index, onStart }: WorkflowCardProps) {
  const Icon = iconMap[workflow.icon] || Target;

  return (
    <div 
      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{workflow.title}</h3>
              {workflow.popular && (
                <Badge className="bg-warning/10 text-warning border-warning/30">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              {workflow.estimatedTime}
              <span className="mx-1">•</span>
              {workflow.steps.length} etapas
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">
        {workflow.description}
      </p>

      {/* Target Audience */}
      <div className="flex items-start gap-2 mb-4 p-3 bg-secondary/30 rounded-lg">
        <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
        <p className="text-xs text-muted-foreground">
          {workflow.targetAudience}
        </p>
      </div>

      {/* Steps Preview */}
      <div className="flex flex-wrap gap-2 mb-4">
        {workflow.steps.slice(0, 4).map((step, i) => (
          <Badge key={step.id} variant="outline" className="text-xs">
            {i + 1}. {step.tool}
          </Badge>
        ))}
        {workflow.steps.length > 4 && (
          <Badge variant="outline" className="text-xs">
            +{workflow.steps.length - 4}
          </Badge>
        )}
      </div>

      {/* CTA */}
      <Button 
        className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground"
        variant="outline"
        onClick={onStart}
      >
        Iniciar Workflow
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
