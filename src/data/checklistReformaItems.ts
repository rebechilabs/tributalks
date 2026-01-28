export interface ChecklistItem {
  key: string;
  question: string;
  helpText: {
    meaning: string;
    importance: string;
    commonIssue: string;
  };
  riskWeight: number; // 1-3, higher = more critical
}

export interface ChecklistBlock {
  key: string;
  title: string;
  description: string;
  icon: string;
  items: ChecklistItem[];
}

export const checklistBlocks: ChecklistBlock[] = [
  {
    key: "sistemas_tecnologia",
    title: "Sistemas e Tecnologia",
    description: "Avaliação da infraestrutura tecnológica para a reforma",
    icon: "Server",
    items: [
      {
        key: "erp_atualizado",
        question: "O ERP/sistema fiscal da empresa está preparado para emitir documentos com CBS e IBS?",
        helpText: {
          meaning: "Significa verificar se o software que emite suas notas fiscais consegue incluir os novos tributos.",
          importance: "A partir de 2026, todos os documentos fiscais precisarão ter campos específicos para CBS e IBS.",
          commonIssue: "Muitas empresas descobrem tarde que seu ERP não suporta os novos campos e precisam migrar às pressas."
        },
        riskWeight: 3
      },
      {
        key: "fornecedor_erp_roadmap",
        question: "O fornecedor do ERP já comunicou um roadmap de atualização para a reforma?",
        helpText: {
          meaning: "Roadmap é o cronograma de atualizações que o fornecedor vai entregar.",
          importance: "Sem roadmap claro, você pode ficar sem suporte técnico no momento crítico da transição.",
          commonIssue: "Fornecedores menores podem não ter recursos para acompanhar as mudanças regulatórias."
        },
        riskWeight: 2
      },
      {
        key: "integracao_split_payment",
        question: "Existe integração preparada para o Split Payment bancário?",
        helpText: {
          meaning: "Split Payment é a divisão automática do pagamento: parte vai para a empresa, parte vai direto para o governo.",
          importance: "A partir de 2027, isso será obrigatório em muitas operações. Seu sistema precisa 'conversar' com os bancos.",
          commonIssue: "Empresas que não se preparam enfrentam problemas de conciliação e fluxo de caixa."
        },
        riskWeight: 3
      },
      {
        key: "backup_contingencia",
        question: "Há plano de contingência caso o sistema fiscal fique indisponível durante a transição?",
        helpText: {
          meaning: "É ter um 'plano B' se o sistema principal parar de funcionar.",
          importance: "Durante a transição, atualizações frequentes podem causar instabilidades.",
          commonIssue: "Empresas ficam impossibilitadas de emitir notas e perdem vendas."
        },
        riskWeight: 2
      },
      {
        key: "cadastro_ncm_nbs",
        question: "O cadastro de produtos/serviços está com NCM e NBS corretos e atualizados?",
        helpText: {
          meaning: "NCM classifica produtos, NBS classifica serviços. São códigos que determinam as alíquotas.",
          importance: "Classificação errada resulta em tributo errado: a menos gera autuação, a mais gera prejuízo.",
          commonIssue: "Cadastros antigos com classificações desatualizadas ou genéricas."
        },
        riskWeight: 3
      }
    ]
  },
  {
    key: "obrigacoes_acessorias",
    title: "Obrigações Acessórias",
    description: "Preparação para as novas declarações e escriturações",
    icon: "FileText",
    items: [
      {
        key: "equipe_capacitada_efd",
        question: "A equipe fiscal está capacitada para as mudanças no SPED/EFD?",
        helpText: {
          meaning: "SPED e EFD são os sistemas de escrituração digital. Novos campos serão exigidos.",
          importance: "Erros de preenchimento geram multas automáticas e podem travar operações.",
          commonIssue: "Equipe sobrecarregada não tem tempo para estudar as mudanças."
        },
        riskWeight: 2
      },
      {
        key: "cronograma_obrigacoes",
        question: "Existe cronograma interno para acompanhar os novos prazos de obrigações?",
        helpText: {
          meaning: "Um calendário interno com todas as datas de entrega de declarações.",
          importance: "Novos tributos = novos prazos. Perder um prazo gera multa automática.",
          commonIssue: "Confusão entre prazos antigos e novos durante a transição."
        },
        riskWeight: 2
      },
      {
        key: "arquivo_digital_organizado",
        question: "Os arquivos digitais fiscais estão organizados e acessíveis para auditoria?",
        helpText: {
          meaning: "XMLs, SPEDs e demais arquivos precisam estar arquivados de forma organizada.",
          importance: "A Receita pode solicitar documentos dos últimos 5 anos a qualquer momento.",
          commonIssue: "Arquivos espalhados em emails, pastas pessoais ou perdidos em trocas de contador."
        },
        riskWeight: 2
      },
      {
        key: "conciliacao_automatica",
        question: "Há conciliação automática entre o que foi declarado e o que foi efetivamente recolhido?",
        helpText: {
          meaning: "Verificação se o que você declarou como tributo foi de fato pago.",
          importance: "Diferenças entre declarado e pago são detectadas automaticamente pelo fisco.",
          commonIssue: "Pagamentos feitos com código errado ou em valor diferente do declarado."
        },
        riskWeight: 3
      }
    ]
  },
  {
    key: "emissao_documentos",
    title: "Emissão de Documentos Fiscais",
    description: "Prontidão para os novos formatos de NF-e, NFS-e e CT-e",
    icon: "FileCheck",
    items: [
      {
        key: "nfe_novos_campos",
        question: "O sistema de emissão de NF-e está pronto para incluir os campos de CBS/IBS?",
        helpText: {
          meaning: "As notas fiscais terão campos específicos para os novos tributos.",
          importance: "Nota fiscal sem os campos corretos pode ser rejeitada ou invalidada.",
          commonIssue: "Descobrir no momento da emissão que o sistema não suporta o layout novo."
        },
        riskWeight: 3
      },
      {
        key: "nfse_unificada",
        question: "A empresa está preparada para a NFS-e nacional unificada?",
        helpText: {
          meaning: "A NFS-e deixará de ser municipal e terá um padrão único nacional.",
          importance: "Empresas de serviços precisarão migrar para o novo modelo.",
          commonIssue: "Cada município tem regras diferentes hoje; a unificação exige adaptação."
        },
        riskWeight: 2
      },
      {
        key: "cte_mdf_atualizados",
        question: "Os documentos de transporte (CT-e, MDF-e) estão sendo emitidos corretamente?",
        helpText: {
          meaning: "Documentos específicos para operações de transporte de carga.",
          importance: "Afetam diretamente o crédito de tributos e a comprovação de operações.",
          commonIssue: "Informações de frete incorretas impactam o cálculo de tributos."
        },
        riskWeight: 2
      },
      {
        key: "regras_destaque_tributo",
        question: "A equipe conhece as novas regras de destaque de tributos em documentos?",
        helpText: {
          meaning: "Como os tributos devem aparecer discriminados nas notas fiscais.",
          importance: "O destaque correto é requisito legal e base para créditos do comprador.",
          commonIssue: "Destaque incorreto invalida o crédito para o cliente B2B."
        },
        riskWeight: 3
      }
    ]
  },
  {
    key: "gestao_creditos",
    title: "Gestão de Créditos",
    description: "Controle de créditos tributários no novo sistema",
    icon: "Wallet",
    items: [
      {
        key: "controle_creditos_atual",
        question: "Existe controle estruturado dos créditos tributários atuais (PIS/COFINS, ICMS, IPI)?",
        helpText: {
          meaning: "Planilha ou sistema que acompanha todos os créditos que a empresa tem direito.",
          importance: "Créditos não controlados são créditos perdidos. É dinheiro deixado na mesa.",
          commonIssue: "Empresas descobrem anos depois que tinham créditos que prescreveram."
        },
        riskWeight: 3
      },
      {
        key: "transicao_creditos_legado",
        question: "Há plano para utilização dos créditos acumulados antes da transição completa?",
        helpText: {
          meaning: "Estratégia para usar os créditos antigos que não existirão mais no novo sistema.",
          importance: "Créditos do sistema antigo precisam ser usados até 2032-2033.",
          commonIssue: "Deixar créditos expirarem por falta de planejamento."
        },
        riskWeight: 3
      },
      {
        key: "validacao_fornecedores",
        question: "Existe processo de validação da situação fiscal dos fornecedores?",
        helpText: {
          meaning: "Verificar se seus fornecedores estão regulares para que você possa usar os créditos.",
          importance: "No IBS/CBS, só haverá crédito se o fornecedor efetivamente pagou o tributo.",
          commonIssue: "Fornecedor irregular = crédito negado para o comprador."
        },
        riskWeight: 3
      },
      {
        key: "documentacao_creditos",
        question: "Os documentos que geram direito a crédito estão sendo arquivados corretamente?",
        helpText: {
          meaning: "Notas fiscais de entrada, comprovantes de pagamento, etc.",
          importance: "Sem documentação, não há como comprovar o direito ao crédito.",
          commonIssue: "Perder documentos em mudanças de contador ou de sistema."
        },
        riskWeight: 2
      }
    ]
  },
  {
    key: "fluxo_caixa_split",
    title: "Fluxo de Caixa e Split Payment",
    description: "Preparação financeira para o novo modelo de arrecadação",
    icon: "TrendingUp",
    items: [
      {
        key: "projecao_impacto_caixa",
        question: "Foi feita projeção do impacto do Split Payment no fluxo de caixa?",
        helpText: {
          meaning: "Simulação de quanto menos dinheiro vai entrar na conta porque parte vai direto para o governo.",
          importance: "O Split Payment muda radicalmente o capital de giro disponível.",
          commonIssue: "Empresas descobrem que não têm caixa para operar após a primeira quinzena."
        },
        riskWeight: 3
      },
      {
        key: "linha_credito_reserva",
        question: "Existe linha de crédito ou reserva para cobrir a redução de capital de giro?",
        helpText: {
          meaning: "Dinheiro guardado ou crédito pré-aprovado para cobrir a diferença.",
          importance: "Evita parar operações por falta de capital.",
          commonIssue: "Buscar crédito em momento de aperto é mais caro e difícil."
        },
        riskWeight: 2
      },
      {
        key: "conciliacao_bancaria_tributaria",
        question: "O processo de conciliação bancária está preparado para identificar os splits?",
        helpText: {
          meaning: "Conseguir identificar nos extratos bancários qual parte foi para tributo e qual para a empresa.",
          importance: "Sem isso, a contabilidade fica incorreta e a conciliação impossível.",
          commonIssue: "Lançamentos genéricos que não identificam a natureza do débito."
        },
        riskWeight: 2
      },
      {
        key: "renegociacao_prazos",
        question: "Foi avaliada a necessidade de renegociar prazos com clientes e fornecedores?",
        helpText: {
          meaning: "Ajustar prazos de pagamento e recebimento para equilibrar o caixa.",
          importance: "Se você recebe mais devagar e paga igual, o caixa aperta.",
          commonIssue: "Manter as mesmas condições comerciais de antes da reforma."
        },
        riskWeight: 2
      }
    ]
  },
  {
    key: "governanca_responsabilidades",
    title: "Governança e Responsabilidades",
    description: "Definição de papéis e responsabilidades na transição",
    icon: "Users",
    items: [
      {
        key: "responsavel_reforma",
        question: "Há uma pessoa ou equipe responsável por coordenar a adaptação à reforma?",
        helpText: {
          meaning: "Alguém com a missão clara de liderar esse projeto.",
          importance: "Sem dono, o projeto não anda. Cada área acha que é responsabilidade da outra.",
          commonIssue: "Reforma tratada como 'assunto do contador' sem envolvimento da gestão."
        },
        riskWeight: 3
      },
      {
        key: "comunicacao_diretoria",
        question: "A diretoria está sendo informada regularmente sobre os riscos e o andamento?",
        helpText: {
          meaning: "Reuniões ou relatórios periódicos sobre o status da preparação.",
          importance: "Decisões estratégicas (investimentos, mudanças) dependem dessa informação.",
          commonIssue: "Diretoria descobre problemas quando já é tarde demais."
        },
        riskWeight: 2
      },
      {
        key: "treinamento_equipe",
        question: "Está previsto treinamento para as equipes afetadas (fiscal, financeiro, comercial)?",
        helpText: {
          meaning: "Capacitação prática sobre como operar no novo modelo.",
          importance: "Pessoas despreparadas cometem erros operacionais.",
          commonIssue: "Assumir que a equipe vai 'aprender fazendo'."
        },
        riskWeight: 2
      },
      {
        key: "assessoria_externa",
        question: "A empresa conta com assessoria contábil/jurídica acompanhando as mudanças?",
        helpText: {
          meaning: "Contador e/ou advogado tributarista atualizado sobre a reforma.",
          importance: "Legislação complexa exige especialistas atualizados.",
          commonIssue: "Assessoria que não está estudando a reforma ou minimiza os impactos."
        },
        riskWeight: 2
      }
    ]
  },
  {
    key: "preparacao_transicao",
    title: "Preparação para a Transição (2026–2027)",
    description: "Ações específicas para o período inicial da reforma",
    icon: "Calendar",
    items: [
      {
        key: "piloto_cbs_conhecimento",
        question: "A equipe conhece o Piloto CBS e as obrigações do período de testes (2026)?",
        helpText: {
          meaning: "Em 2026, o CBS entra em fase piloto com alíquota simbólica de 0,9%.",
          importance: "É o momento de testar sistemas e processos sem grande risco financeiro.",
          commonIssue: "Ignorar o piloto e só se preparar quando virar 'pra valer'."
        },
        riskWeight: 2
      },
      {
        key: "simulacao_cenarios",
        question: "Foram feitas simulações de cenários (melhor, esperado, pior) para 2027?",
        helpText: {
          meaning: "Projeções financeiras considerando diferentes alíquotas e situações.",
          importance: "Permite antecipar necessidades e tomar decisões informadas.",
          commonIssue: "Operar às cegas, sem visibilidade do impacto potencial."
        },
        riskWeight: 2
      },
      {
        key: "cronograma_implantacao",
        question: "Existe um cronograma de implantação das mudanças necessárias?",
        helpText: {
          meaning: "Lista de ações com datas e responsáveis.",
          importance: "Sem cronograma, as ações ficam para 'depois' até virar emergência.",
          commonIssue: "Planejar tudo para o último trimestre de 2026."
        },
        riskWeight: 3
      },
      {
        key: "orcamento_adequacao",
        question: "Há orçamento alocado para as adequações necessárias?",
        helpText: {
          meaning: "Dinheiro separado para sistemas, consultorias, treinamentos.",
          importance: "Adequações custam dinheiro. Sem orçamento, não acontecem.",
          commonIssue: "Esperar que tudo seja feito 'de graça' ou 'com recursos internos'."
        },
        riskWeight: 2
      },
      {
        key: "plano_comunicacao_clientes",
        question: "Há plano de comunicação com clientes sobre mudanças em documentos e preços?",
        helpText: {
          meaning: "Como você vai explicar para seus clientes as mudanças nas notas e nos valores.",
          importance: "Evita surpresas, reclamações e perda de clientes por falta de transparência.",
          commonIssue: "Cliente recebe nota diferente e acha que está errada."
        },
        riskWeight: 1
      }
    ]
  }
];

