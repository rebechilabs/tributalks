import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Opportunity {
  code: string;
  name_simples: string;
  description_ceo: string;
  category: string;
  economia_percentual_min: number;
  economia_percentual_max: number;
  base_legal: string;
  tributos_afetados: string[];
  tempo_implementacao: string;
  complexidade: string;
  risco_fiscal: string;
}

const SECTOR_CONFIG: Record<string, { title: string; icon: string; color: [number, number, number] }> = {
  agro: { title: 'Agronegócio', icon: '🌾', color: [34, 139, 34] },
  energia: { title: 'Energia Solar', icon: '☀️', color: [255, 165, 0] },
  saude: { title: 'Saúde', icon: '🏥', color: [220, 20, 60] },
  construcao: { title: 'Construção Civil', icon: '🏗️', color: [70, 130, 180] },
  transporte: { title: 'Transporte e Logística', icon: '🚛', color: [128, 128, 128] },
  alimentacao: { title: 'Alimentação', icon: '🍽️', color: [255, 99, 71] },
  ecommerce: { title: 'E-commerce e Marketplace', icon: '🛒', color: [138, 43, 226] },
  educacao: { title: 'Educação', icon: '📚', color: [0, 128, 128] },
  geral: { title: 'Oportunidades Gerais', icon: '💼', color: [100, 100, 100] }
};

