import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Calendar,
  ShieldAlert,
  Clock
} from "lucide-react";

interface Prazo {
  id: string;
  titulo: string;
  descricao: string | null;
  data_prazo: string;
  tipo: string;
  afeta_regimes: string[];
  afeta_setores: string[];
  ativo: boolean;
  created_at: string;
}

const TIPOS_PRAZO = [
  { value: 'inicio', label: 'Início', color: 'bg-green-500/20 text-green-400' },
  { value: 'transicao', label: 'Transição', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'obrigacao', label: 'Obrigação', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'extincao', label: 'Extinção', color: 'bg-red-500/20 text-red-400' },
];

const REGIMES = ['simples', 'presumido', 'real'];
const SETORES = ['comercio', 'servicos', 'industria'];

export default function AdminPrazos() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrazo, setEditingPrazo] = useState<Prazo | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_prazo: '',
    tipo: 'transicao',
    afeta_regimes: [] as string[],
    afeta_setores: [] as string[],
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

  // Buscar prazos
  useEffect(() => {
    if (isAdmin) {
      fetchPrazos();
    }
  }, [isAdmin]);

  const fetchPrazos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prazos_reforma')
      .select('*')
      .order('data_prazo', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar prazos');
      console.error(error);
    } else {
      setPrazos(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.data_prazo) {
      toast.error('Preencha título e data');
      return;
    }

    setSaving(true);
    
    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao || null,
      data_prazo: formData.data_prazo,
      tipo: formData.tipo,
      afeta_regimes: formData.afeta_regimes,
      afeta_setores: formData.afeta_setores,
      ativo: formData.ativo,
    };

    let error;
    if (editingPrazo) {
      const result = await supabase
        .from('prazos_reforma')
        .update(payload)
        .eq('id', editingPrazo.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('prazos_reforma')
        .insert(payload);
      error = result.error;
    }

    if (error) {
      toast.error('Erro ao salvar prazo');
      console.error(error);
    } else {
      toast.success(editingPrazo ? 'Prazo atualizado!' : 'Prazo criado!');
      setDialogOpen(false);
      resetForm();
      fetchPrazos();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prazo?')) return;
    
    const { error } = await supabase
      .from('prazos_reforma')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Prazo excluído');
      fetchPrazos();
    }
  };

  const openEdit = (prazo: Prazo) => {
    setEditingPrazo(prazo);
    setFormData({
      titulo: prazo.titulo,
      descricao: prazo.descricao || '',
      data_prazo: prazo.data_prazo,
      tipo: prazo.tipo || 'transicao',
      afeta_regimes: prazo.afeta_regimes || [],
      afeta_setores: prazo.afeta_setores || [],
      ativo: prazo.ativo,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPrazo(null);
    setFormData({
      titulo: '',
      descricao: '',
      data_prazo: '',
      tipo: 'transicao',
      afeta_regimes: [],
      afeta_setores: [],
      ativo: true,
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const getTipoConfig = (tipo: string) => {
    return TIPOS_PRAZO.find(t => t.value === tipo) || TIPOS_PRAZO[1];
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
            <h1 className="text-2xl font-bold text-foreground">Prazos da Reforma</h1>
            <p className="text-muted-foreground mt-1">
              Calendário de marcos 2026-2033
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Prazo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPrazo ? 'Editar Prazo' : 'Novo Prazo'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: CBS entra em vigor"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Detalhes sobre o prazo..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={formData.data_prazo}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_prazo: e.target.value }))}
                    />
                  </div>

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
                        {TIPOS_PRAZO.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Afeta Regimes</Label>
                  <div className="flex flex-wrap gap-3">
                    {REGIMES.map(regime => (
                      <label key={regime} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.afeta_regimes.includes(regime)}
                          onCheckedChange={() => setFormData(prev => ({
                            ...prev,
                            afeta_regimes: toggleArrayItem(prev.afeta_regimes, regime)
                          }))}
                        />
                        <span className="text-sm capitalize">{regime}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Afeta Setores</Label>
                  <div className="flex flex-wrap gap-3">
                    {SETORES.map(setor => (
                      <label key={setor} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.afeta_setores.includes(setor)}
                          onCheckedChange={() => setFormData(prev => ({
                            ...prev,
                            afeta_setores: toggleArrayItem(prev.afeta_setores, setor)
                          }))}
                        />
                        <span className="text-sm capitalize">{setor}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Label>Ativo</Label>
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
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingPrazo ? 'Salvar Alterações' : 'Criar Prazo'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Prazos */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : prazos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum prazo cadastrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {prazos.map((prazo) => {
              const tipoConfig = getTipoConfig(prazo.tipo);
              const daysUntil = getDaysUntil(prazo.data_prazo);
              const isPast = daysUntil < 0;
              
              return (
                <Card key={prazo.id} className={!prazo.ativo ? 'opacity-60' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={tipoConfig.color}>
                            {tipoConfig.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(prazo.data_prazo).toLocaleDateString('pt-BR')}
                          </span>
                          {!isPast && (
                            <span className="text-xs text-primary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {daysUntil} dias
                            </span>
                          )}
                          {!prazo.ativo && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">{prazo.titulo}</h3>
                        {prazo.descricao && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {prazo.descricao}
                          </p>
                        )}
                        {(prazo.afeta_regimes?.length > 0 || prazo.afeta_setores?.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {prazo.afeta_regimes?.map(r => (
                              <Badge key={r} variant="outline" className="text-xs capitalize">
                                {r}
                              </Badge>
                            ))}
                            {prazo.afeta_setores?.map(s => (
                              <Badge key={s} variant="outline" className="text-xs capitalize">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEdit(prazo)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(prazo.id)}
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
