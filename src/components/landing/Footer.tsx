import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";
import logoTributech from "@/assets/logo-tributech.png";

export function Footer() {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <img src={logoTributech} alt="TribuTech" className="h-12 w-auto" />

          {/* Copyright */}
          <div className="text-muted-foreground text-sm">
            <p>TribuTech © 2026</p>
            <p className="mt-1">Uma iniciativa Rebechi & Silva Advogados</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Política de Privacidade
            </Link>
            <a href={`mailto:${CONFIG.CONTACT_EMAIL}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Contato
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
