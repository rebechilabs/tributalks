import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// AES-256-GCM Decryption Functions
// ============================================================================

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get("ERP_ENCRYPTION_KEY");
  if (!keyString || keyString.length < 32) {
    throw new Error("ERP_ENCRYPTION_KEY não configurada");
  }
  
  const keyData = new TextEncoder().encode(keyString.slice(0, 32));
  
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function decryptCredentials(encryptedBase64: string): Promise<ERPCredentials> {
  const key = await getEncryptionKey();
  
  // Base64 decode
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and ciphertext (rest)
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  
  const plaintext = new TextDecoder().decode(decrypted);
  return JSON.parse(plaintext);
}

function isEncryptedCredentials(credentials: unknown): boolean {
  // Encrypted credentials are stored as a base64 string
  // Plain credentials are stored as a JSON object
  return typeof credentials === 'string' && credentials.length > 20;
}

async function getDecryptedCredentials(storedCredentials: unknown): Promise<ERPCredentials> {
  if (isEncryptedCredentials(storedCredentials)) {
    // New format: encrypted base64 string
    return await decryptCredentials(storedCredentials as string);
  } else {
    // Legacy format: plain JSON object (backward compatibility)
    return storedCredentials as ERPCredentials;
  }
}

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SyncRequest {
  connection_id: string;
  modules?: string[];
}

interface SyncResult {
  module: string;
  status: 'success' | 'error' | 'skipped';
  records_synced: number;
  records_failed: number;
  message?: string;
}

interface ERPCredentials {
  // Omie
  app_key?: string;
  app_secret?: string;
  // Bling
  access_token?: string;
  // Conta Azul
  client_id?: string;
  client_secret?: string;
  // Tiny
  token?: string;
  // Sankhya
  sankhya_id?: string;
  // TOTVS
  base_url?: string;
  username?: string;
  password?: string;
}

interface UnifiedProduct {
  ncm_code: string;
  product_name: string;
  cfops_frequentes: string[];
  tipo_operacao: string;
  qtd_operacoes: number;
  revenue_percentage: number;
}

interface UnifiedNFe {
  nfe_key: string;
  nfe_number: string;
  nfe_date: string;
  supplier_cnpj: string;
  supplier_name: string;
  cfop: string;
  ncm_code: string;
  product_description: string;
  valor_total: number;
  icms_value: number;
  pis_value: number;
  cofins_value: number;
  ipi_value: number;
}

interface UnifiedFinancial {
  tipo: 'receita' | 'despesa';
  categoria: string;
  valor: number;
  data: string;
  descricao: string;
}

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMITS: Record<string, { requestsPerMinute: number; delayMs: number }> = {
  omie: { requestsPerMinute: 60, delayMs: 1000 },
  bling: { requestsPerMinute: 180, delayMs: 350 },
  contaazul: { requestsPerMinute: 100, delayMs: 600 },
  tiny: { requestsPerMinute: 30, delayMs: 2000 },
  sankhya: { requestsPerMinute: 60, delayMs: 1000 },
  totvs: { requestsPerMinute: 60, delayMs: 1000 },
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Adapter Base Interface
// ============================================================================

interface ERPAdapter {
  syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>>;
  syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]>;
  syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]>;
  syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]>;
}

// ============================================================================
// OMIE Adapter
// ============================================================================

class OmieAdapter implements ERPAdapter {
  private baseUrl = 'https://app.omie.com.br/api/v1';

