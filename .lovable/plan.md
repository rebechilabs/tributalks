

# Plano: Usar Imagem da Sala de Reunião Moderna à Noite

## Resumo

Utilizar a imagem enviada pelo usuário como fundo do Hero. A imagem mostra exatamente o que foi solicitado:
- Sala de reunião moderna com mesa oval de madeira
- Cadeiras executivas
- Grandes janelas panorâmicas com vista para cidade à noite
- Iluminação ambiente quente
- Atmosfera corporativa premium

---

## Etapas

### 1. Copiar Imagem para o Projeto

Copiar o arquivo do usuário para a pasta `public/images/` para uso como background CSS.

**De:** `user-uploads://Gemini_Generated_Image_w7cxwkw7cxwkw7cx.png`  
**Para:** `public/images/hero-meeting-room.png`

### 2. Atualizar Hero Section

**Arquivo:** `src/components/connect/ConnectHeroSection.tsx`  
**Linha:** 14

```typescript
backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/images/hero-meeting-room.png')`,
```

---

## Overlay

Manter as configurações atuais para garantir legibilidade do texto:
- Gradiente superior: `rgba(0,0,0,0.6), rgba(0,0,0,0.85)`
- Fade inferior: `to-black/90`

---

## Resultado Esperado

A imagem combina perfeitamente com o conceito "Dark Luxury" do TribuTalks Connect:
- Vista noturna da cidade com luzes
- Mesa de reunião executiva oval
- Ambiente profissional e sofisticado
- Transmite exclusividade e poder de decisão

