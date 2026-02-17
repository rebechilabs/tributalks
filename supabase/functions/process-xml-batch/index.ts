import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NFeProduto {
  numero: number;
  ncm: string;
  cfop: string;
  cst_icms: string;
  cst_pis: string;
  cst_cofins: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  icms_st: number;
  credito_icms: number;
  credito_pis: number;
  credito_cofins: number;
}

interface NFeData {
  tipo: 'NFe' | 'NFSe' | 'CTe';
  numero: string;
  serie: string;
  chaveNfe: string;
  dataEmissao: string;
  naturezaOperacao: string;
  tipoOperacao: string;
  finalidadeNfe: string;
  emitenteNome: string;
  emitenteCnpj: string;
  emitenteUf: string;
  emitenteMunicipio: string;
  destinatarioNome: string;
  destinatarioCnpj: string;
  destinatarioUf: string;
  produtos: NFeProduto[];
  totalProdutos: number;
  totalIcms: number;
  totalPis: number;
  totalCofins: number;
  totalIpi: number;
  totalIcmsSt: number;
  totalFrete: number;
  totalNota: number;
}

interface ParsedXmlForCredits {
  chave_nfe: string;
  numero: string;
  data_emissao: string;
  cnpj_emitente: string;
  nome_emitente: string;
  itens: {
    ncm: string;
    cfop: string;
    cst_pis: string;
    cst_cofins: string;
    cst_icms: string;
    valor_pis: number;
    valor_cofins: number;
    valor_icms: number;
    valor_ipi: number;
    valor_icms_st: number;
    credito_pis: number;
    credito_cofins: number;
    credito_icms: number;
    valor_item: number;
    descricao: string;
    is_monophasic?: boolean;
    monophasic_category?: string;
  }[];
}

// NCMs monofásicos - PIS/COFINS recolhido na indústria
const MONOPHASIC_NCMS: Record<string, { category: string; legal_basis: string }> = {
  // Combustíveis - Lei 11.116/2005
  '2710': { category: 'Combustíveis', legal_basis: 'Lei 11.116/2005' },
  '2207': { category: 'Combustíveis', legal_basis: 'Lei 11.116/2005' },
  // Medicamentos - Lei 10.147/2000
  '3003': { category: 'Medicamentos', legal_basis: 'Lei 10.147/2000' },
  '3004': { category: 'Medicamentos', legal_basis: 'Lei 10.147/2000' },
  // Cosméticos - Lei 10.147/2000
  '3303': { category: 'Cosméticos', legal_basis: 'Lei 10.147/2000' },
  '3304': { category: 'Cosméticos', legal_basis: 'Lei 10.147/2000' },
  '3305': { category: 'Cosméticos', legal_basis: 'Lei 10.147/2000' },
  // Bebidas Frias - Lei 13.097/2015
  '2201': { category: 'Bebidas Frias', legal_basis: 'Lei 13.097/2015' },
  '2202': { category: 'Bebidas Frias', legal_basis: 'Lei 13.097/2015' },
  '2203': { category: 'Bebidas Frias', legal_basis: 'Lei 13.097/2015' },
  '2204': { category: 'Bebidas Frias', legal_basis: 'Lei 13.097/2015' },
  // Autopeças - Lei 10.485/2002
  '8708': { category: 'Autopeças', legal_basis: 'Lei 10.485/2002' },
  '4011': { category: 'Pneus', legal_basis: 'Lei 10.485/2002' },
  '8507': { category: 'Baterias', legal_basis: 'Lei 10.485/2002' },
};

function isMonophasicNCM(ncm: string): boolean {
  if (!ncm) return false;
  const prefix = ncm.substring(0, 4);
  return MONOPHASIC_NCMS.hasOwnProperty(prefix);
}

function getMonophasicCategory(ncm: string): string | null {
  if (!ncm) return null;
  const prefix = ncm.substring(0, 4);
  return MONOPHASIC_NCMS[prefix]?.category || null;
}