  private async makeRequest(endpoint: string, call: string, params: unknown[], credentials: ERPCredentials) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        call,
        app_key: credentials.app_key,
        app_secret: credentials.app_secret,
        param: params,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Omie API error: ${error}`);
    }

    return response.json();
  }

  async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
    try {
      const data = await this.makeRequest('/geral/empresas/', 'ListarEmpresas', [{ 
        pagina: 1, 
        registros_por_pagina: 1 
      }], credentials);

      if (data.empresas_cadastro && data.empresas_cadastro.length > 0) {
        const empresa = data.empresas_cadastro[0];
        return {
          razao_social: empresa.razao_social,
          nome_fantasia: empresa.nome_fantasia,
          cnpj_principal: empresa.cnpj,
          uf_sede: empresa.estado,
          municipio_sede: empresa.cidade,
          regime_tributario: this.mapRegimeTributario(empresa.optante_simples_nacional),
        };
      }
      return {};
    } catch (error) {
      console.error('Omie syncEmpresa error:', error);
      throw error;
    }
  }

  private mapRegimeTributario(optanteSimples: string): string {
    return optanteSimples === 'S' ? 'simples' : 'lucro_presumido';
  }

  async syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]> {
    const products: UnifiedProduct[] = [];
    let pagina = 1;
    let hasMore = true;

    while (hasMore) {
      await delay(RATE_LIMITS.omie.delayMs);

      const data = await this.makeRequest('/geral/produtos/', 'ListarProdutos', [{
        pagina,
        registros_por_pagina: 50,
        apenas_importado_api: 'N',
      }], credentials);

      if (data.produto_servico_cadastro) {
        for (const produto of data.produto_servico_cadastro) {
          products.push({
            ncm_code: produto.ncm || '00000000',
            product_name: produto.descricao || produto.codigo,
            cfops_frequentes: [],
            tipo_operacao: 'misto',
            qtd_operacoes: 0,
            revenue_percentage: 0,
          });
        }
      }

      hasMore = data.total_de_paginas > pagina;
      pagina++;

      // Safety limit
      if (pagina > 100) break;
    }

    return products;
  }

  async syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]> {
    const nfes: UnifiedNFe[] = [];
    let pagina = 1;
    let hasMore = true;

    // Last 90 days
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - 90);
    const dataFinal = new Date();

    while (hasMore) {
      await delay(RATE_LIMITS.omie.delayMs);

      try {
        const data = await this.makeRequest('/produtos/nfconsultar/', 'ListarNF', [{
          pagina,
          registros_por_pagina: 50,
          dDtEmisIni: dataInicial.toISOString().split('T')[0],
          dDtEmisFin: dataFinal.toISOString().split('T')[0],
        }], credentials);

        if (data.nfCadastro) {
          for (const nf of data.nfCadastro) {
            // Process each item in the NF
            if (nf.det) {
              for (const item of nf.det) {
                nfes.push({
                  nfe_key: nf.nNF?.toString() || '',
                  nfe_number: nf.nNF?.toString() || '',
                  nfe_date: nf.dEmi || new Date().toISOString(),
                  supplier_cnpj: nf.emit?.CNPJ || '',
                  supplier_name: nf.emit?.xNome || '',
                  cfop: item.prod?.CFOP || '',
                  ncm_code: item.prod?.NCM || '',
                  product_description: item.prod?.xProd || '',
                  valor_total: parseFloat(item.prod?.vProd) || 0,
                  icms_value: parseFloat(item.imposto?.ICMS?.vICMS) || 0,
                  pis_value: parseFloat(item.imposto?.PIS?.vPIS) || 0,
                  cofins_value: parseFloat(item.imposto?.COFINS?.vCOFINS) || 0,
                  ipi_value: parseFloat(item.imposto?.IPI?.vIPI) || 0,
                });
              }
            }
          }
        }

        hasMore = data.total_de_paginas > pagina;
        pagina++;

        if (pagina > 50) break;
      } catch (error) {
        console.error('Omie syncNFe page error:', error);
        break;
      }
    }

    return nfes;
  }

  async syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]> {
    const financeiro: UnifiedFinancial[] = [];

    // Contas a Receber (Receitas)
    try {
      await delay(RATE_LIMITS.omie.delayMs);
      const receber = await this.makeRequest('/financas/contareceber/', 'ListarContasReceber', [{
        pagina: 1,
        registros_por_pagina: 100,
      }], credentials);

      if (receber.conta_receber_cadastro) {
        for (const conta of receber.conta_receber_cadastro) {
          financeiro.push({
            tipo: 'receita',
            categoria: conta.codigo_categoria || 'vendas',
            valor: parseFloat(conta.valor_documento) || 0,
            data: conta.data_vencimento || new Date().toISOString(),
            descricao: conta.observacao || 'Conta a Receber',
          });
        }
      }
    } catch (error) {
      console.error('Omie syncFinanceiro receber error:', error);
    }

    // Contas a Pagar (Despesas)
    try {
      await delay(RATE_LIMITS.omie.delayMs);
      const pagar = await this.makeRequest('/financas/contapagar/', 'ListarContasPagar', [{
        pagina: 1,
        registros_por_pagina: 100,
      }], credentials);

      if (pagar.conta_pagar_cadastro) {
        for (const conta of pagar.conta_pagar_cadastro) {
          financeiro.push({
            tipo: 'despesa',
            categoria: conta.codigo_categoria || 'fornecedores',
            valor: parseFloat(conta.valor_documento) || 0,
            data: conta.data_vencimento || new Date().toISOString(),
            descricao: conta.observacao || 'Conta a Pagar',
          });
        }
      }
    } catch (error) {
      console.error('Omie syncFinanceiro pagar error:', error);
    }

    return financeiro;
  }
}

// ============================================================================
// BLING Adapter
// ============================================================================

class BlingAdapter implements ERPAdapter {
  private baseUrl = 'https://api.bling.com.br/Api/v3';

  private async makeRequest(endpoint: string, credentials: ERPCredentials) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bling API error: ${error}`);
    }

    return response.json();
  }

  async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
    try {
      const data = await this.makeRequest('/empresas', credentials);
      
      if (data.data && data.data.length > 0) {
        const empresa = data.data[0];
        return {
          razao_social: empresa.razaoSocial,
          nome_fantasia: empresa.nomeFantasia,
          cnpj_principal: empresa.cnpj,
          uf_sede: empresa.endereco?.uf,
          municipio_sede: empresa.endereco?.municipio,
        };
      }
      return {};
    } catch (error) {
      console.error('Bling syncEmpresa error:', error);
      throw error;
    }
  }

  async syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]> {
    const products: UnifiedProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      await delay(RATE_LIMITS.bling.delayMs);

      try {
        const data = await this.makeRequest(`/produtos?pagina=${page}&limite=100`, credentials);

        if (data.data) {
          for (const produto of data.data) {
            products.push({
              ncm_code: produto.tributacao?.ncm || '00000000',
              product_name: produto.nome || produto.codigo,
              cfops_frequentes: [],
              tipo_operacao: 'misto',
              qtd_operacoes: 0,
              revenue_percentage: 0,
            });
          }

          hasMore = data.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }

        if (page > 50) break;
      } catch (error) {
        console.error('Bling syncProdutos page error:', error);
        break;
      }
    }

    return products;
  }

  async syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]> {
    const nfes: UnifiedNFe[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      await delay(RATE_LIMITS.bling.delayMs);

      try {
        const data = await this.makeRequest(`/nfe?pagina=${page}&limite=100`, credentials);

        if (data.data) {
          for (const nf of data.data) {
            nfes.push({
              nfe_key: nf.chaveAcesso || '',
              nfe_number: nf.numero?.toString() || '',
              nfe_date: nf.dataEmissao || new Date().toISOString(),
              supplier_cnpj: nf.fornecedor?.cpfCnpj || '',
              supplier_name: nf.fornecedor?.nome || '',
              cfop: nf.cfop || '',
              ncm_code: '',
              product_description: '',
              valor_total: nf.valorNota || 0,
              icms_value: 0,
              pis_value: 0,
              cofins_value: 0,
              ipi_value: 0,
            });
          }

          hasMore = data.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }

        if (page > 50) break;
      } catch (error) {
        console.error('Bling syncNFe page error:', error);
        break;
      }
    }

    return nfes;
  }

  async syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]> {
    const financeiro: UnifiedFinancial[] = [];

    // Contas a Receber
    try {
      await delay(RATE_LIMITS.bling.delayMs);
      const receber = await this.makeRequest('/contas/receber?limite=100', credentials);

      if (receber.data) {
        for (const conta of receber.data) {
          financeiro.push({
            tipo: 'receita',
            categoria: 'vendas',
            valor: conta.valor || 0,
            data: conta.vencimento || new Date().toISOString(),
            descricao: conta.historico || 'Conta a Receber',
          });
        }
      }
    } catch (error) {
      console.error('Bling syncFinanceiro receber error:', error);
    }

    // Contas a Pagar
    try {
      await delay(RATE_LIMITS.bling.delayMs);
      const pagar = await this.makeRequest('/contas/pagar?limite=100', credentials);

      if (pagar.data) {
        for (const conta of pagar.data) {
          financeiro.push({
            tipo: 'despesa',
            categoria: 'fornecedores',
            valor: conta.valor || 0,
            data: conta.vencimento || new Date().toISOString(),
            descricao: conta.historico || 'Conta a Pagar',
          });
        }
      }
    } catch (error) {
      console.error('Bling syncFinanceiro pagar error:', error);
    }

    return financeiro;
  }
}

