import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";

export function Footer() {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-background">TribuTech</span>
          </div>

          {/* Copyright */}
          <div className="text-background/60 text-sm">
            <p>TribuTech © 2026</p>
            <p className="mt-1">Uma iniciativa Rebechi & Silva Advogados</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/termos" className="text-background/60 hover:text-background transition-colors text-sm">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-background/60 hover:text-background transition-colors text-sm">
              Política de Privacidade
            </Link>
            <a href={`mailto:${CONFIG.CONTACT_EMAIL}`} className="text-background/60 hover:text-background transition-colors text-sm">
              Contato
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
