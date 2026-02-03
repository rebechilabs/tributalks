
# Aumentar Logo Rebechi & Silva em 100%

## Objetivo
Dobrar o tamanho atual do logo da Rebechi & Silva na seção de credibilidade.

## Alteração

**Arquivo:** `src/components/landing/CredibilitySection.tsx`

| Propriedade | Valor Atual | Novo Valor |
|-------------|-------------|------------|
| Altura mobile | 72px | 144px |
| Altura desktop (md+) | 96px (h-24) | 192px (h-48) |

## Código

```tsx
<img 
  src={logoRebechiSilva} 
  alt="Rebechi & Silva Advogados Associados" 
  className="h-[144px] md:h-48 object-contain"
/>
```

## Resultado
O logo ficará com o dobro do tamanho atual, mantendo a proporção e responsividade entre mobile e desktop.
