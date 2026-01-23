import { Button } from "@/components/ui/button";
import { Calculator, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">TribuTech</span>
          </Link>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <a href={CONFIG.STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
              <Button>Assinar</Button>
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
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Entrar</Button>
              </Link>
              <a href={CONFIG.STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="w-full">Assinar</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
