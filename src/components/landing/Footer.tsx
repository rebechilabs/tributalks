import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";
import logoTributalks from "@/assets/logo-tributalks.png";
import { Linkedin, Instagram, Youtube, Scale } from "lucide-react";

const productLinks = [
  { label: "Score Tributário", href: "/score-tributario" },
  { label: "Radar de Créditos", href: "/analise-notas" },
  { label: "DRE Inteligente", href: "/dre" },
  { label: "NEXUS", href: "/nexus" },
  { label: "Clara AI", href: "/clara-ai" },
];

const companyLinks = [
  { label: "Sobre nós", href: "/contato" },
  { label: "Contato", href: "/contato" },
  { label: "Comunidade", href: CONFIG.CIRCLE_COMMUNITY, external: true },
];

const legalLinks = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Política de Privacidade", href: "/privacidade" },
];

export function Footer() {
  return (
    <footer className="py-12 md:py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <img src={logoTributalks} alt="TribuTalks" className="h-10 w-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Plataforma de Inteligência Tributária
            </p>
            <p className="text-sm text-primary font-medium mb-4">
              A 1ª AI-First do Brasil
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Scale className="w-4 h-4" />
              <span>Powered by Rebechi & Silva Advogados</span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">PRODUTO</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">EMPRESA</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">LEGAL</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright & Contact */}
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2026 TribuTalks. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                CNPJ: 47.706.144/0001-21 • {CONFIG.CONTACT_EMAIL}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={CONFIG.LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={CONFIG.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={CONFIG.YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <p className="text-muted-foreground/70 text-xs max-w-3xl mx-auto text-center mt-6 leading-relaxed">
            As simulações e informações desta plataforma têm caráter exclusivamente educativo e
            informativo, não constituindo parecer jurídico, contábil ou recomendação de decisão.
            Consulte um profissional habilitado antes de tomar qualquer decisão tributária.
          </p>
        </div>
      </div>
    </footer>
  );
}
