import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";
import logoTributech from "@/assets/logo-tributech.png";
import { TrustBadges } from "./TrustBadges";

export function Footer() {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <img src={logoTributech} alt="TribuTech" className="h-10 w-auto" />

          {/* Description */}
          <p className="text-muted-foreground text-sm">
            Uma iniciativa Rebechi & Silva Produções
          </p>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/termos"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Política de Privacidade
            </Link>
            <Link
              to="/contato"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Contato
            </Link>
          </nav>

          {/* Trust Badges */}
          <TrustBadges variant="compact" className="mt-2" />

          {/* Legal Disclaimer */}
          <p className="text-muted-foreground/70 text-xs max-w-2xl leading-relaxed">
            As simulações e informações desta plataforma têm caráter exclusivamente educativo e informativo, 
            não constituindo parecer jurídico, contábil ou recomendação de decisão. 
            Consulte um profissional habilitado antes de tomar qualquer decisão tributária.
          </p>

          {/* Copyright */}
          <div className="text-muted-foreground text-xs">
            © 2026 TribuTech. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
