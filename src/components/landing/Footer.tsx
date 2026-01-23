import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-background">TribuTech</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/termos" className="text-background/60 hover:text-background transition-colors text-sm">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-background/60 hover:text-background transition-colors text-sm">
              Política de Privacidade
            </Link>
            <a href="mailto:contato@tributech.com.br" className="text-background/60 hover:text-background transition-colors text-sm">
              Contato
            </a>
          </nav>

          {/* Copyright */}
          <div className="text-background/40 text-sm text-center md:text-right">
            <p>© 2026 TribuTech</p>
            <p>Uma iniciativa Rebechi & Silva Advogados</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
