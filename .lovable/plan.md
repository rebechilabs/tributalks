
# Adicionar FAQ e Otimizar Mobile na Landing Page

## 1. Adicionar secao FAQ

O componente `FAQSection` ja existe mas nao esta na pagina. Vou inclui-lo e adaptar o visual ao tema escuro.

### `src/pages/Index.tsx`
- Importar `FAQSection`
- Adicionar `<FAQSection />` entre `<SecuritySection />` e `<NewFooter />`

### `src/components/landing/FAQSection.tsx`
- Trocar `bg-background` da section por `bg-[#1A1A1A]`
- Trocar `bg-card border-border` dos AccordionItems por `bg-[#222222] border-white/10`
- Trocar `data-[state=open]:bg-secondary` por `data-[state=open]:bg-[#2A2A2A]`
- Trocar `text-foreground` por `text-white`
- Trocar `text-muted-foreground` por `text-white/60` e `text-white/70`
- Trocar link "Fale conosco" do rodape por `text-primary`

---

## 2. Otimizacao Mobile

### `src/components/landing/ClaraSection.tsx`
- Orbe central: `w-48 h-48 md:w-80 md:h-80` (menor no mobile)
- Raio dos agentes orbitantes: usar `radius` responsivo via classe condicional (100px mobile, 140px desktop) -- implementado via hook `useIsMobile`
- Icones dos agentes: `w-11 h-11 md:w-16 md:h-16`

### `src/components/landing/SecuritySection.tsx`
- Grid de seguranca: `grid-cols-1 sm:grid-cols-2` (empilha no mobile)

### `src/components/landing/NewFooter.tsx`
- Bloco inferior (powered by, badges, copyright, social): trocar `flex-col md:flex-row` por layout que empilha melhor com `gap-6` e centraliza tudo no mobile

### `src/components/landing/NewPricingSection.tsx`
- Padding dos cards: `p-5 md:p-8`

---

## Resumo

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Index.tsx` | Importar e adicionar FAQSection |
| `src/components/landing/FAQSection.tsx` | Adaptar cores para tema escuro |
| `src/components/landing/ClaraSection.tsx` | Orbe e agentes menores no mobile |
| `src/components/landing/SecuritySection.tsx` | Grid responsivo nos cards de seguranca |
| `src/components/landing/NewFooter.tsx` | Layout mobile do rodape |
| `src/components/landing/NewPricingSection.tsx` | Padding responsivo nos cards |

Total: 6 arquivos editados.
