

# Plano: Adicionar Passo de NCMs/NBS Opcional no DRE Wizard

## Objetivo

Criar um novo passo no wizard do DRE (Etapa 6 - opcional) onde o usuário pode informar os NCMs dos seus produtos OU as categorias de serviços (NBS). Se o usuário não souber o código, pode pesquisar pelo nome do produto/serviço.

## Análise Técnica

### Busca de NCM (Produtos)
A busca por nome de produto **já existe** no `NCMSearchModal.tsx`:
- Conecta à API oficial: `piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/ncm`
- Retorna ~14.000 NCMs com descrições
- Permite buscar por código OU pelo nome do produto (linha 96: `item.descricao.toLowerCase().includes(searchLower)`)

### Busca de NBS (Serviços)
Não há API oficial para NBS. O sistema atual usa 12 categorias fixas em `CalculadoraNBS.tsx`:
- Serviços em Geral (26.5%)
- Saúde (15.9% - 40% redução)
- Educação (15.9% - 40% redução)
- TI, Advocacia, Contabilidade, etc.

## Arquitetura da Solução

### 1. Banco de Dados

Criar nova tabela `user_product_catalog` para armazenar os produtos/serviços informados:

```sql
CREATE TABLE public.user_product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Tipo: produto (NCM) ou serviço (NBS)
  tipo TEXT NOT NULL DEFAULT 'produto',
  
  -- Para produtos
  ncm_code TEXT,
  
  -- Para serviços (categoria do CalculadoraNBS)
  nbs_categoria TEXT,
  
  -- Nome dado pelo usuário
  nome TEXT NOT NULL,
  
  -- Percentual da receita (opcional)
  percentual_receita NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, ncm_code),
  UNIQUE(user_id, nbs_categoria, nome)
);

-- RLS
ALTER TABLE public.user_product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own catalog"
  ON public.user_product_catalog
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_product_catalog_user_id ON public.user_product_catalog(user_id);
```

### 2. Novo Componente: ProductCatalogStep

Criar `src/components/dre/ProductCatalogStep.tsx`:

**Interface do Usuário:**

```text
+--------------------------------------------------------------+
|  📦 Seus Principais Produtos/Serviços (Opcional)             |
|                                                              |
|  Informe o que você vende para cálculos mais precisos na     |
|  Reforma Tributária. Pode pular se preferir.                 |
|                                                              |
|  ┌────────────────────────────────────────────────────────┐  |
|  │  O que você vende?                                     │  |
|  │  ○ Produtos (NCM)    ○ Serviços (NBS)                 │  |
|  └────────────────────────────────────────────────────────┘  |
|                                                              |
|  ┌─ SE PRODUTO ─────────────────────────────────────────────┐|
|  │  Nome: [Notebooks           ] [🔍 Buscar NCM]           │|
|  │  NCM encontrado: 8471.30.12 - Notebooks e laptops       │|
|  │  % da Receita: [25%         ] (opcional)                │|
|  │  [+ Adicionar]                                          │|
|  └─────────────────────────────────────────────────────────┘|
|                                                              |
|  ┌─ SE SERVIÇO ─────────────────────────────────────────────┐|
|  │  Qual tipo de serviço você presta?                      │|
|  │  [▼ Selecione a categoria                     ]         │|
|  │     - Tecnologia da Informação                          │|
|  │     - Serviços de Saúde (40% redução)                   │|
|  │     - Serviços de Educação (40% redução)                │|
|  │     - Advocacia                                          │|
|  │     - etc...                                             │|
|  │  Nome específico: [Desenvolvimento de software ]         │|
|  │  [+ Adicionar]                                          │|
|  └─────────────────────────────────────────────────────────┘|
|                                                              |
|  Itens adicionados:                                         |
|  ┌─────────────────────────────────────────────────────────┐|
|  │ 🏷️ 8471.30.12 - Notebooks (25%)                  [🗑️] │|
|  │ 🏷️ 8517.12.10 - Smartphones (40%)                [🗑️] │|
|  │ 💼 TI - Desenvolvimento de software (35%)        [🗑️] │|
|  └─────────────────────────────────────────────────────────┘|
|                                                              |
|  [Pular esta etapa →]            [← Voltar] [Finalizar ✓]  |
+--------------------------------------------------------------+
```

### 3. Fluxo de Busca por Nome (Produtos)

1. Usuário digita "notebook" no campo "Nome"
2. Clica em "🔍 Buscar NCM"
3. Abre o `NCMSearchModal` existente (já busca por nome!)
4. Usuário seleciona o NCM correto
5. NCM é preenchido automaticamente

### 4. Fluxo de Seleção (Serviços)

1. Usuário seleciona "Serviços (NBS)"
2. Aparece dropdown com as 12 categorias do `CalculadoraNBS`
3. Usuário escolhe a categoria que mais se aproxima
4. Opcionalmente descreve o serviço específico

### 5. Modificações no DREWizard.tsx

```typescript
// Adicionar ao array de steps
const steps = [
  { id: 1, title: 'Suas Vendas', icon: ShoppingCart },
  { id: 2, title: 'Custos', icon: Package },
  { id: 3, title: 'Despesas', icon: Briefcase },
  { id: 4, title: 'Financeiro', icon: Landmark },
  { id: 5, title: 'Impostos', icon: Calculator },
  { id: 6, title: 'Produtos', icon: Tag, optional: true }, // Nova etapa
];

// Novo estado
const [productCatalog, setProductCatalog] = useState<ProductItem[]>([]);

// Novo case no renderStep()
case 6:
  return (
    <ProductCatalogStep 
      items={productCatalog}
      onChange={setProductCatalog}
      onSkip={() => handleSubmit()}
    />
  );
```

### 6. Integração com Calculadora RTC

Quando o usuário acessa `/calculadora/rtc?from_dre=true`:
1. Buscar itens do `user_product_catalog`
2. Filtrar apenas produtos (tipo = 'produto')
3. Pré-preencher os NCMs no formulário

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/dre/ProductCatalogStep.tsx` | Componente do passo 6 |
| `src/components/dre/ServiceCategorySelect.tsx` | Select das categorias NBS |

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/dre/DREWizard.tsx` | Adicionar etapa 6, novo estado, novo import |
| `src/components/dre/index.ts` | Exportar novos componentes |
| `src/pages/calculadora/CalculadoraRTC.tsx` | Buscar produtos salvos quando vem do DRE |

## Experiência do Usuário

### Para quem vende Produtos:
1. Digita o nome do produto (ex: "café", "notebook", "camiseta")
2. Clica em "Buscar NCM"
3. Modal abre com resultados filtrados pelo nome
4. Seleciona o NCM correto
5. Pronto! NCM salvo para uso na Calculadora RTC

### Para quem presta Serviços:
1. Seleciona "Serviços (NBS)"
2. Escolhe a categoria mais próxima (ex: "Tecnologia da Informação")
3. Opcionalmente descreve o serviço específico
4. Pronto! Categoria salva para uso na Calculadora NBS

### Pular é sempre uma opção:
- Botão "Pular esta etapa" está sempre visível
- Usuário não é obrigado a preencher nada
- DRE funciona normalmente sem esta etapa

## Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Busca inteligente** | Usuário digita "notebook" e encontra o NCM 84713012 |
| **Sem obrigatoriedade** | Etapa 100% opcional com "Pular" visível |
| **Dados persistentes** | NCMs/categorias ficam salvos para uso futuro |
| **Integração RTC** | Calculadora RTC pode pré-preencher com produtos cadastrados |
| **Suporte a serviços** | Categorias NBS com alíquotas diferenciadas |

