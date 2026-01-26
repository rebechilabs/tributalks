import { Link } from "react-router-dom";
import { ArrowRight, Quote, Package, Heart, Factory, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "@/data/caseStudies";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Heart,
  Factory,
  Code,
};

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  index: number;
}

export function CaseStudyCard({ caseStudy, index }: CaseStudyCardProps) {
  const Icon = iconMap[caseStudy.sectorIcon] || Package;
  const mainResult = caseStudy.results[0];

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
            <h3 className="font-semibold text-foreground">{caseStudy.company}</h3>
            <p className="text-sm text-muted-foreground">{caseStudy.sector}</p>
          </div>
        </div>
        {caseStudy.featured && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Destaque
          </Badge>
        )}
      </div>

      {/* Challenge */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {caseStudy.challenge}
      </p>

      {/* Main Result */}
      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
        <div className="text-2xl font-bold text-primary mb-1">
          {mainResult.value}
        </div>
        <div className="text-sm text-muted-foreground">
          {mainResult.metric}
        </div>
      </div>

      {/* Testimonial Preview */}
      <div className="flex items-start gap-2 mb-4">
        <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
        <p className="text-sm text-foreground italic line-clamp-2">
          "{caseStudy.testimonial.quote}"
        </p>
      </div>

      {/* Tools Used */}
      <div className="flex flex-wrap gap-2 mb-4">
        {caseStudy.toolsUsed.slice(0, 3).map((tool) => (
          <Badge key={tool} variant="outline" className="text-xs">
            {tool}
          </Badge>
        ))}
        {caseStudy.toolsUsed.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{caseStudy.toolsUsed.length - 3}
          </Badge>
        )}
      </div>

      {/* CTA */}
      <Link to={`/casos/${caseStudy.slug}`}>
        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-primary/5"
        >
          Ver estudo completo
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}
