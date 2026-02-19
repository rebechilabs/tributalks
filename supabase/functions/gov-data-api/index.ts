import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

// Fallback API for CNPJ
const OPEN_CNPJ_BASE = 'https://publica.cnpj.ws/cnpj';

interface CnaeSecundario {
  codigo: number;
  descricao: string;
}

interface InscricaoEstadual {
  inscricao_estadual: string;
  uf: string;
}

interface CnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  cnaes_secundarios: CnaeSecundario[];
  uf: string;
  municipio: string;
  cep: string;
  situacao_cadastral: string;
  porte: string;
  natureza_juridica: string;
  capital_social: number;
  data_inicio_atividade: string;
  data_situacao_cadastral: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  email: string;
  telefone: string;
  inscricoes_estaduais: InscricaoEstadual[];
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

  // Extract CNAEs secundários
  const cnaes_secundarios: CnaeSecundario[] = (data.cnaes_secundarios || []).map((c: any) => ({
    codigo: c.codigo,
    descricao: c.descricao || '',
  }));

  // BrasilAPI doesn't return IE, will be empty
  const inscricoes_estaduais: InscricaoEstadual[] = [];

  // Build phone from DDD + telefone
  const telefone = [data.ddd_telefone_1, data.ddd_telefone_2].filter(Boolean).join(' / ') || '';

  return {
    cnpj: data.cnpj,
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia || '',
    cnae_fiscal: data.cnae_fiscal,
    cnae_fiscal_descricao: data.cnae_fiscal_descricao,
    cnaes_secundarios,
    uf: data.uf,
    municipio: data.municipio,
    cep: data.cep,
    situacao_cadastral: data.descricao_situacao_cadastral,
    porte: data.porte || data.descricao_porte || '',
    natureza_juridica: data.natureza_juridica,
    capital_social: data.capital_social || 0,
    data_inicio_atividade: data.data_inicio_atividade || '',
    data_situacao_cadastral: data.data_situacao_cadastral || '',
    logradouro: data.logradouro || '',
    numero: data.numero || '',
    complemento: data.complemento || '',
    bairro: data.bairro || '',
    email: data.email || '',
    telefone,
    inscricoes_estaduais,
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
  const est = data.estabelecimento || {};

  // Extract CNAEs secundários from CNPJ.ws
  const cnaes_secundarios: CnaeSecundario[] = (est.atividades_secundarias || []).map((a: any) => ({
    codigo: parseInt(a.id || '0'),
    descricao: a.descricao || '',
  }));

  // Extract IEs from CNPJ.ws
  const inscricoes_estaduais: InscricaoEstadual[] = (est.inscricoes_estaduais || [])
    .filter((ie: any) => ie.inscricao_estadual && ie.ativo)
    .map((ie: any) => ({
      inscricao_estadual: ie.inscricao_estadual,
      uf: ie.estado?.sigla || '',
    }));

  // Build phone
  const phones = [est.ddd1 && est.telefone1 ? `(${est.ddd1}) ${est.telefone1}` : '', est.ddd2 && est.telefone2 ? `(${est.ddd2}) ${est.telefone2}` : ''].filter(Boolean);

  return {
    cnpj: cleanedCnpj,
    razao_social: data.razao_social,
    nome_fantasia: est.nome_fantasia || '',
    cnae_fiscal: parseInt(est.atividade_principal?.id || '0'),
    cnae_fiscal_descricao: est.atividade_principal?.descricao || '',
    cnaes_secundarios,
    uf: est.estado?.sigla || '',
    municipio: est.cidade?.nome || '',
    cep: est.cep || '',
    situacao_cadastral: est.situacao_cadastral || '',
    porte: data.porte?.descricao || '',
    natureza_juridica: data.natureza_juridica?.descricao || '',
    capital_social: data.capital_social || 0,
    data_inicio_atividade: est.data_inicio_atividade || '',
    data_situacao_cadastral: est.data_situacao_cadastral || '',
    logradouro: est.logradouro || '',
    numero: est.numero || '',
    complemento: est.complemento || '',
    bairro: est.bairro || '',
    email: est.email || '',
    telefone: phones.join(' / '),
    inscricoes_estaduais,
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
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
