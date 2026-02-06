import { Link } from "react-router-dom";
import logoTributalks from "@/assets/logo-tributalks-header.png";

export function ConnectHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/connect" className="flex items-center gap-2">
            <img
              src={logoTributalks}
              alt="TribuTalks"
              className="h-8 md:h-10"
            />
            <span className="text-white font-semibold text-lg md:text-xl">
              ·Connect
            </span>
          </Link>

          {/* Link discreto */}
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Já tenho acesso
          </Link>
        </div>
      </div>
    </header>
  );
}
