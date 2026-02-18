

# Atualizar Documentacao Completa TribuTalks

## Objetivo
Atualizar o arquivo `docs/TRIBUTALKS_DOCUMENTATION.md` para refletir o estado atual da plataforma (Fevereiro 2026).

## Mudancas Identificadas

### 1. Cabecalho e Data
- Atualizar "Ultima atualizacao" de 5 de Fevereiro para **18 de Fevereiro de 2026**

### 2. Estrutura de Rotas (Secao 6)
- Remover rota standalone `/priceguard` — PriceGuard agora e aba dentro de Margem Ativa
- Atualizar estrutura do modulo PRECIFICACAO para mostrar apenas 2 paginas:
  - Suite Margem Ativa (OMC-AI + PriceGuard)
  - Split Payment
- Adicionar modulo PLANEJAR nas rotas (Oportunidades + Planejamento Tributario)
- Corrigir redirects legados (adicionar os novos como `/dashboard/importar-xml`, `/dashboard/radar-creditos`, `/dashboard/recuperar/oportunidades`)

### 3. Suite Margem Ativa (Secao 7.5)
- Atualizar titulo para "Suite Margem Ativa 2026: OMC-AI + PriceGuard"
- Documentar as 3 formas de entrada do PriceGuard: Importar XMLs, Importar Planilha (em breve), Inserir Manualmente
- Notar que PriceGuard nao tem pagina propria, e uma aba dentro da pagina Margem Ativa

### 4. Menu/Sidebar (Secao 5 e 6)
- Documentar que no plano Professional, PRECIFICAR tem apenas 2 itens no sidebar
- Remover referencia ao PriceGuard como item separado no menu Navigator (era item locked de preview)

### 5. Edge Functions (Secao 13)
- Atualizar contagem de ~48 para **50 funcoes**
- Adicionar funcoes novas identificadas:
  - `analyze-ncm-from-xmls`
  - `analyze-suppliers`
  - `check-expiring-benefits`
  - `check-platform-inactivity`
  - `check-score-recalculation`
  - `execute-autonomous-action`
  - `generate-roadmap`
  - `invite-to-circle`
  - `memory-decay`
  - `notify-new-subscriber`
  - `populate-embeddings`
  - `process-autonomous-cron`
  - `process-dre`
  - `process-news`
  - `process-referral-rewards`
  - `search-news`
  - `send-contact-email`
  - `send-daily-metrics`
  - `stripe-webhook`
  - `subscribe-newsletter`
  - `track-presence`
  - `trigger-autonomous-actions`
- Organizar em categorias atualizadas

### 6. Banco de Dados (Secao 12)
- Notar que `sped_contribuicoes.periodo_inicio` e `periodo_fim` agora sao nullable
- Adicionar tabela `price_simulations` na listagem

### 7. Changelog
- Adicionar entradas para Fevereiro 2026:
  - PriceGuard consolidado como aba dentro de Margem Ativa (sem pagina separada)
  - Sidebar PRECIFICAR simplificado para 2 paginas
  - Titulo atualizado: "Suite Margem Ativa 2026: OMC-AI + PriceGuard"
  - 3 metodos de entrada no PriceGuard (XMLs, Planilha, Manual)
  - Campos periodo_inicio/periodo_fim tornados nullable no SPED
  - Edge functions expandidas para 50+

### 8. URL de Producao (Secao 17)
- Atualizar de `tributechai.lovable.app` para `tributalks.lovable.app`

## Detalhes Tecnicos

**Arquivo a editar:** `docs/TRIBUTALKS_DOCUMENTATION.md`

Todas as alteracoes serao feitas neste unico arquivo, atualizando secoes existentes e adicionando novas entradas ao changelog. Nenhuma mudanca de codigo funcional — apenas documentacao.

