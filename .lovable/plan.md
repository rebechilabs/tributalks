
# Plano: Landing Page TribuTalks Connect (v3 - Unificada)

## Resumo

Criarei uma landing page one-page para o **TribuTalks Connect** - comunidade exclusiva de negocios com modelo de "cadeira unica por especialidade". O design sera **100% consistente** com a landing page do SaaS TribuTalks, usando o mesmo design system (cores, tipografia, estilo de cards e icones).

---

## Arquitetura

### Nova Rota Publica
- **Caminho**: `/connect`
- **Lazy loading**: Sim
- **Independencia**: Completamente separada da landing page principal

### Estrutura de Arquivos

```text
src/
  pages/
    Connect.tsx                    # Pagina principal (nova)
  components/
    connect/                       # Nova pasta dedicada
      ConnectHeader.tsx            # Header sticky com logo TribuTalks
      ConnectHeroSection.tsx       # Hero com imagem de sala de reuniao
      ConnectFormSection.tsx       # Formulario de aplicacao (bloco 2)
      ConnectSolutionSection.tsx   # "Cadeira Unica" + tabela comparativa
      ConnectPillarsSection.tsx    # 3 pilares (Reunioes, Imersoes, Plataforma)
      ConnectFoundersSection.tsx   # Conselho Fundador (placeholders)
      ConnectCTASection.tsx        # CTA final + FAQ em accordion
      ConnectFooter.tsx            # Footer com logos e creditos
```

---

## Especificacoes Tecnicas

### Design System Unificado (Mesmo do SaaS)

| Elemento | Valor |
|----------|-------|
| Background principal | `#000000` (preto puro) |
| Background cards | `#1A1A1A` |
| Cor de destaque | `#E8A000` (mesmo tom do SaaS) |
| Texto principal | `#FFFFFF` |
| Texto secundario | `#A0A0A0` |
| Borda cards | `1px solid #333333` |
| Border-radius cards | `12px` |
| Hover cards | Borda muda para `#E8A000` |

### Fontes
- Usarei **Inter** (ja configurado no projeto) mantendo a hierarquia visual
- Titulos: Inter Bold/Extrabold
- Corpo: Inter Regular

### Icones
- **Lucide Icons** (ja integrado)
- Cor: `#E8A000`
- Estilo: Icones de linha dentro de quadrados com cantos arredondados e fundo semi-transparente (frosted glass)

---

## Detalhamento por Bloco

