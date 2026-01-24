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
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub as string
    const { xml_import_id, parsed_xmls } = await req.json()

    if (!parsed_xmls || !Array.isArray(parsed_xmls)) {
      return new Response(
        JSON.stringify({ error: 'parsed_xmls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Buscar regras ativas
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

    // 2. Analisar cada XML contra cada regra
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

    // 3. Salvar créditos identificados
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

    // 4. Calcular resumo por tributo
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
      by_tax_type: {
        pis_cofins: identifiedCredits
          .filter(c => c.cst?.startsWith('5') || c.cst?.startsWith('7'))
          .reduce((sum, c) => sum + c.potential_recovery, 0),
        icms: identifiedCredits
          .filter(c => c.cfop?.startsWith('2'))
          .reduce((sum, c) => sum + c.potential_recovery, 0),
        ipi: identifiedCredits
          .filter(c => ['1101', '2101'].includes(c.cfop || ''))
          .reduce((sum, c) => sum + c.potential_recovery, 0),
      }
    }

    // 5. Salvar resumo
    const { error: summaryError } = await supabaseAdmin
      .from('credit_analysis_summary')
      .insert({
        user_id: userId,
        analysis_date: new Date().toISOString().split('T')[0],
        period_start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        pis_cofins_potential: summary.by_tax_type.pis_cofins,
        icms_potential: summary.by_tax_type.icms,
        ipi_potential: summary.by_tax_type.ipi,
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
  // PIS/COFINS - CST com direito a crédito mas não usado
  if (rule.rule_code === 'PIS_COFINS_001') {
    const cstWithCredit = ['50', '51', '52', '53', '54', '55', '56']
    const cstPis = item.cst_pis || ''
    const valorPis = item.valor_pis || 0
    const valorCofins = item.valor_cofins || 0
    const creditoPis = item.credito_pis || 0
    
    if (cstWithCredit.includes(cstPis) && creditoPis === 0 && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.9,
        ncm_code: item.ncm || '',
        cfop: item.cfop || '',
        cst: cstPis,
        confidence_level: 'high',
        confidence_score: 85
      }
    }
  }

  // PIS/COFINS - Insumo sem crédito
  if (rule.rule_code === 'PIS_COFINS_002') {
    const cfopInsumo = ['1101', '1102', '2101', '2102']
    const cstInsumo = ['70', '71', '72', '73']
    const cfop = item.cfop || ''
    const cstPis = item.cst_pis || ''
    const valorPis = item.valor_pis || 0
    const valorCofins = item.valor_cofins || 0
    
    if (cfopInsumo.includes(cfop) && cstInsumo.includes(cstPis) && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.75,
        ncm_code: item.ncm || '',
        cfop: cfop,
        cst: cstPis,
        confidence_level: 'medium',
        confidence_score: 70
      }
    }
  }

  // PIS/COFINS - Energia elétrica industrial
  if (rule.rule_code === 'PIS_COFINS_003') {
    const cfopEnergia = ['1253', '2253']
    const cfop = item.cfop || ''
    const valorPis = item.valor_pis || 0
    const valorCofins = item.valor_cofins || 0
    
    if (cfopEnergia.includes(cfop) && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        potential_recovery: (valorPis + valorCofins) * 0.85,
        ncm_code: item.ncm || '',
        cfop: cfop,
        cst: item.cst_pis || '',
        confidence_level: 'high',
        confidence_score: 88
      }
    }
  }

  // ICMS - Compra interestadual sem crédito
  if (rule.rule_code === 'ICMS_001') {
    const cfop = item.cfop || ''
    const valorIcms = item.valor_icms || 0
    const creditoIcms = item.credito_icms || 0
    
    if (cfop.startsWith('2') && valorIcms > 0 && creditoIcms === 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcms,
        potential_recovery: valorIcms * 0.85,
        ncm_code: item.ncm || '',
        cfop: cfop,
        cst: item.cst_icms || '',
        confidence_level: 'high',
        confidence_score: 80
      }
    }
  }

  // ICMS-ST com MVA superior
  if (rule.rule_code === 'ICMS_ST_001') {
    const valorIcmsSt = item.valor_icms_st || 0
    
    if (valorIcmsSt > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIcmsSt,
        potential_recovery: valorIcmsSt * 0.15,
        ncm_code: item.ncm || '',
        cfop: item.cfop || '',
        cst: item.cst_icms || '',
        confidence_level: 'low',
        confidence_score: 45
      }
    }
  }

  // IPI em insumo industrial
  if (rule.rule_code === 'IPI_001') {
    const cfop = item.cfop || ''
    const valorIpi = item.valor_ipi || 0
    
    if (valorIpi > 0 && ['1101', '2101'].includes(cfop)) {
      return {
        rule_id: rule.id,
        original_tax_value: valorIpi,
        potential_recovery: valorIpi * 0.95,
        ncm_code: item.ncm || '',
        cfop: cfop,
        cst: '',
        confidence_level: 'high',
        confidence_score: 90
      }
    }
  }

  return null
}
