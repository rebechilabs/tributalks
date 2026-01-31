
# Plano: Renomear TribuBot para Clara AI

## Resumo Executivo

Vamos unificar a nomenclatura do assistente de IA em toda a plataforma, substituindo todas as referências a "TribuBot" pelo nome correto: **Clara AI**.

## Alterações Necessárias

### 1. Renomear Arquivo Principal
**Arquivo:** `src/pages/TribuBot.tsx` → `src/pages/ClaraAI.tsx`

- Renomear o componente de `TribuBot` para `ClaraAI`
- Manter toda a lógica e funcionalidade existente

### 2. Atualizar Rotas (App.tsx)
**Arquivo:** `src/App.tsx`

- Alterar import de `TribuBot` para `ClaraAI`
- Alterar rota de `/tribubot` para `/clara-ai`
- Atualizar referência do componente

### 3. Atualizar Menu de Navegação
**Arquivo:** `src/data/menuConfig.ts`

- Linha 39: Alterar `href: '/tribubot'` para `href: '/clara-ai'`

### 4. Atualizar Página de Notícias
**Arquivo:** `src/pages/NoticiasReforma.tsx`

- Alterar link de `/tribubot` para `/clara-ai`

### 5. Atualizar Feature Access Hook
**Arquivo:** `src/hooks/useFeatureAccess.ts`

- Linhas 63, 106: Alterar `tribubot` para `clara_ai` (nome interno da feature)
- Atualizar comentários descritivos

### 6. Atualizar User Credits Hook
**Arquivo:** `src/hooks/useUserCredits.ts`

- Linhas 161, 172: Alterar feature default de `'tribubot'` para `'clara_ai'`

### 7. Atualizar Termos de Uso
**Arquivo:** `src/pages/Termos.tsx`

- Linha 80: Alterar "O TribuBot (assistente de IA)" para "A Clara AI (copiloto de decisão tributária)"

### 8. Atualizar Documentação Comercial
**Arquivo:** `src/components/docs/TribuTalksPitchPdf.tsx`

Alterar múltiplas referências:
- "TribuBot (IA 24/7)" → "Clara AI (Copiloto Tributário)"
- "TribuBot — Assistente Conversacional" → "Clara AI — Copiloto de Decisão Tributária"
- "TribuBot 10 msgs/dia" → "Clara AI 30 msgs/dia" (plano Básico)
- "TribuBot ilimitado" → "Clara AI ilimitada" (plano Profissional)

### 9. Atualizar Webhook MercadoPago
**Arquivo:** `supabase/functions/mercadopago-webhook/index.ts`

- Linha 386: Alterar `action_url: '/tribubot'` para `action_url: '/clara-ai'`

### 10. Atualizar Documentação
**Arquivo:** `docs/TRIBUTALKS_DOCUMENTATION.md`

- Linha 191: Alterar "TribuBot.tsx" para "ClaraAI.tsx" e atualizar comentário

---

## Detalhes Técnicos

### Tabela no Banco de Dados
A tabela `tributbot_messages` mencionada no código será mantida como está (sem renomear), pois:
- Renomear tabelas requer migração de dados
- O nome da tabela é interno e não visível ao usuário
- Evita riscos de perda de dados históricos

### Migrações Existentes
As migrações SQL que referenciam `feature = 'tribubot'` continuarão funcionando, mas novos registros usarão `'clara_ai'`. Uma migração opcional pode ser criada para atualizar registros antigos se desejado.

### Compatibilidade de URLs
Recomendação: Adicionar redirect de `/tribubot` para `/clara-ai` para não quebrar links antigos salvos pelos usuários.

---

## Arquivos Afetados (Total: 10)

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/pages/TribuBot.tsx` | Renomear para ClaraAI.tsx |
| `src/App.tsx` | Import e rota |
| `src/data/menuConfig.ts` | URL do menu |
| `src/pages/NoticiasReforma.tsx` | Link para Clara |
| `src/hooks/useFeatureAccess.ts` | Nome da feature |
| `src/hooks/useUserCredits.ts` | Nome da feature |
| `src/pages/Termos.tsx` | Texto legal |
| `src/components/docs/TribuTalksPitchPdf.tsx` | Documentação comercial |
| `supabase/functions/mercadopago-webhook/index.ts` | URL de notificação |
| `docs/TRIBUTALKS_DOCUMENTATION.md` | Documentação técnica |
