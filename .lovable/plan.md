

# Plano: Lista de Despesas Operacionais Categorizada (Valores Anuais)

## Objetivo
Substituir o campo único de "Despesas Operacionais (energia, marketing, combustível)" por uma lista categorizada onde o usuário seleciona despesas específicas e informa o **valor anual** de cada uma.

## Interface Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│ Despesas Operacionais (valores anuais)          Total: R$ X/ano│
├─────────────────────────────────────────────────────────────────┤
│ ▼ I. Produção e Prestação de Serviços                           │
│   ☑ Energia elétrica ........................ R$ [______] /ano  │
│   ☑ Combustíveis e lubrificantes ............ R$ [______] /ano  │
│   ☐ Matéria-prima                                               │
│   ☐ Água (processo produtivo)                                   │
│                                                                 │
│ ▶ II. Logística e Transporte                                    │
│ ▶ III. Manutenção e Reparos                                     │
│ ... (outras categorias)                                         │
├─────────────────────────────────────────────────────────────────┤
│ ⚠ A creditação depende de prova de essencialidade...           │
└─────────────────────────────────────────────────────────────────┘
```

## Categorias (50 itens em 8 grupos)

| Categoria | Itens |
|-----------|-------|
| I. Produção e Prestação de Serviços | Matéria-prima, Produto intermediário, Embalagem primária/secundária, Energia elétrica, Energia térmica, Combustíveis, Água, Ferramentas, Industrialização |
| II. Logística e Transporte | Frete compra, Frete venda, Armazenagem, Paletes/contêineres, Seguro transporte |
| III. Manutenção e Reparos | Peças reposição, Manutenção preventiva/corretiva, Calibração, Software controle |
| IV. Qualidade e Conformidade | Testes qualidade, Certificações, Efluentes, Pragas, Licenciamento |
| V. Segurança e Saúde | EPIs, Uniformes, Exames médicos, Treinamentos NRs, Medicina trabalho |
| VI. Despesas com Pessoal | Vale-transporte, Vale-refeição, Seguro vida, Plano saúde |
| VII. Aluguéis e Arrendamento | Aluguel prédios/máquinas PJ, Leasing veículos, SaaS |
| VIII. Outras Despesas | Marketing, Comissões PJ, Limpeza, Vigilância, Royalties, Contabilidade, Depreciação, Taxas cartão, Telecom, Viagens |

## Mudanças Técnicas

### 1. Criar: `src/types/despesasOperacionais.ts`
```typescript
export interface DespesaItem {
  id: string;
  nome: string;
}

export interface CategoriaDespesa {
  id: string;
  nome: string;
  items: DespesaItem[];
}

export const CATEGORIAS_DESPESAS: CategoriaDespesa[] = [
  {
    id: 'producao',
    nome: 'I. Produção e Prestação de Serviços',
    items: [
      { id: 'materia_prima', nome: 'Matéria-prima' },
      { id: 'produto_intermediario', nome: 'Produto intermediário' },
      // ... demais 8 itens
    ]
  },
  // ... outras 7 categorias
];
```

### 2. Criar: `src/components/simpronto/DespesasOperacionaisSelector.tsx`
- Accordion por categoria (expansível/colapsível)
- Checkbox para ativar despesa
- Input de valor (R$/ano) aparece ao marcar
- Label "/ano" ao lado de cada campo
- Soma total em tempo real no header
- Alerta de essencialidade (50%) mantido

### 3. Atualizar: `src/types/simpronto.ts`
```typescript
interface SimprontoFormData {
  // ... campos existentes
  despesas_operacionais: string;           // soma total (mantido)
  despesas_detalhadas?: Record<string, number>; // { id: valor_anual }
}
```

### 4. Atualizar: `src/components/simpronto/SimprontoWizard.tsx`
- Remover label "(energia, marketing, combustível)"
- Integrar `DespesasOperacionaisSelector`
- Calcular soma dos valores selecionados → `despesas_operacionais`

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/types/despesasOperacionais.ts` | Criar |
| `src/components/simpronto/DespesasOperacionaisSelector.tsx` | Criar |
| `src/types/simpronto.ts` | Modificar |
| `src/components/simpronto/SimprontoWizard.tsx` | Modificar |

## Resultado
- Usuário visualiza todas as despesas potencialmente creditáveis
- Valores informados por ano (consistente com demais campos)
- Soma automática alimenta o cálculo existente de PIS/COFINS
- Organização por categoria facilita preenchimento

