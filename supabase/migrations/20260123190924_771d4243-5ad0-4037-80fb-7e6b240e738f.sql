-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  nome TEXT,
  empresa TEXT,
  regime TEXT CHECK (regime IN ('SIMPLES', 'PRESUMIDO', 'REAL')),
  setor TEXT CHECK (setor IN ('industria', 'comercio', 'servicos', 'tecnologia', 'outro')),
  faturamento_mensal DECIMAL(15, 2),
  estado TEXT,
  cnae TEXT,
  percentual_vendas_pj DECIMAL(5, 2) DEFAULT 0.80,
  plano TEXT DEFAULT 'FREE' CHECK (plano IN ('FREE', 'PRO')),
  stripe_customer_id TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil no signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Tabela de calculadoras
CREATE TABLE public.calculators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  status TEXT DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'EM_BREVE', 'DESATIVADO')),
  ordem INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir calculadoras iniciais
INSERT INTO public.calculators (slug, nome, descricao, icone, status, ordem) VALUES
('split-payment', 'Impacto do Split Payment', 'Descubra quanto vai ficar retido no seu caixa com o novo sistema', 'Wallet', 'ATIVO', 1),
('comparativo-regimes', 'Comparativo de Regimes', 'Simples vs Presumido vs Real — descubra qual é o melhor para sua empresa', 'Scale', 'ATIVO', 2),
('creditos-pis-cofins', 'Créditos PIS/COFINS', 'Identifique oportunidades de créditos tributários', 'FileText', 'EM_BREVE', 3),
('holding-familiar', 'Holding Familiar', 'Avalie vantagens de uma estrutura de holding', 'Building', 'EM_BREVE', 4);

-- RLS para calculadoras (público para leitura)
ALTER TABLE public.calculators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calculadoras são públicas para leitura"
ON public.calculators FOR SELECT
TO authenticated
USING (true);

-- Tabela de simulações
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  calculator_slug TEXT NOT NULL,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para simulações
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias simulações"
ON public.simulations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias simulações"
ON public.simulations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias simulações"
ON public.simulations FOR DELETE
USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();