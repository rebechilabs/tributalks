import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Plus,
  Pencil,
  Trash2,
  Lightbulb,
  ShieldAlert,
  Calendar
} from "lucide-react";

interface Pilula {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: string;
  data_exibicao: string | null;
  ativo: boolean;
  created_at: string;
}

const TIPOS_PILULA = [
  { value: 'fato', label: 'Fato', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'conceito', label: 'Conceito', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'prazo', label: 'Prazo', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'dica', label: 'Dica', color: 'bg-green-500/20 text-green-400' },
  { value: 'alerta', label: 'Alerta', color: 'bg-red-500/20 text-red-400' },
];

export default function AdminPilulas() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pilulas, setPilulas] = useState<Pilula[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPilula, setEditingPilula] = useState<Pilula | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'dica',
    data_exibicao: '',
    ativo: true,
  });

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

  // Buscar pílulas
  useEffect(() => {
    if (isAdmin) {
      fetchPilulas();
    }
  }, [isAdmin]);

  const fetchPilulas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pilulas_reforma')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar pílulas');
      console.error(error);
    } else {
      setPilulas(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.conteudo) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    setSaving(true);
    
    const payload = {
      titulo: formData.titulo,
      conteudo: formData.conteudo,
      tipo: formData.tipo,
      data_exibicao: formData.data_exibicao || null,
      ativo: formData.ativo,
    };

    let error;
    if (editingPilula) {
      const result = await supabase
        .from('pilulas_reforma')
        .update(payload)
        .eq('id', editingPilula.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('pilulas_reforma')
        .insert(payload);
      error = result.error;
    }

    if (error) {
      toast.error('Erro ao salvar pílula');
      console.error(error);
    } else {
      toast.success(editingPilula ? 'Pílula atualizada!' : 'Pílula criada!');
      setDialogOpen(false);
      resetForm();
      fetchPilulas();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pílula?')) return;
    
    const { error } = await supabase
      .from('pilulas_reforma')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Pílula excluída');
      fetchPilulas();
    }
  };

  const openEdit = (pilula: Pilula) => {
    setEditingPilula(pilula);
    setFormData({
      titulo: pilula.titulo,
      conteudo: pilula.conteudo,
      tipo: pilula.tipo || 'dica',
      data_exibicao: pilula.data_exibicao || '',
      ativo: pilula.ativo,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPilula(null);
    setFormData({
      titulo: '',
      conteudo: '',
      tipo: 'dica',
      data_exibicao: '',
      ativo: true,
    });
  };

  const getTipoConfig = (tipo: string) => {
    return TIPOS_PILULA.find(t => t.value === tipo) || TIPOS_PILULA[3];
  };

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
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pílulas da Reforma</h1>
            <p className="text-muted-foreground mt-1">
              Conteúdo diário sobre a reforma tributária
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Pílula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPilula ? 'Editar Pílula' : 'Nova Pílula'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: CBS substitui PIS/COFINS"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo *</Label>
                  <Textarea
                    value={formData.conteudo}
                    onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                    placeholder="Explicação clara e objetiva..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select 
                      value={formData.tipo} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, tipo: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_PILULA.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Exibição</Label>
                    <Input
                      type="date"
                      value={formData.data_exibicao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_exibicao: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Vazio = rotação automática</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Label>Ativa</Label>
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, ativo: v }))}
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={saving} 
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingPilula ? 'Salvar Alterações' : 'Criar Pílula'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Pílulas */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : pilulas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma pílula cadastrada.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pilulas.map((pilula) => {
              const tipoConfig = getTipoConfig(pilula.tipo);
              return (
                <Card key={pilula.id} className={!pilula.ativo ? 'opacity-60' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={tipoConfig.color}>
                            {tipoConfig.label}
                          </Badge>
                          {pilula.data_exibicao && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(pilula.data_exibicao).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {!pilula.ativo && (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">{pilula.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {pilula.conteudo}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEdit(pilula)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(pilula.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
