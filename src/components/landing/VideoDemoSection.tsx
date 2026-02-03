import { Play } from "lucide-react";

interface VideoDemoSectionProps {
  onOpenDemo: () => void;
}

export function VideoDemoSection({ onOpenDemo }: VideoDemoSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Veja TribuTalks em ação
          </h2>
          <p className="text-muted-foreground mt-2">
            Do upload ao insight: menos de 2 minutos
          </p>
        </div>
        
        {/* Demo trigger */}
        <div 
          className="max-w-4xl mx-auto aspect-video bg-card rounded-2xl border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all group shadow-lg relative overflow-hidden"
          onClick={onOpenDemo}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onOpenDemo()}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors group-hover:scale-110 duration-300">
              <Play className="w-10 h-10 text-primary ml-1" />
            </div>
            <div className="text-center">
              <span className="text-foreground font-medium block">
                Clique para ver a demo interativa
              </span>
              <span className="text-muted-foreground text-sm">
                5 passos • ~18 segundos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
