import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DREInputs {
  // Receitas
  vendas_produtos: number
  vendas_servicos: number
  outras_receitas: number
  devolucoes: number
  descontos: number
  // Custos
  custo_mercadorias: number
  custo_materiais: number
  mao_obra_direta: number
  servicos_terceiros: number
  // Despesas
  salarios_encargos: number
  prolabore: number
  aluguel: number
  energia_agua_internet: number
  marketing: number
  software: number
  contador_juridico: number
  viagens: number
  manutencao: number
  frete: number
  outras_despesas: number
  // Financeiro
  juros_pagos: number
  juros_recebidos: number
  tarifas: number
  multas: number
  // Impostos
  impostos_vendas: number
  regime_tributario: string
  calcular_auto: boolean
}

interface Benchmark {
  avg_margem_bruta: number
  avg_margem_operacional: number
  avg_margem_liquida: number
  avg_ebitda_margin: number
  typical_custo_folha_percent: number
  typical_custo_aluguel_percent: number
  sector_name: string
}

interface Diagnostic {
  area: string
  status: 'excellent' | 'ok' | 'warning' | 'critical'
  title: string
  description: string
  recommendation: string
  icon?: string
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

    const { data: userData, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.user.id
    const { inputs, cnae_code, period, dre_id } = await req.json()

    // 1. BUSCAR BENCHMARKS
    let benchmark: Benchmark = {
      avg_margem_bruta: 35,
      avg_margem_operacional: 12,
      avg_margem_liquida: 8,
      avg_ebitda_margin: 15,
      typical_custo_folha_percent: 25,
      typical_custo_aluguel_percent: 8,
      sector_name: 'Geral'
    }

    if (cnae_code) {
      const { data: benchData } = await supabaseAdmin
        .from('sector_benchmarks')
        .select('*')
        .eq('cnae_code', cnae_code)
        .single()

      if (benchData) {
        benchmark = benchData as Benchmark
      }
    }

    // 2. CALCULAR DRE
    const dre = calculateDRE(inputs)

    // 3. GERAR DIAGNÓSTICOS
    const diagnostics = generateDiagnostics(dre, inputs, benchmark)

    // 4. CALCULAR HEALTH SCORE
    const { score: healthScore, status: healthStatus } = calculateHealthScore(diagnostics)

    // 5. GERAR RECOMENDAÇÕES
    const recommendations = generateRecommendations(diagnostics, dre, benchmark)

    // 6. SIMULAR REFORMA TRIBUTÁRIA
    const reformaImpact = simulateReforma(inputs, dre)

    // 7. SALVAR OU ATUALIZAR DRE
    const dreData = {
      user_id: userId,
      period_type: period?.type || 'monthly',
      period_month: period?.month || new Date().getMonth() + 1,
      period_year: period?.year || new Date().getFullYear(),
      // Inputs
      input_vendas_produtos: inputs.vendas_produtos || 0,
      input_vendas_servicos: inputs.vendas_servicos || 0,
      input_outras_receitas: inputs.outras_receitas || 0,
      input_devolucoes: inputs.devolucoes || 0,
      input_descontos_concedidos: inputs.descontos || 0,
      input_custo_mercadorias: inputs.custo_mercadorias || 0,
      input_custo_materiais: inputs.custo_materiais || 0,
      input_custo_mao_obra_direta: inputs.mao_obra_direta || 0,
      input_custo_servicos_terceiros: inputs.servicos_terceiros || 0,
      input_salarios_encargos: inputs.salarios_encargos || 0,
      input_prolabore: inputs.prolabore || 0,
      input_aluguel: inputs.aluguel || 0,
      input_energia_agua_internet: inputs.energia_agua_internet || 0,
      input_marketing_publicidade: inputs.marketing || 0,
      input_software_assinaturas: inputs.software || 0,
      input_contador_juridico: inputs.contador_juridico || 0,
      input_viagens_refeicoes: inputs.viagens || 0,
      input_manutencao_equipamentos: inputs.manutencao || 0,
      input_frete_logistica: inputs.frete || 0,
      input_outras_despesas: inputs.outras_despesas || 0,
      input_juros_pagos: inputs.juros_pagos || 0,
      input_juros_recebidos: inputs.juros_recebidos || 0,
      input_tarifas_bancarias: inputs.tarifas || 0,
      input_multas_pagas: inputs.multas || 0,
      input_impostos_sobre_vendas: inputs.impostos_vendas || 0,
      input_regime_tributario: inputs.regime_tributario || 'presumido',
      // Calculados
      calc_receita_bruta: dre.receita_bruta,
      calc_deducoes_receita: dre.deducoes,
      calc_receita_liquida: dre.receita_liquida,
      calc_custo_produtos_vendidos: dre.cpv,
      calc_lucro_bruto: dre.lucro_bruto,
      calc_margem_bruta: dre.margem_bruta,
      calc_despesas_operacionais_total: dre.despesas_total,
      calc_resultado_operacional: dre.resultado_operacional,
      calc_margem_operacional: dre.margem_operacional,
      calc_resultado_financeiro: dre.resultado_financeiro,
      calc_resultado_antes_ir: dre.resultado_antes_ir,
      calc_impostos_sobre_lucro: dre.impostos_lucro,
      calc_lucro_liquido: dre.lucro_liquido,
      calc_margem_liquida: dre.margem_liquida,
      calc_ebitda: dre.ebitda,
      calc_ebitda_margin: dre.ebitda_margin,
      calc_ponto_equilibrio: dre.ponto_equilibrio,
      // Diagnóstico
      health_score: healthScore,
      health_status: healthStatus,
      diagnostics: diagnostics,
      recommendations: recommendations,
      // Reforma
      reforma_impostos_atuais: reformaImpact.impostos_atuais,
      reforma_impostos_novos: reformaImpact.impostos_novos,
      reforma_impacto_lucro: reformaImpact.impacto_lucro,
      reforma_impacto_percentual: reformaImpact.impacto_percentual
    }

    let savedDre
    if (dre_id) {
      const { data, error } = await supabaseAdmin
        .from('company_dre')
        .update(dreData)
        .eq('id', dre_id)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      savedDre = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('company_dre')
        .upsert(dreData, { onConflict: 'user_id,period_type,period_year,period_month' })
        .select()
        .single()
      
      if (error) throw error
      savedDre = data
    }

    return new Response(
      JSON.stringify({
        success: true,
        dre,
        diagnostics,
        healthScore,
        healthStatus,
        recommendations,
        reformaImpact,
        benchmark,
        savedDre
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing DRE:', error)
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateDRE(inputs: DREInputs) {
  // RECEITA
  const receita_bruta = (inputs.vendas_produtos || 0) + (inputs.vendas_servicos || 0) + (inputs.outras_receitas || 0)
  
  // Calcular impostos sobre vendas se auto
  let impostos_vendas = inputs.impostos_vendas || 0
  if (inputs.calcular_auto && receita_bruta > 0) {
    const taxRates: Record<string, number> = {
      'simples': 0.06,
      'presumido': 0.0925,
      'real': 0.0925
    }
    impostos_vendas = receita_bruta * (taxRates[inputs.regime_tributario] || 0.0925)
  }

  const deducoes = (inputs.devolucoes || 0) + (inputs.descontos || 0) + impostos_vendas
  const receita_liquida = receita_bruta - deducoes

  // CUSTOS
  const cpv = (inputs.custo_mercadorias || 0) + (inputs.custo_materiais || 0)
  const csp = (inputs.mao_obra_direta || 0) + (inputs.servicos_terceiros || 0)
  const custo_total = cpv + csp
  
  const lucro_bruto = receita_liquida - custo_total
  const margem_bruta = receita_liquida > 0 ? (lucro_bruto / receita_liquida) * 100 : 0

  // DESPESAS OPERACIONAIS
  const despesas_total = 
    (inputs.salarios_encargos || 0) + 
    (inputs.prolabore || 0) +
    (inputs.aluguel || 0) + 
    (inputs.energia_agua_internet || 0) + 
    (inputs.marketing || 0) + 
    (inputs.software || 0) + 
    (inputs.contador_juridico || 0) + 
    (inputs.viagens || 0) + 
    (inputs.manutencao || 0) + 
    (inputs.frete || 0) + 
    (inputs.outras_despesas || 0)

  const resultado_operacional = lucro_bruto - despesas_total
  const margem_operacional = receita_liquida > 0 ? (resultado_operacional / receita_liquida) * 100 : 0

  // FINANCEIRO
  const resultado_financeiro = (inputs.juros_recebidos || 0) - (inputs.juros_pagos || 0) - (inputs.tarifas || 0) - (inputs.multas || 0)

  // RESULTADO FINAL
  const resultado_antes_ir = resultado_operacional + resultado_financeiro
  
  // Calcular impostos sobre lucro
  let impostos_lucro = 0
  if (resultado_antes_ir > 0) {
    if (inputs.regime_tributario === 'simples') {
      impostos_lucro = 0 // Já incluso no DAS
    } else if (inputs.regime_tributario === 'presumido') {
      // Presunção de 8% para comércio, 32% para serviços
      const base_irpj = resultado_antes_ir * 0.08
      const base_csll = resultado_antes_ir * 0.12
      impostos_lucro = (base_irpj * 0.15) + (base_csll * 0.09)
    } else {
      // Lucro Real
      impostos_lucro = resultado_antes_ir * 0.34
    }
  }

  const lucro_liquido = resultado_antes_ir - impostos_lucro
  const margem_liquida = receita_liquida > 0 ? (lucro_liquido / receita_liquida) * 100 : 0

  // EBITDA (aproximação sem depreciação/amortização)
  const ebitda = resultado_operacional
  const ebitda_margin = receita_liquida > 0 ? (ebitda / receita_liquida) * 100 : 0

  // PONTO DE EQUILÍBRIO
  const custos_fixos = despesas_total + (inputs.aluguel || 0)
  const margem_contribuicao = margem_bruta / 100
  const ponto_equilibrio = margem_contribuicao > 0 ? custos_fixos / margem_contribuicao : 0

  return {
    receita_bruta,
    deducoes,
    impostos_vendas,
    receita_liquida,
    cpv,
    csp,
    custo_total,
    lucro_bruto,
    margem_bruta,
    despesas_total,
    resultado_operacional,
    margem_operacional,
    resultado_financeiro,
    resultado_antes_ir,
    impostos_lucro,
    lucro_liquido,
    margem_liquida,
    ebitda,
    ebitda_margin,
    ponto_equilibrio
  }
}

function generateDiagnostics(dre: ReturnType<typeof calculateDRE>, inputs: DREInputs, benchmark: Benchmark): Diagnostic[] {
  const diagnostics: Diagnostic[] = []

  // MARGEM BRUTA
  const margemBrutaDiff = dre.margem_bruta - benchmark.avg_margem_bruta
  if (margemBrutaDiff < -10) {
    diagnostics.push({
      area: 'rentabilidade',
      status: 'critical',
      title: 'Margem Bruta Baixa',
      description: `${dre.margem_bruta.toFixed(1)}% (setor: ${benchmark.avg_margem_bruta}%)`,
      recommendation: 'Revise preços de venda ou negocie melhores condições com fornecedores',
      icon: 'trending-down'
    })
  } else if (margemBrutaDiff < -5) {
    diagnostics.push({
      area: 'rentabilidade',
      status: 'warning',
      title: 'Margem Bruta Abaixo do Setor',
      description: `${dre.margem_bruta.toFixed(1)}% vs ${benchmark.avg_margem_bruta}% do setor`,
      recommendation: 'Avalie oportunidades de aumento de preço ou redução de custos',
      icon: 'alert-triangle'
    })
  } else if (margemBrutaDiff >= 5) {
    diagnostics.push({
      area: 'rentabilidade',
      status: 'excellent',
      title: 'Margem Bruta Excelente',
      description: `${dre.margem_bruta.toFixed(1)}% (acima da média do setor)`,
      recommendation: 'Continue mantendo o diferencial competitivo',
      icon: 'check-circle'
    })
  } else {
    diagnostics.push({
      area: 'rentabilidade',
      status: 'ok',
      title: 'Margem Bruta Adequada',
      description: `${dre.margem_bruta.toFixed(1)}% (na média do setor)`,
      recommendation: 'Margem dentro do esperado para o segmento',
      icon: 'check'
    })
  }

  // PESO DA FOLHA (despesas operacionais de pessoal - NÃO inclui mão de obra direta que é custo de produção)
  // mao_obra_direta já está computada nos custos (CPV/CSP), então NÃO somamos aqui para evitar duplicação
  const totalPessoasDespesas = (inputs.salarios_encargos || 0) + (inputs.prolabore || 0)
  const pesoFolha = dre.receita_liquida > 0 ? (totalPessoasDespesas / dre.receita_liquida) * 100 : 0
  
  if (pesoFolha > 50) {
    diagnostics.push({
      area: 'custos',
      status: 'critical',
      title: 'Custo com Pessoas Muito Alto',
      description: `${pesoFolha.toFixed(1)}% da receita (setor: ${benchmark.typical_custo_folha_percent}%)`,
      recommendation: 'Avalie automação de processos ou reestruturação da equipe',
      icon: 'users'
    })
  } else if (pesoFolha > 40) {
    diagnostics.push({
      area: 'custos',
      status: 'warning',
      title: 'Custo com Pessoas Alto',
      description: `${pesoFolha.toFixed(1)}% da receita`,
      recommendation: 'Monitore a produtividade e considere terceirização de funções',
      icon: 'users'
    })
  }

  // DESPESAS FINANCEIRAS
  const despesasFinanceiras = Math.abs(dre.resultado_financeiro)
  const pesoFinanceiro = dre.receita_liquida > 0 ? (despesasFinanceiras / dre.receita_liquida) * 100 : 0
  
  if (pesoFinanceiro > 5 && dre.resultado_financeiro < 0) {
    diagnostics.push({
      area: 'financeiro',
      status: 'critical',
      title: 'Despesas Financeiras Altas',
      description: `${pesoFinanceiro.toFixed(1)}% da receita em juros e tarifas`,
      recommendation: 'Renegocie dívidas, evite cheque especial e antecipações caras',
      icon: 'credit-card'
    })
  } else if (pesoFinanceiro > 3 && dre.resultado_financeiro < 0) {
    diagnostics.push({
      area: 'financeiro',
      status: 'warning',
      title: 'Atenção às Despesas Financeiras',
      description: `${pesoFinanceiro.toFixed(1)}% da receita`,
      recommendation: 'Busque linhas de crédito mais baratas',
      icon: 'credit-card'
    })
  }

  // MARGEM LÍQUIDA
  const margemLiqDiff = dre.margem_liquida - benchmark.avg_margem_liquida
  if (dre.lucro_liquido < 0) {
    diagnostics.push({
      area: 'resultado',
      status: 'critical',
      title: 'PREJUÍZO NO PERÍODO',
      description: `Perda de R$ ${Math.abs(dre.lucro_liquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      recommendation: 'Ação urgente: corte custos ou aumente receita imediatamente',
      icon: 'alert-octagon'
    })
  } else if (margemLiqDiff < -5) {
    diagnostics.push({
      area: 'resultado',
      status: 'warning',
      title: 'Margem Líquida Abaixo do Setor',
      description: `${dre.margem_liquida.toFixed(1)}% vs ${benchmark.avg_margem_liquida}% do setor`,
      recommendation: 'Revise despesas fixas e operacionais',
      icon: 'trending-down'
    })
  } else if (margemLiqDiff >= 5) {
    diagnostics.push({
      area: 'resultado',
      status: 'excellent',
      title: 'Lucratividade Excelente',
      description: `Margem líquida de ${dre.margem_liquida.toFixed(1)}%`,
      recommendation: 'Considere reinvestir ou distribuir lucros',
      icon: 'star'
    })
  }

  // ALUGUEL
  const pesoAluguel = dre.receita_liquida > 0 ? ((inputs.aluguel || 0) / dre.receita_liquida) * 100 : 0
  if (pesoAluguel > 15) {
    diagnostics.push({
      area: 'estrutura',
      status: 'warning',
      title: 'Custo de Ocupação Alto',
      description: `Aluguel representa ${pesoAluguel.toFixed(1)}% da receita`,
      recommendation: 'Avalie renegociação ou mudança para local mais econômico',
      icon: 'home'
    })
  }

  return diagnostics
}

function calculateHealthScore(diagnostics: Diagnostic[]): { score: number; status: string } {
  if (diagnostics.length === 0) {
    return { score: 75, status: 'healthy' }
  }

  const points: Record<string, number> = { 
    excellent: 100, 
    ok: 75, 
    warning: 40, 
    critical: 10 
  }
  
  const total = diagnostics.reduce((sum, d) => sum + (points[d.status] || 50), 0)
  const score = Math.round(total / diagnostics.length)
  
  let status = 'healthy'
  if (score < 30) status = 'critical'
  else if (score < 50) status = 'warning'
  else if (score >= 80) status = 'excellent'
  
  return { score, status }
}

function generateRecommendations(diagnostics: Diagnostic[], dre: ReturnType<typeof calculateDRE>, benchmark: Benchmark) {
  const recommendations: { priority: number; action: string; impact: string; area: string }[] = []
  
  // Ordenar diagnósticos por criticidade
  const criticalDiags = diagnostics.filter(d => d.status === 'critical')
  const warningDiags = diagnostics.filter(d => d.status === 'warning')

  criticalDiags.forEach(d => {
    recommendations.push({
      priority: 1,
      action: d.recommendation,
      impact: 'Alto impacto no resultado',
      area: d.area
    })
  })

  warningDiags.forEach(d => {
    recommendations.push({
      priority: 2,
      action: d.recommendation,
      impact: 'Melhoria potencial',
      area: d.area
    })
  })

  // Adicionar recomendações genéricas baseadas em métricas
  if (dre.margem_bruta < benchmark.avg_margem_bruta) {
    recommendations.push({
      priority: 2,
      action: 'Analise sua tabela de preços e compare com concorrentes',
      impact: `Potencial aumento de ${(benchmark.avg_margem_bruta - dre.margem_bruta).toFixed(1)}pp na margem`,
      area: 'precificacao'
    })
  }

  if (dre.ponto_equilibrio > 0 && dre.receita_liquida > 0) {
    const cobertura = (dre.receita_liquida / dre.ponto_equilibrio) * 100
    if (cobertura < 120) {
      recommendations.push({
        priority: 1,
        action: 'Aumente vendas ou reduza custos fixos para melhorar segurança financeira',
        impact: 'Margem de segurança baixa',
        area: 'estrutura'
      })
    }
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

function simulateReforma(inputs: DREInputs, dre: ReturnType<typeof calculateDRE>) {
  // Impostos atuais (PIS, COFINS, ISS, ICMS aproximados)
  const impostos_atuais = dre.impostos_vendas

  // Simulação com IBS + CBS (alíquota aproximada 26.5%)
  // Porém com créditos ampliados
  const receita_bruta = (inputs.vendas_produtos || 0) + (inputs.vendas_servicos || 0)
  const creditos_atuais = dre.cpv * 0.0925 // PIS/COFINS sobre compras
  const creditos_reforma = dre.cpv * 0.265 // IBS/CBS sobre compras
  
  const impostos_reforma_bruto = receita_bruta * 0.265
  const impostos_novos = Math.max(0, impostos_reforma_bruto - creditos_reforma)
  const impostos_atuais_liquido = Math.max(0, impostos_atuais - creditos_atuais)

  const impacto_lucro = impostos_atuais_liquido - impostos_novos
  const impacto_percentual = impostos_atuais_liquido > 0 
    ? ((impacto_lucro / impostos_atuais_liquido) * 100) 
    : 0

  return {
    impostos_atuais: impostos_atuais_liquido,
    impostos_novos,
    impacto_lucro,
    impacto_percentual,
    economia: impacto_lucro > 0,
    detalhamento: {
      aliquota_atual: inputs.regime_tributario === 'simples' ? 6 : 9.25,
      aliquota_reforma: 26.5,
      creditos_atuais,
      creditos_reforma
    }
  }
}
