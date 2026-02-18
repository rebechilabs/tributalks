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

// [CORREÇÃO #5] Mapeamento CNAE → Anexo expandido com cobertura completa
export function detectAnexoFromCNAE(cnae: string): string {
  if (!cnae) return 'I'
  const prefix = cnae.substring(0, 2)
  // Indústria (Anexo II)
  if (['10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','35','36','37','38','39'].includes(prefix)) return 'II'
  // Comércio (Anexo I)
  if (['45','46','47'].includes(prefix)) return 'I'
  // Transporte, alimentação, turismo, serviços gerais (Anexo III)
  if (['49','50','51','52','53','55','56','58','59','60','61','64','65','66','68','69','70','72','74','75','77','78','79','82','84','85','86','87','88','90','91','92','93','94','95','96','97','99'].includes(prefix)) return 'III'
  // Serviços de construção/vigilância/limpeza (Anexo IV)
  if (['41','42','43','80','81'].includes(prefix)) return 'IV'
  // Tecnologia/engenharia (Anexo V)
  if (['62','63','71','73','76'].includes(prefix)) return 'V'
  // Fallback seguro
  console.warn(`[analyze-credits] CNAE prefix '${prefix}' não mapeado para Anexo, usando III como fallback`)
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

// [CORREÇÃO #10b] isReturnOperation com lista explícita (sem includes genérico)
function isReturnOperation(cfop: string): boolean {
  const returnCfops = [
    '1411', '1412', '1413', '2411', '2412', '2413',
    '5411', '5412', '5413', '6411', '6412', '6413',
    '1556', '2556', '5556', '6556'
  ];
  return returnCfops.includes(cfop);
}

// [CORREÇÃO #10a] CFOPs expandidos para compras
function isPurchaseForResale(cfop: string): boolean {
  return ['1102', '2102', '3102', '1403', '2403', '3403'].includes(cfop);
}

function isPurchaseOfInputs(cfop: string): boolean {
  return ['1101', '2101', '3101', '1111', '2111', '1116', '2116', '1117', '2117', '1126', '2126'].includes(cfop);
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

// [CORREÇÃO #2] Normalização segura da alíquota efetiva
// Detecta automaticamente se o valor está em percentual (ex: 9.76) ou decimal (ex: 0.0976)
function normalizeAliquotaEfetiva(rawAliquota: number): number {
  if (rawAliquota <= 0) return 0.0976 // fallback Faixa 4 Anexo I
  // Se > 1, assume que está em percentual (ex: 9.76) → divide por 100
  // Se <= 1, assume que já está em decimal (ex: 0.0976) → usa direto
  if (rawAliquota > 1) return rawAliquota / 100
  return rawAliquota
}

// [CORREÇÃO #6] Fallbacks por Anexo em vez de hardcoded único
const FALLBACK_TAX_DISTRIBUTIONS: Record<string, SimplesTaxDistribution> = {
  'I':   { irpj: 5.50, csll: 3.50, cofins: 12.74, pis: 2.76, cpp: 41.50, icms: 34.00, iss: 0 },
  'II':  { irpj: 5.50, csll: 3.50, cofins: 11.51, pis: 2.49, cpp: 37.50, icms: 32.00, iss: 0 },
  'III': { irpj: 6.00, csll: 3.50, cofins: 13.64, pis: 2.96, cpp: 43.40, icms: 0,     iss: 33.50 },
  'IV':  { irpj: 18.80, csll: 15.20, cofins: 17.67, pis: 3.83, cpp: 44.50, icms: 0,   iss: 0 },
  'V':   { irpj: 23.00, csll: 15.00, cofins: 14.10, pis: 3.05, cpp: 28.85, icms: 0,   iss: 16.00 },
}

// Rules that should be DISABLED for Simples Nacional
const SIMPLES_DISABLED_RULES = new Set([
  'IPI_001', 'IPI_002', 'IPI_003',
  'ICMS_001', 'ICMS_002', 'ICMS_005',
  'ICMS_ST_001', 'ICMS_ST_002',
  'PIS_COFINS_001', 'PIS_COFINS_002', 'PIS_COFINS_003',
  'PIS_COFINS_004', 'PIS_COFINS_005', 'PIS_COFINS_006',
  'PIS_COFINS_007', 'PIS_COFINS_008', 'PIS_COFINS_009',
  'PIS_COFINS_010', 'PIS_COFINS_011',
])

// [CORREÇÃO #12] Limite máximo de XMLs por requisição para evitar DoS
const MAX_XMLS_PER_REQUEST = 500

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
    const requestBody = await req.json()
    const { xml_import_id, parsed_xmls, user_id: bodyUserId } = requestBody

    // Support internal calls with service role key + user_id in body
    let userId: string
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (token === serviceRoleKey && bodyUserId) {
      userId = bodyUserId
    } else {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      userId = user.id
    }

    if (!parsed_xmls || !Array.isArray(parsed_xmls)) {
      return new Response(
        JSON.stringify({ error: 'parsed_xmls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // [CORREÇÃO #12] Validação de tamanho do array
    if (parsed_xmls.length > MAX_XMLS_PER_REQUEST) {
      return new Response(
        JSON.stringify({ error: `Máximo de ${MAX_XMLS_PER_REQUEST} XMLs por requisição. Recebido: ${parsed_xmls.length}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========== FETCH COMPANY CONTEXT ==========
    const { data: profile } = await supabaseAdmin
      .from('company_profile')
      .select('regime_tributario, cnae_principal, setor, tem_atividades_mistas, cnae_secundarios')
      .eq('user_id', userId)
      .maybeSingle()

    // Fetch user profile as fallback for regime/cnae
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('regime, cnae, setor')
      .eq('user_id', userId)
      .maybeSingle()

    // Fetch ALL PGDAS records with reparticao data (for per-month matching)
    const { data: allPgdasWithReparticao } = await supabaseAdmin
      .from('pgdas_arquivos')
      .select('aliquota_efetiva, dados_completos, periodo_apuracao, anexo_simples, receita_bruta')
      .eq('user_id', userId)
      .not('dados_completos', 'is', null)
      .gt('receita_bruta', 0)
      .order('periodo_apuracao', { ascending: false })
      .order('created_at', { ascending: false })

    // latestPgdasRecord = first record (most recent) for fallback/context
    const latestPgdasRecord = allPgdasWithReparticao?.[0] || null

    // Fetch PGDAS from last 60 months for RBT12 calculation
    const sixtyMonthsAgo = new Date()
    sixtyMonthsAgo.setMonth(sixtyMonthsAgo.getMonth() - 60)

    const { data: pgdasRecords } = await supabaseAdmin
      .from('pgdas_arquivos')
      .select('aliquota_efetiva, dados_completos, periodo_apuracao, anexo_simples, receita_bruta')
      .eq('user_id', userId)
      .gte('periodo_apuracao', sixtyMonthsAgo.toISOString().split('T')[0])
      .order('periodo_apuracao', { ascending: false })

    // Use latestPgdasRecord for reparticao; pgdasRecords for RBT12
    const latestPgdas = latestPgdasRecord || null
    console.log(`[analyze-credits] PGDAS: latestRecord periodo=${latestPgdas?.periodo_apuracao || 'null'}, pgdasRecords count=${pgdasRecords?.length || 0}`)

    // [CORREÇÃO #9] Calculate RBT12 com proporcionalização para períodos incompletos
    let rbt12Calculated = 0
    const mesesComDados = pgdasRecords?.length || 0
    if (pgdasRecords && pgdasRecords.length > 0) {
      for (const pgdas of pgdasRecords) {
        const rb = pgdas.receita_bruta ||
          (pgdas.dados_completos as Record<string, unknown>)?.receita_bruta as number || 0
        rbt12Calculated += rb
      }
      // Proporcionalizar se menos de 12 meses (LC 123/2006, Art. 18, §1º)
      if (mesesComDados > 0 && mesesComDados < 12) {
        rbt12Calculated = (rbt12Calculated / mesesComDados) * 12
        console.log(`[analyze-credits] RBT12 proporcionalizado: ${mesesComDados} meses → estimativa 12 meses: ${rbt12Calculated}`)
      }
    }

    // Fallback to dados_completos.rbt12 if calculated is 0
    const rbt12FromDados = (latestPgdas?.dados_completos as Record<string, unknown>)?.rbt12 as number || 0
    const rbt12Final = rbt12Calculated > 0 ? rbt12Calculated : rbt12FromDados

    // Normalize regime: DB stores 'SIMPLES', 'PRESUMIDO', 'REAL'
    const rawRegime = profile?.regime_tributario || (userProfile as Record<string, unknown>)?.regime as string || ''
    const normalizedRegime = rawRegime.toString().toLowerCase().trim()

    const companyContext: CompanyContext = {
      regime: normalizedRegime || null,
      cnae: profile?.cnae_principal || (userProfile as Record<string, unknown>)?.cnae as string || null,
      setor: profile?.setor || (userProfile as Record<string, unknown>)?.setor as string || null,
      aliquotaEfetiva: latestPgdas?.aliquota_efetiva || 0,
      pgdasData: latestPgdas?.dados_completos as Record<string, unknown> || null,
      temAtividadesMistas: profile?.tem_atividades_mistas || false,
      cnaeSecundarios: profile?.cnae_secundarios || null,
    }

    // Correct detection: 'SIMPLES' or 'simples_nacional' both match
    const isSimplesNacional = normalizedRegime.startsWith('simples')

    console.log(`[analyze-credits] Regime raw: '${rawRegime}', normalized: '${normalizedRegime}', Simples: ${isSimplesNacional}, CNAE: ${companyContext.cnae}, Alíquota: ${companyContext.aliquotaEfetiva}, RBT12: ${rbt12Final}, Mistas: ${companyContext.temAtividadesMistas}`)

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
      // [CORREÇÃO] Processa mês a mês, cruzando XMLs com a repartição do PGDAS do mesmo período
      // Fórmula por mês:
      //   PIS indevido    = PIS_pago_mes    × (fat_mono_mes + fat_ST_mes) / fat_total_mes
      //   COFINS indevido = COFINS_pago_mes × (fat_mono_mes + fat_ST_mes) / fat_total_mes
      //   ICMS-ST indevido = ICMS_pago_mes  × fat_ST_mes / fat_total_mes

      const simplesMonoRule = applicableRules.find((r: CreditRule) => r.rule_code === 'SIMPLES_MONO_001')
      const simplesIcmsStRule = applicableRules.find((r: CreditRule) => r.rule_code === 'SIMPLES_ICMS_ST_001')

      // Build PGDAS reparticao index by YYYY-MM
      const pgdasByMonth: Record<string, { pis: number, cofins: number, icms: number, receita_bruta: number, periodo: string }> = {}
      if (allPgdasWithReparticao) {
        for (const pgdas of allPgdasWithReparticao) {
          const dc = pgdas.dados_completos as Record<string, unknown>
          const rep = dc?.reparticao as Record<string, number> | null
          if (!rep) continue
          // periodo_apuracao can be "2024-01-01" or "2024-01" — normalize to YYYY-MM
          const periodo = (pgdas.periodo_apuracao || '').substring(0, 7)
          if (!periodo || pgdasByMonth[periodo]) continue // keep first (most recent created_at)
          pgdasByMonth[periodo] = {
            pis: rep.pis || 0,
            cofins: rep.cofins || 0,
            icms: rep.icms || 0,
            receita_bruta: pgdas.receita_bruta || (dc?.receita_bruta as number) || 0,
            periodo,
          }
        }
      }
      console.log(`[analyze-credits] PGDAS reparticao months available: ${Object.keys(pgdasByMonth).join(', ')}`)

      // Group XML items by month (from NF-e emission date)
      const xmlItemsByMonth: Record<string, Array<{ ncm: string, cfop: string, cstPis: string, csosn: string, valorItem: number }>> = {}
      for (const xml of parsed_xmls as ParsedXml[]) {
        const items = xml.itens || (xml as any).items || (xml as any).produtos || []
        const dataEmissao = xml.data_emissao || ''
        const mes = dataEmissao.substring(0, 7) // YYYY-MM

        for (const item of items) {
          const cfop = item.cfop || ''
          const ncm = item.ncm || ''
          const cstPis = item.cst_pis || (item as any).cstPis || ''
          const csosn = item.csosn || item.cst_icms || (item as any).cstIcms || ''
          const valorItem = item.valor_item || (item as any).valorTotal || (item as any).valor_total || 0

          if (!isExitOperation(cfop)) continue
          if (valorItem <= 0) continue

          const monthKey = mes || 'unknown'
          if (!xmlItemsByMonth[monthKey]) xmlItemsByMonth[monthKey] = []
          xmlItemsByMonth[monthKey].push({ ncm, cfop, cstPis, csosn, valorItem })
        }
      }

      console.log(`[analyze-credits] XML months found: ${Object.keys(xmlItemsByMonth).join(', ')}`)

      // Accumulate credits across all months
      let totalPisIndevido = 0
      let totalCofinsIndevido = 0
      let totalIcmsStIndevido = 0
      const allNcmsEncontrados: Set<string> = new Set()
      let mesesProcessados = 0

      // For each month with XMLs, find matching PGDAS repartição
      for (const [mes, items] of Object.entries(xmlItemsByMonth)) {
        let faturamentoTotal = 0
        let faturamentoMonofasico = 0
        let faturamentoST = 0
        const ncmsMes: Set<string> = new Set()

        for (const item of items) {
          faturamentoTotal += item.valorItem

          // Check monophasic
          const monoMatch = isMonophasicNCMFromList(item.ncm, monophasicNcms)
          const isMonoCST = isMonophasicCST(item.cstPis)
          if (monoMatch || isMonoCST) {
            faturamentoMonofasico += item.valorItem
            ncmsMes.add(item.ncm)
          }

          // Check ST
          const isST = item.csosn === '500' || ['5405', '6405', '5403', '6403'].includes(item.cfop)
          if (isST) {
            faturamentoST += item.valorItem
          }
        }

        if (faturamentoTotal <= 0) continue

        // Find PGDAS repartição for this month
        const pgdasMes = pgdasByMonth[mes]
        if (!pgdasMes) {
          console.warn(`[analyze-credits] Mês ${mes}: sem PGDAS repartição. Pulando. fatTotal=${faturamentoTotal}, fatMono=${faturamentoMonofasico}, fatST=${faturamentoST}`)
          continue
        }

        // [CORREÇÃO #1] fatTotalRef = receita_bruta do PGDAS do mês (faturamento total declarado),
        // NÃO a soma dos XMLs processados (que são apenas uma amostra das NF-e)
        const fatTotalRef = pgdasMes.receita_bruta > 0 ? pgdasMes.receita_bruta : faturamentoTotal

        const baseIndevidaPisCofins = faturamentoMonofasico + faturamentoST
        if (baseIndevidaPisCofins <= 0 && faturamentoST <= 0) continue

        const proporcaoPisCofins = baseIndevidaPisCofins / fatTotalRef
        const proporcaoST = faturamentoST / fatTotalRef

        const pisIndevido = Math.round(pgdasMes.pis * proporcaoPisCofins * 100) / 100
        const cofinsIndevido = Math.round(pgdasMes.cofins * proporcaoPisCofins * 100) / 100
        const icmsStIndevido = Math.round(pgdasMes.icms * proporcaoST * 100) / 100

        console.log(`[analyze-credits] Mês ${mes}: fatTotal=${faturamentoTotal.toFixed(2)}, fatMono=${faturamentoMonofasico.toFixed(2)}, fatST=${faturamentoST.toFixed(2)}, propPisCofins=${proporcaoPisCofins.toFixed(4)}, propST=${proporcaoST.toFixed(4)}, PIS=${pisIndevido}, COFINS=${cofinsIndevido}, ICMS-ST=${icmsStIndevido}`)

        totalPisIndevido += pisIndevido
        totalCofinsIndevido += cofinsIndevido
        totalIcmsStIndevido += icmsStIndevido
        ncmsMes.forEach(n => allNcmsEncontrados.add(n))
        mesesProcessados++
      }

      console.log(`[analyze-credits] Simples TOTAL: meses=${mesesProcessados}, PIS=${totalPisIndevido.toFixed(2)}, COFINS=${totalCofinsIndevido.toFixed(2)}, ICMS-ST=${totalIcmsStIndevido.toFixed(2)}`)

      // Push aggregated credits
      const latestPeriodo = latestPgdas?.periodo_apuracao || new Date().toISOString().split('T')[0]

      if (simplesMonoRule && totalPisIndevido > 0.01) {
        identifiedCredits.push({
          rule_id: simplesMonoRule.id,
          original_tax_value: totalPisIndevido, // valor total recuperável
          potential_recovery: Math.round(totalPisIndevido * 100) / 100,
          ncm_code: Array.from(allNcmsEncontrados).join(','),
          cfop: '',
          cst: '04',
          confidence_level: 'high',
          confidence_score: 92,
          product_description: `PIS recolhido indevidamente no DAS sobre receita de produtos monofásicos e com ST (${mesesProcessados} meses) — Art. 2º, §1º-A da Lei 10.637/2002`,
          nfe_key: '',
          nfe_number: '',
          nfe_date: latestPeriodo,
          supplier_cnpj: '',
          supplier_name: '',
        })
      }

      if (simplesMonoRule && totalCofinsIndevido > 0.01) {
        identifiedCredits.push({
          rule_id: simplesMonoRule.id,
          original_tax_value: totalCofinsIndevido,
          potential_recovery: Math.round(totalCofinsIndevido * 100) / 100,
          ncm_code: Array.from(allNcmsEncontrados).join(','),
          cfop: '',
          cst: '04',
          confidence_level: 'high',
          confidence_score: 92,
          product_description: `COFINS recolhido indevidamente no DAS sobre receita de produtos monofásicos e com ST (${mesesProcessados} meses) — Art. 2º, §1º-A da Lei 10.833/2003`,
          nfe_key: '',
          nfe_number: '',
          nfe_date: latestPeriodo,
          supplier_cnpj: '',
          supplier_name: '',
        })
      }

      if (simplesIcmsStRule && totalIcmsStIndevido > 0.01) {
        identifiedCredits.push({
          rule_id: simplesIcmsStRule.id,
          original_tax_value: totalIcmsStIndevido,
          potential_recovery: Math.round(totalIcmsStIndevido * 100) / 100,
          ncm_code: '',
          cfop: '5405',
          cst: '500',
          confidence_level: 'high',
          confidence_score: 90,
          product_description: `ICMS recolhido indevidamente no DAS sobre receita de produtos com ST (${mesesProcessados} meses) — Art. 13, §1º, XIII da LC 123/2006`,
          nfe_key: '',
          nfe_number: '',
          nfe_date: latestPeriodo,
          supplier_cnpj: '',
          supplier_name: '',
        })
      }

      if (mesesProcessados === 0) {
        console.warn(`[analyze-credits] Simples: nenhum mês processado. Verifique se os XMLs têm data_emissao compatível com os períodos do PGDAS.`)
      }
    } else {
      // ========== LUCRO REAL / PRESUMIDO ANALYSIS ==========
      // [CORREÇÃO #1] Encontrar a regra de devolução UMA VEZ, fora do loop de regras
      const returnRule = applicableRules.find((r: CreditRule) =>
        r.rule_code === 'RETURN_001' || r.tax_type?.includes('DEVOLUÇÃO') || r.tax_type?.includes('DEVOLUCION')
      )

      for (const xml of parsed_xmls as ParsedXml[]) {
        const items = xml.itens || []

        for (const item of items) {
          // [CORREÇÃO #1] Verificar devoluções SEPARADAMENTE, UMA VEZ por item
          const cfop = item.cfop || ''
          if (returnRule && isReturnOperation(cfop) && isEntryOperation(cfop)) {
            const valorPis = item.valor_pis || 0
            const valorCofins = item.valor_cofins || 0
            if (valorPis > 0 || valorCofins > 0) {
              identifiedCredits.push({
                rule_id: returnRule.id,
                original_tax_value: valorPis + valorCofins,
                potential_recovery: (valorPis + valorCofins) * 0.9,
                ncm_code: item.ncm || '',
                cfop: cfop,
                cst: item.cst_pis || '',
                confidence_level: 'medium',
                confidence_score: 65,
                product_description: item.descricao || 'Devolução de mercadoria',
                nfe_key: xml.chave_nfe || '',
                nfe_number: xml.numero || '',
                nfe_date: xml.data_emissao || new Date().toISOString().split('T')[0],
                supplier_cnpj: xml.cnpj_emitente || '',
                supplier_name: xml.nome_emitente || '',
              })
              continue // Pula para o próximo item após tratar devolução
            }
          }

          // Avaliar regras normais (sem catch-all de devolução)
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
                product_description: credit.product_description || item.descricao || '',
              })
            }
          }
        }
      }
    }

    // 3. Clean previous credits for this import (avoid duplicates on re-analysis)
    if (xml_import_id) {
      const { error: deleteError } = await supabaseAdmin
        .from('identified_credits')
        .delete()
        .eq('user_id', userId)
        .eq('xml_import_id', xml_import_id)

      if (deleteError) {
        console.error('Error cleaning previous credits:', deleteError)
      } else {
        console.log(`Cleaned previous credits for import ${xml_import_id}`)
      }
    }

    // 4. Save identified credits
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

    // 5. Calculate summary by tax type
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
        faixa: rbt12Final > 0 ? detectFaixaFromRBT12(rbt12Final) : 1,
        anexo: latestPgdas?.anexo_simples || detectAnexoFromCNAE(companyContext.cnae || ''),
        aliquota_efetiva: companyContext.aliquotaEfetiva,
      } : null,
    }

    console.log(`[analyze-credits] Summary: ${JSON.stringify(summary)}`)

    // [CORREÇÃO #7] Save summary com delete + insert (evita duplicatas)
    // Primeiro limpa sumários anteriores do mesmo dia para o mesmo usuário
    await supabaseAdmin
      .from('credit_analysis_summary')
      .delete()
      .eq('user_id', userId)
      .eq('analysis_date', new Date().toISOString().split('T')[0])

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
// [CORREÇÃO #1] Removido catch-all de devoluções — agora tratado no loop principal
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
    // CSTs 50-56: operação com direito a crédito
    const cstWithCredit = ['50', '51', '52', '53', '54', '55', '56']
    if (cstWithCredit.includes(cstPis) && creditoPis === 0 && valorPis > 0) {
      return {
        rule_id: rule.id,
        original_tax_value: valorPis + valorCofins,
        // [CORREÇÃO #8] Recovery = valor integral do crédito não aproveitado
        potential_recovery: valorPis + valorCofins,
        ncm_code: ncm, cfop, cst: cstPis,
        confidence_level: 'high', confidence_score: 85
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_002') {
    if (isPurchaseOfInputs(cfop) || isPurchaseForResale(cfop)) {
      // CSTs 70-73: operação sem incidência — se há valor de PIS, está errado
      const cstNoCredit = ['70', '71', '72', '73']
      if (cstNoCredit.includes(cstPis) && valorPis > 0) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          // [CORREÇÃO #8] PIS cobrado indevidamente em operação sem incidência = 100% recuperável
          potential_recovery: valorPis + valorCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'medium', confidence_score: 70
        }
      }
      // CST 01 em entrada de insumos/revenda — crédito básico não aproveitado
      if (cstPis === '01' && valorPis > 0 && isEntryOperation(cfop)) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          // [CORREÇÃO #8] Crédito básico: alíquotas de 1.65% PIS e 7.6% COFINS (Lei 10.833/2003)
          potential_recovery: (valorPis + valorCofins) * 0.8,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'medium', confidence_score: 68
        }
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_003') {
    // Energia elétrica e telecomunicações — crédito permitido (Lei 10.833/2003, art. 3º, III)
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

  // [CORREÇÃO #4] PIS_COFINS_007: Monofásico na entrada — só gera crédito se PIS/COFINS > 0
  if (rule.rule_code === 'PIS_COFINS_007') {
    if (isMonophasicNCM(ncm) && isEntryOperation(cfop) && (valorPis > 0 || valorCofins > 0)) {
      // Produto monofásico com PIS/COFINS destacado na entrada:
      // Verificar se CST indica cobrança indevida (não deveria haver PIS/COFINS na revenda)
      if (!isMonophasicCST(cstPis)) {
        return {
          rule_id: rule.id,
          original_tax_value: valorPis + valorCofins,
          // [CORREÇÃO #8] Cobrança indevida na cadeia monofásica
          potential_recovery: (valorPis + valorCofins) * 0.6,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'medium', confidence_score: 65,
          product_description: `Produto monofásico com PIS/COFINS na entrada - verificar cadeia tributária`
        }
      }
    }
  }

  // [CORREÇÃO #3] PIS_COFINS_008: Exige que haja valor > 0 para criar crédito
  if (rule.rule_code === 'PIS_COFINS_008') {
    if (isMonophasicNCM(ncm) && isExitOperation(cfop)) {
      const totalPisCofins = valorPis + valorCofins
      // Só cria crédito se houver valor efetivo de PIS/COFINS cobrado indevidamente
      if (totalPisCofins > 0 && !isMonophasicCST(cstPis)) {
        const category = getMonophasicCategory(ncm);
        return {
          rule_id: rule.id,
          original_tax_value: totalPisCofins,
          potential_recovery: totalPisCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'high', confidence_score: 92,
          product_description: `Produto monofásico (${category}) - ${getMonophasicLegalBasis(ncm)}`
        }
      }
      // CST é monofásico mas tem valor > 0 — inconsistência na NFe
      if (totalPisCofins > 0 && isMonophasicCST(cstPis)) {
        const category = getMonophasicCategory(ncm);
        return {
          rule_id: rule.id,
          original_tax_value: totalPisCofins,
          potential_recovery: totalPisCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'medium', confidence_score: 75,
          product_description: `Produto monofásico (${category}) com CST correto mas valor PIS/COFINS > 0 - inconsistência NFe`
        }
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_010') {
    if ((ncm.startsWith('8708') || ncm.startsWith('4011') || ncm.startsWith('8507')) && isExitOperation(cfop)) {
      const totalPisCofins = valorPis + valorCofins
      // [CORREÇÃO #3] Exige valor > 0
      if (totalPisCofins > 0 && (!isMonophasicCST(cstPis) || totalPisCofins > 0)) {
        return {
          rule_id: rule.id,
          original_tax_value: totalPisCofins,
          potential_recovery: totalPisCofins,
          ncm_code: ncm, cfop, cst: cstPis,
          confidence_level: 'high', confidence_score: 92,
          product_description: `Autopeças/Pneus - Lei 10.485/2002`
        }
      }
    }
  }

  if (rule.rule_code === 'PIS_COFINS_011') {
    if ((ncm.startsWith('3303') || ncm.startsWith('3304') || ncm.startsWith('3305')) && isExitOperation(cfop)) {
      const totalPisCofins = valorPis + valorCofins
      // [CORREÇÃO #3] Exige valor > 0
      if (totalPisCofins > 0 && (!isMonophasicCST(cstPis) || totalPisCofins > 0)) {
        return {
          rule_id: rule.id,
          original_tax_value: totalPisCofins,
          potential_recovery: totalPisCofins,
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

  // [CORREÇÃO #1] Removido bloco catch-all de devoluções que gerava duplicatas

  return null
}
