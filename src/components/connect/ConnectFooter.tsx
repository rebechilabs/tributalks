import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import logoTributalks from "@/assets/logo-tributalks.png";
import logoRebechiSilva from "@/assets/logo-rebechi-silva.png";

export function ConnectFooter() {
  return (
    <footer className="py-12 md:py-16 bg-[#050505] border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Coluna Esquerda - TribuTalks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src={logoTributalks}
                alt="TribuTalks"
                className="h-8"
              />
              <span className="text-white font-semibold">·Connect</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A comunidade de negócios onde cada cadeira é única.
            </p>
          </div>

          {/* Coluna Central - Rebechi & Silva */}
          <div className="text-center">
            <img
              src={logoRebechiSilva}
              alt="Rebechi & Silva"
              className="h-12 mx-auto mb-3"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <Scale className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-medium">
                Powered by Rebechi & Silva Advogados Associados
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Uma iniciativa de Alexandre Silva
            </p>
            <p className="text-muted-foreground text-xs">
              Sócio-fundador da Rebechi & Silva
            </p>
          </div>

          {/* Coluna Direita - Links */}
          <div className="text-right">
            <nav className="space-y-2">
              <Link
                to="/privacidade"
                className="block text-muted-foreground text-sm hover:text-primary transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                to="/termos"
                className="block text-muted-foreground text-sm hover:text-primary transition-colors"
              >
                Termos de Uso
              </Link>
            </nav>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="pt-8 border-t border-border/30 text-center">
          <p className="text-muted-foreground/60 text-xs">
            © 2026 TribuTalks. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
