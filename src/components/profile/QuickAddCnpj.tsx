import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCnpjLookup, formatCnpj, CnpjData } from "@/hooks/useCnpjLookup";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Plus, 
  Loader2, 
  Search, 
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Limits per plan - Navigator pode adicionar 1 a mais (total 2), Professional até 5
const CNPJ_LIMITS: Record<string, number> = {
  'STARTER': 1,
  'NAVIGATOR': 2,
  'PROFESSIONAL': 5,
  'ENTERPRISE': 999,
};

interface QuickAddCnpjProps {
  userId: string;
  userPlan: string;
  cnpjPrincipal: string | null;
  cnpjsGrupo: string[];
  onUpdate?: () => void;
  compact?: boolean;
}

export function QuickAddCnpj({
  userId,
  userPlan,
  cnpjPrincipal,
  cnpjsGrupo,
  onUpdate,
  compact = false,
}: QuickAddCnpjProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { lookup, isLoading: isLookingUp, reset } = useCnpjLookup();
  
  const [newCnpj, setNewCnpj] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pendingCnpjData, setPendingCnpjData] = useState<CnpjData | null>(null);

  const plan = userPlan?.toUpperCase() || 'STARTER';
  const limit = CNPJ_LIMITS[plan] || 1;
  const allCnpjs = [cnpjPrincipal, ...cnpjsGrupo].filter(Boolean) as string[];
  const currentCount = allCnpjs.length;
  const canAddMore = currentCount < limit;
  
  // Calcula quantos CNPJs extras pode adicionar
  const extraSlots = Math.max(0, limit - currentCount);
  const isPlanLimited = plan === 'STARTER';

  // Format CNPJ input
  const handleCnpjInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    setNewCnpj(formatCnpj(digits));
  };

  // Search CNPJ
  const handleSearchCnpj = async () => {
    const cleanedCnpj = newCnpj.replace(/\D/g, '');
    
    if (cleanedCnpj.length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "Digite os 14 dígitos do CNPJ",
        variant: "destructive",
      });
      return;
    }

    // Check if already exists
    if (allCnpjs.includes(cleanedCnpj)) {
      toast({
        title: "CNPJ já cadastrado",
        description: "Este CNPJ já está no grupo",
        variant: "destructive",
      });
      return;
    }

    const data = await lookup(cleanedCnpj);
    if (data) {
      setPendingCnpjData(data);
    } else {
      toast({
        title: "CNPJ não encontrado",
        description: "Verifique o número e tente novamente",
        variant: "destructive",
      });
    }
  };

  // Confirm and add CNPJ
  const handleConfirmAdd = async () => {
    if (!pendingCnpjData) return;
    
    setIsAdding(true);
    try {
      const cleanedCnpj = pendingCnpjData.cnpj.replace(/\D/g, '');
      
      let newPrincipal = cnpjPrincipal;
      let newGrupo = [...cnpjsGrupo];
      
      if (!cnpjPrincipal) {
        newPrincipal = cleanedCnpj;
      } else {
        newGrupo.push(cleanedCnpj);
      }

      const { error } = await supabase
        .from('company_profile')
        .update({
          cnpj_principal: newPrincipal,
          cnpjs_grupo: newGrupo,
          qtd_cnpjs: 1 + newGrupo.length,
          ...(newPrincipal === cleanedCnpj ? {
            razao_social: pendingCnpjData.razao_social,
            nome_fantasia: pendingCnpjData.nome_fantasia || pendingCnpjData.razao_social,
            uf_sede: pendingCnpjData.uf,
            cnae_principal: pendingCnpjData.cnae_fiscal?.toString(),
          } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "CNPJ adicionado!",
        description: `${pendingCnpjData.razao_social} foi adicionado ao grupo.`,
      });

      // Reset form
      setNewCnpj("");
      setPendingCnpjData(null);
      setShowForm(false);
      reset();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding CNPJ:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewCnpj("");
    setPendingCnpjData(null);
    setShowForm(false);
    reset();
  };

  // Versão compacta para o dashboard
  if (compact) {
    if (!canAddMore) {
      if (isPlanLimited) {
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate('/upgrade')}
          >
            <Lock className="h-4 w-4" />
            Upgrade para +CNPJs
          </Button>
        );
      }
      return null; // Já tem todos os CNPJs do plano
    }

    if (!showForm) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar CNPJ ({extraSlots} disponível{extraSlots > 1 ? 'is' : ''})
        </Button>
      );
    }

    return (
      <Card className="border-primary/30">
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="00.000.000/0000-00"
              value={newCnpj}
              onChange={(e) => handleCnpjInput(e.target.value)}
              className="font-mono"
              disabled={isLookingUp || !!pendingCnpjData}
            />
            {!pendingCnpjData && (
              <Button 
                onClick={handleSearchCnpj} 
                disabled={isLookingUp || newCnpj.replace(/\D/g, '').length !== 14}
                size="icon"
              >
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {pendingCnpjData && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pendingCnpjData.razao_social}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">{pendingCnpjData.uf}</Badge>
                    <Badge variant="outline" className="text-xs">{pendingCnpjData.porte}</Badge>
                    {pendingCnpjData.inscricoes_estaduais?.[0] && (
                      <Badge variant="outline" className="text-xs">IE: {pendingCnpjData.inscricoes_estaduais[0].inscricao_estadual}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleConfirmAdd} disabled={isAdding}>
                  {isAdding && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {!pendingCnpjData && (
            <Button variant="ghost" size="sm" onClick={handleCancel} className="w-full">
              Cancelar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Versão completa (card)
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              CNPJs do Grupo
            </CardTitle>
            <CardDescription className="text-sm">
              {currentCount} de {limit} cadastrados
            </CardDescription>
          </div>
          <Badge variant={canAddMore ? "default" : "secondary"}>
            {plan}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {canAddMore ? (
          showForm ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="00.000.000/0000-00"
                  value={newCnpj}
                  onChange={(e) => handleCnpjInput(e.target.value)}
                  className="font-mono"
                  disabled={isLookingUp || !!pendingCnpjData}
                />
                {!pendingCnpjData && (
                  <Button 
                    onClick={handleSearchCnpj} 
                    disabled={isLookingUp || newCnpj.replace(/\D/g, '').length !== 14}
                  >
                    {isLookingUp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {pendingCnpjData && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{pendingCnpjData.razao_social}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{pendingCnpjData.uf}</Badge>
                        <Badge variant="outline">{pendingCnpjData.porte}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button onClick={handleConfirmAdd} disabled={isAdding}>
                      {isAdding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}

              {!pendingCnpjData && (
                <Button variant="ghost" onClick={handleCancel} className="w-full">
                  Cancelar
                </Button>
              )}
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar CNPJ ({extraSlots} disponível{extraSlots > 1 ? 'is' : ''})
            </Button>
          )
        ) : (
          <div className="text-center py-2">
            {isPlanLimited ? (
              <Button variant="link" onClick={() => navigate('/upgrade')} className="gap-1">
                Upgrade para mais CNPJs
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Limite de {limit} CNPJs atingido
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
