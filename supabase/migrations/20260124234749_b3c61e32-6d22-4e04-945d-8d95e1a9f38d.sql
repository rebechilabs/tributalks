-- ===========================================
-- CAMPOS SETORIAIS PARA MATCHING DE OPORTUNIDADES
-- Adiciona campos específicos por setor na company_profile
-- ===========================================

-- AGRONEGÓCIO
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS tem_area_preservacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS comercializa_commodities boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compra_insumos_agricolas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS investe_maquinas_agricolas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tipo_cooperativa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS producao_rural boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pecuaria boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS agricultura boolean DEFAULT false;

-- ENERGIA SOLAR
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS tem_geracao_solar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compra_equipamento_solar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS importa_equipamento_solar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS projeto_infraestrutura_energia boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS potencia_solar_kw numeric DEFAULT 0;

-- SAÚDE
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS tem_internacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS procedimentos_complexos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS comercializa_medicamentos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compra_equipamentos_medicos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS investe_pd_saude boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS clinica boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS laboratorio boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hospital boolean DEFAULT false;

-- CONSTRUÇÃO CIVIL
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS incorporacao_imobiliaria boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS patrimonio_afetacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS programa_mcmv boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS folha_alta_construcao boolean DEFAULT false;

-- TRANSPORTE E LOGÍSTICA
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS transporte_cargas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS transporte_passageiros boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS investe_frota boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS frete_exportacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS operacao_interestadual boolean DEFAULT false;

-- ALIMENTAÇÃO (RESTAURANTES, BARES)
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS prepara_alimentos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recebe_gorjetas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS usa_plataformas_delivery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tem_bar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tem_restaurante boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tem_lanchonete boolean DEFAULT false;

-- E-COMMERCE E MARKETPLACE
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS centro_distribuicao_incentivado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS centro_distribuicao_zfm boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS estado_beneficio_icms text DEFAULT NULL;

-- EDUCAÇÃO
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS escola_regular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cursos_livres boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS faculdade boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fins_lucrativos boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investe_tecnologia_educacional boolean DEFAULT false;

-- CAMPOS GERAIS PARA FATOR R
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS fator_r_acima_28 boolean DEFAULT false;