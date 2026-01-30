import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  RefreshCcw, 
  Loader2, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
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

interface SwitchCompanyCardProps {
  companyName?: string | null;
  cnpj?: string | null;
}

export function SwitchCompanyCard({ companyName, cnpj }: SwitchCompanyCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const handleSwitchCompany = async () => {
    if (!user?.id) return;

    setIsResetting(true);
    try {
      // Delete all user data related to current company
      // Order matters due to foreign key constraints
      await supabase.from('identified_credits').delete().eq('user_id', user.id);
      await supabase.from('credit_analysis_summary').delete().eq('user_id', user.id);
      await supabase.from('xml_imports').delete().eq('user_id', user.id);
      await supabase.from('fiscal_cross_analysis').delete().eq('user_id', user.id);
      await supabase.from('dctf_debitos').delete().eq('user_id', user.id);
      await supabase.from('dctf_declaracoes').delete().eq('user_id', user.id);
      await supabase.from('sped_contribuicoes').delete().eq('user_id', user.id);
      await supabase.from('company_ncm_analysis').delete().eq('user_id', user.id);
      await supabase.from('company_opportunities').delete().eq('user_id', user.id);
      await supabase.from('company_dre').delete().eq('user_id', user.id);
      await supabase.from('price_simulations').delete().eq('user_id', user.id);
      await supabase.from('margin_dashboard').delete().eq('user_id', user.id);
      await supabase.from('erp_sync_logs').delete().eq('user_id', user.id);
      await supabase.from('erp_connections').delete().eq('user_id', user.id);
      await supabase.from('erp_checklist').delete().eq('user_id', user.id);
      await supabase.from('company_profile').delete().eq('user_id', user.id);

      toast({
        title: "Dados limpos com sucesso!",
        description: "Você será redirecionado para cadastrar a nova empresa.",
      });

      // Navigate to company profile wizard
      navigate('/dashboard/perfil-empresa');
    } catch (error) {
      console.error('Error resetting company data:', error);
      toast({
        title: "Erro ao limpar dados",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Empresa Atual</CardTitle>
        </div>
        {companyName && (
          <CardDescription className="flex flex-col gap-1">
            <span className="font-medium text-foreground">{companyName}</span>
            {cnpj && <span className="font-mono text-xs">{formatCnpj(cnpj)}</span>}
          </CardDescription>
        )}
        {!companyName && (
          <CardDescription>
            Nenhuma empresa cadastrada
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2" size="sm">
              <RefreshCcw className="h-4 w-4" />
              Trocar Empresa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Trocar de Empresa
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Ao trocar de empresa, <strong>todos os dados</strong> relacionados 
                  à empresa atual serão excluídos:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Perfil da empresa e CNPJs</li>
                  <li>XMLs importados e créditos identificados</li>
                  <li>Arquivos SPED e DCTF</li>
                  <li>DRE e Score Tributário</li>
                  <li>Oportunidades e simulações</li>
                  <li>Integrações ERP</li>
                </ul>
                <p className="text-destructive font-medium">
                  Esta ação não pode ser desfeita.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSwitchCompany}
                disabled={isResetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Limpando...
                  </>
                ) : (
                  <>
                    Confirmar Troca
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
