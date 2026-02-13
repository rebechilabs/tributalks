import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreditRule {
  id: string
  rule_code: string
  rule_name: string
  description: string
  tax_type: string
  trigger_conditions: Record<string, unknown>
  confidence_level: string
  legal_basis: string
}

interface XmlItem {
  ncm?: string
  cfop?: string
  cst_pis?: string
  cst_cofins?: string
  cst_icms?: string
  csosn?: string
  valor_pis?: number
  valor_cofins?: number
  valor_icms?: number
  valor_ipi?: number
  valor_icms_st?: number
  credito_pis?: number
  credito_cofins?: number
  credito_icms?: number
  valor_item?: number
  descricao?: string
}

interface ParsedXml {
  chave_nfe?: string
  numero?: string
  data_emissao?: string
  cnpj_emitente?: string
  nome_emitente?: string
  itens: XmlItem[]
}

interface IdentifiedCredit {
  rule_id: string
  original_tax_value: number
  potential_recovery: number
  ncm_code: string
  cfop: string
  cst: string
  confidence_level: string
  confidence_score: number
  product_description?: string
  nfe_key?: string
  nfe_number?: string
  nfe_date?: string
  supplier_cnpj?: string
  supplier_name?: string
}

interface CompanyContext {
  regime: string | null
  cnae: string | null
  setor: string | null
  aliquotaEfetiva: number
  pgdasData: Record<string, unknown> | null
  temAtividadesMistas: boolean
  cnaeSecundarios: string[] | null
}

interface SimplesTaxDistribution {
  irpj: number
  csll: number
  cofins: number
  pis: number
  cpp: number
  icms: number
  iss: number
}

interface MonophasicNcm {
  ncm_prefix: string
  category: string
  legal_basis: string
  description: string | null
}

// ========== EXPORTED HELPER FUNCTIONS (for testing) ==========

export function detectFaixaFromRBT12(rbt12: number): number {
  if (rbt12 <= 180000) return 1
  if (rbt12 <= 360000) return 2
  if (rbt12 <= 720000) return 3
  if (rbt12 <= 1800000) return 4
  if (rbt12 <= 3600000) return 5
  return 6
}

export function detectAnexoFromCNAE(cnae: string): string {
  if (!cnae) return 'I'
  const prefix = cnae.substring(0, 2)
  // Indústria
  if (['10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33'].includes(prefix)) return 'II'
  // Comércio
  if (['45','46','47'].includes(prefix)) return 'I'
  // Serviços de construção/vigilância/limpeza
  if (['41','42','43','80','81'].includes(prefix)) return 'IV'
  // Tecnologia/engenharia
  if (['62','63','71','73'].includes(prefix)) return 'V'
  // Serviços gerais
  return 'III'
}

export function isMonophasicNCMFromList(ncm: string, monophasicList: MonophasicNcm[]): MonophasicNcm | null {
  for (const item of monophasicList) {
    if (ncm.startsWith(item.ncm_prefix)) return item
  }
  return null
}

// ========== HELPER FUNCTIONS ==========

function isEntryOperation(cfop: string): boolean {
  return cfop.startsWith('1') || cfop.startsWith('2') || cfop.startsWith('3');
}

function isExitOperation(cfop: string): boolean {
  return cfop.startsWith('5') || cfop.startsWith('6') || cfop.startsWith('7');
}

function isReturnOperation(cfop: string): boolean {
  const returnCfops = ['1411', '1412', '2411', '2412', '5411', '5412', '6411', '6412'];
  return returnCfops.includes(cfop) || cfop.includes('411') || cfop.includes('412');
}

function isPurchaseForResale(cfop: string): boolean {
  return ['1102', '2102', '1403', '2403'].includes(cfop);
}

function isPurchaseOfInputs(cfop: string): boolean {
  return ['1101', '2101', '1111', '2111', '1116', '2116', '1117', '2117'].includes(cfop);
}

function isEnergyOrTelecom(cfop: string): boolean {
  return ['1253', '2253', '1254', '2254', '1255', '2255'].includes(cfop);
}

// Legacy fallback (used for Lucro Real rules)
function isMonophasicNCM(ncm: string): boolean {
  if (ncm.startsWith('2710') || ncm.startsWith('2207')) return true;
  if (ncm.startsWith('3004') || ncm.startsWith('3003')) return true;
  if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return true;
  if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return true;
  if (ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) return true;
  return false;
}

