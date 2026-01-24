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

// Helper to check if CFOP is an entry operation (purchases)
function isEntryOperation(cfop: string): boolean {
  return cfop.startsWith('1') || cfop.startsWith('2') || cfop.startsWith('3');
}

// Helper to check if CFOP is an exit operation (sales)
function isExitOperation(cfop: string): boolean {
  return cfop.startsWith('5') || cfop.startsWith('6') || cfop.startsWith('7');
}

// Helper to check if CFOP is a return operation
function isReturnOperation(cfop: string): boolean {
  const returnCfops = ['1411', '1412', '2411', '2412', '5411', '5412', '6411', '6412'];
  return returnCfops.includes(cfop) || cfop.includes('411') || cfop.includes('412');
}

// Helper to check if CFOP is a purchase for resale
function isPurchaseForResale(cfop: string): boolean {
  return ['1102', '2102', '1403', '2403'].includes(cfop);
}

// Helper to check if CFOP is a purchase of inputs
function isPurchaseOfInputs(cfop: string): boolean {
  return ['1101', '2101', '1111', '2111', '1116', '2116', '1117', '2117'].includes(cfop);
}

// Helper to check if CFOP is energy/telecommunications
function isEnergyOrTelecom(cfop: string): boolean {
  return ['1253', '2253', '1254', '2254', '1255', '2255'].includes(cfop);
}

