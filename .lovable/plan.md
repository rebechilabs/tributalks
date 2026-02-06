

# Plano: Trocar Imagem do Hero

## Problema Atual

A imagem atual (arquivo uploadado pelo usuário) mostra uma mesa com pessoas e laptop, que não transmite a atmosfera de "sala de reunião executiva premium" desejada para o TribuTalks Connect.

---

## Opções de Imagem

| # | Descrição | URL |
|---|-----------|-----|
| **1** | Sofá de couro com mesa de centro em ambiente escuro e sofisticado | `photo-1505624198937-c704aff72608` |
| **2** | Sala de conferência elegante com cadeiras e grande pintura na parede | `photo-1646215993365-125e6428e1dc` |
| **3** | Interior de quarto moderno com grandes janelas e vista noturna | `photo-1691388203101-7322999dc108` |

---

## Recomendação

**Opção 1** - Mesa de centro com sofás de couro

Esta imagem representa melhor o conceito de "clube exclusivo de negócios":
- Ambiente escuro e sofisticado
- Mobiliário premium (sofás de couro, mesa de madeira)
- Sem pessoas visíveis
- Iluminação quente/âmbar
- Atmosfera de lounge executivo

---

## Alteração Técnica

**Arquivo:** `src/components/connect/ConnectHeroSection.tsx`  
**Linha:** 14

```typescript
backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1505624198937-c704aff72608?auto=format&fit=crop&w=1920&q=80')`,
```

---

## Overlay

Manter o overlay escuro atual para garantir legibilidade:
- Gradiente: `rgba(0,0,0,0.6), rgba(0,0,0,0.85)`
- Bottom fade: `to-black/90`

