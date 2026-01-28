import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

// Fallback API for CNPJ
const OPEN_CNPJ_BASE = 'https://publica.cnpj.ws/cnpj';

interface CnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  uf: string;
  municipio: string;
  cep: string;
  situacao_cadastral: string;
  porte: string;
  natureza_juridica: string;
  capital_social: number;
}

interface MunicipioResponse {
  nome: string;
  codigo_ibge: string;
}

// Clean CNPJ to digits only
function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

// Validate CNPJ format
function validateCnpj(cnpj: string): boolean {
  const cleaned = cleanCnpj(cnpj);
  if (cleaned.length !== 14) return false;
  
  // Check for invalid patterns
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  return true;
}

// Clean CEP to digits only
function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '');
}

// Validate CEP format
function validateCep(cep: string): boolean {
  const cleaned = cleanCep(cep);
  return cleaned.length === 8;
}

// Clean NCM to digits only
function cleanNcm(ncm: string): string {
  return ncm.replace(/\D/g, '');
}

// Validate NCM format (8 digits for products, 9 for services/NBS)
function validateNcm(ncm: string): boolean {
  const cleaned = cleanNcm(ncm);
  return cleaned.length === 8 || cleaned.length === 9;
}

// Lookup CNPJ via BrasilAPI
async function lookupCnpjBrasilApi(cnpj: string): Promise<CnpjResponse | null> {
  const cleanedCnpj = cleanCnpj(cnpj);
  const response = await fetch(`${BRASIL_API_BASE}/cnpj/v1/${cleanedCnpj}`);
  
  if (!response.ok) {
    console.log(`BrasilAPI CNPJ failed: ${response.status}`);
    return null;
  }
  
  const data = await response.json();
  
  return {
    cnpj: data.cnpj,
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia || '',
    cnae_fiscal: data.cnae_fiscal,
    cnae_fiscal_descricao: data.cnae_fiscal_descricao,
    uf: data.uf,
    municipio: data.municipio,
    cep: data.cep,
    situacao_cadastral: data.descricao_situacao_cadastral,
    porte: data.porte || data.descricao_porte || '',
    natureza_juridica: data.natureza_juridica,
    capital_social: data.capital_social || 0,
  };
}

// Fallback: Lookup CNPJ via OpenCNPJ/CNPJ.ws
async function lookupCnpjFallback(cnpj: string): Promise<CnpjResponse | null> {
  const cleanedCnpj = cleanCnpj(cnpj);
  const response = await fetch(`${OPEN_CNPJ_BASE}/${cleanedCnpj}`);
  
  if (!response.ok) {
    console.log(`OpenCNPJ fallback failed: ${response.status}`);
    return null;
  }
  
  const data = await response.json();
  
  return {
    cnpj: cleanedCnpj,
    razao_social: data.razao_social,
    nome_fantasia: data.estabelecimento?.nome_fantasia || '',
    cnae_fiscal: parseInt(data.estabelecimento?.atividade_principal?.id || '0'),
    cnae_fiscal_descricao: data.estabelecimento?.atividade_principal?.descricao || '',
    uf: data.estabelecimento?.estado?.sigla || '',
    municipio: data.estabelecimento?.cidade?.nome || '',
    cep: data.estabelecimento?.cep || '',
    situacao_cadastral: data.estabelecimento?.situacao_cadastral || '',
    porte: data.porte?.descricao || '',
    natureza_juridica: data.natureza_juridica?.descricao || '',
    capital_social: data.capital_social || 0,
  };
}

// Lookup CEP via BrasilAPI
async function lookupCep(cep: string) {
  const cleanedCep = cleanCep(cep);
  const response = await fetch(`${BRASIL_API_BASE}/cep/v2/${cleanedCep}`);
  
  if (!response.ok) {
    throw new Error(`CEP não encontrado: ${cleanedCep}`);
  }
  
  const data = await response.json();
  
  return {
    cep: data.cep,
    logradouro: data.street,
    bairro: data.neighborhood,
    cidade: data.city,
    uf: data.state,
    codigo_ibge: data.location?.coordinates?.ibge_city_code || null,
  };
}