// ============================================================================
// CONTA AZUL Adapter
// ============================================================================

class ContaAzulAdapter implements ERPAdapter {
  private baseUrl = 'https://api.contaazul.com/v1';

  private async makeRequest(endpoint: string, credentials: ERPCredentials) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Conta Azul API error: ${error}`);
    }

    return response.json();
  }

  async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
    try {
      const data = await this.makeRequest('/companies', credentials);
      
      if (data) {
        return {
          razao_social: data.name,
          cnpj_principal: data.federalTaxNumber,
        };
      }
      return {};
    } catch (error) {
      console.error('Conta Azul syncEmpresa error:', error);
      throw error;
    }
  }

  async syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]> {
    const products: UnifiedProduct[] = [];

    try {
      await delay(RATE_LIMITS.contaazul.delayMs);
      const data = await this.makeRequest('/products?size=200', credentials);

      if (data && Array.isArray(data)) {
        for (const produto of data) {
          products.push({
            ncm_code: produto.ncm || '00000000',
            product_name: produto.name || produto.code,
            cfops_frequentes: [],
            tipo_operacao: 'misto',
            qtd_operacoes: 0,
            revenue_percentage: 0,
          });
        }
      }
    } catch (error) {
      console.error('Conta Azul syncProdutos error:', error);
    }

    return products;
  }

  async syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]> {
    // Conta Azul uses sales endpoint for invoice data
    const nfes: UnifiedNFe[] = [];

    try {
      await delay(RATE_LIMITS.contaazul.delayMs);
      const data = await this.makeRequest('/sales?size=200', credentials);

      if (data && Array.isArray(data)) {
        for (const sale of data) {
          nfes.push({
            nfe_key: sale.id || '',
            nfe_number: sale.number?.toString() || '',
            nfe_date: sale.emission || new Date().toISOString(),
            supplier_cnpj: '',
            supplier_name: sale.customer?.name || '',
            cfop: '',
            ncm_code: '',
            product_description: '',
            valor_total: sale.total || 0,
            icms_value: 0,
            pis_value: 0,
            cofins_value: 0,
            ipi_value: 0,
          });
        }
      }
    } catch (error) {
      console.error('Conta Azul syncNFe error:', error);
    }

    return nfes;
  }

  async syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]> {
    const financeiro: UnifiedFinancial[] = [];

    // Sales = Receitas
    try {
      await delay(RATE_LIMITS.contaazul.delayMs);
      const sales = await this.makeRequest('/sales?size=200', credentials);

      if (sales && Array.isArray(sales)) {
        for (const sale of sales) {
          financeiro.push({
            tipo: 'receita',
            categoria: 'vendas',
            valor: sale.total || 0,
            data: sale.emission || new Date().toISOString(),
            descricao: `Venda #${sale.number}`,
          });
        }
      }
    } catch (error) {
      console.error('Conta Azul syncFinanceiro sales error:', error);
    }

    // Purchases = Despesas
    try {
      await delay(RATE_LIMITS.contaazul.delayMs);
      const purchases = await this.makeRequest('/purchases?size=200', credentials);

      if (purchases && Array.isArray(purchases)) {
        for (const purchase of purchases) {
          financeiro.push({
            tipo: 'despesa',
            categoria: 'compras',
            valor: purchase.total || 0,
            data: purchase.emission || new Date().toISOString(),
            descricao: `Compra #${purchase.number}`,
          });
        }
      }
    } catch (error) {
      console.error('Conta Azul syncFinanceiro purchases error:', error);
    }

    return financeiro;
  }
}

