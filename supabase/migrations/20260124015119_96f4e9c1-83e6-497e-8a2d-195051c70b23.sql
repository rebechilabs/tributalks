-- ===========================================
-- OPORTUNIDADES TRIBUTÁRIAS POR SETOR
-- TribuTech - Janeiro/2026
-- ===========================================

-- ===========================================
-- AGRONEGÓCIO
-- ===========================================

INSERT INTO tax_opportunities (
  code, name, name_simples, description, description_ceo, category, 
  tributos_afetados, criterios, economia_percentual_min, economia_percentual_max, 
  base_legal, base_legal_resumo, is_active, complexidade, tempo_implementacao, 
  risco_fiscal, requer_contador, requer_advogado
) VALUES

('AGRO_001', 'Funrural - Pessoa Física x Jurídica', 'Economia na contribuição rural',
'Comparação entre contribuição do Funrural como pessoa física (1,2%) ou sobre folha de pagamento (2,05%) para identificar o modelo mais vantajoso.',
'Compare o Funrural como pessoa física (1,2%) ou sobre folha de pagamento (2,05%) e escolha o mais vantajoso para sua fazenda.',
'regime_especial', ARRAY['FUNRURAL'],
'{"setor_in": ["agronegocio", "agro"], "atividade_rural": true}'::jsonb,
40, 50, 'Lei 13.606/2018', 'Lei que permite escolha do modelo de contribuição rural', 
true, 'media', '2-4 semanas', 'baixo', true, false),