// Validate NCM via BrasilAPI
async function validateNcmApi(ncm: string) {
  const cleanedNcm = cleanNcm(ncm);
  
  // NBS codes (9 digits) are not supported by BrasilAPI
  if (cleanedNcm.length === 9) {
    return {
      codigo: cleanedNcm,
      descricao: 'Código NBS (Serviço) - consulte tabela NBS para descrição',
      tipo: 'NBS',
      valido: true,
    };
  }
  
  const response = await fetch(`${BRASIL_API_BASE}/ncm/v1/${cleanedNcm}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return {
        codigo: cleanedNcm,
        descricao: null,
        tipo: 'NCM',
        valido: false,
        erro: 'NCM não encontrado na tabela oficial',
      };
    }
    throw new Error(`Erro ao validar NCM: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    codigo: data.codigo,
    descricao: data.descricao,
    tipo: 'NCM',
    valido: true,
    unidade: data.unidade || null,
    data_inicio: data.data_inicio,
    data_fim: data.data_fim,
  };
}

// Get all municipalities for a UF via BrasilAPI
async function getMunicipios(uf: string): Promise<MunicipioResponse[]> {
  const response = await fetch(`${BRASIL_API_BASE}/ibge/municipios/v1/${uf.toUpperCase()}?providers=dados-abertos-br,gov,wikipedia`);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar municípios: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Map and sort alphabetically
  const municipios = data.map((m: any) => ({
    nome: m.nome,
    codigo_ibge: m.codigo_ibge?.toString() || '',
  }));
  
  return municipios.sort((a: MunicipioResponse, b: MunicipioResponse) => 
    a.nome.localeCompare(b.nome, 'pt-BR')
  );
}

// Get list of Brazilian banks
async function getBancos() {
  const response = await fetch(`${BRASIL_API_BASE}/banks/v1`);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar bancos: ${response.status}`);
  }
  
  return await response.json();
}

// Get national holidays for a year
async function getFeriados(ano: string) {
  const response = await fetch(`${BRASIL_API_BASE}/feriados/v1/${ano}`);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar feriados: ${response.status}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Remove 'gov-data-api' from path if present
    const startIndex = pathParts.findIndex(p => p === 'gov-data-api');
    const relevantParts = startIndex >= 0 ? pathParts.slice(startIndex + 1) : pathParts;
    
    const endpoint = relevantParts[0];
    const param = relevantParts[1];

    console.log(`gov-data-api: endpoint=${endpoint}, param=${param}`);

    switch (endpoint) {
      case 'cnpj': {
        if (!param) {
          return new Response(
            JSON.stringify({ error: 'CNPJ não informado' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!validateCnpj(param)) {
          return new Response(
            JSON.stringify({ error: 'CNPJ inválido: deve conter 14 dígitos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Try BrasilAPI first, then fallback
        let result = await lookupCnpjBrasilApi(param);
        
        if (!result) {
          console.log('Trying fallback for CNPJ...');
          result = await lookupCnpjFallback(param);
        }
        
        if (!result) {
          return new Response(
            JSON.stringify({ error: 'CNPJ não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cep': {
        if (!param) {
          return new Response(
            JSON.stringify({ error: 'CEP não informado' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!validateCep(param)) {
          return new Response(
            JSON.stringify({ error: 'CEP inválido: deve conter 8 dígitos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const cepData = await lookupCep(param);
        
        return new Response(
          JSON.stringify(cepData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'ncm': {
        if (!param) {
          return new Response(
            JSON.stringify({ error: 'NCM/NBS não informado' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!validateNcm(param)) {
          return new Response(
            JSON.stringify({ error: 'Código inválido: NCM deve ter 8 dígitos, NBS deve ter 9 dígitos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const ncmData = await validateNcmApi(param);
        
        return new Response(
          JSON.stringify(ncmData),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=604800' // 7 days cache
            } 
          }
        );
      }

      case 'municipios': {
        if (!param) {
          return new Response(
            JSON.stringify({ error: 'UF não informada' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (param.length !== 2) {
          return new Response(
            JSON.stringify({ error: 'UF inválida: deve conter 2 letras' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const municipios = await getMunicipios(param);
        
        return new Response(
          JSON.stringify(municipios),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=86400' // 24 hours cache
            } 
          }
        );
      }

      case 'bancos': {
        const bancos = await getBancos();
        
        return new Response(
          JSON.stringify(bancos),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=604800' // 7 days cache
            } 
          }
        );
      }

      case 'feriados': {
        const ano = param || new Date().getFullYear().toString();
        const feriados = await getFeriados(ano);
        
        return new Response(
          JSON.stringify(feriados),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=604800' // 7 days cache
            } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Endpoint não encontrado',
            endpoints_disponiveis: [
              '/cnpj/{cnpj}',
              '/cep/{cep}',
              '/ncm/{codigo}',
              '/municipios/{uf}',
              '/bancos',
              '/feriados/{ano}'
            ]
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('gov-data-api error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
