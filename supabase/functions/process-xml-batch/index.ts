import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NFeProduto {
  numero: number;
  ncm: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  icms?: number;
  pis?: number;
  cofins?: number;
  ipi?: number;
}

interface NFeData {
  tipo: 'NFe' | 'NFSe' | 'CTe';
  numero: string;
  serie: string;
  dataEmissao: string;
  emitenteNome: string;
  emitenteCnpj: string;
  emitenteUf: string;
  emitenteMunicipio: string;
  destinatarioNome: string;
  destinatarioCnpj: string;
  produtos: NFeProduto[];
  totalProdutos: number;
  totalIcms: number;
  totalPis: number;
  totalCofins: number;
  totalIpi: number;
  totalNota: number;
}

function parseNFeXML(xmlContent: string): NFeData | null {
  try {
    // Parse NFe XML structure
    const tipo = xmlContent.includes('<NFe') ? 'NFe' : 
                 xmlContent.includes('<NFS') ? 'NFSe' : 
                 xmlContent.includes('<CTe') ? 'CTe' : 'NFe';

    // Extract basic info
    const getTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
      const match = xmlContent.match(regex);
      return match ? match[1].trim() : '';
    };

    const getNestedTag = (parent: string, tag: string): string => {
      const parentRegex = new RegExp(`<${parent}[^>]*>([\\s\\S]*?)</${parent}>`, 'i');
      const parentMatch = xmlContent.match(parentRegex);
      if (parentMatch) {
        const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
        const match = parentMatch[1].match(regex);
        return match ? match[1].trim() : '';
      }
      return '';
    };

    // Parse emitente
    const emitenteMatch = xmlContent.match(/<emit>([\s\S]*?)<\/emit>/i);
    const emitenteBlock = emitenteMatch ? emitenteMatch[1] : '';
    
    const emitenteNome = emitenteBlock.match(/<xNome>([^<]*)<\/xNome>/i)?.[1] || '';
    const emitenteCnpj = emitenteBlock.match(/<CNPJ>([^<]*)<\/CNPJ>/i)?.[1] || '';
    const emitenteUf = emitenteBlock.match(/<UF>([^<]*)<\/UF>/i)?.[1] || '';
    const emitenteMunicipio = emitenteBlock.match(/<xMun>([^<]*)<\/xMun>/i)?.[1] || '';

    // Parse destinatario
    const destMatch = xmlContent.match(/<dest>([\s\S]*?)<\/dest>/i);
    const destBlock = destMatch ? destMatch[1] : '';
    
    const destinatarioNome = destBlock.match(/<xNome>([^<]*)<\/xNome>/i)?.[1] || '';
    const destinatarioCnpj = destBlock.match(/<CNPJ>([^<]*)<\/CNPJ>/i)?.[1] || 
                            destBlock.match(/<CPF>([^<]*)<\/CPF>/i)?.[1] || '';

    // Parse produtos
    const produtosMatches = xmlContent.matchAll(/<det[^>]*>([\s\S]*?)<\/det>/gi);
    const produtos: NFeProduto[] = [];
    let numero = 0;

    for (const match of produtosMatches) {
      numero++;
      const detBlock = match[1];
      
      const prodBlock = detBlock.match(/<prod>([\s\S]*?)<\/prod>/i)?.[1] || '';
      
      const ncm = prodBlock.match(/<NCM>([^<]*)<\/NCM>/i)?.[1] || '00000000';
      const descricao = prodBlock.match(/<xProd>([^<]*)<\/xProd>/i)?.[1] || '';
      const quantidade = parseFloat(prodBlock.match(/<qCom>([^<]*)<\/qCom>/i)?.[1] || '0');
      const unidade = prodBlock.match(/<uCom>([^<]*)<\/uCom>/i)?.[1] || 'UN';
      const valorUnitario = parseFloat(prodBlock.match(/<vUnCom>([^<]*)<\/vUnCom>/i)?.[1] || '0');
      const valorTotal = parseFloat(prodBlock.match(/<vProd>([^<]*)<\/vProd>/i)?.[1] || '0');

      // Parse impostos
      const impostoBlock = detBlock.match(/<imposto>([\s\S]*?)<\/imposto>/i)?.[1] || '';
      
      const icmsBlock = impostoBlock.match(/<ICMS[^>]*>([\s\S]*?)<\/ICMS[^>]*>/i)?.[1] || '';
      const icms = parseFloat(icmsBlock.match(/<vICMS>([^<]*)<\/vICMS>/i)?.[1] || '0');

      const pisBlock = impostoBlock.match(/<PIS[^>]*>([\s\S]*?)<\/PIS[^>]*>/i)?.[1] || '';
      const pis = parseFloat(pisBlock.match(/<vPIS>([^<]*)<\/vPIS>/i)?.[1] || '0');

      const cofinsBlock = impostoBlock.match(/<COFINS[^>]*>([\s\S]*?)<\/COFINS[^>]*>/i)?.[1] || '';
      const cofins = parseFloat(cofinsBlock.match(/<vCOFINS>([^<]*)<\/vCOFINS>/i)?.[1] || '0');

      const ipiBlock = impostoBlock.match(/<IPI[^>]*>([\s\S]*?)<\/IPI[^>]*>/i)?.[1] || '';
      const ipi = parseFloat(ipiBlock.match(/<vIPI>([^<]*)<\/vIPI>/i)?.[1] || '0');

      produtos.push({
        numero,
        ncm,
        descricao,
        quantidade,
        unidade,
        valorUnitario,
        valorTotal,
        icms,
        pis,
        cofins,
        ipi
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
    const totalNota = parseFloat(icmsTotBlock.match(/<vNF>([^<]*)<\/vNF>/i)?.[1] || '0');

    // Parse identificação
    const ideBlock = xmlContent.match(/<ide>([\s\S]*?)<\/ide>/i)?.[1] || '';
    const numeroNota = ideBlock.match(/<nNF>([^<]*)<\/nNF>/i)?.[1] || '';
    const serie = ideBlock.match(/<serie>([^<]*)<\/serie>/i)?.[1] || '';
    const dataEmissao = ideBlock.match(/<dhEmi>([^<]*)<\/dhEmi>/i)?.[1] || 
                       ideBlock.match(/<dEmi>([^<]*)<\/dEmi>/i)?.[1] || '';

    return {
      tipo,
      numero: numeroNota,
      serie,
      dataEmissao,
      emitenteNome,
      emitenteCnpj,
      emitenteUf,
      emitenteMunicipio,
      destinatarioNome,
      destinatarioCnpj,
      produtos,
      totalProdutos,
      totalIcms,
      totalPis,
      totalCofins,
      totalIpi,
      totalNota
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
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
          isBeneficial: differenceValue < 0
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

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        errors: errors.length,
        results,
        errorDetails: errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-xml-batch:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});