import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, Edit, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { FloatingAssistant } from "@/components/common/FloatingAssistant";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import logoTributalks from "@/assets/logo-tributalks.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <MobileNav />
            
            {/* Mobile Logo */}
            <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
              <img src={logoTributalks} alt="TribuTalks" className="h-8 w-auto" />
            </Link>

            {/* Page Title (Desktop) */}
            {title && (
              <h1 className="hidden lg:block text-lg font-semibold text-foreground">
                {title}
              </h1>
            )}
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">{profile?.nome || 'Usuário'}</span>
                  <span className="text-xs text-muted-foreground">{profile?.empresa || ''}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Floating AI Assistant */}
        <FloatingAssistant />
      </div>
    </div>
  );
}
