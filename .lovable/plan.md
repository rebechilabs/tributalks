
# Plano: Melhorar CTA do NEXUS para Preenchimento do DRE

## Problema Identificado

1. **Mensagem genérica**: O texto atual não destaca a importância do DRE
2. **Inconsistência de tempo**: Texto diz "5 minutos", botão diz "3 min"

## Código Atual (linhas 84-98)

```tsx
<h3 className="font-semibold text-foreground text-lg">
  🎯 Desbloqueie insights personalizados
</h3>
<p className="text-sm text-muted-foreground mt-1.5 mb-4">
  Com poucos dados, a Clara pode identificar oportunidades de economia tributária 
  específicas para sua empresa. Leva menos de 5 minutos.
</p>
...
<span className="text-xs opacity-80 ml-1">(3 min)</span>
```

## Nova Versão Proposta

```tsx
<h3 className="font-semibold text-foreground text-lg">
  🚀 Esta é uma das ferramentas mais importantes da plataforma
</h3>
<p className="text-sm text-muted-foreground mt-1.5 mb-4">
  Para desbloquear insights personalizados e identificar oportunidades de economia 
  tributária específicas para sua empresa, preencha seu DRE. Leva apenas 3 minutos.
</p>
...
<span className="text-xs opacity-80 ml-1">(3 min)</span>
```

## Alterações

| Item | Antes | Depois |
|------|-------|--------|
| Título | "Desbloqueie insights personalizados" | "Esta é uma das ferramentas mais importantes da plataforma" |
| Emoji | 🎯 | 🚀 |
| Texto | Genérico sobre dados | Direto sobre importância do DRE |
| Tempo | "menos de 5 minutos" | "apenas 3 minutos" (consistente com botão) |

## Arquivo a Editar

- `src/pages/Nexus.tsx` (linhas 84-89)

## Resultado Esperado

Mensagem mais impactante que comunica claramente a importância do DRE para o funcionamento completo do NEXUS, com tempos consistentes em todo o card.
