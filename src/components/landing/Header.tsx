import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";
import logoTributech from "@/assets/logo-tributech.png";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoTributech} alt="TribuTech" className="h-10 w-auto" />
          </Link>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10">
                Entrar
              </Button>
            </Link>
            <a href={CONFIG.STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Assinar
              </Button>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-primary/50 text-foreground hover:bg-primary/10">
                  Entrar
                </Button>
              </Link>
              <a href={CONFIG.STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Assinar
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