// Helper to check if NCM is monophasic (fuels, pharma, cosmetics, beverages)
function isMonophasicNCM(ncm: string): boolean {
  // Fuels
  if (ncm.startsWith('2710') || ncm.startsWith('2207')) return true;
  // Pharmaceuticals
  if (ncm.startsWith('3004') || ncm.startsWith('3003')) return true;
  // Cosmetics
  if (ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) return true;
  // Beverages
  if (ncm.startsWith('2201') || ncm.startsWith('2202') || ncm.startsWith('2203') || ncm.startsWith('2204')) return true;
  return false;
}

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

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
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

    const identifiedCredits: IdentifiedCredit[] = []

    // 2. Analyze each XML against each rule
    for (const xml of parsed_xmls as ParsedXml[]) {
      const items = xml.itens || []
      
      for (const item of items) {
        for (const rule of (rules || []) as CreditRule[]) {
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

    for (const credit of identifiedCredits) {
      const cfop = credit.cfop || ''
      const cst = credit.cst || ''
      
      // Categorize by the rule that matched or by item characteristics
      if (cst.startsWith('5') || cst.startsWith('7') || cst.startsWith('0')) {
        byTaxType.pis_cofins += credit.potential_recovery
      } else if (cfop.startsWith('2')) {
        byTaxType.icms += credit.potential_recovery
      } else if (cfop.startsWith('1')) {
        byTaxType.icms += credit.potential_recovery
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
      by_tax_type: byTaxType
    }

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
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

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
  
  // PIS_COFINS_001: CST with credit right but not used
  if (rule.rule_code === 'PIS_COFINS_001') {
    const cstWithCredit = ['50', '51', '52', '53', '54', '55', '56']
    if (cstWithCredit.includes(cstPis) && creditoPis === 0 && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.9,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstPis,
        confidence_level: 'high',
        confidence_score: 85
      }
    }
  }

  // PIS_COFINS_002: Input without credit (purchase CFOPs)
  if (rule.rule_code === 'PIS_COFINS_002') {
    if (isPurchaseOfInputs(cfop) || isPurchaseForResale(cfop)) {
      // CST 70-73 indicates non-cumulative with no credit taken
      const cstNoCredit = ['70', '71', '72', '73']
      if (cstNoCredit.includes(cstPis) && valorPis > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: (valorPis + valorCofins) * 0.75,
          ncm_code: ncm,
          cfop: cfop,
          cst: cstPis,
          confidence_level: 'medium',
          confidence_score: 70
        }
      }
      // Also check if CST 01 (taxable) with no credit claimed on entry
      if (cstPis === '01' && valorPis > 0 && isEntryOperation(cfop)) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: (valorPis + valorCofins) * 0.8,
          ncm_code: ncm,
          cfop: cfop,
          cst: cstPis,
          confidence_level: 'medium',
          confidence_score: 68
        }
      }
    }
  }

  // PIS_COFINS_003: Industrial energy
  if (rule.rule_code === 'PIS_COFINS_003') {
    if (isEnergyOrTelecom(cfop) && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.85,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstPis,
        confidence_level: 'high',
        confidence_score: 88
      }
    }
  }

  // PIS_COFINS_007: Monophasic products (fuels)
  if (rule.rule_code === 'PIS_COFINS_007') {
    if (isMonophasicNCM(ncm) && isEntryOperation(cfop)) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.6,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstPis,
        confidence_level: 'high',
        confidence_score: 82
      }
    }
  }

  // PIS_COFINS_008: Pharma monophasic
  if (rule.rule_code === 'PIS_COFINS_008') {
    if (ncm.startsWith('3004') && isExitOperation(cfop)) {
      // Pharma sales - check if PIS/COFINS was charged when it shouldn't be
      if (valorPis > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          potential_recovery: (valorPis + valorCofins) * 0.95,
          ncm_code: ncm,
          cfop: cfop,
          cst: cstPis,
          confidence_level: 'high',
          confidence_score: 90
        }
      }
    }
  }

  // ==== ICMS RULES ====

  // ICMS_001: Interstate purchase without credit
  if (rule.rule_code === 'ICMS_001') {
    if (cfop.startsWith('2') && valorIcms > 0 && creditoIcms === 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcms,
        potential_recovery: valorIcms * 0.85,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstIcms,
        confidence_level: 'high',
        confidence_score: 80
      }
    }
  }

  // ICMS_002: Energy for industrialization
  if (rule.rule_code === 'ICMS_002') {
    if (isEnergyOrTelecom(cfop) && valorIcms > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcms,
        potential_recovery: valorIcms * 0.8,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstIcms,
        confidence_level: 'high',
        confidence_score: 85
      }
    }
  }

  // ICMS_005: DIFAL on fixed assets
  if (rule.rule_code === 'ICMS_005') {
    // CFOP 2551 = purchase of fixed asset interstate
    if (cfop === '2551' || cfop === '1551') {
      if (valorIcms > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorIcms,
          potential_recovery: valorIcms * 0.5, // CIAP recovery over 48 months
          ncm_code: ncm,
          cfop: cfop,
          cst: cstIcms,
          confidence_level: 'high',
          confidence_score: 78
        }
      }
    }
  }

  // ==== ICMS-ST RULES ====

  // ICMS_ST_001: ST with MVA above real price
  if (rule.rule_code === 'ICMS_ST_001') {
    if (valorIcmsSt > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcmsSt,
        potential_recovery: valorIcmsSt * 0.15,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstIcms,
        confidence_level: 'low',
        confidence_score: 45
      }
    }
  }

  // ICMS_ST_002: ST refund on interstate operations
  if (rule.rule_code === 'ICMS_ST_002') {
    const refundCfops = ['6403', '6404', '6102']
    if (refundCfops.includes(cfop) && valorIcmsSt > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcmsSt,
        potential_recovery: valorIcmsSt * 0.7,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstIcms,
        confidence_level: 'high',
        confidence_score: 75
      }
    }
  }

  // ==== IPI RULES ====

  // IPI_001: IPI credit on industrial inputs
  if (rule.rule_code === 'IPI_001') {
    if (valorIpi > 0 && isPurchaseOfInputs(cfop)) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIpi,
        potential_recovery: valorIpi * 0.95,
        ncm_code: ncm,
        cfop: cfop,
        cst: '',
        confidence_level: 'high',
        confidence_score: 90
      }
    }
  }

  // ==== RETURN OPERATIONS ====
  // Check for returns that may generate credit recovery

  if (isReturnOperation(cfop)) {
    // Entry returns (1411, 2411) = receiving returned goods = debit reversal
    if (isEntryOperation(cfop) && (valorPis > 0 || valorCofins > 0)) {
      // This is a potential debit reversal opportunity
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.9,
        ncm_code: ncm,
        cfop: cfop,
        cst: cstPis,
        confidence_level: 'medium',
        confidence_score: 65
      }
    }
  }

  return null
}
