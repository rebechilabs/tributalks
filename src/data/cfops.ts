// src/data/cfops.ts
// Fonte: Ajuste SINIEF s/nº de 1970, com alterações até 2025

export interface CfopInfo {
  cfop: string;
  descricao: string;
  tipo: string;
  direcao: 'entrada' | 'saida';
  icmsNoDas: boolean;
  temST: boolean;
  relevanciaPataRadar: string;
}

export const CFOPS_SAIDA: Record<string, CfopInfo> = {
  "5102": { cfop: "5102", descricao: "Venda de mercadoria adquirida de terceiros - operação interna", tipo: "venda_normal", direcao: "saida", icmsNoDas: true, temST: false, relevanciaPataRadar: "Venda normal. ICMS é pago no DAS." },
  "5405": { cfop: "5405", descricao: "Venda de mercadoria com ST - operação interna", tipo: "venda_com_st", direcao: "saida", icmsNoDas: false, temST: true, relevanciaPataRadar: "CHAVE: ICMS já recolhido por ST. NÃO deve pagar ICMS no DAS." },
  "5403": { cfop: "5403", descricao: "Venda de mercadoria sujeita a ST (substituto) - interna", tipo: "venda_st_substituto", direcao: "saida", icmsNoDas: true, temST: true, relevanciaPataRadar: "Empresa é substituta (diferente de substituída)." },
  "5101": { cfop: "5101", descricao: "Venda de produção do estabelecimento - interna", tipo: "venda_producao", direcao: "saida", icmsNoDas: true, temST: false, relevanciaPataRadar: "Venda de produção própria (indústria)." },
  "6102": { cfop: "6102", descricao: "Venda de mercadoria adquirida de terceiros - interestadual", tipo: "venda_normal_interestadual", direcao: "saida", icmsNoDas: true, temST: false, relevanciaPataRadar: "Venda interestadual normal." },
  "6405": { cfop: "6405", descricao: "Venda de mercadoria com ST - interestadual", tipo: "venda_com_st_interestadual", direcao: "saida", icmsNoDas: false, temST: true, relevanciaPataRadar: "CHAVE: ICMS-ST já recolhido. NÃO deve pagar ICMS no DAS." },
};

export const CFOPS_ENTRADA: Record<string, CfopInfo> = {
  "1102": { cfop: "1102", descricao: "Compra para comercialização - interna", tipo: "compra_normal", direcao: "entrada", icmsNoDas: true, temST: false, relevanciaPataRadar: "Compra normal." },
  "1403": { cfop: "1403", descricao: "Compra para comercialização com ST - interna", tipo: "compra_com_st", direcao: "entrada", icmsNoDas: false, temST: true, relevanciaPataRadar: "Compra com ST. Na revenda, deve usar CFOP 5405." },
  "2102": { cfop: "2102", descricao: "Compra para comercialização - interestadual", tipo: "compra_interestadual", direcao: "entrada", icmsNoDas: true, temST: false, relevanciaPataRadar: "Compra interestadual normal." },
  "2403": { cfop: "2403", descricao: "Compra para comercialização com ST - interestadual", tipo: "compra_com_st_interestadual", direcao: "entrada", icmsNoDas: false, temST: true, relevanciaPataRadar: "Compra interestadual com ST." },
};

export function isCfopSaidaComST(cfop: string): boolean {
  return ["5405", "6405"].includes(cfop);
}

export function isCfopEntradaComST(cfop: string): boolean {
  return ["1403", "2403"].includes(cfop);
}
