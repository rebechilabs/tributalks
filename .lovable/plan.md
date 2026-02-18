

## Plano: Estado vazio friendly na Margem Ativa + Prompt da Clara

### Resumo
Duas alteracoes independentes:
1. **Frontend**: Substituir o estado vazio generico da tabela de fornecedores por uma tela acolhedora com area de upload
2. **Backend**: Adicionar logica no prompt da Clara para detectar quando o usuario esta na Margem Ativa sem dados e responder de forma orientada

---

### Alteracao 1 — Estado vazio no SupplierTable

**Arquivo**: `src/components/margem-ativa/omc/SupplierTable.tsx`

- Substituir o bloco de estado vazio (linhas 90-97) pelo novo design com:
  - Emoji ilustrativo e titulo motivacional
  - Explicacao clara sobre XMLs necessarios
  - Area de upload com drag-and-drop visual (estilizada com border dashed amarela)
  - Ao selecionar arquivo, redireciona para `/dashboard/importar-xml` (que ja redireciona para `/dashboard/recuperar/radar`)
  - Dica extra sobre importar mais notas para melhor precisao
- Adicionar `useNavigate` do react-router-dom ao componente
- Adaptar as cores para respeitar o tema (usar classes do Tailwind com suporte a dark mode em vez de cores fixas como `text-white` e `text-gray-400`)

**Nota sobre cores**: O prompt original usa cores fixas (`text-white`, `text-gray-400`, `bg-white/5`). Vou adaptar para usar classes semanticas do Tailwind (`text-foreground`, `text-muted-foreground`, `bg-muted/50`) para funcionar corretamente tanto no tema claro quanto no escuro.

---

### Alteracao 2 — Prompt da Clara para estado vazio

**Arquivo**: `supabase/functions/clara-assistant/index.ts`

- Na funcao `buildSystemPrompt`, apos o bloco que adiciona contexto da ferramenta (linha ~2143), adicionar logica condicional:
  - Se `toolSlug === "margem-ativa"` e `userContext?.progresso?.xmlsProcessados === 0`, append o bloco de instrucao `ESTADO VAZIO` ao prompt
  - O bloco instrui a Clara a responder de forma acolhedora, com passos claros para importar XMLs, sem explicar funcionalidades ou citar numeros zerados
- Isso requer passar `toolSlug` e `userContext` como parametros adicionais de `buildSystemPrompt` (que ja recebe `userContext` mas nao recebe `toolSlug` — sera adicionado)

---

### Detalhes tecnicos

**SupplierTable.tsx** — mudancas:
- Import: adicionar `useNavigate` de `react-router-dom`
- Dentro do componente: `const navigate = useNavigate()`
- Substituir linhas 90-97 pelo novo JSX com area de upload e orientacoes
- O `onChange` do input redireciona para a pagina de importacao

**clara-assistant/index.ts** — mudancas:
- Adicionar parametro `toolSlug?: string` na funcao `buildSystemPrompt`
- Antes do `return prompt` (linha 2145), adicionar condicional que detecta Margem Ativa vazia
- Passar `toolSlug` na chamada de `buildSystemPrompt` (linha 2419)

