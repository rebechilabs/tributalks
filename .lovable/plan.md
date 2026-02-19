

# Guardrails Anti-Copia de Codigos e Prompts

## Contexto

O TribuTalks tem conteudo sensivel exposto no frontend que pode ser copiado por usuarios mal-intencionados:
- Respostas da Clara (conteudo gerado por IA com logica tributaria proprietaria)
- Codigos de referral (ja tem botao de copia controlado)
- Prompts do sistema (esses ja estao protegidos no servidor — edge functions)

**Nota importante:** Protecoes no frontend sao barreiras de friccao, nao seguranca absoluta. Um usuario tecnico sempre pode usar DevTools. O objetivo e dificultar a copia casual e em massa.

## Plano de Execucao

### 1. Componente `AntiCopyGuard` (novo)

Criar `src/components/common/AntiCopyGuard.tsx` — wrapper reutilizavel que aplica protecoes em qualquer conteudo sensivel:

- `user-select: none` via CSS (impede selecao de texto)
- Bloqueia `contextmenu` (clique direito) mostrando toast educativo
- Bloqueia `Ctrl+C` / `Cmd+C` dentro do wrapper
- Bloqueia `Ctrl+A` dentro do wrapper
- Prop `allowCopy?: boolean` para desativar quando necessario (ex: codigo de referral que tem botao proprio)

### 2. Aplicar nas respostas da Clara

Envolver as respostas da Clara (mensagens `role === "assistant"`) com `AntiCopyGuard` nos dois componentes de chat:

- `src/components/common/FloatingAssistant.tsx` — chat flutuante
- `src/components/onboarding/ClaraOnboardingChat.tsx` — chat de onboarding

Mensagens do usuario continuam copiaveis normalmente.

### 3. Protecao global contra Print Screen e Print

Adicionar no `App.tsx` ou `index.css`:

- `@media print { body { display: none; } }` — bloqueia impressao/PDF
- Event listener global para `Ctrl+P` mostrando toast

### 4. Watermark invisivel nas respostas da Clara

Na edge function `clara-assistant`, adicionar caracteres Unicode de largura zero (zero-width spaces) com padrao unico por usuario. Se alguem copiar e colar, o watermark identifica a origem.

Isso ja esta no servidor, entao nao requer mudanca no frontend.

### 5. Protecao do codigo de referral

O `ReferralCodeCard` ja tem botao de copia controlado. Adicionar `AntiCopyGuard` ao redor do codigo exibido para impedir selecao manual — forcando uso do botao oficial.

## Secao Tecnica

### Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/components/common/AntiCopyGuard.tsx` | Wrapper com protecoes anti-copia |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/common/FloatingAssistant.tsx` | Envolver respostas Clara com AntiCopyGuard |
| `src/components/onboarding/ClaraOnboardingChat.tsx` | Envolver respostas Clara com AntiCopyGuard |
| `src/components/referral/ReferralCodeCard.tsx` | Envolver codigo com AntiCopyGuard |
| `src/index.css` | Regra `@media print` para bloquear impressao |
| `supabase/functions/clara-assistant/index.ts` | Watermark invisivel por usuario nas respostas |

### AntiCopyGuard — Comportamento

```text
+-----------------------------+
|       AntiCopyGuard         |
|-----------------------------|
| CSS: user-select: none      |
| Block: right-click          |
| Block: Ctrl+C / Cmd+C      |
| Block: Ctrl+A               |
| Toast: "Conteudo protegido" |
+-----------------------------+
```

### Watermark invisivel — Implementacao

Inserir no inicio da resposta da Clara (server-side) uma sequencia de caracteres Unicode invisivel (U+200B, U+200C, U+200D, U+FEFF) que codifica o `user_id` em binario. Comprimento: ~36 chars invisivel (UUID em binario). Impacto zero na renderizacao.

### Limitacoes conhecidas

- DevTools (F12) permite inspecionar o DOM e copiar texto — nao ha como bloquear isso em web
- Print Screen nativo do OS nao pode ser bloqueado pelo browser
- Essas protecoes sao barreiras de friccao, nao DRM

Nenhuma migracao de banco necessaria.
