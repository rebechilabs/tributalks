
## Plano: Correção de SEO e Meta Tags

### Resumo
Atualizar as meta tags de SEO, robots.txt, criar sitemap.xml e gerar imagem OG para melhorar a indexação no Google e a aparência em redes sociais.

---

### 1. Atualizar Meta Tags no index.html

**Arquivo:** `index.html`

| Meta Tag | Valor Atual | Novo Valor |
|----------|-------------|------------|
| title | TribuTalks- Inteligência Tributária para Empresas | TribuTalks \| Software de Reforma Tributária com IA - A 1ª AI-First do Brasil |
| description | Calculadoras, IA e especialistas... | Domine a Reforma Tributária com a 1ª plataforma AI-First do Brasil... |
| keywords | tributário, impostos... | reforma tributária, software tributário, inteligência artificial tributária, AI-First, CBS, IBS... |
| og:image | lovable.dev/opengraph-image... | tributalks.com.br/og-image.png |
| author | TribuTalks | TribuTalks - Powered by Rebechi & Silva |

**Novas meta tags a adicionar:**
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical" href="https://tributalks.com.br/">`
- `<meta property="og:url" content="https://tributalks.com.br/">`
- `<meta property="og:site_name" content="TribuTalks">`

---

### 2. Atualizar robots.txt

**Arquivo:** `public/robots.txt`

```text
User-agent: *
Allow: /

Sitemap: https://tributalks.com.br/sitemap.xml

Disallow: /api/
Disallow: /admin/
```

**Mudanças:**
- Simplificar para um único User-agent genérico
- Adicionar referência ao sitemap
- Bloquear rotas sensíveis (/api/, /admin/)

---

### 3. Criar sitemap.xml

**Arquivo:** `public/sitemap.xml` (novo)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tributalks.com.br/</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

### 4. Criar Imagem OG (Open Graph)

**Arquivo:** `public/og-image.png` (novo)

**Especificações:**
- Dimensões: 1200 x 630 pixels
- Fundo: Imagem cinematográfica de São Paulo (hero-bg-cinematic.jpg)
- Overlay: Gradiente escuro para legibilidade

**Conteúdo:**
- Logo TribuTalks no topo (usar logo-tributalks-header.png)
- Headline: "Domine a Reforma Tributária com a 1ª AI-First do Brasil"
- Subheadline: "Identifique créditos ocultos - Proteja sua margem - Clara AI 24/7"
- CTA: "Teste grátis 7 dias"
- Cores: Dourado (#F5A623) para destaques, branco para texto principal

A imagem será gerada usando a AI de geração de imagens disponível no projeto.

---

### Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `index.html` | Atualizar meta tags |
| `public/robots.txt` | Atualizar conteúdo |
| `public/sitemap.xml` | Criar novo |
| `public/og-image.png` | Gerar com AI |

---

### Resultado Esperado

- Melhor indexação no Google com meta tags otimizadas
- URL canônica apontando para o domínio principal
- Sitemap para facilitar crawling
- Imagem OG profissional para compartilhamentos em redes sociais
- robots.txt bloqueando rotas sensíveis
