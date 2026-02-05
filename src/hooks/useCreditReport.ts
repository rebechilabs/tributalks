/**
 * useCreditReport Hook
 * Aggregates data for credit report generation
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/contexts/CompanyContext';
import { useIdentifiedCredits, useIdentifiedCreditsSummary } from '@/hooks/useIdentifiedCredits';
import { useXmlCreditsSummary, useXmlCreditItems } from '@/hooks/useXmlCredits';
import type { 
  RelatorioCreditos, 
  EmpresaDados, 
  SumarioExecutivo, 
  TributoCreditoDetalhe, 
  Inconsistencia, 
  Oportunidade, 
  Estatisticas,
  NotaFiscalCredito,
  RegraCredito,
  NivelConfianca,
  NivelRisco,
} from '@/lib/pdf/types';
import { generateReportId } from '@/lib/pdf/types';

interface UseCreditReportReturn {
  data: RelatorioCreditos | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export function useCreditReport(): UseCreditReportReturn {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { data: identifiedCredits, isLoading: loadingCredits } = useIdentifiedCredits(500);
  const { data: creditsSummary, isLoading: loadingSummary } = useIdentifiedCreditsSummary();
  const { data: xmlSummary, isLoading: loadingXml } = useXmlCreditsSummary();
  const { data: xmlCreditItems, isLoading: loadingXmlItems } = useXmlCreditItems(100);

  const isLoading = loadingCredits || loadingSummary || loadingXml || loadingXmlItems;

  const data = useMemo<RelatorioCreditos | null>(() => {
    if (!user || isLoading) return null;

    // Build company data
    const empresa: EmpresaDados = {
      razaoSocial: currentCompany?.razao_social || 'Empresa não identificada',
      nomeFantasia: currentCompany?.nome_fantasia || undefined,
      cnpj: currentCompany?.cnpj_principal || '',
      regime: (currentCompany?.regime_tributario as 'simples' | 'presumido' | 'real') || 'presumido',
    };

    // Build summary
    const hasIdentifiedCredits = creditsSummary && creditsSummary.total_credits_count > 0;
    const sumario: SumarioExecutivo = {
      totalRecuperavel: hasIdentifiedCredits 
        ? creditsSummary.total_potential 
        : (xmlSummary?.totalRecuperavel || 0),
      economiaAnualMin: hasIdentifiedCredits 
        ? creditsSummary.total_potential * 0.8 
        : (xmlSummary?.totalRecuperavel || 0) * 0.6,
      economiaAnualMax: hasIdentifiedCredits 
        ? creditsSummary.total_potential * 1.2 
        : (xmlSummary?.totalRecuperavel || 0) * 1.2,
      pisCofins: hasIdentifiedCredits 
        ? creditsSummary.pis_cofins_potential 
        : (xmlSummary?.pisCofinsRecuperavel || 0),
      icms: hasIdentifiedCredits 
        ? creditsSummary.icms_potential 
        : (xmlSummary?.icmsRecuperavel || 0),
      icmsSt: hasIdentifiedCredits 
        ? creditsSummary.icms_st_potential 
        : (xmlSummary?.icmsStRecuperavel || 0),
      ipi: hasIdentifiedCredits 
        ? creditsSummary.ipi_potential 
        : (xmlSummary?.ipiRecuperavel || 0),
      altaConfianca: creditsSummary?.high_confidence_total || 0,
      mediaConfianca: creditsSummary?.medium_confidence_total || 0,
      baixaConfianca: creditsSummary?.low_confidence_total || 0,
      totalCreditos: creditsSummary?.total_credits_count || 0,
    };

    // Group credits by tax type
    const creditosPorTributo: TributoCreditoDetalhe[] = [];
    const creditsByTax = new Map<string, typeof identifiedCredits>();

    // Check if we have identified_credits data
    const hasIdentifiedCreditsData = identifiedCredits && identifiedCredits.length > 0;

    if (hasIdentifiedCreditsData) {
      // Use identified_credits data (original logic)
      identifiedCredits.forEach(credit => {
        const taxType = credit.rule?.tax_type || 'Outros';
        if (!creditsByTax.has(taxType)) {
          creditsByTax.set(taxType, []);
        }
        creditsByTax.get(taxType)!.push(credit);
      });

      creditsByTax.forEach((credits, taxType) => {
        const notas: NotaFiscalCredito[] = credits.map(c => ({
          chaveAcesso: c.nfe_key || '',
          numeroNfe: c.nfe_number || '',
          cnpjEmitente: c.supplier_cnpj || '',
          nomeEmitente: c.supplier_name || '',
          dataEmissao: c.nfe_date || new Date().toISOString(),
          valorNota: c.original_tax_value || 0,
          valorCredito: c.potential_recovery || 0,
          ncm: c.ncm_code || '',
          cfop: c.cfop || '',
          cst: c.cst || '',
          confianca: normalizeConfidence(c.confidence_level),
          regraAplicada: c.rule?.rule_code,
          baseLegal: c.rule?.legal_basis,
        }));

        // Group by rule
        const regrasMap = new Map<string, RegraCredito>();
        credits.forEach(c => {
          if (c.rule) {
            const key = c.rule.rule_code;
            if (!regrasMap.has(key)) {
              regrasMap.set(key, {
                codigo: c.rule.rule_code,
                nome: c.rule.rule_name,
                tributo: c.rule.tax_type,
                baseLegal: c.rule.legal_basis || '',
                descricao: c.rule.description || '',
                confianca: normalizeConfidence(c.rule.confidence_level),
                totalIdentificado: 0,
                quantidadeNotas: 0,
              });
            }
            const regra = regrasMap.get(key)!;
            regra.totalIdentificado += c.potential_recovery || 0;
            regra.quantidadeNotas += 1;
          }
        });

        const regras = Array.from(regrasMap.values());
        const valorTotal = credits.reduce((sum, c) => sum + (c.potential_recovery || 0), 0);
        const primaryRule = regras[0];

        creditosPorTributo.push({
          tributo: normalizeTaxType(taxType),
          valorTotal,
          baseLegal: primaryRule?.baseLegal || '',
          descricaoBaseLegal: primaryRule?.descricao || '',
          risco: 'baixo' as NivelRisco,
          notas,
          regras,
        });
      });
    } else if (xmlCreditItems && xmlCreditItems.length > 0) {
      // FALLBACK: Use xml_analysis data when identified_credits is empty
      // Group XMLs by tax type and create synthetic credits
      const xmlsByTax: Record<string, typeof xmlCreditItems> = {
        'PIS/COFINS': [],
        'ICMS': [],
        'ICMS-ST': [],
        'IPI': [],
      };

      xmlCreditItems.forEach(xml => {
        if (xml.pis > 0 || xml.cofins > 0) xmlsByTax['PIS/COFINS'].push(xml);
        if (xml.icms > 0) xmlsByTax['ICMS'].push(xml);
        if (xml.icmsSt > 0) xmlsByTax['ICMS-ST'].push(xml);
        if (xml.ipi > 0) xmlsByTax['IPI'].push(xml);
      });

      // Recovery factors (conservative estimates)
      const recoveryFactors: Record<string, number> = {
        'PIS/COFINS': 0.65,
        'ICMS': 0.40,
        'ICMS-ST': 0.30,
        'IPI': 0.50,
      };

      const legalBases: Record<string, string> = {
        'PIS/COFINS': 'Lei 10.637/02 e Lei 10.833/03',
        'ICMS': 'LC 87/96 (Lei Kandir)',
        'ICMS-ST': 'LC 87/96 art. 10',
        'IPI': 'Decreto 7.212/10 (RIPI)',
      };

      const taxValueGetters: Record<string, (xml: typeof xmlCreditItems[0]) => number> = {
        'PIS/COFINS': (xml) => xml.pis + xml.cofins,
        'ICMS': (xml) => xml.icms,
        'ICMS-ST': (xml) => xml.icmsSt,
        'IPI': (xml) => xml.ipi,
      };

      Object.entries(xmlsByTax).forEach(([taxType, xmls]) => {
        if (xmls.length === 0) return;

        const getTaxValue = taxValueGetters[taxType];
        const recoveryFactor = recoveryFactors[taxType] || 0.5;

        const notas: NotaFiscalCredito[] = xmls.slice(0, 50).map(xml => {
          const taxValue = getTaxValue(xml);
          const creditValue = taxValue * recoveryFactor;
          
          return {
            chaveAcesso: xml.id, // Using ID as placeholder since we don't have full NFe key
            numeroNfe: xml.documentNumber,
            cnpjEmitente: xml.issuerCnpj,
            nomeEmitente: xml.issuerName,
            dataEmissao: xml.issueDate || new Date().toISOString(),
            valorNota: taxValue,
            valorCredito: creditValue,
            aliquota: taxType === 'PIS/COFINS' ? 9.25 : taxType === 'ICMS' ? 18 : taxType === 'IPI' ? 10 : 18,
            ncm: '',
            cfop: '',
            cst: '',
            confianca: 'media' as NivelConfianca,
            baseLegal: legalBases[taxType],
          };
        });

        const valorTotal = notas.reduce((sum, n) => sum + n.valorCredito, 0);

        creditosPorTributo.push({
          tributo: normalizeTaxType(taxType),
          valorTotal,
          baseLegal: legalBases[taxType],
          descricaoBaseLegal: `Créditos estimados a partir de ${xmls.length} documentos fiscais analisados.`,
          risco: 'medio' as NivelRisco,
          notas,
          regras: [{
            codigo: `${taxType}-XML`,
            nome: `Créditos de ${taxType} (análise preliminar)`,
            tributo: taxType,
            baseLegal: legalBases[taxType],
            descricao: 'Créditos identificados através da análise dos XMLs importados.',
            confianca: 'media' as NivelConfianca,
            totalIdentificado: valorTotal,
            quantidadeNotas: notas.length,
          }],
        });
      });
    }

    // Sort by value
    creditosPorTributo.sort((a, b) => b.valorTotal - a.valorTotal);

    // Build inconsistencies (from credits with issues)
    const inconsistencias: Inconsistencia[] = [];
    
    // Identify monophasic issues
    const monophasicCredits = identifiedCredits?.filter(c => 
      c.rule?.rule_code?.includes('MONO') || 
      c.rule?.rule_name?.toLowerCase().includes('monofásico')
    ) || [];
    
    if (monophasicCredits.length > 0) {
      const impacto = monophasicCredits.reduce((sum, c) => sum + (c.potential_recovery || 0), 0);
      inconsistencias.push({
        tipo: 'tributacao_monofasica',
        descricao: 'Produtos sujeitos à tributação monofásica com PIS/COFINS destacado indevidamente nas notas de saída.',
        impacto,
        quantidadeNotas: monophasicCredits.length,
        recomendacao: 'Solicitar retificação das notas ou compensação do imposto pago a maior.',
      });
    }

    // Identify CST issues
    const cstCredits = identifiedCredits?.filter(c => 
      c.rule?.rule_code?.includes('CST') || 
      c.cst === '00' || c.cst === '01'
    ) || [];
    
    if (cstCredits.length > 0) {
      const impacto = cstCredits.reduce((sum, c) => sum + (c.potential_recovery || 0), 0);
      inconsistencias.push({
        tipo: 'cst_incorreto',
        descricao: 'CST (Código de Situação Tributária) aplicado incorretamente em operações que dariam direito a crédito.',
        impacto,
        quantidadeNotas: cstCredits.length,
        recomendacao: 'Revisar a classificação fiscal dos produtos e corrigir os CSTs aplicados.',
      });
    }

    // Build opportunities (simplified)
    const oportunidades: Oportunidade[] = [];
    
    if (sumario.pisCofins > 0) {
      oportunidades.push({
        id: 'pis-cofins-recovery',
        titulo: 'Recuperação de PIS/COFINS',
        descricao: 'Créditos de PIS/COFINS identificados em operações de entrada que não foram aproveitados.',
        economiaMin: sumario.pisCofins * 0.8,
        economiaMax: sumario.pisCofins * 1.2,
        risco: 'baixo',
        complexidade: 'media',
        baseLegal: 'Lei 10.637/02 e Lei 10.833/03',
        elegibilidade: ['Regime não-cumulativo', 'Documentação fiscal válida'],
        quickWin: sumario.pisCofins > 10000,
      });
    }

    if (sumario.icms > 0) {
      oportunidades.push({
        id: 'icms-recovery',
        titulo: 'Recuperação de ICMS',
        descricao: 'Créditos de ICMS em operações interestaduais ou sobre insumos que não foram aproveitados.',
        economiaMin: sumario.icms * 0.7,
        economiaMax: sumario.icms * 1.3,
        risco: 'medio',
        complexidade: 'complexa',
        baseLegal: 'LC 87/96 (Lei Kandir)',
        elegibilidade: ['Operações interestaduais', 'Insumos para produção'],
        quickWin: false,
      });
    }

    if (sumario.icmsSt > 0) {
      oportunidades.push({
        id: 'icms-st-recovery',
        titulo: 'Restituição de ICMS-ST',
        descricao: 'Diferença de base de cálculo em operações sujeitas à substituição tributária.',
        economiaMin: sumario.icmsSt * 0.6,
        economiaMax: sumario.icmsSt * 1.0,
        risco: 'baixo',
        complexidade: 'rapida',
        baseLegal: 'Súmula STF 166',
        elegibilidade: ['Operações com ICMS-ST', 'Diferença de MVA comprovada'],
        quickWin: true,
      });
    }

    // Build statistics
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const estatisticas: Estatisticas = {
      totalXmlsAnalisados: xmlSummary?.totalXmls || 0,
      totalCreditosIdentificados: creditsSummary?.total_credits_count || 0,
      periodoCobertura: '3 meses',
      dataUltimaAnalise: now,
      regrasAplicadas: creditosPorTributo.reduce((sum, t) => sum + t.regras.length, 0),
      fornecedoresAnalisados: new Set(identifiedCredits?.map(c => c.supplier_cnpj)).size,
    };

    return {
      id: generateReportId(),
      dataGeracao: now,
      periodoInicio: threeMonthsAgo,
      periodoFim: now,
      empresa,
      sumario,
      creditosPorTributo,
      inconsistencias,
      oportunidades,
      estatisticas,
    };
  }, [user, isLoading, currentCompany, identifiedCredits, creditsSummary, xmlSummary, xmlCreditItems]);

  const isReady = !isLoading && data !== null && (data.sumario.totalRecuperavel > 0 || data.creditosPorTributo.length > 0);

  return {
    data,
    isLoading,
    isReady,
    error: null,
  };
}

// Helper functions
function normalizeConfidence(level: string | undefined): NivelConfianca {
  if (!level) return 'baixa';
  const normalized = level.toLowerCase();
  if (normalized === 'high' || normalized === 'alta') return 'alta';
  if (normalized === 'medium' || normalized === 'media') return 'media';
  return 'baixa';
}

function normalizeTaxType(type: string): 'PIS' | 'COFINS' | 'PIS/COFINS' | 'ICMS' | 'ICMS-ST' | 'IPI' | 'Outros' {
  const upper = type.toUpperCase();
  if (upper.includes('PIS') && upper.includes('COFINS')) return 'PIS/COFINS';
  if (upper.includes('PIS')) return 'PIS';
  if (upper.includes('COFINS')) return 'COFINS';
  if (upper === 'ICMS-ST' || upper.includes('ST')) return 'ICMS-ST';
  if (upper.includes('ICMS')) return 'ICMS';
  if (upper.includes('IPI')) return 'IPI';
  return 'Outros';
}
