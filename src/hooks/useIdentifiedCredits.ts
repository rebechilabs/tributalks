import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CreditRule {
  id: string;
  rule_code: string;
  rule_name: string;
  tax_type: string;
  legal_basis: string;
  description: string;
  confidence_level: string;
}

export interface IdentifiedCredit {
  id: string;
  nfe_key: string;
  nfe_number: string;
  nfe_date: string;
  supplier_cnpj: string;
  supplier_name: string;
  original_tax_value: number;
  credit_not_used: number;
  potential_recovery: number;
  ncm_code: string;
  product_description: string;
  cfop: string;
  cst: string;
  confidence_score: number;
  confidence_level: string;
  status: string;
  created_at: string;
  rule?: CreditRule;
}

export interface IdentifiedCreditsSummary {
  total_potential: number;
  pis_cofins_potential: number;
  icms_potential: number;
  icms_st_potential: number;
  ipi_potential: number;
  high_confidence_total: number;
  medium_confidence_total: number;
  low_confidence_total: number;
  total_credits_count: number;
  credits_by_rule: Record<string, { count: number; total: number; rule_name: string }>;
}

export function useIdentifiedCredits(limit = 100) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["identified-credits", user?.id, limit],
    queryFn: async (): Promise<IdentifiedCredit[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("identified_credits")
        .select(`
          id,
          nfe_key,
          nfe_number,
          nfe_date,
          supplier_cnpj,
          supplier_name,
          original_tax_value,
          credit_not_used,
          potential_recovery,
          ncm_code,
          product_description,
          cfop,
          cst,
          confidence_score,
          confidence_level,
          status,
          created_at,
          credit_rules (
            id,
            rule_code,
            rule_name,
            tax_type,
            legal_basis,
            description,
            confidence_level
          )
        `)
        .eq("user_id", user.id)
        .order("potential_recovery", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...row,
        rule: row.credit_rules || undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useIdentifiedCreditsSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["identified-credits-summary", user?.id],
    queryFn: async (): Promise<IdentifiedCreditsSummary> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("identified_credits")
        .select(`
          potential_recovery,
          confidence_level,
          credit_rules (
            tax_type,
            rule_name,
            rule_code
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      const credits = data || [];

      // Calculate summaries
      let pis_cofins_potential = 0;
      let icms_potential = 0;
      let icms_st_potential = 0;
      let ipi_potential = 0;
      let high_confidence_total = 0;
      let medium_confidence_total = 0;
      let low_confidence_total = 0;
      const credits_by_rule: Record<string, { count: number; total: number; rule_name: string }> = {};

      credits.forEach((credit: any) => {
        const value = credit.potential_recovery || 0;
        const taxType = credit.credit_rules?.tax_type || 'Outros';
        const ruleCode = credit.credit_rules?.rule_code || 'unknown';
        const ruleName = credit.credit_rules?.rule_name || 'Regra desconhecida';

        // By tax type
        if (taxType.includes('PIS') || taxType.includes('COFINS')) {
          pis_cofins_potential += value;
        } else if (taxType === 'ICMS-ST') {
          icms_st_potential += value;
        } else if (taxType === 'ICMS') {
          icms_potential += value;
        } else if (taxType === 'IPI') {
          ipi_potential += value;
        }

        // By confidence
        if (credit.confidence_level === 'high') {
          high_confidence_total += value;
        } else if (credit.confidence_level === 'medium') {
          medium_confidence_total += value;
        } else {
          low_confidence_total += value;
        }

        // By rule
        if (!credits_by_rule[ruleCode]) {
          credits_by_rule[ruleCode] = { count: 0, total: 0, rule_name: ruleName };
        }
        credits_by_rule[ruleCode].count++;
        credits_by_rule[ruleCode].total += value;
      });

      const total_potential = pis_cofins_potential + icms_potential + icms_st_potential + ipi_potential;

      return {
        total_potential,
        pis_cofins_potential,
        icms_potential,
        icms_st_potential,
        ipi_potential,
        high_confidence_total,
        medium_confidence_total,
        low_confidence_total,
        total_credits_count: credits.length,
        credits_by_rule,
      };
    },
    enabled: !!user,
  });
}