('AGRO_002', 'Isenção/Redução ICMS Insumos Agrícolas', 'Insumos agrícolas com imposto reduzido',
'Diversos estados concedem isenção ou redução de ICMS para insumos agropecuários como sementes, fertilizantes, defensivos e rações.',
'Sementes, fertilizantes, defensivos e rações têm ICMS reduzido ou isento em diversos estados.',
'incentivo', ARRAY['ICMS'],
'{"setor_in": ["agronegocio", "agro"], "compra_insumos_agricolas": true}'::jsonb,
50, 100, 'Convênio ICMS 100/97', 'Convênio que autoriza isenção de ICMS para insumos agrícolas',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

('AGRO_003', 'Depreciação Acelerada de Máquinas Agrícolas', 'Desconto na compra de tratores e máquinas',
'Dedução acelerada de máquinas e equipamentos agrícolas para redução do IR no Lucro Real.',
'Deduza mais rapidamente o valor de tratores e equipamentos agrícolas do seu imposto de renda.',
'credito', ARRAY['IRPJ'],
'{"setor_in": ["agronegocio", "agro"], "lucro_real": true, "investe_maquinas": true}'::jsonb,
25, 30, 'Lei 11.774/2008', 'Depreciação acelerada incentivada para máquinas agrícolas',
true, 'media', '1-2 meses', 'baixo', true, false),

('AGRO_004', 'ITR - Exclusão Área de Preservação', 'Menos imposto na terra preservada',
'Áreas de preservação permanente (APP), reserva legal e proteção ambiental são excluídas do cálculo do ITR.',
'Áreas de preservação (APP, reserva legal) são excluídas do cálculo do ITR - pague menos pela terra.',
'isencao', ARRAY['ITR'],
'{"setor_in": ["agronegocio", "agro"], "tem_area_preservacao": true}'::jsonb,
30, 70, 'Lei 9.393/96', 'Lei do ITR que exclui áreas de preservação da base de cálculo',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('AGRO_005', 'Diferimento ICMS na Comercialização', 'Imposto só na venda final',
'Postergar o pagamento do ICMS para operações subsequentes na cadeia produtiva agrícola.',
'Posterge o pagamento do ICMS para operações futuras na cadeia de produção agrícola.',
'regime_especial', ARRAY['ICMS'],
'{"setor_in": ["agronegocio", "agro"], "comercializa_commodities": true}'::jsonb,
15, 20, 'Legislação estadual específica', 'Diferimento de ICMS para operações agrícolas',
true, 'media', '1-2 meses', 'baixo', true, false),

('AGRO_006', 'Regime Especial Cooperativas Agrícolas', 'Benefícios especiais para cooperativas',
'Ato cooperativo tem tratamento diferenciado - não incidência de IR/CSLL sobre sobras distribuídas.',
'Cooperativas agrícolas têm tratamento especial: sobras não pagam IR/CSLL.',
'regime_especial', ARRAY['IRPJ', 'CSLL'],
'{"setor_in": ["agronegocio", "agro"], "tipo_societario": "cooperativa"}'::jsonb,
25, 34, 'Lei 5.764/71, Lei 10.865/04', 'Lei das Cooperativas - tratamento tributário diferenciado',
true, 'alta', '2-3 meses', 'baixo', true, true),

-- ===========================================
-- ENERGIA SOLAR
-- ===========================================

('SOLAR_001', 'Isenção ICMS Micro e Minigeração', 'Energia solar sem ICMS',
'Sistemas de geração distribuída (até 5MW) têm isenção de ICMS sobre a energia compensada.',
'Sistemas de geração distribuída (até 5MW) não pagam ICMS sobre a energia compensada.',
'isencao', ARRAY['ICMS'],
'{"tem_geracao_solar": true, "potencia_kw_ate": 5000}'::jsonb,
25, 30, 'Convênio ICMS 16/2015', 'Isenção de ICMS para geração distribuída solar',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('SOLAR_002', 'Isenção IPI Equipamentos Solares', 'Painéis solares sem imposto federal',
'Isenção de IPI na aquisição de painéis fotovoltaicos e inversores para geração solar.',
'Compre painéis fotovoltaicos e inversores sem pagar IPI.',
'isencao', ARRAY['IPI'],
'{"compra_equipamento_solar": true}'::jsonb,
10, 15, 'Decreto 8.950/2016', 'Isenção de IPI para equipamentos de energia renovável',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('SOLAR_003', 'PIS/COFINS Zero na Importação Solar', 'Importação de equipamentos com menos imposto',
'Alíquota zero de PIS/COFINS na importação de equipamentos para geração de energia solar.',
'Importe equipamentos solares com PIS/COFINS zerados.',
'isencao', ARRAY['PIS', 'COFINS'],
'{"importa_equipamento_solar": true}'::jsonb,
9, 10, 'Lei 11.488/07', 'Alíquota zero para importação de equipamentos de energia renovável',
true, 'media', '2-4 semanas', 'baixo', true, false),

('SOLAR_004', 'REIDI para Projetos de Energia Solar', 'Isenção para projetos de infraestrutura solar',
'Regime Especial de Incentivos para projetos de infraestrutura em energia renovável.',
'Projetos de energia renovável podem usar o REIDI para suspender PIS/COFINS na compra de insumos.',
'regime_especial', ARRAY['PIS', 'COFINS'],
'{"setor_in": ["energia", "solar"], "projeto_infraestrutura": true}'::jsonb,
9, 10, 'Lei 11.488/07', 'REIDI - suspensão de PIS/COFINS para projetos de infraestrutura',
true, 'alta', '3-6 meses', 'baixo', true, true),

('SOLAR_005', 'IPTU Verde Municipal', 'Desconto no IPTU com energia solar',
'Diversos municípios concedem desconto no IPTU para imóveis com geração fotovoltaica instalada.',
'Muitas cidades dão desconto de até 30% no IPTU para imóveis com geração solar.',
'incentivo', ARRAY['IPTU'],
'{"tem_geracao_solar": true}'::jsonb,
10, 30, 'Legislação municipal específica', 'Incentivo municipal para energia renovável',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

-- ===========================================
-- SAÚDE
-- ===========================================

('SAUDE_001', 'Equiparação Hospitalar para Clínicas', 'Clínica pagando como hospital',
'Clínicas com internação ou procedimentos complexos podem ter base de cálculo presumida de 8% ao invés de 32%, economizando até 75% no IR/CSLL.',
'Clínicas com internação ou procedimentos complexos podem usar base presumida de 8% ao invés de 32%, economizando até 75% no IR.',
'regime_especial', ARRAY['IRPJ', 'CSLL'],
'{"setor_in": ["saude"], "atividade_in": ["clinica", "laboratorio", "hospital"], "tem_internacao_ou_procedimento_complexo": true}'::jsonb,
60, 75, 'Lei 9.249/95, IN RFB 1.234/12', 'Equiparação hospitalar - base presumida de 8%',
true, 'media', '1-2 meses', 'baixo', true, false),

('SAUDE_002', 'Redução PIS/COFINS Medicamentos', 'Imposto reduzido em medicamentos',
'Medicamentos de lista positiva da ANVISA têm alíquota zero ou reduzida de PIS/COFINS.',
'Medicamentos da lista positiva da ANVISA têm PIS/COFINS zerado ou reduzido.',
'monofasico', ARRAY['PIS', 'COFINS'],
'{"setor_in": ["saude", "comercio"], "vende_farmacos": true}'::jsonb,
5, 10, 'Lei 10.147/00', 'Tributação monofásica de medicamentos',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

('SAUDE_003', 'Imunidade ICMS Órteses e Próteses', 'Equipamentos médicos sem ICMS',
'Isenção de ICMS sobre órteses, próteses e equipamentos médicos em diversos estados.',
'Órteses, próteses e equipamentos médicos têm isenção de ICMS em diversos estados.',
'isencao', ARRAY['ICMS'],
'{"setor_in": ["saude"], "compra_equipamentos_medicos": true}'::jsonb,
12, 18, 'Convênio ICMS 01/99', 'Isenção de ICMS para equipamentos médicos',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

('SAUDE_004', 'Lei do Bem para P&D em Saúde', 'Incentivo para pesquisa médica',
'Empresas que investem em P&D na área de saúde podem deduzir 60-100% dos gastos do IR.',
'Invista em pesquisa e desenvolvimento na área de saúde e deduza até 100% do IR.',
'incentivo', ARRAY['IRPJ'],
'{"setor_in": ["saude"], "tem_atividade_pd": true, "lucro_real": true}'::jsonb,
20, 34, 'Lei 11.196/05 (Lei do Bem)', 'Incentivo fiscal para pesquisa e desenvolvimento',
true, 'alta', '3-6 meses', 'baixo', true, true),

-- ===========================================
-- CONSTRUÇÃO CIVIL
-- ===========================================

('CONST_001', 'RET - Regime Especial de Tributação', 'Pague só 4% de imposto em obras imobiliárias',
'Incorporações imobiliárias podem optar pelo RET com alíquota unificada de 4% sobre a receita.',
'Incorporações imobiliárias podem usar o RET e pagar apenas 4% sobre a receita ao invés de 6-15%.',
'regime_especial', ARRAY['IRPJ', 'CSLL', 'PIS', 'COFINS'],
'{"setor_in": ["construcao"], "atividade_in": ["incorporacao_imobiliaria", "construtora"]}'::jsonb,
50, 70, 'Lei 10.931/04', 'Regime Especial de Tributação para incorporações',
true, 'media', '1-2 meses', 'baixo', true, false),

('CONST_002', 'Patrimônio de Afetação', 'Obra separada da empresa para pagar menos',
'Cada empreendimento é tratado como entidade separada, com tributação própria pelo RET.',
'Use patrimônio de afetação para separar cada obra e tributar individualmente pelo RET (4%).',
'regime_especial', ARRAY['IRPJ', 'CSLL', 'PIS', 'COFINS'],
'{"setor_in": ["construcao"], "atividade_in": ["incorporacao_imobiliaria"]}'::jsonb,
50, 70, 'Lei 10.931/04', 'Patrimônio de afetação para segurança e benefício fiscal',
true, 'media', '1-2 meses', 'baixo', true, true),

('CONST_003', 'Minha Casa Minha Vida - Tributação 1%', 'Imposto de 1% para habitação popular',
'Construções do programa MCMV têm tributação unificada de apenas 1% sobre a receita.',
'Construções do Minha Casa Minha Vida pagam apenas 1% de imposto sobre a receita.',
'regime_especial', ARRAY['IRPJ', 'CSLL', 'PIS', 'COFINS'],
'{"setor_in": ["construcao"], "programa_mcmv": true}'::jsonb,
70, 80, 'Lei 12.024/09', 'Tributação especial para habitação popular',
true, 'media', '1-2 meses', 'nenhum', true, false),

('CONST_004', 'Desoneração da Folha - Construção', 'Pagar menos sobre salários',
'Construção civil pode optar pela desoneração (contribuição sobre receita ao invés de folha).',
'Construção civil pode optar pela desoneração: contribuição sobre receita ao invés da folha de pagamento.',
'regime_especial', ARRAY['INSS'],
'{"setor_in": ["construcao"], "folha_alta": true}'::jsonb,
20, 35, 'Lei 12.546/11', 'Desoneração da folha de pagamento para construção civil',
true, 'media', '1-2 meses', 'baixo', true, false),

-- ===========================================
-- TRANSPORTE E LOGÍSTICA
-- ===========================================

('TRANSP_001', 'Crédito Presumido ICMS Transporte', 'Desconto no ICMS do frete',
'Transportadoras têm direito a crédito presumido de 20% sobre o ICMS devido.',
'Transportadoras têm direito automático a crédito presumido de 20% sobre o ICMS.',
'credito', ARRAY['ICMS'],
'{"setor_in": ["transporte", "logistica"], "atividade_in": ["transporte_cargas", "transporte_passageiros"]}'::jsonb,
18, 22, 'Convênio ICMS 106/96', 'Crédito presumido de ICMS para transportadoras',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

('TRANSP_002', 'Redução Base ICMS Interestadual', 'Frete entre estados com menos imposto',
'Alguns estados reduzem a base de cálculo do ICMS no transporte interestadual.',
'Alguns estados reduzem a base de cálculo do ICMS no transporte interestadual.',
'regime_especial', ARRAY['ICMS'],
'{"setor_in": ["transporte", "logistica"], "opera_outros_estados": true}'::jsonb,
30, 50, 'Legislação estadual', 'Redução de base de cálculo para transporte interestadual',
true, 'media', '1-2 meses', 'baixo', true, false),

('TRANSP_003', 'Subvenção para Renovação de Frota', 'Incentivo para renovar a frota',
'Lei 14.789/2023 permite subvenção para investimento em renovação de veículos.',
'A nova lei permite subvenção para investimento em renovação de veículos.',
'incentivo', ARRAY['IRPJ'],
'{"setor_in": ["transporte", "logistica"], "investe_frota": true, "lucro_real": true}'::jsonb,
15, 25, 'Lei 14.789/2023', 'Subvenção para investimento em renovação de frota',
true, 'alta', '3-6 meses', 'baixo', true, true),

('TRANSP_004', 'Fator R - Transporte de Passageiros', 'Menos imposto com mais funcionários',
'Empresas de transporte de passageiros no Simples podem usar Fator R para tributar pelo Anexo III.',
'Empresas de transporte de passageiros com folha alta podem tributar pelo Anexo III do Simples.',
'segregacao', ARRAY['SIMPLES'],
'{"setor_in": ["transporte"], "atividade_in": ["transporte_passageiros"], "regime_tributario": "simples", "folha_percentual_faturamento_min": 28}'::jsonb,
30, 40, 'LC 123/06', 'Fator R para redução de alíquota no Simples Nacional',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('TRANSP_005', 'Isenção PIS/COFINS Exportação', 'Frete de exportação sem imposto',
'Transporte internacional e de mercadorias para exportação têm isenção de PIS/COFINS.',
'Transporte de mercadorias para exportação tem isenção de PIS/COFINS.',
'isencao', ARRAY['PIS', 'COFINS'],
'{"setor_in": ["transporte", "logistica"], "exporta_servicos": true}'::jsonb,
9, 10, 'Lei 10.833/03', 'Isenção de PIS/COFINS para exportação de serviços',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

-- ===========================================
-- ALIMENTAÇÃO (RESTAURANTES, BARES)
-- ===========================================

('ALIM_001', 'Regime Especial ICMS 4% Restaurantes', 'Imposto fixo de 4% sobre vendas',
'Em SP e outros estados, restaurantes podem optar por regime especial com ICMS de 4% sobre receita.',
'Em SP e outros estados, restaurantes podem optar por regime especial com ICMS de apenas 4%.',
'regime_especial', ARRAY['ICMS'],
'{"setor_in": ["alimentacao", "restaurante"], "atividade_in": ["restaurante", "bar", "lanchonete"], "uf_sede_in": ["SP", "RJ", "MG"]}'::jsonb,
30, 50, 'Decreto 51.597/07 (SP)', 'Regime especial de ICMS para restaurantes',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

('ALIM_002', 'Redução 40% IBS/CBS Reforma Tributária', 'Imposto 40% menor a partir de 2026',
'Com a Reforma Tributária, alimentos preparados terão redução de 40% nas alíquotas de IBS/CBS.',
'Com a Reforma Tributária, alimentos preparados terão redução de 40% nas alíquotas de IBS/CBS.',
'regime_especial', ARRAY['IBS', 'CBS'],
'{"setor_in": ["alimentacao", "restaurante"], "prepara_alimentos": true}'::jsonb,
35, 45, 'LC 214/2025, Art. 273-276', 'Redução de alíquota para alimentação na reforma tributária',
true, 'media', '2-4 semanas', 'nenhum', true, false),

('ALIM_003', 'Exclusão Gorjetas da Base', 'Gorjeta fora do imposto',
'O valor das gorjetas é excluído da base de cálculo dos tributos federais e municipais.',
'O valor das gorjetas é excluído da base de cálculo dos tributos.',
'isencao', ARRAY['IBS', 'CBS', 'ISS'],
'{"setor_in": ["alimentacao", "restaurante"], "recebe_gorjetas": true}'::jsonb,
8, 12, 'LC 214/2025', 'Exclusão de gorjetas da base de cálculo tributária',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('ALIM_004', 'Exclusão Taxas de Delivery', 'Taxa do iFood/Rappi fora do imposto',
'Valores retidos por plataformas de entrega são excluídos da base de cálculo tributária.',
'Valores retidos pelas plataformas de delivery não entram na base de cálculo de impostos.',
'isencao', ARRAY['IBS', 'CBS', 'ISS'],
'{"setor_in": ["alimentacao", "restaurante"], "usa_plataformas_delivery": true}'::jsonb,
15, 30, 'LC 214/2025', 'Exclusão de comissões de marketplace da base tributária',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('ALIM_005', 'Fator R - Restaurantes', 'Menos imposto com equipe na CLT',
'Restaurantes com folha de pagamento superior a 28% do faturamento tributam pelo Anexo III do Simples.',
'Restaurantes com folha de pagamento acima de 28% do faturamento tributam pelo Anexo III (menor).',
'segregacao', ARRAY['SIMPLES'],
'{"setor_in": ["alimentacao", "restaurante"], "regime_tributario": "simples", "folha_percentual_faturamento_min": 28}'::jsonb,
30, 40, 'LC 123/06', 'Fator R para restaurantes no Simples Nacional',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

-- ===========================================
-- E-COMMERCE E MARKETPLACE
-- ===========================================

('ECOM_001', 'Incentivos Estaduais ICMS E-commerce', 'Estados que cobram menos imposto',
'SC, ES, GO e outros estados oferecem incentivos fiscais para e-commerce (crédito presumido, redução de base).',
'SC, ES, GO e outros estados oferecem incentivos fiscais para e-commerce com economia de até 50% no ICMS.',
'incentivo', ARRAY['ICMS'],
'{"setor_in": ["comercio"], "tem_ecommerce": true, "uf_sede_in": ["SC", "ES", "GO", "MG"]}'::jsonb,
30, 50, 'TTD-SC, Compete-ES, Produzir-GO', 'Incentivos estaduais para e-commerce',
true, 'alta', '2-4 meses', 'baixo', true, true),

('ECOM_002', 'Simples Nacional Anexo I para E-commerce', 'Venda online com imposto reduzido',
'E-commerce tributa pelo Anexo I do Simples Nacional (mais vantajoso que serviços).',
'E-commerce tributa pelo Anexo I do Simples Nacional, com alíquota inicial de apenas 4%.',
'regime_especial', ARRAY['SIMPLES'],
'{"setor_in": ["comercio"], "tem_ecommerce": true, "regime_tributario": "simples"}'::jsonb,
20, 40, 'LC 123/06', 'Tributação de comércio pelo Anexo I do Simples',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('ECOM_003', 'Zona Franca de Manaus para E-commerce', 'Estoque em Manaus paga menos',
'Produtos comercializados a partir da ZFM têm benefícios de IPI, ICMS e PIS/COFINS.',
'Produtos comercializados a partir da Zona Franca de Manaus têm benefícios de IPI, ICMS e PIS/COFINS.',
'regime_especial', ARRAY['IPI', 'ICMS', 'PIS', 'COFINS'],
'{"setor_in": ["comercio"], "zona_franca": true}'::jsonb,
40, 60, 'Decreto-Lei 288/67', 'Benefícios fiscais da Zona Franca de Manaus',
true, 'alta', '3-6 meses', 'medio', true, true),

('ECOM_004', 'Créditos Monofásicos E-commerce', 'Produtos que já tiveram o imposto pago',
'E-commerces que vendem cosméticos, bebidas, autopeças não recolhem PIS/COFINS (já pago na indústria).',
'Cosméticos, bebidas, autopeças e pneus vendidos online não recolhem PIS/COFINS pois são monofásicos.',
'monofasico', ARRAY['PIS', 'COFINS'],
'{"setor_in": ["comercio"], "tem_ecommerce": true, "tem_produtos_monofasicos": true}'::jsonb,
9, 10, 'Lei 10.147/00, Lei 10.485/02', 'Tributação monofásica para e-commerce',
true, 'baixa', '2-4 semanas', 'nenhum', true, false),

-- ===========================================
-- EDUCAÇÃO
-- ===========================================

('EDUC_001', 'Redução 60% IBS/CBS Educação', 'Escola pagando 60% menos imposto',
'Serviços educacionais listados no Anexo II da LC 214/2025 têm redução de 60% nas alíquotas de IBS/CBS.',
'Serviços educacionais listados no Anexo II da reforma terão redução de 60% nas alíquotas de IBS/CBS.',
'regime_especial', ARRAY['IBS', 'CBS'],
'{"setor_in": ["educacao"], "atividade_in": ["escola", "faculdade", "curso", "universidade"]}'::jsonb,
55, 65, 'LC 214/2025, Art. 129', 'Redução de alíquota para educação na reforma tributária',
true, 'media', '2-4 semanas', 'nenhum', true, false),

('EDUC_002', 'Imunidade Tributária - Sem Fins Lucrativos', 'Escola filantrópica sem impostos',
'Instituições educacionais sem fins lucrativos são imunes a impostos federais, estaduais e municipais.',
'Instituições educacionais sem fins lucrativos são imunes a impostos.',
'isencao', ARRAY['IRPJ', 'CSLL', 'ISS', 'ICMS'],
'{"setor_in": ["educacao"], "fins_lucrativos": false}'::jsonb,
90, 100, 'CF/88, Art. 150, VI', 'Imunidade constitucional para entidades educacionais',
true, 'alta', '3-6 meses', 'baixo', true, true),

('EDUC_003', 'Fator R - Escolas', 'Menos imposto com professores CLT',
'Escolas com folha de pagamento alta (acima de 28%) tributam pelo Anexo III do Simples Nacional.',
'Escolas com folha de pagamento alta (acima de 28%) tributam pelo Anexo III do Simples.',
'segregacao', ARRAY['SIMPLES'],
'{"setor_in": ["educacao"], "regime_tributario": "simples", "folha_percentual_faturamento_min": 28}'::jsonb,
30, 40, 'LC 123/06', 'Fator R para instituições de ensino no Simples',
true, 'baixa', '1-2 semanas', 'nenhum', true, false),

('EDUC_004', 'Dedução Tecnologia Educacional', 'Desconto por investir em tecnologia',
'Gastos com softwares de gestão e plataformas de ensino podem ser deduzidos do IR no Lucro Real.',
'Gastos com softwares educacionais e plataformas de ensino podem ser deduzidos do IR.',
'credito', ARRAY['IRPJ'],
'{"setor_in": ["educacao"], "investe_em_inovacao": true, "lucro_real": true}'::jsonb,
15, 25, 'Lei 11.196/05', 'Incentivo fiscal para investimento em tecnologia',
true, 'media', '2-3 meses', 'baixo', true, false)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_simples = EXCLUDED.name_simples,
  description = EXCLUDED.description,
  description_ceo = EXCLUDED.description_ceo,
  category = EXCLUDED.category,
  tributos_afetados = EXCLUDED.tributos_afetados,
  criterios = EXCLUDED.criterios,
  economia_percentual_min = EXCLUDED.economia_percentual_min,
  economia_percentual_max = EXCLUDED.economia_percentual_max,
  base_legal = EXCLUDED.base_legal,
  base_legal_resumo = EXCLUDED.base_legal_resumo,
  complexidade = EXCLUDED.complexidade,
  tempo_implementacao = EXCLUDED.tempo_implementacao,
  risco_fiscal = EXCLUDED.risco_fiscal,
  requer_contador = EXCLUDED.requer_contador,
  requer_advogado = EXCLUDED.requer_advogado,
  updated_at = now();