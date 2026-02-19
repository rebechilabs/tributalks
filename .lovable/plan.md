

# Correcao do Bug Critico no SwitchCompanyCard

## Problema Real Encontrado

A investigacao revelou que **nenhuma** das tabelas afetadas possui a coluna `company_id`. Todas filtram apenas por `user_id`:

| Tabela | Tem user_id | Tem company_id |
|--------|:-----------:|:--------------:|
| identified_credits | Sim | **Nao** |
| credit_analysis_summary | Sim | **Nao** |
| xml_imports | Sim | **Nao** |
| fiscal_cross_analysis | Sim | **Nao** |
| dctf_debitos | Sim | **Nao** |
| dctf_declaracoes | Sim | **Nao** |
| sped_contribuicoes | Sim | **Nao** |
| company_ncm_analysis | Sim | **Nao** |
| company_opportunities | Sim | **Nao** |
| company_dre | Sim | **Nao** |
| price_simulations | Sim | **Nao** |
| margin_dashboard | Sim | **Nao** |
| erp_sync_logs | Sim | **Nao** |
| erp_connections | Sim | **Nao** |
| erp_checklist | Sim | **Nao** |
| company_profile | Sim (dono) | N/A (e a propria tabela) |

Isso significa que **nao e possivel** distinguir dados de empresas diferentes hoje. A correcao precisa de 2 etapas.

## Plano de Execucao

### Etapa 1 — Migracao SQL: Adicionar company_id em todas as tabelas

Adicionar coluna `company_id UUID REFERENCES company_profile(id) ON DELETE CASCADE` em cada uma das 15 tabelas.

A clausula `ON DELETE CASCADE` garante que ao deletar um `company_profile`, todos os dados filhos sao removidos automaticamente.

Tabelas que receberao `company_id`:
- identified_credits
- credit_analysis_summary
- xml_imports
- fiscal_cross_analysis
- dctf_debitos
- dctf_declaracoes
- sped_contribuicoes
- company_ncm_analysis
- company_opportunities
- company_dre
- price_simulations
- margin_dashboard
- erp_sync_logs
- erp_connections
- erp_checklist

Backfill: Para usuarios que ja tem dados e uma unica empresa, preencher automaticamente o `company_id` com o id da empresa existente:

```text
UPDATE identified_credits ic
SET company_id = (
  SELECT cp.id FROM company_profile cp 
  WHERE cp.user_id = ic.user_id 
  ORDER BY cp.created_at ASC LIMIT 1
)
WHERE ic.company_id IS NULL;
```

(Repetido para cada tabela)

### Etapa 2 — Corrigir SwitchCompanyCard.tsx

Arquivo: `src/components/profile/SwitchCompanyCard.tsx`

Mudancas:
1. Importar `useCompany` do `CompanyContext`
2. Obter `currentCompany` do hook
3. Adicionar guard `if (!currentCompany?.id) return`
4. Para cada DELETE, adicionar `.eq('company_id', currentCompany.id)` alem do `.eq('user_id', user.id)`
5. Para `company_profile`, deletar por `.eq('id', currentCompany.id)`

Exemplo do padrao corrigido:

```text
// Antes (apaga TUDO do usuario)
await supabase.from('identified_credits').delete().eq('user_id', user.id);

// Depois (apaga so da empresa atual)
await supabase.from('identified_credits').delete()
  .eq('user_id', user.id)
  .eq('company_id', currentCompany.id);

// company_profile — deleta pelo ID da empresa
await supabase.from('company_profile').delete()
  .eq('id', currentCompany.id);
```

### Etapa 3 — Atualizar RLS policies

Atualizar as policies das 15 tabelas para incluir validacao de `company_id` onde aplicavel, garantindo que usuarios so acessem dados de empresas que possuem.

## Nenhuma mudanca visual

O layout, textos e comportamento do componente permanecem identicos. Apenas os filtros SQL sao corrigidos.

## Secao Tecnica

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| Nova migracao SQL | ADD COLUMN company_id + FK + backfill + cascade |
| `src/components/profile/SwitchCompanyCard.tsx` | Import useCompany, filtrar DELETEs por company_id |

### Risco

- O backfill assume que usuarios com dados existentes tem pelo menos 1 company_profile (validado pelo fluxo de onboarding)
- Coluna `company_id` sera nullable inicialmente para nao quebrar inserts existentes — mas o backfill preenche todos os registros existentes
- Apos confirmar que o backfill funcionou, uma migracao futura pode tornar a coluna NOT NULL

### ON DELETE CASCADE

Com a FK `ON DELETE CASCADE`, a operacao de troca de empresa se simplifica: basta deletar o `company_profile` e todos os dados filhos sao removidos automaticamente pelo banco. O SwitchCompanyCard continuara deletando explicitamente para manter controle e logs, mas o cascade serve como rede de seguranca.

