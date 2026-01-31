
# Adicionar Links das Redes Sociais

## Resumo

Atualizar os links das redes sociais em toda a aplicação para apontar para os endereços corretos do TribuTalks.

---

## URLs Corretas

| Rede | URL |
|------|-----|
| LinkedIn | https://www.linkedin.com/company/tributalks |
| Instagram | https://www.instagram.com/tributalks |
| YouTube | https://www.youtube.com/@tributalksnews |

---

## Alterações

### 1. src/config/site.ts

Adicionar Instagram e YouTube às configurações centralizadas:

```typescript
// Antes (linha 35-36)
// Social
LINKEDIN: "https://www.linkedin.com/company/tributalks/",

// Depois
// Social
LINKEDIN: "https://www.linkedin.com/company/tributalks",
INSTAGRAM: "https://www.instagram.com/tributalks",
YOUTUBE: "https://www.youtube.com/@tributalksnews",
```

---

### 2. src/pages/Contato.tsx

Atualizar os links hardcoded para usar o CONFIG (linhas 246-270):

```tsx
// Antes
<a href="https://www.linkedin.com/company/tributalks/">
<a href="https://instagram.com/tributech">
<a href="https://youtube.com/@tributech">

// Depois
<a href={CONFIG.LINKEDIN}>
<a href={CONFIG.INSTAGRAM}>
<a href={CONFIG.YOUTUBE}>
```

---

### 3. src/components/landing/Footer.tsx

Adicionar ícones de Instagram e YouTube ao footer:

```tsx
// Adicionar imports
import { Linkedin, Instagram, Youtube, Phone, Mail } from "lucide-react";

// Adicionar links na seção de contato
<a href={CONFIG.LINKEDIN}>
  <Linkedin className="h-4 w-4" />
  LinkedIn
</a>
<a href={CONFIG.INSTAGRAM}>
  <Instagram className="h-4 w-4" />
  Instagram
</a>
<a href={CONFIG.YOUTUBE}>
  <Youtube className="h-4 w-4" />
  YouTube
</a>
```

---

## Arquivos Alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/config/site.ts` | Adicionar INSTAGRAM e YOUTUBE |
| `src/pages/Contato.tsx` | Usar CONFIG para os links |
| `src/components/landing/Footer.tsx` | Adicionar Instagram e YouTube |