export type ChecklistResponse = 'sim' | 'parcial' | 'nao' | 'nao_sei';

export const responseLabels: Record<ChecklistResponse, { label: string; color: string; bgColor: string }> = {
  sim: { label: 'Sim', color: 'text-green-700', bgColor: 'bg-green-100 hover:bg-green-200 border-green-300' },
  parcial: { label: 'Parcial', color: 'text-yellow-700', bgColor: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  nao: { label: 'Não', color: 'text-red-700', bgColor: 'bg-red-100 hover:bg-red-200 border-red-300' },
  nao_sei: { label: 'Não sei', color: 'text-gray-700', bgColor: 'bg-gray-100 hover:bg-gray-200 border-gray-300' }
};

export const getTotalItems = (): number => {
  return checklistBlocks.reduce((total, block) => total + block.items.length, 0);
};

export const calculateReadinessScore = (responses: Record<string, ChecklistResponse>): number => {
  const blocks = checklistBlocks;
  let totalWeight = 0;
  let earnedWeight = 0;

  blocks.forEach(block => {
    block.items.forEach(item => {
      const response = responses[item.key];
      totalWeight += item.riskWeight * 3; // Max possible per item

      if (response === 'sim') {
        earnedWeight += item.riskWeight * 3;
      } else if (response === 'parcial') {
        earnedWeight += item.riskWeight * 1.5;
      }
      // 'nao' and 'nao_sei' earn 0
    });
  });

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
};

export const getRiskLevel = (score: number): 'baixo' | 'moderado' | 'alto' | 'critico' => {
  if (score >= 80) return 'baixo';
  if (score >= 60) return 'moderado';
  if (score >= 40) return 'alto';
  return 'critico';
};

export const riskLevelLabels: Record<string, { label: string; color: string; description: string }> = {
  baixo: { 
    label: 'Risco Baixo', 
    color: 'text-green-600', 
    description: 'A empresa demonstra boa preparação para a transição.' 
  },
  moderado: { 
    label: 'Risco Moderado', 
    color: 'text-yellow-600', 
    description: 'Existem pontos de atenção que merecem acompanhamento.' 
  },
  alto: { 
    label: 'Risco Alto', 
    color: 'text-orange-600', 
    description: 'Há lacunas significativas que exigem ação prioritária.' 
  },
  critico: { 
    label: 'Risco Crítico', 
    color: 'text-red-600', 
    description: 'A preparação está muito aquém do necessário. Ação imediata recomendada.' 
  }
};