// ============================================================================
// TINY Adapter
// ============================================================================

class TinyAdapter implements ERPAdapter {
  private baseUrl = 'https://api.tiny.com.br/api2';

  private async makeRequest(endpoint: string, credentials: ERPCredentials) {
    const url = `${this.baseUrl}/${endpoint}?token=${credentials.token}&formato=json`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tiny API error: ${error}`);
    }

    return response.json();
  }

  async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
    try {
      const data = await this.makeRequest('info.php', credentials);
      
      if (data.retorno?.info) {
        return {
          razao_social: data.retorno.info.razao_social,
          nome_fantasia: data.retorno.info.nome_fantasia,
          cnpj_principal: data.retorno.info.cnpj,
        };
      }
      return {};
    } catch (error) {
      console.error('Tiny syncEmpresa error:', error);
      throw error;
    }
  }

  async syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]> {
    const products: UnifiedProduct[] = [];
    let pagina = 1;
    let hasMore = true;

    while (hasMore) {
      await delay(RATE_LIMITS.tiny.delayMs);

      try {
        const data = await this.makeRequest(`produtos.pesquisa.php&pagina=${pagina}`, credentials);

        if (data.retorno?.produtos) {
          for (const item of data.retorno.produtos) {
            const produto = item.produto;
            products.push({
              ncm_code: produto.ncm || '00000000',
              product_name: produto.nome || produto.codigo,
              cfops_frequentes: [],
              tipo_operacao: 'misto',
              qtd_operacoes: 0,
              revenue_percentage: 0,
            });
          }

          hasMore = data.retorno.produtos.length === 100;
          pagina++;
        } else {
          hasMore = false;
        }

        if (pagina > 50) break;
      } catch (error) {
        console.error('Tiny syncProdutos page error:', error);
        break;
      }
    }

    return products;
  }

  async syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]> {
    const nfes: UnifiedNFe[] = [];
    let pagina = 1;
    let hasMore = true;

    while (hasMore) {
      await delay(RATE_LIMITS.tiny.delayMs);

      try {
        const data = await this.makeRequest(`notas.fiscais.pesquisa.php&pagina=${pagina}`, credentials);

        if (data.retorno?.notas_fiscais) {
          for (const item of data.retorno.notas_fiscais) {
            const nf = item.nota_fiscal;
            nfes.push({
              nfe_key: nf.chave_acesso || '',
              nfe_number: nf.numero?.toString() || '',
              nfe_date: nf.data_emissao || new Date().toISOString(),
              supplier_cnpj: nf.cliente?.cpf_cnpj || '',
              supplier_name: nf.cliente?.nome || '',
              cfop: '',
              ncm_code: '',
              product_description: '',
              valor_total: parseFloat(nf.valor_nota) || 0,
              icms_value: 0,
              pis_value: 0,
              cofins_value: 0,
              ipi_value: 0,
            });
          }

          hasMore = data.retorno.notas_fiscais.length === 100;
          pagina++;
        } else {
          hasMore = false;
        }

        if (pagina > 50) break;
      } catch (error) {
        console.error('Tiny syncNFe page error:', error);
        break;
      }
    }

    return nfes;
  }

  async syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]> {
    const financeiro: UnifiedFinancial[] = [];

    // Contas a Receber
    try {
      await delay(RATE_LIMITS.tiny.delayMs);
      const receber = await this.makeRequest('contas.receber.pesquisa.php', credentials);

      if (receber.retorno?.contas) {
        for (const item of receber.retorno.contas) {
          const conta = item.conta;
          financeiro.push({
            tipo: 'receita',
            categoria: 'vendas',
            valor: parseFloat(conta.valor) || 0,
            data: conta.data_vencimento || new Date().toISOString(),
            descricao: conta.historico || 'Conta a Receber',
          });
        }
      }
    } catch (error) {
      console.error('Tiny syncFinanceiro receber error:', error);
    }

    // Contas a Pagar
    try {
      await delay(RATE_LIMITS.tiny.delayMs);
      const pagar = await this.makeRequest('contas.pagar.pesquisa.php', credentials);

      if (pagar.retorno?.contas) {
        for (const item of pagar.retorno.contas) {
          const conta = item.conta;
          financeiro.push({
            tipo: 'despesa',
            categoria: 'fornecedores',
            valor: parseFloat(conta.valor) || 0,
            data: conta.data_vencimento || new Date().toISOString(),
            descricao: conta.historico || 'Conta a Pagar',
          });
        }
      }
    } catch (error) {
      console.error('Tiny syncFinanceiro pagar error:', error);
    }

    return financeiro;
  }
}

// ============================================================================
// SANKHYA Adapter
// ============================================================================

class SankhyaAdapter implements ERPAdapter {
  private baseUrl = 'https://api.sankhya.com.br/gateway/v1';

  private async makeRequest(serviceName: string, entityName: string, credentials: ERPCredentials) {
    const url = `${this.baseUrl}/mge/service.sbr?serviceName=${serviceName}&entityName=${entityName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'appkey': credentials.app_key || '',
        'token': credentials.token || '',
        'sankhyaid': credentials.sankhya_id || '',
      },
      body: JSON.stringify({
        requestBody: {
          dataSet: {
            rootEntity: entityName,
            includePresentationFields: 'S',
            dataRow: {},
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sankhya API error: ${error}`);
    }

    return response.json();
  }

  async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
    try {
      const data = await this.makeRequest('CRUDServiceProvider.loadRecords', 'Empresa', credentials);
      
      if (data.responseBody?.entities?.entity) {
        const empresa = data.responseBody.entities.entity[0];
        return {
          razao_social: empresa.RAZAOSOCIAL,
          nome_fantasia: empresa.NOMEFANTASIA,
          cnpj_principal: empresa.CGC,
          uf_sede: empresa.UF,
          municipio_sede: empresa.CIDADE,
        };
      }
      return {};
    } catch (error) {
      console.error('Sankhya syncEmpresa error:', error);
      throw error;
    }
  }

  async syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]> {
    const products: UnifiedProduct[] = [];

    try {
      await delay(RATE_LIMITS.sankhya.delayMs);
      const data = await this.makeRequest('CRUDServiceProvider.loadRecords', 'Produto', credentials);

      if (data.responseBody?.entities?.entity) {
        for (const produto of data.responseBody.entities.entity) {
          products.push({
            ncm_code: produto.NCM || '00000000',
            product_name: produto.DESCRPROD || produto.CODPROD,
            cfops_frequentes: [],
            tipo_operacao: 'misto',
            qtd_operacoes: 0,
            revenue_percentage: 0,
          });
        }
      }
    } catch (error) {
      console.error('Sankhya syncProdutos error:', error);
    }

    return products;
  }

  async syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]> {
    const nfes: UnifiedNFe[] = [];

    try {
      await delay(RATE_LIMITS.sankhya.delayMs);
      const data = await this.makeRequest('SelecaoDocumentoSP.consultarDocumentos', 'CabecalhoNota', credentials);

      if (data.responseBody?.entities?.entity) {
        for (const nf of data.responseBody.entities.entity) {
          nfes.push({
            nfe_key: nf.CHAVENFE || '',
            nfe_number: nf.NUMNOTA?.toString() || '',
            nfe_date: nf.DTNEG || new Date().toISOString(),
            supplier_cnpj: nf.CGC_CPF || '',
            supplier_name: nf.NOMEPARC || '',
            cfop: nf.CODCFO || '',
            ncm_code: '',
            product_description: '',
            valor_total: parseFloat(nf.VLRNOTA) || 0,
            icms_value: parseFloat(nf.VLRICMS) || 0,
            pis_value: parseFloat(nf.VLRPIS) || 0,
            cofins_value: parseFloat(nf.VLRCOFINS) || 0,
            ipi_value: parseFloat(nf.VLRIPI) || 0,
          });
        }
      }
    } catch (error) {
      console.error('Sankhya syncNFe error:', error);
    }

    return nfes;
  }

  async syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]> {
    const financeiro: UnifiedFinancial[] = [];

    try {
      await delay(RATE_LIMITS.sankhya.delayMs);
      const data = await this.makeRequest('CRUDServiceProvider.loadRecords', 'MovimentacaoFinanceira', credentials);

      if (data.responseBody?.entities?.entity) {
        for (const mov of data.responseBody.entities.entity) {
          const tipo = mov.TIPMOV === 'R' ? 'receita' : 'despesa';
          financeiro.push({
            tipo,
            categoria: mov.CODNAT || 'geral',
            valor: parseFloat(mov.VLRMOV) || 0,
            data: mov.DTVENC || new Date().toISOString(),
            descricao: mov.HISTORICO || 'Movimentação',
          });
        }
      }
    } catch (error) {
      console.error('Sankhya syncFinanceiro error:', error);
    }

    return financeiro;
  }
}

// ============================================================================
// TOTVS Adapter
// ============================================================================

class TotvsAdapter implements ERPAdapter {
  private getBaseUrl(credentials: ERPCredentials) {
    return credentials.base_url || 'https://totvs.example.com';
  }

  private async makeRequest(endpoint: string, credentials: ERPCredentials) {
    const baseUrl = this.getBaseUrl(credentials);
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TOTVS API error: ${error}`);
    }

    return response.json();
  }

  async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
    try {
      const data = await this.makeRequest('/api/framework/v1/environment', credentials);
      
      if (data) {
        return {
          razao_social: data.name,
          nome_fantasia: data.tradeName,
          cnpj_principal: data.federalId,
          uf_sede: data.state,
          municipio_sede: data.city,
        };
      }
      return {};
    } catch (error) {
      console.error('TOTVS syncEmpresa error:', error);
      throw error;
    }
  }

  async syncProdutos(credentials: ERPCredentials): Promise<UnifiedProduct[]> {
    const products: UnifiedProduct[] = [];

    try {
      await delay(RATE_LIMITS.totvs.delayMs);
      const data = await this.makeRequest('/api/retaguarda/v1/products?pageSize=200', credentials);

      if (data.items) {
        for (const produto of data.items) {
          products.push({
            ncm_code: produto.ncm || '00000000',
            product_name: produto.description || produto.code,
            cfops_frequentes: [],
            tipo_operacao: 'misto',
            qtd_operacoes: 0,
            revenue_percentage: 0,
          });
        }
      }
    } catch (error) {
      console.error('TOTVS syncProdutos error:', error);
    }

    return products;
  }

  async syncNFe(credentials: ERPCredentials): Promise<UnifiedNFe[]> {
    const nfes: UnifiedNFe[] = [];

    try {
      await delay(RATE_LIMITS.totvs.delayMs);
      const data = await this.makeRequest('/api/fiscal/v1/invoices?pageSize=200', credentials);

      if (data.items) {
        for (const nf of data.items) {
          nfes.push({
            nfe_key: nf.accessKey || '',
            nfe_number: nf.number?.toString() || '',
            nfe_date: nf.issueDate || new Date().toISOString(),
            supplier_cnpj: nf.supplierFederalId || '',
            supplier_name: nf.supplierName || '',
            cfop: nf.cfop || '',
            ncm_code: '',
            product_description: '',
            valor_total: nf.totalValue || 0,
            icms_value: nf.icmsValue || 0,
            pis_value: nf.pisValue || 0,
            cofins_value: nf.cofinsValue || 0,
            ipi_value: nf.ipiValue || 0,
          });
        }
      }
    } catch (error) {
      console.error('TOTVS syncNFe error:', error);
    }

    return nfes;
  }

  async syncFinanceiro(credentials: ERPCredentials): Promise<UnifiedFinancial[]> {
    const financeiro: UnifiedFinancial[] = [];

    try {
      await delay(RATE_LIMITS.totvs.delayMs);
      const data = await this.makeRequest('/api/financeiro/v1/movements?pageSize=200', credentials);

      if (data.items) {
        for (const mov of data.items) {
          financeiro.push({
            tipo: mov.type === 'CREDIT' ? 'receita' : 'despesa',
            categoria: mov.category || 'geral',
            valor: mov.value || 0,
            data: mov.dueDate || new Date().toISOString(),
            descricao: mov.description || 'Movimentação',
          });
        }
      }
    } catch (error) {
      console.error('TOTVS syncFinanceiro error:', error);
    }

    return financeiro;
  }
}

// ============================================================================
// Adapter Factory
// ============================================================================

function getAdapter(erpType: string): ERPAdapter {
  switch (erpType) {
    case 'omie':
      return new OmieAdapter();
    case 'bling':
      return new BlingAdapter();
    case 'contaazul':
      return new ContaAzulAdapter();
    case 'tiny':
      return new TinyAdapter();
    case 'sankhya':
      return new SankhyaAdapter();
    case 'totvs':
      return new TotvsAdapter();
    default:
      throw new Error(`Unsupported ERP type: ${erpType}`);
  }
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = userData.user.id;

    if (req.method === 'POST') {
      const body: SyncRequest = await req.json();
      const { connection_id, modules } = body;

      if (!connection_id) {
        return new Response(JSON.stringify({ error: 'connection_id é obrigatório' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Fetch connection
      const { data: connection, error: connError } = await supabase
        .from('erp_connections')
        .select('*')
        .eq('id', connection_id)
        .eq('user_id', userId)
        .single();

      if (connError || !connection) {
        return new Response(JSON.stringify({ error: 'Conexão não encontrada' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Create sync log
      const { data: syncLog, error: logError } = await supabase
        .from('erp_sync_logs')
        .insert({
          connection_id: connection.id,
          user_id: userId,
          sync_type: 'manual',
          status: 'running',
          started_at: new Date().toISOString(),
          details: { modules: modules || connection.sync_config?.modules || ['nfe', 'produtos', 'financeiro', 'empresa'] },
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating sync log:', logError);
      }

      const results: SyncResult[] = [];
      let totalSynced = 0;
      let totalFailed = 0;

      try {
        const adapter = getAdapter(connection.erp_type);
        // Decrypt credentials (supports both encrypted and legacy plain formats)
        const credentials = await getDecryptedCredentials(connection.credentials);
        const modulesToSync = modules || connection.sync_config?.modules || ['nfe', 'produtos', 'financeiro', 'empresa'];

        // Sync Empresa
        if (modulesToSync.includes('empresa')) {
          try {
            const empresaData = await adapter.syncEmpresa(credentials);
            
            if (Object.keys(empresaData).length > 0) {
              // Upsert to company_profile
              const { error: upsertError } = await supabase
                .from('company_profile')
                .upsert({
                  user_id: userId,
                  ...empresaData,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

              if (upsertError) {
                console.error('Error upserting company_profile:', upsertError);
                results.push({ module: 'empresa', status: 'error', records_synced: 0, records_failed: 1, message: upsertError.message });
                totalFailed++;
              } else {
                results.push({ module: 'empresa', status: 'success', records_synced: 1, records_failed: 0 });
                totalSynced++;
              }
            } else {
              results.push({ module: 'empresa', status: 'skipped', records_synced: 0, records_failed: 0, message: 'Sem dados' });
            }
          } catch (error) {
            console.error('Empresa sync error:', error);
            results.push({ module: 'empresa', status: 'error', records_synced: 0, records_failed: 1, message: String(error) });
            totalFailed++;
          }
        }

        // Sync Produtos
        if (modulesToSync.includes('produtos')) {
          try {
            const produtos = await adapter.syncProdutos(credentials);
            
            if (produtos.length > 0) {
              // Delete existing and insert new
              await supabase
                .from('company_ncm_analysis')
                .delete()
                .eq('user_id', userId);

              const { error: insertError } = await supabase
                .from('company_ncm_analysis')
                .insert(produtos.map(p => ({
                  user_id: userId,
                  ncm_code: p.ncm_code,
                  product_name: p.product_name,
                  cfops_frequentes: p.cfops_frequentes,
                  tipo_operacao: p.tipo_operacao,
                  qtd_operacoes: p.qtd_operacoes,
                  revenue_percentage: p.revenue_percentage,
                  status: 'pendente',
                })));

              if (insertError) {
                console.error('Error inserting produtos:', insertError);
                results.push({ module: 'produtos', status: 'error', records_synced: 0, records_failed: produtos.length, message: insertError.message });
                totalFailed += produtos.length;
              } else {
                results.push({ module: 'produtos', status: 'success', records_synced: produtos.length, records_failed: 0 });
                totalSynced += produtos.length;
              }
            } else {
              results.push({ module: 'produtos', status: 'skipped', records_synced: 0, records_failed: 0, message: 'Sem produtos' });
            }
          } catch (error) {
            console.error('Produtos sync error:', error);
            results.push({ module: 'produtos', status: 'error', records_synced: 0, records_failed: 1, message: String(error) });
            totalFailed++;
          }
        }

        // Sync NF-e
        if (modulesToSync.includes('nfe')) {
          try {
            const nfes = await adapter.syncNFe(credentials);
            
            if (nfes.length > 0) {
              // Insert to xml_imports for analysis
              let synced = 0;
              let failed = 0;

              for (const nfe of nfes) {
                const { error: insertError } = await supabase
                  .from('xml_imports')
                  .upsert({
                    user_id: userId,
                    file_name: `ERP_${connection.erp_type}_${nfe.nfe_number}.xml`,
                    file_type: 'nfe',
                    status: 'processed',
                    nfe_number: nfe.nfe_number,
                    nfe_key: nfe.nfe_key,
                    nfe_date: nfe.nfe_date,
                    supplier_cnpj: nfe.supplier_cnpj,
                    supplier_name: nfe.supplier_name,
                    total_value: nfe.valor_total,
                    parsed_data: nfe,
                    source: `erp_${connection.erp_type}`,
                  }, { onConflict: 'user_id,nfe_key', ignoreDuplicates: true });

                if (insertError) {
                  failed++;
                } else {
                  synced++;
                }
              }

              results.push({ module: 'nfe', status: synced > 0 ? 'success' : 'error', records_synced: synced, records_failed: failed });
              totalSynced += synced;
              totalFailed += failed;
            } else {
              results.push({ module: 'nfe', status: 'skipped', records_synced: 0, records_failed: 0, message: 'Sem NF-e' });
            }
          } catch (error) {
            console.error('NF-e sync error:', error);
            results.push({ module: 'nfe', status: 'error', records_synced: 0, records_failed: 1, message: String(error) });
            totalFailed++;
          }
        }

        // Sync Financeiro
        if (modulesToSync.includes('financeiro')) {
          try {
            const financeiro = await adapter.syncFinanceiro(credentials);
            
            if (financeiro.length > 0) {
              // Aggregate into DRE-like structure
              const receitas = financeiro.filter(f => f.tipo === 'receita').reduce((sum, f) => sum + f.valor, 0);
              const despesas = financeiro.filter(f => f.tipo === 'despesa').reduce((sum, f) => sum + f.valor, 0);

              const currentDate = new Date();
              const { error: dreError } = await supabase
                .from('company_dre')
                .upsert({
                  user_id: userId,
                  period_type: 'monthly',
                  period_year: currentDate.getFullYear(),
                  period_month: currentDate.getMonth() + 1,
                  input_vendas_produtos: receitas,
                  input_custo_mercadorias: despesas * 0.6, // Estimate
                  input_salarios_encargos: despesas * 0.2, // Estimate
                  input_outras_despesas: despesas * 0.2, // Estimate
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,period_type,period_year,period_month' });

              if (dreError) {
                console.error('Error upserting DRE:', dreError);
                results.push({ module: 'financeiro', status: 'error', records_synced: 0, records_failed: financeiro.length, message: dreError.message });
                totalFailed += financeiro.length;
              } else {
                results.push({ module: 'financeiro', status: 'success', records_synced: financeiro.length, records_failed: 0 });
                totalSynced += financeiro.length;
              }
            } else {
              results.push({ module: 'financeiro', status: 'skipped', records_synced: 0, records_failed: 0, message: 'Sem dados financeiros' });
            }
          } catch (error) {
            console.error('Financeiro sync error:', error);
            results.push({ module: 'financeiro', status: 'error', records_synced: 0, records_failed: 1, message: String(error) });
            totalFailed++;
          }
        }

        // Update connection status
        const hasErrors = results.some(r => r.status === 'error');
        await supabase
          .from('erp_connections')
          .update({
            status: hasErrors ? 'error' : 'active',
            status_message: hasErrors ? 'Alguns módulos falharam' : 'Sincronização concluída',
            last_sync_at: new Date().toISOString(),
            next_sync_at: new Date(Date.now() + (connection.sync_config?.frequency_hours || 24) * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id);

        // Update sync log
        if (syncLog) {
          await supabase
            .from('erp_sync_logs')
            .update({
              status: hasErrors ? 'error' : 'success',
              completed_at: new Date().toISOString(),
              records_synced: totalSynced,
              records_failed: totalFailed,
              details: { modules: results },
            })
            .eq('id', syncLog.id);
        }

        // Trigger post-sync analyses
        try {
          // Trigger analyze-credits for NF-e data
          if (modulesToSync.includes('nfe')) {
            await supabase.functions.invoke('analyze-credits', {
              headers: { Authorization: authHeader },
            });
          }

          // Trigger match-opportunities for updated profile
          if (modulesToSync.includes('empresa') || modulesToSync.includes('produtos')) {
            await supabase.functions.invoke('match-opportunities', {
              headers: { Authorization: authHeader },
            });
          }
        } catch (triggerError) {
          console.error('Post-sync trigger error:', triggerError);
        }

        return new Response(JSON.stringify({
          success: !hasErrors,
          message: hasErrors ? 'Sincronização parcial' : 'Sincronização concluída',
          results,
          total_synced: totalSynced,
          total_failed: totalFailed,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Sync error:', error);

        // Update connection status to error
        await supabase
          .from('erp_connections')
          .update({
            status: 'error',
            status_message: String(error),
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id);

        // Update sync log
        if (syncLog) {
          await supabase
            .from('erp_sync_logs')
            .update({
              status: 'error',
              completed_at: new Date().toISOString(),
              error_message: String(error),
              details: { results },
            })
            .eq('id', syncLog.id);
        }

        // Log error internally, return sanitized message
        return new Response(JSON.stringify({ 
          error: 'Erro na sincronização. Tente novamente.',
          results 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    // Log error internally for debugging, but return sanitized message
    console.error('Handler error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno. Tente novamente.' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
