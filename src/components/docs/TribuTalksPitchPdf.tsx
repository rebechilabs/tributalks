import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function TribuTalksPitchPdf() {
  const [generating, setGenerating] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    
    // Dynamic import to avoid build issues
    const { default: jsPDF } = await import("jspdf");
    
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const addTitle = (text: string, size: number = 18) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(30, 30, 30);
      doc.text(text, margin, y);
      y += size * 0.5 + 4;
    };

    const addSubtitle = (text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(234, 179, 8); // Amber
      doc.text(text, margin, y);
      y += 8;
    };

    const addParagraph = (text: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    };

    const addBullet = (text: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, contentWidth - 5);
      doc.text("•", margin, y);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5 + 2;
    };

    const addSpacer = (height: number = 6) => {
      y += height;
    };

    const checkPage = () => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // ===== CAPA =====
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, pageWidth, 60, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(234, 179, 8);
    doc.text("TRIBUTALKS", margin, 35);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("Plataforma de Inteligência Tributária", margin, 48);

    y = 80;

    addTitle("Documento Comercial", 22);
    addSpacer(4);
    addParagraph("Visão completa da plataforma, ferramentas, arquitetura técnica e proposta de valor para empresas que faturam acima de R$1M/mês.");
    
    addSpacer(10);
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // ===== VISÃO GERAL =====
    addTitle("1. Visão Geral", 16);
    addParagraph("A TribuTalks é uma plataforma SaaS de inteligência tributária desenvolvida para empresários, CFOs e contadores de empresas brasileiras com faturamento mensal superior a R$1.000.000.");
    addParagraph("O objetivo central é transformar a complexidade do sistema tributário brasileiro em decisões claras e acionáveis, entregando economia real e compliance através de automação e IA.");
    
    addSpacer(4);
    addSubtitle("Proposta de Valor");
    addBullet("Reduzir o tempo de decisão tributária de semanas para minutos");
    addBullet("Identificar oportunidades de economia fiscal não aproveitadas");
    addBullet("Preparar empresas para a Reforma Tributária (CBS/IBS/IS) de 2026-2033");
    addBullet("Fornecer Score Tributário com diagnóstico de 5 dimensões");
    addBullet("Oferecer painel executivo para CEOs/CFOs com linguagem de negócios");

    checkPage();
    addSpacer(8);

    // ===== FERRAMENTAS =====
    addTitle("2. As 12 Ferramentas Disponíveis", 16);
    addParagraph("A plataforma oferece um ecossistema integrado de 12 ferramentas que cobrem todo o ciclo de gestão tributária:");

    const tools = [
      {
        name: "Calculadora RTC (Reforma Tributária)",
        badge: "API Oficial",
        desc: "Calcula CBS, IBS e Imposto Seletivo utilizando a API oficial da Receita Federal com alíquotas reais por NCM.",
        inputs: "NCM do produto, valor da operação, UF de destino, tipo de operação (venda, serviço)",
        outputs: "Valores de CBS (federal), IBS estadual, IBS municipal, Imposto Seletivo, alíquota efetiva total"
      },
      {
        name: "Comparativo de Regimes",
        badge: null,
        desc: "Compara Simples Nacional, Lucro Presumido e Lucro Real para identificar o regime mais econômico.",
        inputs: "Faturamento mensal, despesas dedutíveis, folha de pagamento, setor de atividade",
        outputs: "Carga tributária por regime, melhor opção, economia anual potencial, gráfico comparativo"
      },
      {
        name: "Simulador Split Payment",
        badge: null,
        desc: "Simula o impacto do novo mecanismo de retenção automática de tributos que entra em vigor em 2026.",
        inputs: "Faturamento mensal, percentual de vendas B2B vs B2C, margem operacional",
        outputs: "Valor retido na fonte, impacto no fluxo de caixa, projeção mensal e anual"
      },
      {
        name: "Importador de XMLs",
        badge: null,
        desc: "Faz upload e parsing de notas fiscais eletrônicas (NF-e, NFS-e, CT-e) para análise automatizada.",
        inputs: "Arquivos XML de notas fiscais (upload em lote)",
        outputs: "Dados estruturados por NCM, CFOP, fornecedor, valores de impostos, status de processamento"
      },
      {
        name: "Radar de Créditos",
        badge: "Novo",
        desc: "Identifica créditos tributários não aproveitados de ICMS, PIS/COFINS, IPI e ICMS-ST com base nos XMLs importados.",
        inputs: "XMLs processados, perfil da empresa, regime tributário",
        outputs: "Lista de créditos por tipo de tributo, valor potencial, nível de confiança, base legal"
      },
      {
        name: "DRE Inteligente",
        badge: "Novo",
        desc: "Análise de Demonstração de Resultado do Exercício com diagnóstico automatizado e score de saúde.",
        inputs: "Receitas, custos, despesas operacionais, resultado financeiro (20+ campos)",
        outputs: "DRE calculado, EBITDA, margens, 8 diagnósticos, score de saúde (0-100), recomendações, simulação da reforma"
      },
      {
        name: "Score Tributário",
        badge: "Novo",
        desc: "Avalia a saúde fiscal da empresa em 5 dimensões com nota de 0 a 1000 e grade (A+ a E).",
        inputs: "4 cards automáticos (XMLs, DRE, perfil) + 4 cards manuais (situação fiscal, certidões, obrigações, controles)",
        outputs: "Score total, nota por dimensão, ações recomendadas priorizadas, economia potencial"
      },
      {
        name: "Oportunidades Fiscais",
        badge: "Novo",
        desc: "Motor de matching que identifica 37+ benefícios fiscais aplicáveis ao perfil da empresa.",
        inputs: "Perfil completo da empresa (setor, faturamento, atividades, UFs de operação, produtos)",
        outputs: "Lista de oportunidades com match score, economia estimada, complexidade, tempo de implementação, pauta para contador"
      },
      {
        name: "Clara AI (Copiloto Tributário)",
        badge: "IA",
        desc: "Copiloto de decisão tributária com IA, disponível 24/7 para tirar dúvidas em linguagem natural.",
        inputs: "Perguntas em linguagem natural sobre tributação, reforma, regimes, obrigações",
        outputs: "Respostas contextualizadas ao perfil da empresa, com referências legais quando aplicável"
      },
      {
        name: "Notícias Tributárias",
        badge: null,
        desc: "Feed curado de notícias sobre legislação tributária com resumos executivos gerados por IA.",
        inputs: "Fontes oficiais (RFB, Confaz, portais especializados), processamento por IA",
        outputs: "Título, resumo executivo, o que muda, quem é afetado, ação recomendada, relevância (Alta/Média/Baixa)"
      },
      {
        name: "Relatórios PDF",
        badge: null,
        desc: "Geração de relatórios profissionais em PDF para apresentação em reuniões de diretoria.",
        inputs: "Dados das simulações e análises realizadas na plataforma",
        outputs: "PDF formatado com logo, métricas, gráficos, recomendações e próximos passos"
      },
      {
        name: "Comunidade Exclusiva",
        badge: null,
        desc: "Network com empresários que faturam acima de R$1M/mês.",
        inputs: "Participação ativa, perguntas, cases",
        outputs: "Conexões, troca de experiências, acesso a especialistas"
      }
    ];

    for (const tool of tools) {
      checkPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      let toolTitle = tool.name;
      doc.text(toolTitle, margin, y);
      
      if (tool.badge) {
        const titleWidth = doc.getTextWidth(toolTitle);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(234, 179, 8);
        doc.text(`[${tool.badge}]`, margin + titleWidth + 3, y);
      }
      y += 6;

      addParagraph(tool.desc);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Inputs:", margin, y);
      doc.setFont("helvetica", "normal");
      const inputLines = doc.splitTextToSize(tool.inputs, contentWidth - 15);
      doc.text(inputLines, margin + 15, y);
      y += inputLines.length * 4 + 2;

      doc.setFont("helvetica", "bold");
      doc.text("Outputs:", margin, y);
      doc.setFont("helvetica", "normal");
      const outputLines = doc.splitTextToSize(tool.outputs, contentWidth - 18);
      doc.text(outputLines, margin + 18, y);
      y += outputLines.length * 4 + 5;
    }

    // ===== ARQUITETURA =====
    doc.addPage();
    y = 20;
    
    addTitle("3. Arquitetura Técnica", 16);
    addParagraph("A TribuTalks é construída sobre uma stack moderna e escalável:");

    addSubtitle("Frontend");
    addBullet("React 18 com TypeScript para type-safety");
    addBullet("Vite como bundler para hot-reload rápido");
    addBullet("Tailwind CSS + shadcn/ui para design system consistente");
    addBullet("React Router para navegação SPA");
    addBullet("TanStack Query para gerenciamento de estado servidor");

    addSpacer(4);
    addSubtitle("Backend (Lovable Cloud / Supabase)");
    addBullet("PostgreSQL gerenciado com RLS (Row Level Security) para isolamento de dados");
    addBullet("14 Edge Functions (Deno) para lógica de negócio serverless");
    addBullet("Autenticação integrada com JWT e políticas granulares");
    addBullet("Storage para upload de XMLs com controle de acesso por usuário");
    addBullet("Realtime para atualizações em tempo real (notificações, chat)");

    addSpacer(4);
    addSubtitle("Integrações Externas");
    addBullet("API oficial da Receita Federal (RTC) para alíquotas CBS/IBS/IS");
    addBullet("Stripe para pagamentos e gestão de assinaturas");
    addBullet("Resend para envio de emails transacionais");
    addBullet("Lovable AI Gateway para modelos Gemini e GPT (Clara AI)");

    checkPage();
    addSpacer(8);

    // ===== EDGE FUNCTIONS =====
    addTitle("4. Edge Functions (Backend)", 16);
    addParagraph("14 funções serverless que processam a lógica de negócio:");

    const functions = [
      { name: "calculate-rtc", desc: "Cálculo de impostos da reforma tributária via API oficial" },
      { name: "calculate-tax-score", desc: "Geração do Score Tributário com 5 dimensões" },
      { name: "match-opportunities", desc: "Motor de matching de 37+ oportunidades fiscais" },
      { name: "process-dre", desc: "Processamento de DRE com diagnósticos e simulação de reforma" },
      { name: "process-xml-batch", desc: "Parsing em lote de NF-e, NFS-e e CT-e" },
      { name: "analyze-credits", desc: "Identificação de créditos tributários não aproveitados" },
      { name: "analyze-ncm-from-xmls", desc: "Classificação de NCMs para adequação à reforma" },
      { name: "clara-assistant", desc: "Chat com IA tributária (Gemini) com contexto personalizado" },
      { name: "process-news", desc: "Processamento de notícias com extração de insights por IA" },
      { name: "fetch-news", desc: "Coleta automatizada de fontes de notícias tributárias" },
      { name: "send-news-alerts", desc: "Envio de alertas de notícias por email" },
      { name: "send-executive-report", desc: "Geração e envio de relatório executivo mensal" },
      { name: "send-batch-executive-reports", desc: "Envio em lote para usuários premium" },
      { name: "stripe-webhook", desc: "Processamento de eventos de pagamento (subscription lifecycle)" },
    ];

    for (const fn of functions) {
      checkPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(fn.name, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(" — " + fn.desc, margin + doc.getTextWidth(fn.name), y);
      y += 6;
    }

    checkPage();
    addSpacer(10);

    // ===== PAPEL DA IA =====
    addTitle("5. O Papel da Inteligência Artificial", 16);
    addParagraph("A IA é um componente central da TribuTalks, utilizada em múltiplas camadas:");

    addSubtitle("Clara AI — Copiloto de Decisão Tributária");
    addBullet("Modelo: Google Gemini 3 Flash (via Lovable AI Gateway)");
    addBullet("Contexto personalizado: perfil da empresa, setor, regime, faturamento");
    addBullet("Limite por plano: 30 msgs/dia (Starter), ilimitado (Professional+)");
    addBullet("Histórico persistido para continuidade de conversas");

    addSpacer(4);
    addSubtitle("Processamento de Notícias");
    addBullet("Extração automática de: resumo executivo, impacto, afetados, ação recomendada");
    addBullet("Classificação de relevância (Alta/Média/Baixa) e categorização");
    addBullet("Identificação de setores, regimes e tributos relacionados");

    addSpacer(4);
    addSubtitle("Motor de Oportunidades");
    addBullet("Matching inteligente entre perfil da empresa e 37+ benefícios fiscais");
    addBullet("Pontuação de match score baseada em critérios obrigatórios e desejáveis");
    addBullet("Geração de pauta estruturada para contador");

    addSpacer(4);
    addSubtitle("Análise de Créditos (Radar)");
    addBullet("Cruzamento de NCMs, CFOPs e CSTs com regras de recuperação");
    addBullet("Cálculo de potencial recuperável com níveis de confiança");

    checkPage();
    addSpacer(10);

    // ===== PLANOS =====
    addTitle("6. Modelo de Negócio", 16);
    addParagraph("A TribuTalks opera em modelo SaaS com 4 níveis de assinatura:");

    const plans = [
      { name: "FREE", price: "R$0/mês", features: "1 simulação/mês, só Comparativo de Regimes + Calculadora RTC" },
      { name: "STARTER", price: "R$397/mês", features: "Simulações ilimitadas, todas calculadoras, Clara AI 30 msgs/dia" },
      { name: "NAVIGATOR", price: "R$1.297/mês", features: "Tudo do Starter + Clara AI 100 msgs/dia + Notícias + Comunidade" },
      { name: "PROFESSIONAL", price: "R$2.997/mês", features: "Tudo + Clara AI ilimitada + PDF + NEXUS + Radar Créditos" },
    ];

    for (const plan of plans) {
      checkPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(`${plan.name} — ${plan.price}`, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const planLines = doc.splitTextToSize(plan.features, contentWidth);
      doc.text(planLines, margin, y);
      y += planLines.length * 4 + 5;
    }

    addSpacer(4);
    addParagraph("Desconto de 2 meses para pagamento anual em todos os planos.");

    checkPage();
    addSpacer(10);

    // ===== PÚBLICO-ALVO =====
    addTitle("7. Público-Alvo", 16);
    addBullet("Empresários e CFOs de empresas com faturamento mensal > R$1.000.000");
    addBullet("Contadores e escritórios de contabilidade com carteira de clientes médios/grandes");
    addBullet("Empresas em transição de regime tributário (Simples → Presumido/Real)");
    addBullet("Indústrias com operações interestaduais e créditos de ICMS/IPI");
    addBullet("E-commerces com alto volume de SKUs e complexidade de NCMs");
    addBullet("Empresas se preparando para a Reforma Tributária (CBS/IBS/IS)");

    checkPage();
    addSpacer(10);

    // ===== DIFERENCIAIS =====
    addTitle("8. Diferenciais Competitivos", 16);
    addBullet("API oficial da Receita Federal para cálculos RTC (único no mercado)");
    addBullet("Score Tributário com 5 dimensões e ações priorizadas");
    addBullet("Painel Executivo com linguagem de negócios para CEOs (não contabilês)");
    addBullet("Motor de oportunidades com 37+ benefícios fiscais mapeados");
    addBullet("Radar de Créditos com análise automática de XMLs");
    addBullet("IA integrada em múltiplas camadas (chat, notícias, análises)");
    addBullet("Relatório Executivo mensal automatizado por email");

    // ===== RODAPÉ =====
    doc.addPage();
    y = 20;
    
    addTitle("9. Roadmap 2026", 16);
    addBullet("Q1: Simulador de Preços com impacto da reforma por produto");
    addBullet("Q2: Integração com ERPs (Omie, Bling, TOTVS)");
    addBullet("Q3: Leitura automática de SPED Fiscal e Contribuições");
    addBullet("Q4: IA Preditiva para antecipação de riscos fiscais");
    addBullet("2027: Playbooks estruturados (1-pager diretoria + briefing contador)");

    addSpacer(20);
    
    doc.setDrawColor(234, 179, 8);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Tributech — Inteligência Tributária", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("suporte@tributalks.com.br", margin, y);
    y += 5;
    doc.text("tributechai.lovable.app", margin, y);
    y += 10;
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, y);

    // Salvar
    doc.save("Tributech_Documento_Comercial.pdf");
    setGenerating(false);
  };

  return (
    <Button onClick={generatePdf} disabled={generating} className="gap-2">
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Baixar PDF Comercial
        </>
      )}
    </Button>
  );
}
