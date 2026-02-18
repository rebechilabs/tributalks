
# Widget de Noticias da Reforma Tributaria na Home

## Situacao Atual

A Home (`HomePage.tsx`) ja exibe um `LatestNewsSection` basico que lista 5 noticias da tabela `noticias_tributarias`. A tabela ja possui dados reais com campos `categoria`, `relevancia`, `tributos_relacionados`, `resumo_executivo`, etc. A pagina completa de noticias (`/noticias`) ja existe em `NoticiasReforma.tsx`.

## O Que Muda

### 1. Reformular o widget `LatestNewsSection`

Substituir o widget atual por uma versao mais rica:

- Titulo: "Ultimas da Reforma Tributaria" com icone de jornal
- Subtitulo: "Acompanhe as mudancas que impactam seu negocio"
- Cards compactos com: data formatada, titulo (1 linha truncada), tags de tributos relacionados (IBS/CBS, Split Payment, etc.), indicador de impacto com emoji (Alto/Medio/Baixo)
- Borda dourada sutil no widget
- Hover effect nos cards
- Rodape com dois links: "Ver todas as noticias" e "Configurar alertas por email"
- O link de alertas mostra badge de upgrade para planos abaixo de Professional

### 2. Expandir o hook `useLatestNews`

Adicionar campos `categoria`, `tributos_relacionados` e `fonte_url` a query para alimentar as tags e o link externo.

### 3. Adicionar link "Perguntar a Clara" na pagina completa

No `NoticiasReforma.tsx`, adicionar um botao em cada noticia expandida que abre o chat da Clara com a pergunta pre-preenchida sobre aquela noticia.

### 4. Inserir noticias de exemplo (mock data)

Como a tabela ja tem dados reais, vamos inserir 5 noticias adicionais com `tributos_relacionados` preenchidos para demonstrar as tags de categoria (IBS/CBS, Split Payment, Simples Nacional, Lucro Real, Regulamentacao). As noticias existentes tem `tributos_relacionados` possivelmente nulo.

## O que NAO muda

- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Tabela `noticias_tributarias` (estrutura) -- ja possui todos os campos necessarios
- Pagina `/noticias` (layout geral) -- apenas adicao do botao Clara
- Feature gate `news_email_alerts` (ja existe como PROFESSIONAL+)

## Secao tecnica

### Arquivos editados
- `src/components/home/LatestNewsSection.tsx` -- Reformulacao completa do widget: novo layout com borda dourada, tags de tributos, indicador de impacto com emoji, subtitulo, links de rodape (noticias + alertas com gating)
- `src/hooks/useLatestNews.ts` -- Adicionar `categoria`, `tributos_relacionados`, `fonte_url` ao select da query
- `src/pages/NoticiasReforma.tsx` -- Adicionar botao "Perguntar a Clara sobre isso" em cada noticia expandida

### Dados inseridos
- 5 noticias de exemplo na tabela `noticias_tributarias` com `tributos_relacionados` preenchidos para demonstrar tags visuais

### Mapeamento de dados existentes

| Campo no banco | Uso no widget |
|---|---|
| `data_publicacao` | Data formatada (ex: "17 Fev 2026") |
| `titulo_original` | Titulo truncado em 1 linha |
| `tributos_relacionados` | Tags coloridas (IBS/CBS, ICMS, etc.) |
| `relevancia` (ALTA/MEDIA/BAIXA) | Emoji de impacto (vermelho/amarelo/verde) |
| `resumo_executivo` | Texto de preview no hover ou segunda linha |
| `fonte_url` | Link externo na pagina completa |

### Visual do widget

```text
+--------------------------------------------+
| Ultimas da Reforma Tributaria              |
| Acompanhe as mudancas que impactam...      |
|--------------------------------------------|
| 17 Fev 2026                                |
| Comite Gestor define aliquota de           |
| referencia do IBS em 17,7%                 |
| [IBS/CBS]  Alto impacto                    |
|--------------------------------------------|
| 16 Fev 2026                                |
| Split Payment obrigatorio para...          |
| [Split Payment]  Medio impacto             |
|--------------------------------------------|
| Ver todas as noticias ->                   |
| Configurar alertas por email               |
+--------------------------------------------+
```
