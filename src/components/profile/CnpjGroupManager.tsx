import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCnpjLookup, formatCnpj, CnpjData } from "@/hooks/useCnpjLookup";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  CheckCircle2,
  AlertCircle,
  Crown,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Limits per plan
const CNPJ_LIMITS: Record<string, number> = {
  'STARTER': 1,
  'NAVIGATOR': 2,
  'PROFESSIONAL': 5,
  'ENTERPRISE': 999,
};

interface CnpjItem {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  uf: string;
  cnae_fiscal_descricao: string;
  is_principal: boolean;
}

interface CnpjGroupManagerProps {
  userId: string;
  userPlan: string;
  cnpjPrincipal: string | null;
  cnpjsGrupo: string[];
  onUpdate: (cnpjPrincipal: string, cnpjsGrupo: string[]) => void;
}

export function CnpjGroupManager({
  userId,
  userPlan,
  cnpjPrincipal,
  cnpjsGrupo,
  onUpdate,
}: CnpjGroupManagerProps) {
  const { toast } = useToast();
  const { lookup, isLoading: isLookingUp, reset } = useCnpjLookup();
  
  const [newCnpj, setNewCnpj] = useState("");
  const [cnpjDetails, setCnpjDetails] = useState<Map<string, CnpjItem>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingCnpjData, setPendingCnpjData] = useState<CnpjData | null>(null);

  const plan = userPlan?.toUpperCase() || 'STARTER';
  const limit = CNPJ_LIMITS[plan] || 1;
  const allCnpjs = [cnpjPrincipal, ...cnpjsGrupo].filter(Boolean) as string[];
  const canAddMore = allCnpjs.length < limit;
  const isPlanLimited = plan === 'STARTER' || plan === 'NAVIGATOR';

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
      
      // If no principal, set this as principal
      let newPrincipal = cnpjPrincipal;
      let newGrupo = [...cnpjsGrupo];
      
      if (!cnpjPrincipal) {
        newPrincipal = cleanedCnpj;
      } else {
        newGrupo.push(cleanedCnpj);
      }

      // Update database
      const { error } = await supabase
        .from('company_profile')
        .update({
          cnpj_principal: newPrincipal,
          cnpjs_grupo: newGrupo,
          qtd_cnpjs: 1 + newGrupo.length,
          // Also update auto-filled data from first CNPJ
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

      // Store details locally
      const newDetails = new Map(cnpjDetails);
      newDetails.set(cleanedCnpj, {
        cnpj: cleanedCnpj,
        razao_social: pendingCnpjData.razao_social,
        nome_fantasia: pendingCnpjData.nome_fantasia || '',
        uf: pendingCnpjData.uf,
        cnae_fiscal_descricao: pendingCnpjData.cnae_fiscal_descricao,
        is_principal: newPrincipal === cleanedCnpj,
      });
      setCnpjDetails(newDetails);

      onUpdate(newPrincipal!, newGrupo);
      
      toast({
        title: "CNPJ adicionado!",
        description: `${pendingCnpjData.razao_social} foi adicionado ao grupo.`,
      });

      // Reset form
      setNewCnpj("");
      setPendingCnpjData(null);
      setShowAddForm(false);
      reset();
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

  // Remove CNPJ from group
  const handleRemoveCnpj = async (cnpjToRemove: string) => {
    try {
      let newPrincipal = cnpjPrincipal;
      let newGrupo = cnpjsGrupo.filter(c => c !== cnpjToRemove);

      // If removing principal, promote first from grupo
      if (cnpjToRemove === cnpjPrincipal) {
        if (newGrupo.length > 0) {
          newPrincipal = newGrupo.shift()!;
        } else {
          newPrincipal = null;
        }
      }

      const { error } = await supabase
        .from('company_profile')
        .update({
          cnpj_principal: newPrincipal,
          cnpjs_grupo: newGrupo,
          qtd_cnpjs: (newPrincipal ? 1 : 0) + newGrupo.length,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      const newDetails = new Map(cnpjDetails);
      newDetails.delete(cnpjToRemove);
      setCnpjDetails(newDetails);

      onUpdate(newPrincipal || '', newGrupo);

      toast({
        title: "CNPJ removido",
        description: "O CNPJ foi removido do grupo.",
      });
    } catch (error) {
      console.error('Error removing CNPJ:', error);
      toast({
        title: "Erro ao remover",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Cancel add form
  const handleCancelAdd = () => {
    setNewCnpj("");
    setPendingCnpjData(null);
    setShowAddForm(false);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              CNPJs do Grupo Empresarial
            </CardTitle>
            <CardDescription>
              {allCnpjs.length} de {limit} CNPJs cadastrados
            </CardDescription>
          </div>
          <Badge variant={canAddMore ? "outline" : "secondary"}>
            {plan}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* List of CNPJs */}
        {allCnpjs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum CNPJ cadastrado</p>
            <p className="text-sm">Adicione o primeiro CNPJ do seu grupo empresarial</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allCnpjs.map((cnpj, index) => {
              const isPrincipal = cnpj === cnpjPrincipal;
              const details = cnpjDetails.get(cnpj);
              const isLoadingThis = loadingDetails.has(cnpj);

              return (
                <div
                  key={cnpj}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    isPrincipal && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "p-2 rounded-full",
                      isPrincipal ? "bg-primary/10" : "bg-muted"
                    )}>
                      {isPrincipal ? (
                        <Crown className="h-4 w-4 text-primary" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {formatCnpj(cnpj)}
                        </span>
                        {isPrincipal && (
                          <Badge variant="default" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      {isLoadingThis ? (
                        <Skeleton className="h-4 w-48 mt-1" />
                      ) : details ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {details.razao_social}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Remove button - can't remove last CNPJ */}
                  {allCnpjs.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 ml-2">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover CNPJ</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover {formatCnpj(cnpj)} do grupo?
                            {isPrincipal && " O próximo CNPJ será promovido a principal."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveCnpj(cnpj)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add CNPJ Form */}
        {showAddForm ? (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
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

            {/* Preview of found CNPJ */}
            {pendingCnpjData && (
              <div className="border rounded-lg p-4 bg-background space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{pendingCnpjData.razao_social}</p>
                    {pendingCnpjData.nome_fantasia && (
                      <p className="text-sm text-muted-foreground">
                        {pendingCnpjData.nome_fantasia}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{pendingCnpjData.uf}</Badge>
                      <Badge variant="outline">{pendingCnpjData.porte}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {pendingCnpjData.cnae_fiscal_descricao}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCancelAdd}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmAdd} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Confirmar
                  </Button>
                </div>
              </div>
            )}

            {!pendingCnpjData && (
              <div className="flex justify-end">
                <Button variant="ghost" onClick={handleCancelAdd}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Add Button */
          canAddMore ? (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar CNPJ
            </Button>
          ) : (
            <div className="text-center py-4 border rounded-lg bg-muted/30">
              <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Limite de {limit} CNPJ{limit > 1 ? 's' : ''} atingido
              </p>
              {isPlanLimited && (
                <Button variant="link" className="mt-1 h-auto p-0 text-sm">
                  Upgrade para Professional →
                </Button>
              )}
            </div>
          )
        )}

        {/* Info about auto-fill */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-muted-foreground">
            Os dados são preenchidos automaticamente pela API da Receita Federal: 
            Razão Social, Nome Fantasia, CNAE, UF e Porte.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