export function OpportunitiesDocPdf() {
  const [generating, setGenerating] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);

    try {
      // Fetch opportunities from database
      const { data: opportunities, error } = await supabase
        .from('tax_opportunities')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;

      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      // Helper functions
      const addNewPageIfNeeded = (neededSpace: number = 30) => {
        if (y + neededSpace > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      const addTitle = (text: string, size: number = 18) => {
        addNewPageIfNeeded(20);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(245, 158, 11);
        doc.text(text, margin, y);
        y += size * 0.5;
      };

      const addSubtitle = (text: string, size: number = 14) => {
        addNewPageIfNeeded(15);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(text, margin, y);
        y += size * 0.4;
      };

      const addParagraph = (text: string, size: number = 10) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(text, contentWidth);
        lines.forEach((line: string) => {
          addNewPageIfNeeded(8);
          doc.text(line, margin, y);
          y += size * 0.5;
        });
      };

      const addBullet = (text: string) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(text, contentWidth - 8);
        lines.forEach((line: string, idx: number) => {
          addNewPageIfNeeded(7);
          if (idx === 0) {
            doc.text('•', margin, y);
          }
          doc.text(line, margin + 6, y);
          y += 5;
        });
      };

      const addSpacer = (space: number = 8) => {
        y += space;
      };

      // Group opportunities by sector
      const groupedOpportunities: Record<string, Opportunity[]> = {};
      (opportunities || []).forEach((opp: any) => {
        let sector = 'geral';
        const code = opp.code || '';
        if (code.startsWith('AGRO')) sector = 'agro';
        else if (code.startsWith('SOLAR')) sector = 'energia';
        else if (code.startsWith('SAUDE')) sector = 'saude';
        else if (code.startsWith('CONST')) sector = 'construcao';
        else if (code.startsWith('TRANSP')) sector = 'transporte';
        else if (code.startsWith('ALIM')) sector = 'alimentacao';
        else if (code.startsWith('ECOM')) sector = 'ecommerce';
        else if (code.startsWith('EDUC')) sector = 'educacao';
        
        if (!groupedOpportunities[sector]) groupedOpportunities[sector] = [];
        groupedOpportunities[sector].push(opp);
      });

      // ============================================
      // CAPA
      // ============================================
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Logo placeholder (golden circle)
      doc.setFillColor(245, 158, 11);
      doc.circle(pageWidth / 2, 60, 20, 'F');
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 10, 10);
      doc.text('T', pageWidth / 2 - 6, 67);

      // Title
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('Motor de Oportunidades', pageWidth / 2, 110, { align: 'center' });
      doc.text('Tributárias', pageWidth / 2, 125, { align: 'center' });

      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('Documentação Técnica e Comercial', pageWidth / 2, 145, { align: 'center' });

      // Stats
      doc.setFontSize(14);
      doc.setTextColor(180, 180, 180);
      const totalOpps = opportunities?.length || 0;
      doc.text(`${totalOpps} Benefícios Fiscais Setoriais`, pageWidth / 2, 170, { align: 'center' });
      doc.text('Matching Automático com Perfil da Empresa', pageWidth / 2, 182, { align: 'center' });

      // Footer
      doc.setFontSize(11);
      doc.setTextColor(120, 120, 120);
      doc.text('TribuTech - Inteligência Tributária', pageWidth / 2, 260, { align: 'center' });
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 270, { align: 'center' });

      // ============================================
      // RESUMO EXECUTIVO
      // ============================================
      doc.addPage();
      y = margin;

      addTitle('📊 Resumo Executivo', 20);
      addSpacer(10);

      addParagraph('O Motor de Oportunidades Tributárias da TribuTech identifica automaticamente benefícios fiscais aplicáveis à sua empresa com base no perfil cadastrado. São mais de 50 oportunidades de economia tributária organizadas por setor de atuação.');
      addSpacer(8);

      // Summary table
      addSubtitle('Oportunidades por Setor');
      addSpacer(5);

      const sectors = Object.entries(groupedOpportunities);
      sectors.forEach(([sector, opps]) => {
        const config = SECTOR_CONFIG[sector] || SECTOR_CONFIG.geral;
        const minEconomia = Math.min(...opps.map(o => o.economia_percentual_min || 0));
        const maxEconomia = Math.max(...opps.map(o => o.economia_percentual_max || 0));
        addBullet(`${config.icon} ${config.title}: ${opps.length} oportunidades | Economia: ${minEconomia}-${maxEconomia}%`);
      });

      addSpacer(12);
      addSubtitle('Proposta de Valor');
      addParagraph('• Identificação automática baseada no perfil da empresa');
      addParagraph('• Cálculo de economia estimada em reais');
      addParagraph('• Classificação por risco fiscal e complexidade');
      addParagraph('• Base legal atualizada para cada oportunidade');
      addParagraph('• Playbooks para implementação com contador');

      // ============================================
      // ARQUITETURA TÉCNICA
      // ============================================
      doc.addPage();
      y = margin;

      addTitle('🏗️ Arquitetura do Sistema', 20);
      addSpacer(10);

      addSubtitle('Fluxo de Dados');
      addSpacer(5);
      addParagraph('1. Wizard de Perfil → Coleta dados da empresa em 6 etapas');
      addParagraph('2. Banco de Dados → Armazena perfil em company_profile');
      addParagraph('3. Edge Function → match-opportunities processa critérios');
      addParagraph('4. Matching Engine → Avalia 50+ oportunidades vs perfil');
      addParagraph('5. Dashboard → Exibe resultados com economia estimada');
      addSpacer(8);

      addSubtitle('Stack Tecnológico');
      addBullet('Frontend: React + TypeScript + Tailwind CSS');
      addBullet('Backend: Supabase (PostgreSQL + Edge Functions)');
      addBullet('IA: Google Gemini para análises avançadas');
      addBullet('Hospedagem: Lovable Cloud');
      addSpacer(8);

      addSubtitle('Tabelas Principais');
      addBullet('company_profile: Dados da empresa (45+ campos setoriais)');
      addBullet('tax_opportunities: Catálogo de benefícios (50+ registros)');
      addBullet('company_opportunities: Oportunidades identificadas por usuário');
      addSpacer(8);

      addSubtitle('Operadores de Matching');
      addBullet('_in: Verifica se valor está em lista (ex: setor IN [agro, construcao])');
      addBullet('_min: Valor mínimo (ex: faturamento_anual >= 1000000)');
      addBullet('_max: Valor máximo (ex: funcionarios <= 100)');
      addBullet('Boolean: Campos true/false diretos');

      // ============================================
      // DETALHAMENTO POR SETOR
      // ============================================
      const sectorOrder = ['agro', 'energia', 'saude', 'construcao', 'transporte', 'alimentacao', 'ecommerce', 'educacao', 'geral'];

      sectorOrder.forEach((sectorKey) => {
        const opps = groupedOpportunities[sectorKey];
        if (!opps || opps.length === 0) return;

        const config = SECTOR_CONFIG[sectorKey] || SECTOR_CONFIG.geral;

        doc.addPage();
        y = margin;

        // Sector header with colored bar
        doc.setFillColor(...config.color);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${config.icon} ${config.title}`, margin, 24);

        doc.setFontSize(12);
        doc.text(`${opps.length} oportunidades de economia tributária`, margin, 32);

        y = 50;

        opps.forEach((opp, idx) => {
          addNewPageIfNeeded(45);

          // Opportunity header
          doc.setFillColor(245, 245, 245);
          doc.rect(margin - 2, y - 5, contentWidth + 4, 8, 'F');
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...config.color);
          doc.text(`${opp.code}`, margin, y);
          doc.setTextColor(40, 40, 40);
          doc.text(opp.name_simples || opp.code, margin + 25, y);
          y += 8;

          // Economy badge
          const econMin = opp.economia_percentual_min || 0;
          const econMax = opp.economia_percentual_max || 0;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 139, 34);
          doc.text(`💰 Economia: ${econMin}-${econMax}%`, margin, y);

          // Complexity
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          const complexidade = opp.complexidade || 'média';
          const tempo = opp.tempo_implementacao || '30-60 dias';
          doc.text(`| ⏱️ ${tempo} | 📊 ${complexidade}`, margin + 55, y);
          y += 6;

          // CEO Description
          if (opp.description_ceo) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const lines = doc.splitTextToSize(opp.description_ceo, contentWidth);
            lines.slice(0, 2).forEach((line: string) => {
              doc.text(line, margin, y);
              y += 4;
            });
          }

          // Legal base
          if (opp.base_legal) {
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.setFont('helvetica', 'italic');
            doc.text(`📜 ${opp.base_legal}`, margin, y);
            y += 5;
          }

          // Tributes affected
          if (opp.tributos_afetados && opp.tributos_afetados.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text(`Tributos: ${opp.tributos_afetados.join(', ')}`, margin, y);
            y += 4;
          }

          y += 6;
        });
      });

      // ============================================
      // WIZARD DE PERFIL
      // ============================================
      doc.addPage();
      y = margin;

      addTitle('🧙 Wizard de Perfil Empresarial', 20);
      addSpacer(10);

      addParagraph('O perfil da empresa é coletado em 6 etapas estruturadas, garantindo dados completos para o matching preciso de oportunidades tributárias.');
      addSpacer(8);

      const steps = [
        { num: 1, title: 'Setor de Atuação', desc: 'Agronegócio, Comércio, Indústria, Serviços, Construção, Saúde, Educação, etc.' },
        { num: 2, title: 'Porte e Faturamento', desc: 'Faturamento anual, número de funcionários, CNPJs do grupo' },
        { num: 3, title: 'Produtos e Serviços', desc: 'Mix de produtos/serviços, produtos monofásicos, atividades mistas' },
        { num: 4, title: 'Clientes e Canais', desc: 'Vendas B2B/B2C/Governo, e-commerce, marketplace, loja física' },
        { num: 5, title: 'Estrutura Societária', desc: 'Regime tributário, holding, filiais, tipo societário' },
        { num: 6, title: 'Características Setoriais', desc: 'Perguntas específicas por setor (ex: área preservada no agro)' }
      ];

      steps.forEach((step) => {
        addNewPageIfNeeded(20);
        doc.setFillColor(245, 158, 11);
        doc.circle(margin + 5, y - 2, 4, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(10, 10, 10);
        doc.text(step.num.toString(), margin + 3.5, y);

        doc.setTextColor(40, 40, 40);
        doc.text(step.title, margin + 14, y);
        y += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(step.desc, margin + 14, y);
        y += 10;
      });

      addSpacer(8);
      addSubtitle('Campos Setoriais Adicionados');
      addParagraph('A partir de Janeiro/2026, o wizard coleta 45+ campos específicos por setor para matching preciso:');
      addBullet('Agro: área preservada, commodities, insumos, cooperativa');
      addBullet('Energia: geração solar, potência kW, projetos infraestrutura');
      addBullet('Saúde: internação, procedimentos complexos, P&D');
      addBullet('Construção: incorporação, patrimônio afetação, MCMV');
      addBullet('Transporte: cargas/passageiros, frota, exportação');
      addBullet('Alimentação: preparo alimentos, gorjetas, delivery');
      addBullet('E-commerce: CD incentivado, ZFM, monofásicos');
      addBullet('Educação: tipo instituição, fins lucrativos, tecnologia');

      // ============================================
      // LÓGICA DE MATCHING
      // ============================================
      doc.addPage();
      y = margin;

      addTitle('🎯 Algoritmo de Matching', 20);
      addSpacer(10);

      addSubtitle('Pseudocódigo');
      addSpacer(5);

      const pseudocode = [
        'PARA cada oportunidade no catálogo:',
        '  SE oportunidade.is_active = false: PULAR',
        '  ',
        '  score = 0',
        '  criterios_atendidos = []',
        '  criterios_faltantes = []',
        '  ',
        '  PARA cada criterio em oportunidade.criterios:',
        '    SE criterio tem operador _in:',
        '      SE perfil[campo] IN criterio.valores: score += peso',
        '    SE criterio tem operador _min:',
        '      SE perfil[campo] >= criterio.valor: score += peso',
        '    SE criterio é booleano:',
        '      SE perfil[campo] = true: score += peso',
        '  ',
        '  SE score >= 70: ADICIONAR às oportunidades do usuário',
        '  ',
        '  economia_min = faturamento * economia_percentual_min / 100',
        '  economia_max = faturamento * economia_percentual_max / 100'
      ];

      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.setTextColor(60, 60, 60);
      pseudocode.forEach((line) => {
        addNewPageIfNeeded(5);
        doc.text(line, margin, y);
        y += 4.5;
      });

      addSpacer(10);
      addSubtitle('Classificação de Resultados');
      addBullet('Quick Wins: Economia alta + Complexidade baixa + Risco baixo');
      addBullet('Alto Impacto: Economia > R$ 50k/ano');
      addBullet('Por prioridade: Score de matching descendente');

      // ============================================
      // ROADMAP 2026
      // ============================================
      doc.addPage();
      y = margin;

      addTitle('🗺️ Roadmap 2026', 20);
      addSpacer(10);

      const roadmap = [
        { q: 'Q1', title: 'Campos Setoriais', desc: 'Adicionar 45+ campos específicos no company_profile para matching preciso' },
        { q: 'Q2', title: 'Matching por NCM', desc: 'Integrar análise de XMLs para identificar produtos monofásicos automaticamente' },
        { q: 'Q3', title: 'Dashboard Executivo', desc: 'ROI por oportunidade, timeline de implementação, alertas de validade' },
        { q: 'Q4', title: 'Playbooks Automáticos', desc: 'Gerar pauta para contador e 1-pager para diretoria por oportunidade' }
      ];

      roadmap.forEach((item) => {
        addNewPageIfNeeded(25);
        doc.setFillColor(245, 158, 11);
        doc.roundedRect(margin, y - 4, 20, 10, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(10, 10, 10);
        doc.text(item.q, margin + 5, y + 2);

        doc.setTextColor(40, 40, 40);
        doc.text(item.title, margin + 26, y + 2);
        y += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize(item.desc, contentWidth - 26);
        lines.forEach((line: string) => {
          doc.text(line, margin + 26, y);
          y += 4;
        });
        y += 8;
      });

      addSpacer(10);
      addSubtitle('Integrações Planejadas');
      addBullet('ERPs: Omie, Bling, Tiny, Sankhya (leitura automática de dados)');
      addBullet('SPED: Importação de EFD-Contribuições e EFD-ICMS/IPI');
      addBullet('Contabilidade: Conexão com sistemas contábeis para validação');

      // ============================================
      // FONTES E BASE LEGAL
      // ============================================
      doc.addPage();
      y = margin;

      addTitle('📜 Fontes e Base Legal', 20);
      addSpacer(10);

      const sources = [
        { sector: 'Agronegócio', refs: 'Lei 13.606/2018, Lei 9.393/96, Convênio ICMS 100/97, Lei 5.764/71' },
        { sector: 'Energia Solar', refs: 'Convênio ICMS 16/2015, Decreto 8.950/2016, Lei 11.488/07' },
        { sector: 'Saúde', refs: 'Lei 9.249/95, IN RFB 1.234/12, Lei 10.147/00, Lei 11.196/05' },
        { sector: 'Construção Civil', refs: 'Lei 10.931/04, Lei 12.024/09, Lei 12.546/11' },
        { sector: 'Transporte', refs: 'Convênio ICMS 106/96, Lei 14.789/2023, LC 123/06, Lei 10.833/03' },
        { sector: 'Alimentação', refs: 'Decreto 51.597/07 (SP), LC 214/2025, LC 123/06' },
        { sector: 'E-commerce', refs: 'TTD-SC, Compete-ES, Produzir-GO, Lei 10.147/00, Decreto-Lei 288/67' },
        { sector: 'Educação', refs: 'LC 214/2025, CF/88 Art. 150 VI, LC 123/06, Lei 11.196/05' }
      ];

      sources.forEach((src) => {
        addNewPageIfNeeded(15);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(src.sector, margin, y);
        y += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize(src.refs, contentWidth);
        lines.forEach((line: string) => {
          doc.text(line, margin, y);
          y += 4;
        });
        y += 6;
      });

      addSpacer(15);
      addSubtitle('Portais de Referência');
      addBullet('Portal Canal Rural, Embrapa, CNA Brasil');
      addBullet('ABSOLAR, Portal Solar');
      addBullet('CFM, CRM, CBIC, SINDUSCON');
      addBullet('CNT, ANTT, ANR Brasil');
      addBullet('E-Commerce Brasil, TOTVS');

      // ============================================
      // CONTRACAPA
      // ============================================
      doc.addPage();
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('TribuTech', pageWidth / 2, 100, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('Inteligência Tributária para', pageWidth / 2, 120, { align: 'center' });
      doc.text('Empresas que Crescem', pageWidth / 2, 132, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(180, 180, 180);
      doc.text('contato@tributech.ai', pageWidth / 2, 160, { align: 'center' });
      doc.text('https://tributechai.lovable.app', pageWidth / 2, 172, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })}`, pageWidth / 2, 250, { align: 'center' });

      // Save PDF
      doc.save('TribuTech_Motor_Oportunidades_Tributarias.pdf');

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePdf}
      disabled={generating}
      size="lg"
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      {generating ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5 mr-2" />
          Baixar PDF Completo
        </>
      )}
    </Button>
  );
}