function parseNFeXML(xmlContent: string): NFeData | null {
  try {
    // Parse NFe XML structure
    const tipo = xmlContent.includes('<NFe') ? 'NFe' : 
                 xmlContent.includes('<NFS') ? 'NFSe' : 
                 xmlContent.includes('<CTe') ? 'CTe' : 'NFe';

    // Extract chave NFe
    const chaveMatch = xmlContent.match(/Id="NFe(\d{44})"/i) ||
                       xmlContent.match(/<chNFe>(\d{44})<\/chNFe>/i);
    const chaveNfe = chaveMatch ? chaveMatch[1] : '';

    // Parse emitente
    const emitenteMatch = xmlContent.match(/<emit>([\s\S]*?)<\/emit>/i);
    const emitenteBlock = emitenteMatch ? emitenteMatch[1] : '';
    
    const emitenteNome = emitenteBlock.match(/<xNome>([^<]*)<\/xNome>/i)?.[1] || '';
    const emitenteCnpj = emitenteBlock.match(/<CNPJ>([^<]*)<\/CNPJ>/i)?.[1] || '';
    const emitenteEnderMatch = emitenteBlock.match(/<enderEmit>([\s\S]*?)<\/enderEmit>/i);
    const emitenteEnderBlock = emitenteEnderMatch ? emitenteEnderMatch[1] : '';
    const emitenteUf = emitenteEnderBlock.match(/<UF>([^<]*)<\/UF>/i)?.[1] || '';
    const emitenteMunicipio = emitenteEnderBlock.match(/<xMun>([^<]*)<\/xMun>/i)?.[1] || '';

    // Parse destinatario
    const destMatch = xmlContent.match(/<dest>([\s\S]*?)<\/dest>/i);
    const destBlock = destMatch ? destMatch[1] : '';
    
    const destinatarioNome = destBlock.match(/<xNome>([^<]*)<\/xNome>/i)?.[1] || '';
    const destinatarioCnpj = destBlock.match(/<CNPJ>([^<]*)<\/CNPJ>/i)?.[1] || 
                            destBlock.match(/<CPF>([^<]*)<\/CPF>/i)?.[1] || '';
    const destEnderMatch = destBlock.match(/<enderDest>([\s\S]*?)<\/enderDest>/i);
    const destEnderBlock = destEnderMatch ? destEnderMatch[1] : '';
    const destinatarioUf = destEnderBlock.match(/<UF>([^<]*)<\/UF>/i)?.[1] || '';

    // Parse identificação
    const ideBlock = xmlContent.match(/<ide>([\s\S]*?)<\/ide>/i)?.[1] || '';
    const numeroNota = ideBlock.match(/<nNF>([^<]*)<\/nNF>/i)?.[1] || '';
    const serie = ideBlock.match(/<serie>([^<]*)<\/serie>/i)?.[1] || '';
    const dataEmissao = ideBlock.match(/<dhEmi>([^<]*)<\/dhEmi>/i)?.[1] || 
                       ideBlock.match(/<dEmi>([^<]*)<\/dEmi>/i)?.[1] || '';
    const naturezaOperacao = ideBlock.match(/<natOp>([^<]*)<\/natOp>/i)?.[1] || '';
    const tipoOperacao = ideBlock.match(/<tpNF>([^<]*)<\/tpNF>/i)?.[1] || ''; // 0=entrada, 1=saida
    const finalidadeNfe = ideBlock.match(/<finNFe>([^<]*)<\/finNFe>/i)?.[1] || ''; // 1=normal, 4=devolucao

    // Parse produtos
    const produtosMatches = xmlContent.matchAll(/<det[^>]*>([\s\S]*?)<\/det>/gi);
    const produtos: NFeProduto[] = [];
    let numero = 0;

    for (const match of produtosMatches) {
      numero++;
      const detBlock = match[1];
      
      const prodBlock = detBlock.match(/<prod>([\s\S]*?)<\/prod>/i)?.[1] || '';
      
      const ncm = prodBlock.match(/<NCM>([^<]*)<\/NCM>/i)?.[1] || '00000000';
      const cfop = prodBlock.match(/<CFOP>([^<]*)<\/CFOP>/i)?.[1] || '';
      const descricao = prodBlock.match(/<xProd>([^<]*)<\/xProd>/i)?.[1] || '';
      const quantidade = parseFloat(prodBlock.match(/<qCom>([^<]*)<\/qCom>/i)?.[1] || '0');
      const unidade = prodBlock.match(/<uCom>([^<]*)<\/uCom>/i)?.[1] || 'UN';
      const valorUnitario = parseFloat(prodBlock.match(/<vUnCom>([^<]*)<\/vUnCom>/i)?.[1] || '0');
      const valorTotal = parseFloat(prodBlock.match(/<vProd>([^<]*)<\/vProd>/i)?.[1] || '0');

      // Parse impostos
      const impostoBlock = detBlock.match(/<imposto>([\s\S]*?)<\/imposto>/i)?.[1] || '';
      
      // ICMS - parse all variants (ICMS00, ICMS10, ICMS20, etc)
      const icmsBlock = impostoBlock.match(/<ICMS>([\s\S]*?)<\/ICMS>/i)?.[1] || '';
      const icmsInnerBlock = icmsBlock.match(/<ICMS\d{2}>([\s\S]*?)<\/ICMS\d{2}>/i)?.[1] || 
                             icmsBlock.match(/<ICMSSN\d{3}>([\s\S]*?)<\/ICMSSN\d{3}>/i)?.[1] || '';
      const icms = parseFloat(icmsInnerBlock.match(/<vICMS>([^<]*)<\/vICMS>/i)?.[1] || '0');
      const cst_icms = icmsInnerBlock.match(/<CST>([^<]*)<\/CST>/i)?.[1] || 
                       icmsInnerBlock.match(/<CSOSN>([^<]*)<\/CSOSN>/i)?.[1] || '';
      const icms_st = parseFloat(icmsInnerBlock.match(/<vICMSST>([^<]*)<\/vICMSST>/i)?.[1] || '0');
      
      // For credit analysis, check if there's a credit field or assume based on CST
      const credito_icms = 0; // Will be determined by business rules

      // PIS
      const pisBlock = impostoBlock.match(/<PIS>([\s\S]*?)<\/PIS>/i)?.[1] || '';
      const pisInnerBlock = pisBlock.match(/<PISAliq>([\s\S]*?)<\/PISAliq>/i)?.[1] || 
                           pisBlock.match(/<PISNT>([\s\S]*?)<\/PISNT>/i)?.[1] ||
                           pisBlock.match(/<PISOutr>([\s\S]*?)<\/PISOutr>/i)?.[1] || '';
      const pis = parseFloat(pisInnerBlock.match(/<vPIS>([^<]*)<\/vPIS>/i)?.[1] || '0');
      const cst_pis = pisInnerBlock.match(/<CST>([^<]*)<\/CST>/i)?.[1] || '';
      const credito_pis = 0; // Will be determined by business rules

      // COFINS
      const cofinsBlock = impostoBlock.match(/<COFINS>([\s\S]*?)<\/COFINS>/i)?.[1] || '';
      const cofinsInnerBlock = cofinsBlock.match(/<COFINSAliq>([\s\S]*?)<\/COFINSAliq>/i)?.[1] || 
                               cofinsBlock.match(/<COFINSNT>([\s\S]*?)<\/COFINSNT>/i)?.[1] ||
                               cofinsBlock.match(/<COFINSOutr>([\s\S]*?)<\/COFINSOutr>/i)?.[1] || '';
      const cofins = parseFloat(cofinsInnerBlock.match(/<vCOFINS>([^<]*)<\/vCOFINS>/i)?.[1] || '0');
      const cst_cofins = cofinsInnerBlock.match(/<CST>([^<]*)<\/CST>/i)?.[1] || '';
      const credito_cofins = 0; // Will be determined by business rules

      // IPI
      const ipiBlock = impostoBlock.match(/<IPI>([\s\S]*?)<\/IPI>/i)?.[1] || '';
      const ipiTribBlock = ipiBlock.match(/<IPITrib>([\s\S]*?)<\/IPITrib>/i)?.[1] || '';
      const ipi = parseFloat(ipiTribBlock.match(/<vIPI>([^<]*)<\/vIPI>/i)?.[1] || '0');

      produtos.push({
        numero,
        ncm,
        cfop,
        cst_icms,
        cst_pis,
        cst_cofins,
        descricao,
        quantidade,
        unidade,
        valorUnitario,
        valorTotal,
        icms,
        pis,
        cofins,
        ipi,
        icms_st,
        credito_icms,
        credito_pis,
        credito_cofins
      });
    }

    // Parse totais
    const totalBlock = xmlContent.match(/<total>([\s\S]*?)<\/total>/i)?.[1] || '';
    const icmsTotBlock = totalBlock.match(/<ICMSTot>([\s\S]*?)<\/ICMSTot>/i)?.[1] || '';
    
    const totalProdutos = parseFloat(icmsTotBlock.match(/<vProd>([^<]*)<\/vProd>/i)?.[1] || '0');
    const totalIcms = parseFloat(icmsTotBlock.match(/<vICMS>([^<]*)<\/vICMS>/i)?.[1] || '0');
    const totalPis = parseFloat(icmsTotBlock.match(/<vPIS>([^<]*)<\/vPIS>/i)?.[1] || '0');
    const totalCofins = parseFloat(icmsTotBlock.match(/<vCOFINS>([^<]*)<\/vCOFINS>/i)?.[1] || '0');
    const totalIpi = parseFloat(icmsTotBlock.match(/<vIPI>([^<]*)<\/vIPI>/i)?.[1] || '0');
    const totalIcmsSt = parseFloat(icmsTotBlock.match(/<vST>([^<]*)<\/vST>/i)?.[1] || '0');
    const totalFrete = parseFloat(icmsTotBlock.match(/<vFrete>([^<]*)<\/vFrete>/i)?.[1] || '0');
    const totalNota = parseFloat(icmsTotBlock.match(/<vNF>([^<]*)<\/vNF>/i)?.[1] || '0');

    return {
      tipo,
      numero: numeroNota,
      serie,
      chaveNfe,
      dataEmissao,
      naturezaOperacao,
      tipoOperacao,
      finalidadeNfe,
      emitenteNome,
      emitenteCnpj,
      emitenteUf,
      emitenteMunicipio,
      destinatarioNome,
      destinatarioCnpj,
      destinatarioUf,
      produtos,
      totalProdutos,
      totalIcms,
      totalPis,
      totalCofins,
      totalIpi,
      totalIcmsSt,
      totalFrete,
      totalNota
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

function convertToCreditsFormat(nfeData: NFeData): ParsedXmlForCredits {
  return {
    chave_nfe: nfeData.chaveNfe,
    numero: nfeData.numero,
    data_emissao: nfeData.dataEmissao,
    cnpj_emitente: nfeData.emitenteCnpj,
    nome_emitente: nfeData.emitenteNome,
    itens: nfeData.produtos.map(prod => {
      const isMonophasic = isMonophasicNCM(prod.ncm);
      const monophasicCategory = getMonophasicCategory(prod.ncm);
      
      return {
        ncm: prod.ncm,
        cfop: prod.cfop,
        cst_pis: prod.cst_pis,
        cst_cofins: prod.cst_cofins,
        cst_icms: prod.cst_icms,
        valor_pis: prod.pis,
        valor_cofins: prod.cofins,
        valor_icms: prod.icms,
        valor_ipi: prod.ipi,
        valor_icms_st: prod.icms_st,
        credito_pis: prod.credito_pis,
        credito_cofins: prod.credito_cofins,
        credito_icms: prod.credito_icms,
        valor_item: prod.valorTotal,
        descricao: prod.descricao,
        is_monophasic: isMonophasic,
        monophasic_category: monophasicCategory || undefined,
      };
    })
  };
}

async function calculateReformTaxes(nfeData: NFeData, supabaseUrl: string, supabaseKey: string): Promise<any> {
  try {
    // Build items for RTC API
    const items = nfeData.produtos.map((prod, index) => ({
      numero: index + 1,
      ncm: prod.ncm.padEnd(8, '0').substring(0, 8),
      quantidade: prod.quantidade,
      unidade: prod.unidade,
      cst: '000',
      baseCalculo: prod.valorTotal,
      cClassTrib: '000001'
    }));

    // Get municipality code (simplified - would need proper lookup)
    const municipio = 3550308; // São Paulo as default
    const uf = nfeData.emitenteUf || 'SP';

    // Call the calculate-rtc function
    const response = await fetch(`${supabaseUrl}/functions/v1/calculate-rtc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ municipio, uf, itens: items })
    });

    if (response.ok) {
      return await response.json();
    }
    
    // Fallback: estimate using standard rates
    const baseCalculo = nfeData.totalProdutos;
    return {
      success: true,
      data: {
        totais: {
          cbs: baseCalculo * 0.088, // 8.8% CBS
          ibsUf: baseCalculo * 0.0965, // 9.65% IBS UF  
          ibsMun: baseCalculo * 0.0535, // 5.35% IBS Mun
          is: 0
        }
      },
      simulated: true
    };
  } catch (error) {
    console.error('Error calculating reform taxes:', error);
    // Return estimated values
    const baseCalculo = nfeData.totalProdutos;
    return {
      success: true,
      data: {
        totais: {
          cbs: baseCalculo * 0.088,
          ibsUf: baseCalculo * 0.0965,
          ibsMun: baseCalculo * 0.0535,
          is: 0
        }
      },
      simulated: true
    };
  }
}

async function triggerCreditAnalysis(
  parsedXmls: ParsedXmlForCredits[], 
  supabaseUrl: string, 
  authToken: string,
  xmlImportId?: string,
  userId?: string
): Promise<any> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/analyze-credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ 
        xml_import_id: xmlImportId,
        parsed_xmls: parsedXmls,
        user_id: userId
      })
    });

    if (response.ok) {
      return await response.json();
    }
    
    console.error('Credit analysis failed:', await response.text());
    return null;
  } catch (error) {
    console.error('Error triggering credit analysis:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { importIds } = await req.json();

    if (!importIds || !Array.isArray(importIds) || importIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'IDs de importação não fornecidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    const errors = [];
    const parsedXmlsForCredits: ParsedXmlForCredits[] = [];

    for (const importId of importIds) {
      try {
        // Get import record
        const { data: importRecord, error: importError } = await supabase
          .from('xml_imports')
          .select('*')
          .eq('id', importId)
          .eq('user_id', user.id)
          .single();

        if (importError || !importRecord) {
          errors.push({ importId, error: 'Registro não encontrado' });
          continue;
        }

        // Download XML from storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('xml-imports')
          .download(importRecord.file_path);

        if (fileError || !fileData) {
          await supabase
            .from('xml_imports')
            .update({ status: 'ERROR', error_message: 'Erro ao baixar arquivo' })
            .eq('id', importId);
          errors.push({ importId, error: 'Erro ao baixar arquivo' });
          continue;
        }

        // Parse XML
        const xmlContent = await fileData.text();
        const nfeData = parseNFeXML(xmlContent);

        if (!nfeData) {
          await supabase
            .from('xml_imports')
            .update({ status: 'ERROR', error_message: 'Erro ao processar XML' })
            .eq('id', importId);
          errors.push({ importId, error: 'Erro ao processar XML' });
          continue;
        }

        // Convert to credits format for later analysis
        const creditsFormat = convertToCreditsFormat(nfeData);
        parsedXmlsForCredits.push(creditsFormat);

        // Calculate current taxes total
        const currentTaxTotal = nfeData.totalIcms + nfeData.totalPis + nfeData.totalCofins + nfeData.totalIpi;

        // Calculate reform taxes
        const reformResult = await calculateReformTaxes(nfeData, supabaseUrl, supabaseKey);
        const reformTaxes = reformResult.data?.totais || { cbs: 0, ibsUf: 0, ibsMun: 0, is: 0 };
        const reformTaxTotal = (reformTaxes.cbs || 0) + (reformTaxes.ibsUf || 0) + (reformTaxes.ibsMun || 0) + (reformTaxes.is || 0);

        // Calculate difference
        const differenceValue = reformTaxTotal - currentTaxTotal;
        const differencePercent = currentTaxTotal > 0 ? ((differenceValue / currentTaxTotal) * 100) : 0;

        // Save analysis
        const { data: analysis, error: analysisError } = await supabase
          .from('xml_analysis')
          .insert({
            user_id: user.id,
            import_id: importId,
            xml_type: nfeData.tipo,
            document_number: nfeData.numero,
            document_series: nfeData.serie,
            issue_date: nfeData.dataEmissao ? new Date(nfeData.dataEmissao).toISOString() : null,
            issuer_cnpj: nfeData.emitenteCnpj,
            issuer_name: nfeData.emitenteNome,
            recipient_cnpj: nfeData.destinatarioCnpj,
            recipient_name: nfeData.destinatarioNome,
            items_count: nfeData.produtos.length,
            document_total: nfeData.totalNota,
            current_tax_total: currentTaxTotal,
            reform_tax_total: reformTaxTotal,
            difference_value: differenceValue,
            difference_percent: differencePercent,
            raw_data: nfeData,
            analysis_data: reformResult.data,
            current_taxes: {
              icms: nfeData.totalIcms,
              pis: nfeData.totalPis,
              cofins: nfeData.totalCofins,
              ipi: nfeData.totalIpi,
              icms_st: nfeData.totalIcmsSt,
              frete: nfeData.totalFrete,
              total: currentTaxTotal
            },
            reform_taxes: {
              cbs: reformTaxes.cbs,
              ibsUf: reformTaxes.ibsUf,
              ibsMun: reformTaxes.ibsMun,
              is: reformTaxes.is,
              total: reformTaxTotal
            }
          })
          .select()
          .single();

        if (analysisError) {
          await supabase
            .from('xml_imports')
            .update({ status: 'ERROR', error_message: 'Erro ao salvar análise' })
            .eq('id', importId);
          errors.push({ importId, error: 'Erro ao salvar análise' });
          continue;
        }

        // Update import status
        await supabase
          .from('xml_imports')
          .update({ status: 'COMPLETED', processed_at: new Date().toISOString() })
          .eq('id', importId);

        results.push({
          importId,
          analysisId: analysis.id,
          documentNumber: nfeData.numero,
          documentType: nfeData.tipo,
          currentTaxTotal,
          reformTaxTotal,
          differenceValue,
          differencePercent,
          isBeneficial: differenceValue < 0,
          itemsCount: nfeData.produtos.length,
          // New metadata fields for summary
          issuerName: nfeData.emitenteNome,
          issuerCnpj: nfeData.emitenteCnpj,
          documentTotal: nfeData.totalNota,
          issueDate: nfeData.dataEmissao
        });

      } catch (error) {
        console.error(`Error processing import ${importId}:`, error);
        await supabase
          .from('xml_imports')
          .update({ status: 'ERROR', error_message: String(error) })
          .eq('id', importId);
        errors.push({ importId, error: String(error) });
      }
    }

    // After processing all XMLs, trigger credit analysis
    let creditAnalysisResult = null;
    if (parsedXmlsForCredits.length > 0) {
      console.log(`Triggering credit analysis for ${parsedXmlsForCredits.length} XMLs...`);
      creditAnalysisResult = await triggerCreditAnalysis(
        parsedXmlsForCredits, 
        supabaseUrl, 
        supabaseKey,
        importIds.length === 1 ? importIds[0] : undefined,
        user.id
      );
      console.log('Credit analysis result:', creditAnalysisResult);
    }

    // Build metadata for summary
    const processingTimeMs = Date.now();
    const byYearMap: Record<string, { count: number; totalValue: number; taxes: number }> = {};
    const byTypeMap: Record<string, { count: number; totalValue: number }> = {};
    const suppliersMap: Record<string, { cnpj: string; name: string; count: number; total: number }> = {};

    for (const r of results) {
      // By year
      const year = r.issueDate ? new Date(r.issueDate).getFullYear().toString() : 'unknown';
      if (!byYearMap[year]) {
        byYearMap[year] = { count: 0, totalValue: 0, taxes: 0 };
      }
      byYearMap[year].count++;
      byYearMap[year].totalValue += r.documentTotal || 0;
      byYearMap[year].taxes += r.currentTaxTotal;

      // By type
      if (!byTypeMap[r.documentType]) {
        byTypeMap[r.documentType] = { count: 0, totalValue: 0 };
      }
      byTypeMap[r.documentType].count++;
      byTypeMap[r.documentType].totalValue += r.documentTotal || 0;

      // Suppliers
      if (r.issuerCnpj) {
        if (!suppliersMap[r.issuerCnpj]) {
          suppliersMap[r.issuerCnpj] = { 
            cnpj: r.issuerCnpj, 
            name: r.issuerName || 'Desconhecido', 
            count: 0, 
            total: 0 
          };
        }
        suppliersMap[r.issuerCnpj].count++;
        suppliersMap[r.issuerCnpj].total += r.documentTotal || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        errors: errors.length,
        results,
        errorDetails: errors,
        metadata: {
          processingTimeMs,
          byYear: byYearMap,
          byType: byTypeMap,
          suppliers: Object.values(suppliersMap).sort((a, b) => b.total - a.total).slice(0, 10)
        },
        creditAnalysis: creditAnalysisResult ? {
          creditsFound: creditAnalysisResult.credits_count || 0,
          totalPotential: creditAnalysisResult.summary?.total_potential || 0,
          byCategory: creditAnalysisResult.summary?.by_category || []
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log error internally for debugging, but return sanitized message
    console.error('Error in process-xml-batch:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao processar XMLs. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
