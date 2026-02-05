import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface XmlCreditsSummary {
  totalXmls: number;
  totalPis: number;
  totalCofins: number;
  totalIcms: number;
  totalIcmsSt: number;
  totalIpi: number;
  totalImpostos: number;
  totalPisCofins: number;
  // Para o Radar de Créditos - estimativa conservadora de recuperação
  pisCofinsRecuperavel: number;
  icmsRecuperavel: number;
  icmsStRecuperavel: number;
  ipiRecuperavel: number;
  totalRecuperavel: number;
}

export interface XmlCreditItem {
  id: string;
  documentNumber: string;
  issueDate: string;
  issuerCnpj: string;
  issuerName: string;
  documentTotal: number;
  pis: number;
  cofins: number;
  icms: number;
  icmsSt: number;
  ipi: number;
  totalTax: number;
}

// Fatores de recuperação conservadores (% do imposto que pode ser crédito)
const RECOVERY_FACTORS = {
  pisCofins: 0.65, // 65% - muitas operações geram crédito
  icms: 0.40, // 40% - depende muito do tipo de operação
  icmsSt: 0.30, // 30% - mais restrito
  ipi: 0.50, // 50% - comum em industrialização
};

export function useXmlCreditsSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["xml-credits-summary", user?.id],
    queryFn: async (): Promise<XmlCreditsSummary> => {
      if (!user) throw new Error("User not authenticated");

      const { data: xmlData, error: xmlError } = await supabase
        .from("xml_analysis")
        .select("current_taxes")
        .eq("user_id", user.id);

      if (xmlError) throw xmlError;

      const summary = (xmlData || []).reduce(
        (acc, row) => {
          const taxes = row.current_taxes as Record<string, number> | null;
          if (taxes) {
            acc.totalXmls++;
            acc.totalPis += Number(taxes.pis) || 0;
            acc.totalCofins += Number(taxes.cofins) || 0;
            acc.totalIcms += Number(taxes.icms) || 0;
            acc.totalIcmsSt += Number(taxes.icms_st) || 0;
            acc.totalIpi += Number(taxes.ipi) || 0;
            acc.totalImpostos += Number(taxes.total) || 0;
          }
          return acc;
        },
        {
          totalXmls: 0,
          totalPis: 0,
          totalCofins: 0,
          totalIcms: 0,
          totalIcmsSt: 0,
          totalIpi: 0,
          totalImpostos: 0,
        }
      );

      const totalPisCofins = summary.totalPis + summary.totalCofins;
      const pisCofinsRecuperavel = totalPisCofins * RECOVERY_FACTORS.pisCofins;
      const icmsRecuperavel = summary.totalIcms * RECOVERY_FACTORS.icms;
      const icmsStRecuperavel = summary.totalIcmsSt * RECOVERY_FACTORS.icmsSt;
      const ipiRecuperavel = summary.totalIpi * RECOVERY_FACTORS.ipi;
      const totalRecuperavel =
        pisCofinsRecuperavel + icmsRecuperavel + icmsStRecuperavel + ipiRecuperavel;

      return {
        ...summary,
        totalPisCofins,
        pisCofinsRecuperavel,
        icmsRecuperavel,
        icmsStRecuperavel,
        ipiRecuperavel,
        totalRecuperavel,
      };
    },
    enabled: !!user,
  });
}

export function useXmlCreditItems(limit = 100) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["xml-credit-items", user?.id, limit],
    queryFn: async (): Promise<XmlCreditItem[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("xml_analysis")
        .select(
          "id, document_number, issue_date, issuer_cnpj, issuer_name, document_total, current_taxes"
        )
        .eq("user_id", user.id)
        .not("current_taxes", "is", null)
        .order("document_total", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row) => {
        const taxes = row.current_taxes as Record<string, number> | null;
        return {
          id: row.id,
          documentNumber: row.document_number || "",
          issueDate: row.issue_date || "",
          issuerCnpj: row.issuer_cnpj || "",
          issuerName: row.issuer_name || "",
          documentTotal: row.document_total || 0,
          pis: Number(taxes?.pis) || 0,
          cofins: Number(taxes?.cofins) || 0,
          icms: Number(taxes?.icms) || 0,
          icmsSt: Number(taxes?.icms_st) || 0,
          ipi: Number(taxes?.ipi) || 0,
          totalTax: Number(taxes?.total) || 0,
        };
      });
    },
    enabled: !!user,
  });
}
