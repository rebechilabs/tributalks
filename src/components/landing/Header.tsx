import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoTributalksHeader from "@/assets/logo-tributalks-header.png";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "./LoginModal";
import { CONFIG } from "@/config/site";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#111111]/95 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={logoTributalksHeader} 
                alt="TribuTalks" 
                className="h-12 md:h-16 w-auto drop-shadow-[0_0_30px_rgba(239,162,25,0.15)]"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a 
                href="#planos" 
                className="text-sm font-medium text-white/70 hover:text-primary transition-colors"
              >
                Planos
              </a>
              <Link 
                to="/contato" 
                className="text-sm font-medium text-white/70 hover:text-primary transition-colors"
              >
                Contato
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                    Acessar Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => setLoginModalOpen(true)}
                  >
                    Entrar
                  </Button>
                  <a href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                      Testar 7 dias grátis
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10 animate-fade-in bg-[#111111]/95 backdrop-blur-md">
              <div className="flex flex-col gap-3">
                <a 
                  href="#planos" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-white/70 hover:text-primary transition-colors px-2 py-2"
                >
                  Planos
                </a>
                <Link 
                  to="/contato"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-white/70 hover:text-primary transition-colors px-2 py-2"
                >
                  Contato
                </Link>
                <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-3">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                      Acessar Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginModalOpen(true);
                      }}
                    >
                      Entrar
                    </Button>
                    <a 
                      href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                        Testar 7 dias grátis
                      </Button>
                    </a>
                  </>
                )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}
