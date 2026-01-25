import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  ShieldAlert,
  Users,
  Newspaper,
  Lightbulb,
  Calendar,
  TrendingUp,
  ArrowRight
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  usersNavigator: number;
  usersProfessional: number;
  usersEnterprise: number;
  totalNews: number;
  totalPilulas: number;
  totalPrazos: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se usuário é admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Erro ao verificar role:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    if (!authLoading && user) {
      checkAdminRole();
    } else if (!authLoading && !user) {
      setIsAdmin(false);
    }
  }, [user, authLoading]);

  // Buscar estatísticas
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      
      try {
        // Contagem de usuários por plano
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: usersNavigator } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('plano', ['BASICO', 'NAVIGATOR']);

        const { count: usersProfessional } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('plano', ['PROFISSIONAL', 'PROFESSIONAL']);

        const { count: usersEnterprise } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('plano', ['PREMIUM', 'ENTERPRISE']);

        // Contagem de conteúdo
        const { count: totalNews } = await supabase
          .from('noticias_tributarias')
          .select('*', { count: 'exact', head: true });

        const { count: totalPilulas } = await supabase
          .from('pilulas_reforma')
          .select('*', { count: 'exact', head: true });

        const { count: totalPrazos } = await supabase
          .from('prazos_reforma')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: totalUsers || 0,
          usersNavigator: usersNavigator || 0,
          usersProfessional: usersProfessional || 0,
          usersEnterprise: usersEnterprise || 0,
          totalNews: totalNews || 0,
          totalPilulas: totalPilulas || 0,
          totalPrazos: totalPrazos || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (authLoading || isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Acesso Restrito
              </h2>
              <p className="text-muted-foreground">
                Esta área é restrita a administradores do sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const adminModules = [
    {
      title: 'Pílulas da Reforma',
      description: 'Gerenciar pílulas diárias de conhecimento',
      href: '/admin/pilulas',
      icon: Lightbulb,
      count: stats?.totalPilulas || 0,
    },
    {
      title: 'Prazos da Reforma',
      description: 'Calendário 2026-2033 da reforma tributária',
      href: '/admin/prazos',
      icon: Calendar,
      count: stats?.totalPrazos || 0,
    },
    {
      title: 'Notícias',
      description: 'Processar e publicar notícias tributárias',
      href: '/admin/noticias',
      icon: Newspaper,
      count: stats?.totalNews || 0,
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários e planos',
      href: '/admin/usuarios',
      icon: Users,
      count: stats?.totalUsers || 0,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie conteúdo, usuários e configurações da plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuários</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Navigator</p>
                  <p className="text-2xl font-bold">{stats?.usersNavigator || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Professional</p>
                  <p className="text-2xl font-bold">{stats?.usersProfessional || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enterprise</p>
                  <p className="text-2xl font-bold">{stats?.usersEnterprise || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-warning/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.href} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">
                      {module.count}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={module.href}>
                      Gerenciar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
