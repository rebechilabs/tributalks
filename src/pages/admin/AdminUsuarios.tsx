import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Search,
  Users,
  ShieldAlert,
  Mail
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  nome: string | null;
  empresa: string | null;
  plano: string | null;
  created_at: string;
  onboarding_complete: boolean | null;
}

const PLANOS = [
  { value: 'STARTER', label: 'Starter' },
  { value: 'NAVIGATOR', label: 'Navigator' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
];

export default function AdminUsuarios() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlano, setFilterPlano] = useState<string>('todos');

  // Verificar admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };

    if (!authLoading && user) {
      checkAdminRole();
    } else if (!authLoading) {
      setIsAdmin(false);
    }
  }, [user, authLoading]);

  // Buscar usuários
  useEffect(() => {
    if (isAdmin) {
      fetchUsuarios();
    }
  }, [isAdmin]);

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  const handlePlanChange = async (userId: string, newPlano: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ plano: newPlano })
      .eq('user_id', userId);

    if (error) {
      toast.error('Erro ao atualizar plano');
      console.error(error);
    } else {
      toast.success('Plano atualizado!');
      fetchUsuarios();
    }
  };

  const getPlanoBadgeColor = (plano: string | null) => {
    switch (plano?.toUpperCase()) {
      case 'NAVIGATOR':
      case 'BASICO':
        return 'bg-blue-500/20 text-blue-400';
      case 'PROFESSIONAL':
      case 'PROFISSIONAL':
        return 'bg-purple-500/20 text-purple-400';
      case 'ENTERPRISE':
      case 'PREMIUM':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = 
      (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (u.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesPlano = filterPlano === 'todos' || u.plano === filterPlano;
    
    return matchesSearch && matchesPlano;
  });

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
              <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Área restrita a administradores.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            {usuarios.length} usuários cadastrados
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPlano} onValueChange={setFilterPlano}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os planos</SelectItem>
              {PLANOS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-[160px]">Alterar Plano</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.nome || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {usuario.email || 'Sem email'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario.empresa || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPlanoBadgeColor(usuario.plano)}>
                          {usuario.plano || 'STARTER'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.onboarding_complete ? 'default' : 'secondary'}>
                          {usuario.onboarding_complete ? 'Completo' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={usuario.plano || 'STARTER'}
                          onValueChange={(v) => handlePlanChange(usuario.user_id, v)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLANOS.map(p => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