function getMonophasicCategory(ncm: string): string | null {
  if (ncm.startsWith('2710') || ncm.startsWith('2207')) return 'Combustíveis';
  if (ncm.startsWith('3004') || ncm.startsWith('3003')) return 'Medicamentos';
  if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return 'Cosméticos';
  if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return 'Bebidas';
  if (ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) return 'Autopeças';
  return null;
}

function isMonophasicCST(cst: string): boolean {
  return ['04', '05', '06'].includes(cst);
}

function getMonophasicLegalBasis(ncm: string): string {
  if (ncm.startsWith('2710') || ncm.startsWith('2207')) return 'Lei 11.116/2005';
  if (ncm.startsWith('3004') || ncm.startsWith('3003')) return 'Lei 10.147/2000';
  if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return 'Lei 10.147/2000';
  if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return 'Lei 13.097/2015';
  if (ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) return 'Lei 10.485/2002';
  return 'Legislação monofásica';
}

// Rules that should be DISABLED for Simples Nacional
const SIMPLES_DISABLED_RULES = new Set([
  'IPI_001', 'IPI_002', 'IPI_003',
  'ICMS_001', 'ICMS_002', 'ICMS_005',
  'ICMS_ST_001', 'ICMS_ST_002',
  'PIS_COFINS_001', 'PIS_COFINS_002', 'PIS_COFINS_003',
  'PIS_COFINS_007', 'PIS_COFINS_008', 'PIS_COFINS_010', 'PIS_COFINS_011',
])

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    const { xml_import_id, parsed_xmls } = await req.json()

    if (!parsed_xmls || !Array.isArray(parsed_xmls)) {
      return new Response(
        JSON.stringify({ error: 'parsed_xmls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========== FETCH COMPANY CONTEXT ==========
    const { data: profile } = await supabaseAdmin
      .from('company_profile')
      .select('regime_tributario, cnae_principal, setor, tem_atividades_mistas, cnae_secundarios')
      .eq('user_id', userId)
      .maybeSingle()

    // Fetch all PGDAS from last 12 months for RBT12 calculation
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { data: pgdasRecords } = await supabaseAdmin
      .from('pgdas_arquivos')
      .select('aliquota_efetiva, dados_completos, periodo_apuracao, anexo_simples, receita_bruta')
      .eq('user_id', userId)
      .gte('periodo_apuracao', twelveMonthsAgo.toISOString().split('T')[0])
      .order('periodo_apuracao', { ascending: false })

    const latestPgdas = pgdasRecords?.[0] || null

    // Calculate RBT12 from PGDAS records
    let rbt12Calculated = 0
    if (pgdasRecords && pgdasRecords.length > 0) {
      for (const pgdas of pgdasRecords) {
        const rb = pgdas.receita_bruta || 
          (pgdas.dados_completos as Record<string, unknown>)?.receita_bruta as number || 0
        rbt12Calculated += rb
      }
    }
    
    // Fallback to dados_completos.rbt12 if calculated is 0
    const rbt12FromDados = (latestPgdas?.dados_completos as Record<string, unknown>)?.rbt12 as number || 0
    const rbt12Final = rbt12Calculated > 0 ? rbt12Calculated : rbt12FromDados

    const companyContext: CompanyContext = {
      regime: profile?.regime_tributario || null,
      cnae: profile?.cnae_principal || null,
      setor: profile?.setor || null,
      aliquotaEfetiva: latestPgdas?.aliquota_efetiva || 0,
      pgdasData: latestPgdas?.dados_completos as Record<string, unknown> || null,
      temAtividadesMistas: profile?.tem_atividades_mistas || false,
      cnaeSecundarios: profile?.cnae_secundarios || null,
    }

    const isSimplesNacional = companyContext.regime === 'simples_nacional'
    
    console.log(`[analyze-credits] Regime: ${companyContext.regime}, CNAE: ${companyContext.cnae}, Simples: ${isSimplesNacional}, Alíquota: ${companyContext.aliquotaEfetiva}, RBT12: ${rbt12Final}, Mistas: ${companyContext.temAtividadesMistas}`)

    // ========== FETCH REFERENCE DATA FROM DB ==========
    // Fetch monophasic NCMs from database
    let monophasicNcms: MonophasicNcm[] = []
    if (isSimplesNacional) {
      const { data: ncmData } = await supabaseAdmin
        .from('monophasic_ncms')
        .select('ncm_prefix, category, legal_basis, description')
        .eq('is_active', true)
      monophasicNcms = (ncmData || []) as MonophasicNcm[]
      console.log(`[analyze-credits] Loaded ${monophasicNcms.length} monophasic NCMs from DB`)
    }

    // Fetch tax distribution from database
    let taxDistributions: Record<string, SimplesTaxDistribution> = {}
    if (isSimplesNacional) {
      const { data: distData } = await supabaseAdmin
        .from('simples_tax_distribution')
        .select('*')
      
      if (distData) {
        for (const row of distData) {
          const key = `${row.anexo}_${row.faixa}`
          taxDistributions[key] = {
            irpj: Number(row.irpj),
            csll: Number(row.csll),
            cofins: Number(row.cofins),
            pis: Number(row.pis),
            cpp: Number(row.cpp),
            icms: Number(row.icms),
            iss: Number(row.iss),
          }
        }
      }
      console.log(`[analyze-credits] Loaded ${Object.keys(taxDistributions).length} tax distribution entries from DB`)
    }

    // 1. Fetch active rules
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('credit_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError) {
      console.error('Error fetching rules:', rulesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch credit rules' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter rules based on regime
    const applicableRules = (rules || []).filter((rule: CreditRule) => {
      if (isSimplesNacional && SIMPLES_DISABLED_RULES.has(rule.rule_code)) {
        return false
      }
      // For non-Simples, disable Simples-specific rules
      if (!isSimplesNacional && rule.rule_code.startsWith('SIMPLES_')) {
        return false
      }
      return true
    })

    console.log(`[analyze-credits] Total rules: ${rules?.length}, Applicable: ${applicableRules.length}`)

    const identifiedCredits: IdentifiedCredit[] = []

    // 2. Analyze each XML
    if (isSimplesNacional) {
      // ========== SIMPLES NACIONAL ANALYSIS ==========
      // Determine anexo: prefer PGDAS field, then CNAE inference
      const anexo = latestPgdas?.anexo_simples || detectAnexoFromCNAE(companyContext.cnae || '')
      const faixa = rbt12Final > 0 ? detectFaixaFromRBT12(rbt12Final) : 4
      const aliquotaEfetiva = companyContext.aliquotaEfetiva > 0 
        ? companyContext.aliquotaEfetiva / 100 
        : 0.0976 // fallback
      
      // Get tax distribution from DB, fallback to hardcoded
      const taxDistKey = `${anexo}_${faixa}`
      const taxDist = taxDistributions[taxDistKey] || { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 41.50, icms: 34.00, iss: 0 }
      const parcelaPisCofins = (taxDist.pis + taxDist.cofins) / 100
      const parcelaIcms = taxDist.icms / 100

      console.log(`[analyze-credits] Simples config: Anexo ${anexo}, Faixa ${faixa}, RBT12 ${rbt12Final}, Alíquota ${aliquotaEfetiva}, PIS+COFINS ${parcelaPisCofins}, ICMS ${parcelaIcms}`)

      // Find Simples-specific rules
      const simplesMonoRule = applicableRules.find((r: CreditRule) => r.rule_code === 'SIMPLES_MONO_001')
      const simplesIcmsStRule = applicableRules.find((r: CreditRule) => r.rule_code === 'SIMPLES_ICMS_ST_001')

      for (const xml of parsed_xmls as ParsedXml[]) {
        const items = xml.itens || []
        
        for (const item of items) {
          const cfop = item.cfop || ''
          const ncm = item.ncm || ''
          const cstPis = item.cst_pis || ''
          const csosn = item.csosn || item.cst_icms || ''
          const valorItem = item.valor_item || 0

          // Only analyze exit operations for Simples segregation
          if (!isExitOperation(cfop)) continue

          // Determine item-level anexo for mixed activities
          let itemAnexo = anexo
          if (companyContext.temAtividadesMistas && companyContext.cnaeSecundarios?.length) {
            // For now, use the primary CNAE's anexo as default
            // Future: map item CNAE to specific anexo
            itemAnexo = anexo
          }

          // Get distribution for this item's anexo (may differ in mixed activities)
          const itemDistKey = `${itemAnexo}_${faixa}`
          const itemDist = taxDistributions[itemDistKey] || taxDist
          const itemParcelaPisCofins = (itemDist.pis + itemDist.cofins) / 100
          const itemParcelaIcms = itemDist.icms / 100

          // SIMPLES_MONO_001: Monophasic PIS/COFINS segregation (uses DB list)
          if (simplesMonoRule && valorItem > 0) {
            const monoMatch = isMonophasicNCMFromList(ncm, monophasicNcms)
            if (monoMatch) {
              const recovery = valorItem * aliquotaEfetiva * itemParcelaPisCofins
              
              identifiedCredits.push({
                rule_id: simplesMonoRule.id,
                original_tax_value: valorItem * aliquotaEfetiva,
                potential_recovery: recovery,
                ncm_code: ncm,
                cfop: cfop,
                cst: cstPis || '04',
                confidence_level: 'high',
                confidence_score: 92,
                product_description: `Produto monofásico (${monoMatch.category}) - Segregação PGDAS-D - ${monoMatch.legal_basis}`,
                nfe_key: xml.chave_nfe || '',
                nfe_number: xml.numero || '',
                nfe_date: xml.data_emissao || new Date().toISOString().split('T')[0],
                supplier_cnpj: xml.cnpj_emitente || '',
                supplier_name: xml.nome_emitente || '',
              })
            }
          }

          // SIMPLES_ICMS_ST_001: ICMS-ST segregation
          if (simplesIcmsStRule && valorItem > 0) {
            const isST = csosn === '500' || cfop === '5405' || cfop === '6404'
            if (isST) {
              const recovery = valorItem * aliquotaEfetiva * itemParcelaIcms
              
              identifiedCredits.push({
                rule_id: simplesIcmsStRule.id,
                original_tax_value: valorItem * aliquotaEfetiva,
                potential_recovery: recovery,
                ncm_code: ncm,
                cfop: cfop,
                cst: csosn || '500',
                confidence_level: 'high',
                confidence_score: 90,
                product_description: `ICMS-ST já recolhido - Segregação PGDAS-D - LC 123/2006, art. 18, §4º-A`,
                nfe_key: xml.chave_nfe || '',
                nfe_number: xml.numero || '',
                nfe_date: xml.data_emissao || new Date().toISOString().split('T')[0],
                supplier_cnpj: xml.cnpj_emitente || '',
                supplier_name: xml.nome_emitente || '',
              })
            }
          }
        }
      }
    } else {
      // ========== LUCRO REAL / PRESUMIDO ANALYSIS ==========
      for (const xml of parsed_xmls as ParsedXml[]) {
        const items = xml.itens || []
        
        for (const item of items) {
          for (const rule of applicableRules as CreditRule[]) {
            const credit = evaluateRule(rule, xml, item)
            if (credit) {
              identifiedCredits.push({
                ...credit,
                nfe_key: xml.chave_nfe || '',
                nfe_number: xml.numero || '',
                nfe_date: xml.data_emissao || new Date().toISOString().split('T')[0],
                supplier_cnpj: xml.cnpj_emitente || '',
                supplier_name: xml.nome_emitente || '',
                product_description: item.descricao || '',
              })
            }
          }
        }
      }
    }

    // 3. Save identified credits
    if (identifiedCredits.length > 0) {
      const creditsToInsert = identifiedCredits.map(c => ({
        user_id: userId,
        xml_import_id: xml_import_id || null,
        rule_id: c.rule_id,
        nfe_key: c.nfe_key,
        nfe_number: c.nfe_number,
        nfe_date: c.nfe_date,
        supplier_cnpj: c.supplier_cnpj,
        supplier_name: c.supplier_name,
        original_tax_value: c.original_tax_value,
        potential_recovery: c.potential_recovery,
        ncm_code: c.ncm_code,
        product_description: c.product_description,
        cfop: c.cfop,
        cst: c.cst,
        confidence_score: c.confidence_score,
        confidence_level: c.confidence_level,
        status: 'identified'
      }))

      const { error: insertError } = await supabaseAdmin
        .from('identified_credits')
        .insert(creditsToInsert)

      if (insertError) {
        console.error('Error inserting credits:', insertError)
      }
    }

    // 4. Calculate summary by tax type
    const byTaxType = {
      pis_cofins: 0,
      icms: 0,
      icms_st: 0,
      ipi: 0,
      iss: 0
    }

    // Use rule-based categorization for accurate summary
    const ruleMap = new Map((rules || []).map((r: CreditRule) => [r.id, r]))
    
    for (const credit of identifiedCredits) {
      const rule = ruleMap.get(credit.rule_id) as CreditRule | undefined
      if (rule) {
        const taxType = rule.tax_type || ''
        if (taxType.includes('PIS') || taxType.includes('COFINS')) {
          byTaxType.pis_cofins += credit.potential_recovery
        } else if (taxType === 'ICMS-ST') {
          byTaxType.icms_st += credit.potential_recovery
        } else if (taxType === 'ICMS') {
          byTaxType.icms += credit.potential_recovery
        } else if (taxType === 'IPI') {
          byTaxType.ipi += credit.potential_recovery
        }
      }
    }

    const summary = {
      total_potential: identifiedCredits.reduce((sum, c) => sum + c.potential_recovery, 0),
      high_confidence: identifiedCredits
        .filter(c => c.confidence_level === 'high')
        .reduce((sum, c) => sum + c.potential_recovery, 0),
      medium_confidence: identifiedCredits
        .filter(c => c.confidence_level === 'medium')
        .reduce((sum, c) => sum + c.potential_recovery, 0),
      low_confidence: identifiedCredits
        .filter(c => c.confidence_level === 'low')
        .reduce((sum, c) => sum + c.potential_recovery, 0),
      credits_count: identifiedCredits.length,
      by_tax_type: byTaxType,
      regime: companyContext.regime,
      simples_config: isSimplesNacional ? {
        rbt12: rbt12Final,
        faixa: rbt12Final > 0 ? detectFaixaFromRBT12(rbt12Final) : 4,
        anexo: latestPgdas?.anexo_simples || detectAnexoFromCNAE(companyContext.cnae || ''),
        aliquota_efetiva: companyContext.aliquotaEfetiva,
      } : null,
    }

    console.log(`[analyze-credits] Summary: ${JSON.stringify(summary)}`)

    // 5. Save summary
    const { error: summaryError } = await supabaseAdmin
      .from('credit_analysis_summary')
      .insert({
        user_id: userId,
        analysis_date: new Date().toISOString().split('T')[0],
        period_start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        pis_cofins_potential: byTaxType.pis_cofins,
        icms_potential: byTaxType.icms,
        icms_st_potential: byTaxType.icms_st,
        ipi_potential: byTaxType.ipi,
        high_confidence_total: summary.high_confidence,
        medium_confidence_total: summary.medium_confidence,
        low_confidence_total: summary.low_confidence,
        total_potential: summary.total_potential,
        total_xmls_analyzed: parsed_xmls.length,
        credits_found_count: summary.credits_count
      })

    if (summaryError) {
      console.error('Error inserting summary:', summaryError)
    }

    // 6. Create notification
    if (identifiedCredits.length > 0) {
      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
      
      const highConfidenceCredits = identifiedCredits.filter(c => c.confidence_level === 'high')
      const notificationTitle = identifiedCredits.length === 1 
        ? '💰 1 crédito tributário identificado!'
        : `💰 ${identifiedCredits.length} créditos tributários identificados!`
      
      let notificationMessage = `Potencial de recuperação: ${formatCurrency(summary.total_potential)}.`
      
      if (isSimplesNacional) {
        notificationMessage += ' Identificado via segregação de receitas no PGDAS-D.'
      }
      
      if (highConfidenceCredits.length > 0) {
        notificationMessage += ` ${highConfidenceCredits.length} com alta confiança (${formatCurrency(summary.high_confidence)}).`
      }
      
      notificationMessage += ' Clique para ver detalhes no Radar de Créditos.'

      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'success',
          category: 'sistema',
          action_url: '/analise-notas-fiscais',
          read: false
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary, 
        details: identifiedCredits,
        credits_count: identifiedCredits.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-credits:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao analisar créditos. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ========== LUCRO REAL/PRESUMIDO RULE EVALUATOR ==========
function evaluateRule(rule: CreditRule, xml: ParsedXml, item: XmlItem): IdentifiedCredit | null {
  const cfop = item.cfop || ''
  const ncm = item.ncm || ''
  const cstPis = item.cst_pis || ''
  const cstIcms = item.cst_icms || ''
  const valorPis = item.valor_pis || 0
  const valorCofins = item.valor_cofins || 0
  const valorIcms = item.valor_icms || 0
  const valorIpi = item.valor_ipi || 0
  const valorIcmsSt = item.valor_icms_st || 0
  const creditoPis = item.credito_pis || 0
  const creditoIcms = item.credito_icms || 0
  const valorItem = item.valor_item || 0

  // ==== PIS/COFINS RULES ====
  
  if (rule.rule_code === 'PIS_COFINS_001') {
    const cstWithCredit = ['50', '51', '52', '53', '54', '55', '56']
    if (cstWithCredit.includes(cstPis) && creditoPis === 0 && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.9,
        ncm_code: ncm, cfop, cst: cstPis,
        confidence_level: 'high', confidence_score: 85
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_002') {
    if (isPurchaseOfInputs(cfop) || isPurchaseForResale(cfop)) {
      const cstNoCredit = ['70', '71', '72', '73']
      if (cstNoCredit.includes(cstPis) && valorPis > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: (valorPis + valorCofins) * 0.75,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'medium', confidence_score: 70
        }
      }
      if (cstPis === '01' && valorPis > 0 && isEntryOperation(cfop)) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: (valorPis + valorCofins) * 0.8,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'medium', confidence_score: 68
        }
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_003') {
    if (isEnergyOrTelecom(cfop) && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.85,
        ncm_code: ncm, cfop, cst: cstPis,
        confidence_level: 'high', confidence_score: 88
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_007') {
    if (isMonophasicNCM(ncm) && isEntryOperation(cfop)) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.6,
        ncm_code: ncm, cfop, cst: cstPis,
        confidence_level: 'high', confidence_score: 82
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_008') {
    if (isMonophasicNCM(ncm) && isExitOperation(cfop)) {
      if (!isMonophasicCST(cstPis) || valorPis > 0 || valorCofins > 0) {
        const category = getMonophasicCategory(ncm);
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: valorPis + valorCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'high', confidence_score: 92,
          product_description: `Produto monofásico (${category}) - ${getMonophasicLegalBasis(ncm)}`
        }
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_010') {
    if ((ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) && isExitOperation(cfop)) {
      if (!isMonophasicCST(cstPis) || valorPis > 0 || valorCofins > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: valorPis + valorCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'high', confidence_score: 92,
          product_description: `Autopeças/Pneus - Lei 10.485/2002`
        }
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_011') {
    if ((ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) && isExitOperation(cfop)) {
      if (!isMonophasicCST(cstPis) || valorPis > 0 || valorCofins > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: valorPis + valorCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'high', confidence_score: 92,
          product_description: `Cosméticos - Lei 10.147/2000`
        }
      }
    }
  }

  // ==== ICMS RULES ====

  if (rule.rule_code === 'ICMS_001') {
    if (cfop.startsWith('2') && valorIcms > 0 && creditoIcms === 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcms,
        potential_recovery: valorIcms * 0.85,
        ncm_code: ncm, cfop, cst: cstIcms,
        confidence_level: 'high', confidence_score: 80
      }
    }
  }

  if (rule.rule_code === 'ICMS_002') {
    if (isEnergyOrTelecom(cfop) && valorIcms > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcms,
        potential_recovery: valorIcms * 0.8,
        ncm_code: ncm, cfop, cst: cstIcms,
        confidence_level: 'high', confidence_score: 85
      }
    }
  }

  if (rule.rule_code === 'ICMS_005') {
    if (cfop === '2551' || cfop === '1551') {
      if (valorIcms > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorIcms,
          potential_recovery: valorIcms * 0.5,
          ncm_code: ncm, cfop, cst: cstIcms,
          confidence_level: 'high', confidence_score: 78
        }
      }
    }
  }

  // ==== ICMS-ST RULES ====

  if (rule.rule_code === 'ICMS_ST_001') {
    if (valorIcmsSt > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcmsSt,
        potential_recovery: valorIcmsSt * 0.15,
        ncm_code: ncm, cfop, cst: cstIcms,
        confidence_level: 'low', confidence_score: 45
      }
    }
  }

  if (rule.rule_code === 'ICMS_ST_002') {
    const refundCfops = ['6403', '6404', '6102']
    if (refundCfops.includes(cfop) && valorIcmsSt > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcmsSt,
        potential_recovery: valorIcmsSt * 0.7,
        ncm_code: ncm, cfop, cst: cstIcms,
        confidence_level: 'high', confidence_score: 75
      }
    }
  }

  // ==== IPI RULES ====

  if (rule.rule_code === 'IPI_001') {
    if (valorIpi > 0 && isPurchaseOfInputs(cfop)) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIpi,
        potential_recovery: valorIpi * 0.95,
        ncm_code: ncm, cfop, cst: '',
        confidence_level: 'high', confidence_score: 90
      }
    }
  }

  // ==== RETURN OPERATIONS ====
  if (isReturnOperation(cfop)) {
    if (isEntryOperation(cfop) && (valorPis > 0 || valorCofins > 0)) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.9,
        ncm_code: ncm, cfop, cst: cstPis,
        confidence_level: 'medium', confidence_score: 65
      }
    }
  }

  return null
}
