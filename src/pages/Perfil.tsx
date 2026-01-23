import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, User, Building, DollarSign, FileText, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const FAIXAS_FATURAMENTO = [
  { value: '1000000', label: 'R$1M - R$2,5M/mês' },
  { value: '2500000', label: 'R$2,5M - R$5M/mês' },
  { value: '5000000', label: 'R$5M - R$10M/mês' },
  { value: '10000000', label: 'R$10M - R$25M/mês' },
  { value: '25000000', label: 'R$25M - R$50M/mês' },
  { value: '50000000', label: 'Acima de R$50M/mês' },
];

const Perfil = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    empresa: profile?.empresa || "",
    estado: profile?.estado || "",
    faturamento_mensal: profile?.faturamento_mensal?.toString() || "",
    regime: profile?.regime || "",
    setor: profile?.setor || "",
    cnae: profile?.cnae || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          empresa: formData.empresa,
          estado: formData.estado,
          faturamento_mensal: parseFloat(formData.faturamento_mensal) || null,
          regime: formData.regime as 'SIMPLES' | 'PRESUMIDO' | 'REAL' | null,
          setor: formData.setor as 'industria' | 'comercio' | 'servicos' | 'tecnologia' | 'outro' | null,
          cnae: formData.cnae || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const number = parseInt(numericValue, 10);
    return new Intl.NumberFormat('pt-BR').format(number);
  };

  return (
    <DashboardLayout title="Meu Perfil">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Suas informações de contato e identificação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Seu nome"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="h-11 bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações sobre sua empresa para personalizar as simulações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da empresa</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => handleChange("empresa", e.target.value)}
                    placeholder="Empresa Exemplo LTDA"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado principal</Label>
                  <Select value={formData.estado} onValueChange={(v) => handleChange("estado", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faturamento">Faturamento mensal</Label>
                <Select 
                  value={formData.faturamento_mensal} 
                  onValueChange={(v) => handleChange("faturamento_mensal", v)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAIXAS_FATURAMENTO.map((faixa) => (
                      <SelectItem key={faixa.value} value={faixa.value}>{faixa.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tax Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Informações Tributárias
              </CardTitle>
              <CardDescription>
                Dados fiscais para cálculos mais precisos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Regime tributário atual</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {[
                    { value: 'SIMPLES', label: 'Simples Nacional' },
                    { value: 'PRESUMIDO', label: 'Lucro Presumido' },
                    { value: 'REAL', label: 'Lucro Real' },
                  ].map((regime) => (
                    <button
                      key={regime.value}
                      type="button"
                      onClick={() => handleChange("regime", regime.value)}
                      className={`p-3 text-sm text-left rounded-lg border-2 transition-all ${
                        formData.regime === regime.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {regime.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Setor de atuação</Label>
                  <Select value={formData.setor} onValueChange={(v) => handleChange("setor", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industria">Indústria</SelectItem>
                      <SelectItem value="comercio">Comércio</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE principal (opcional)</Label>
                  <Input
                    id="cnae"
                    value={formData.cnae}
                    onChange={(e) => handleChange("cnae", e.target.value)}
                    placeholder="Ex: 6201-5/00"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Perfil;