### Bloco 0: ConnectHeader
- Header sticky com backdrop-blur (90% opacidade)
- Background: `#000000`
- **Esquerda**: Logo TribuTalks (reusando `logo-tributalks-header.png`)
- **Direita**: Link discreto "Ja tenho acesso" (texto cinza #A0A0A0)

### Bloco 1: ConnectHeroSection
- **Layout**: Uma coluna, texto centralizado
- **Background**: Imagem de sala de reuniao luxuosa com overlay preto (`rgba(0,0,0,0.6)`)
  - Caracteristicas: paredes de vidro, vista cidade a noite, iluminacao quente ambar, mesa de madeira escura
  - Fonte: Unsplash (buscar "luxury boardroom night city view")
- **Conteudo**:
  - Headline (72px): "Imagine 34 Executivos de Elite como sua Equipe de **Vendas.**"
  - Sub-headline (20px, #A0A0A0): "A unica comunidade de negocios do Brasil onde voce nao encontra concorrentes. Apenas parceiros."
  - Botao CTA: "Aplique para uma Cadeira Exclusiva" - bg `#E8A000`, texto preto

### Bloco 2: ConnectFormSection
- **Layout**: Card centralizado (max-width 800px)
- **Card**: Background `#1A1A1A`, borda `#333333`, radius 16px, padding 32px
- **Titulo**: "Aplique para uma Cadeira Exclusiva" (32px, bold)
- **Campos** (mesmo estilo do SaaS):
  1. Nome Completo
  2. Seu melhor e-mail
  3. Empresa (opcional)
  4. Seu cargo (Dropdown: C-Level/Presidente, Socio/Dono, Diretor, VP)
  5. Setor de atuacao (campo de texto - mais importante)
- **Botao**: "Garantir minha Aplicacao" - full width, bg `#E8A000`
- **Integracao**: Salvar no banco de dados `connect_applications`

### Bloco 3: ConnectSolutionSection
- **Layout**: 2 colunas (texto 40% | tabela 60%)
- **Titulo**: "O Poder da **Cadeira Unica**" (destaque em `#E8A000`)
- **Texto explicativo** sobre o modelo de exclusividade
- **Tabela Comparativa**:
  | Networking Tradicional | TribuTalks Connect |
  |------------------------|-------------------|
  | Multiplos concorrentes | Zero concorrencia interna |
  | Foco em volume | Foco em qualidade e confianca |
  | Conversas superficiais | Reunioes de negocio estruturadas |
  | ROI incerto | ROI direto atraves de referencias |
  - Icones de check (`#E8A000`) na coluna Connect

### Bloco 4: ConnectPillarsSection
- **Layout**: Titulo centralizado + 3 cards em grid
- **Titulo**: "Inteligencia, Negocios e **Conexao.**"
- **Cards** (estilo consistente com RTCCalculatorSection):
  - Background `#1A1A1A`, borda hover `#E8A000`
  - Icones em quadrados com fundo semi-transparente
  1. **Reunioes de Celula**: Online, quinzenais | Icone: Video
  2. **Imersoes Presenciais**: 2x/ano, SP | Icone: MapPin
  3. **Plataforma Digital**: Circle, 24/7 | Icone: Shield

### Bloco 5: ConnectFoundersSection
- **Layout**: Titulo + galeria de 3 cards
- **Background**: Gradiente sutil `#000000` para `#111111`
- **Titulo**: "O Conselho **Fundador**"
- **Cards placeholders**:
  - Foto circular em P&B com borda `#E8A000`
  - Nome, cargo, faturamento
  - Inicialmente com placeholders (icone de usuario)

### Bloco 6: ConnectCTASection
- **Layout**: 2 colunas (CTA 50% | FAQ 50%)
- **Coluna Esquerda**:
  - Titulo: "Sua Cadeira Esta **Esperando?**"
  - Requisitos: R$ 12M+ faturamento
  - Preco: "Anuidade: R$ 15.000"
  - Botao: Scroll para formulario
- **Coluna Direita (FAQ)**:
  - Accordion (mesmo estilo FAQSection existente)
  - Background `#1A1A1A`, icone chevron `#E8A000`
  - 5 perguntas sobre tamanho da celula, exclusividade, gravacoes, tempo e investimento

### Bloco 7: ConnectFooter
- **Layout**: 3 colunas + barra inferior
- **Coluna Esquerda**: Logo TribuTalks + tagline
- **Coluna Central**: Logo Rebechi & Silva + creditos Alexandre Silva
- **Coluna Direita**: Links (Privacidade, Termos)
- **Barra inferior**: Copyright 2026

---

## Integracao com Banco de Dados

### Nova Tabela: `connect_applications`

| Coluna | Tipo | Obrigatorio |
|--------|------|-------------|
| id | UUID (PK) | Auto |
| nome | TEXT | Sim |
| email | TEXT (UNIQUE) | Sim |
| empresa | TEXT | Nao |
| cargo | TEXT | Sim |
| setor | TEXT | Sim |
| status | TEXT (default: 'pending') | Auto |
| created_at | TIMESTAMPTZ | Auto |

### Politicas RLS
- INSERT anonimo permitido (formulario publico)
- SELECT restrito a admins

---

## Responsividade

### Desktop (mais de 768px)
- Layout 2 colunas onde especificado
- Hero com imagem full-width

### Mobile (menos de 768px)
- Layout empilhado verticalmente
- Headline reduzida para 40px
- Cards empilhados
- Header simplificado (logo + link)

---

## Assets

### Reutilizados do Projeto
- `logo-tributalks-header.png` - Header
- `logo-tributalks.png` - Footer
- `logo-rebechi-silva.png` - Footer (creditos)

### Novo Asset Necessario
- Imagem de fundo do Hero (sala de reuniao luxuosa)
  - Sera buscada no Unsplash durante implementacao
  - Alternativa: usar gradiente escuro se imagem nao disponivel

---

## Alteracoes em App.tsx

Adicionar nova rota publica:

```tsx
const Connect = lazy(() => import("./pages/Connect"));

// Na secao de rotas publicas (apos linha 126):
<Route path="/connect" element={<LazyRoute><Connect /></LazyRoute>} />
```

---

## Ordem de Implementacao

1. Criar tabela `connect_applications` no banco de dados
2. Criar pasta `src/components/connect/`
3. Criar componentes na seguinte ordem:
   - ConnectHeader
   - ConnectHeroSection
   - ConnectFormSection
   - ConnectSolutionSection
   - ConnectPillarsSection
   - ConnectFoundersSection
   - ConnectCTASection
   - ConnectFooter
4. Criar pagina `src/pages/Connect.tsx`
5. Adicionar rota no `App.tsx`
6. Testar formulario e integracao com banco
7. Testar responsividade mobile

---

## Resultado Esperado

Uma landing page premium em `/connect` que:
- Segue 100% o design system do SaaS TribuTalks
- Captura leads qualificados (executivos R$ 12M+)
- Transmite exclusividade e sofisticacao
- Funciona perfeitamente em desktop e mobile
- Salva aplicacoes no banco de dados para follow-up
