import { Play } from "lucide-react";

export function VideoDemoSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Veja TribuTalks em ação
          </h2>
        </div>
        
        {/* Video Placeholder - substituir por embed real quando disponível */}
        <div className="max-w-4xl mx-auto aspect-video bg-card rounded-2xl border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Play className="w-10 h-10 text-primary ml-1" />
            </div>
            <span className="text-muted-foreground text-sm">Clique para assistir</span>
          </div>
        </div>
        
        <p className="text-center text-muted-foreground mt-6">
          Do upload ao insight: menos de 2 minutos
        </p>
      </div>
    </section>
  );
}
