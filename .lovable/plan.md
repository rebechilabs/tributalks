
# Plano: Gerenciamento Completo de CNPJs no Onboarding e Além

## Resumo das Suas Perguntas

| Pergunta | Solução Proposta |
|----------|------------------|
| Usuário preencheu 1 de 4, como adiciona os outros? | Acesso permanente via Sidebar + Perfil + CompanySelector |
| Depois de salvar não pode alterar? | Sim, poderá **editar e remover** a qualquer momento |

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────┐
│                      FLUXO DO USUÁRIO                       │
├─────────────────────────────────────────────────────────────┤
│  Login → /setup (NOVO)                                      │
│           ↓                                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Cadastrar PELO MENOS 1 CNPJ obrigatório           │   │
│   │  Pode adicionar mais depois                        │   │
│   │  Botão: "Continuar" (habilita com 1+)              │   │
│   └─────────────────────────────────────────────────────┘   │
│           ↓                                                 │
│  /welcome (Seleção empresa ativa + Prioridade)              │
│           ↓                                                 │
│  /dashboard/home                                            │
├─────────────────────────────────────────────────────────────┤
│               ACESSO POSTERIOR (SEMPRE DISPONÍVEL)          │
├─────────────────────────────────────────────────────────────┤
│  1. CompanySelector no header → "Adicionar CNPJ"            │
│  2. Sidebar → Perfil → Seção "Minhas Empresas"              │
│  3. Sidebar → Novo item "Gerenciar Empresas" (direto)       │
│  4. Command Palette (Ctrl+K) → "gerenciar empresas"         │
└─────────────────────────────────────────────────────────────┘
```

## Funcionalidades de Cada CNPJ

| Ação | Disponível? | Onde? |
|------|-------------|-------|
| **Adicionar novo** | ✅ | Setup, CompanySelector, Perfil |
| **Editar dados** | ✅ (NOVO) | Modal de edição no Perfil |
| **Remover** | ✅ | Perfil (se tiver mais de 1) |
| **Definir como principal** | ✅ (NOVO) | Perfil |
| **Trocar empresa ativa** | ✅ | CompanySelector (header) |

## Componentes a Implementar

### 1. Página `/setup` (NOVA)

```text
┌──────────────────────────────────────────────────────────────┐
│  ╭─────────────╮                                             │
│  │  ● ─── ○    │  Passo 1 de 2: Configure seu ambiente       │
│  ╰─────────────╯                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Seus Dados                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Nome completo: [________________]                     │  │
│  │  Telefone:      [________________] (opcional)          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  🏢 Suas Empresas (1 de 4 permitidos)                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ✓ Empresa ABC LTDA                                    │  │
│  │    12.345.678/0001-90 • SP • Comércio                  │  │
│  │    [Editar] [Remover]                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  + Adicionar outra empresa                             │  │
│  │    (você pode fazer isso depois também)                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  💡 Você poderá adicionar mais empresas depois em           │
│     Perfil > Minhas Empresas ou pelo seletor no topo        │
│                                                              │
│                              [Continuar para Boas-vindas →]  │
└──────────────────────────────────────────────────────────────┘
```

### 2. Card de Empresa Editável (NOVO)

Cada empresa cadastrada terá:
- **Visualização**: CNPJ, Razão Social, UF, Regime
- **Ações**: Editar, Remover, Definir como principal
- **Indicador**: Badge "Principal" na empresa ativa

```typescript
// Estrutura do CompanyCard editável
interface CompanyCardProps {
  company: Company;
  isPrincipal: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onSetPrincipal: () => void;
}
```

### 3. Modal de Edição de Empresa (NOVO)

Permite alterar:
- Nome Fantasia (editável)
- Regime Tributário (editável)
- Setor (editável)
- ❌ CNPJ e Razão Social (bloqueados - dados da Receita)

### 4. Integração no Perfil

Adicionar nova seção "Minhas Empresas" na página de Perfil:

```text
┌──────────────────────────────────────────────────────────────┐
│  🏢 Minhas Empresas                                          │
│  Gerencie os CNPJs do seu grupo empresarial                  │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  [★] Empresa ABC LTDA              12.345.678/0001-90  │ │
│  │      Lucro Presumido • Comércio • SP                   │ │
│  │                          [Editar] [Definir Principal]  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  [ ] Filial XYZ                    12.345.678/0002-71  │ │
│  │      Lucro Presumido • Serviços • RJ                   │ │
│  │                          [Editar] [Definir Principal]  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  [+ Adicionar nova empresa] (2 de 4 usados)                  │
│                                                              │
│  💡 Faça upgrade para adicionar mais CNPJs                   │
└──────────────────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/Setup.tsx` | CRIAR | Nova página de setup inicial |
| `src/components/setup/SetupWizard.tsx` | CRIAR | Wizard de configuração |
| `src/components/setup/CompanySetupCard.tsx` | CRIAR | Card de empresa editável |
| `src/components/setup/EditCompanyModal.tsx` | CRIAR | Modal para editar dados |
| `src/App.tsx` | MODIFICAR | Adicionar rota `/setup` |
| `src/components/ProtectedRoute.tsx` | MODIFICAR | Lógica de redirecionamento |
| `src/pages/Perfil.tsx` | MODIFICAR | Adicionar seção "Minhas Empresas" |
| `src/contexts/CompanyContext.tsx` | MODIFICAR | Adicionar função `updateCompany` |

## Migração de Banco de Dados

```sql
-- Adicionar campos de controle de fluxo
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false;

-- Adicionar campos editáveis na company_profile
ALTER TABLE company_profile
ADD COLUMN IF NOT EXISTS setor TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

## Lógica de Redirecionamento

```text
1. Usuário faz login
2. ProtectedRoute verifica:
   - setup_complete = false? → /setup
   - welcome_seen = false? → /welcome  
   - Ambos true? → /dashboard/home

3. Na /setup:
   - Usuário preenche nome + pelo menos 1 CNPJ
   - Clica "Continuar" → marca setup_complete = true

4. Na /welcome:
   - Se múltiplos CNPJs → mostra seletor
   - Escolhe prioridade
   - Clica "Começar" → marca welcome_seen = true
```

## Pontos de Acesso para Gerenciar Empresas (Depois do Setup)

| Local | Como Acessar |
|-------|--------------|
| **Header** | CompanySelector → dropdown → "Adicionar nova empresa" |
| **Sidebar** | Perfil → Seção "Minhas Empresas" |
| **Command Palette** | Ctrl+K → "gerenciar empresas" |
| **Welcome** | Se voltar para /welcome, pode adicionar mais |

## Comportamento do Botão "Salvar"

| Situação | Comportamento |
|----------|---------------|
| Novo CNPJ adicionado | Salva automaticamente no banco |
| Editar empresa | Modal com campos editáveis + "Salvar alterações" |
| Remover empresa | Confirmação + remove (se não for última) |
| Trocar principal | Atualiza automaticamente |

## Resultado Final

O usuário terá:
1. ✅ Obrigação de cadastrar **pelo menos 1 CNPJ** no setup
2. ✅ **Liberdade** de adicionar os outros depois, quando quiser
3. ✅ **Múltiplos pontos de acesso** para gerenciar empresas
4. ✅ **Edição** de dados não-fixos (regime, setor, nome fantasia)
5. ✅ **Remoção** de empresas (exceto a última)
6. ✅ **Troca** de empresa ativa a qualquer momento
