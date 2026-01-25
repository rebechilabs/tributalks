import { Button } from "@/components/ui/button";
import { Menu, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoTributech from "@/assets/logo-tributech.png";
import { useAuth } from "@/hooks/useAuth";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoTributech} alt="TribuTech" className="h-10 md:h-12 w-auto" />
            <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
              GPS da Reforma
            </span>
          </Link>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Acessar Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 px-3 gap-2 border-border hover:bg-secondary"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="hidden lg:inline">Entrar com Google</span>
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    Começar grátis
                  </Button>
                </Link>
              </>
            )}
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
            <div className="flex flex-col gap-3">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    Acessar Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-border"
                    onClick={() => {
                      handleGoogleLogin();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Entrar com Google
                  </Button>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                      Começar grátis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}