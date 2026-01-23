import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";
import logoTributech from "@/assets/logo-tributech.png";

export function Footer() {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <img src={logoTributech} alt="TribuTech" className="h-10 w-auto" />

          {/* Description */}
          <p className="text-muted-foreground text-sm">
            Uma iniciativa Rebechi & Silva Advogados
          </p>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/termos"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Termos
            </Link>
            <Link
              to="/privacidade"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Privacidade
            </Link>
            <a
              href={`mailto:${CONFIG.CONTACT_EMAIL}`}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Contato
            </a>
          </nav>

          {/* Copyright */}
          <div className="text-muted-foreground text-xs">
            © 2026 TribuTech. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
