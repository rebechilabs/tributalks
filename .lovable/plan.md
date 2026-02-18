

# Adicionar nomes dos modulos nas features dos cards

## Resumo

Inserir os nomes dos modulos (ENTENDER, PRECIFICAR, RECUPERAR, PLANEJAR, COMANDAR) como labels dentro da lista de features existente, sem alterar a estrutura dos cards nem o tipo `PlanCard`.

## O que muda

Apenas o array `features` de cada plano recebe itens especiais que funcionam como headers de secao. Na renderizacao, esses itens sao detectados e exibidos como labels em destaque (texto primary, bold, uppercase) em vez de itens com check.

### Convencao

Features que comecam com `"@"` sao tratadas como headers de modulo. Ex: `"@ENTENDER"` renderiza como label de secao.

### Features atualizadas

**STARTER:**
```
"@ENTENDER"
"DRE Inteligente"
"Score Tributário 0-1000"
"Calculadora CBS/IBS por NCM"
"Comparativo de Regimes"
"Timeline 2026-2033"
"Newsletter TribuTalks News"
```

**NAVIGATOR:**
```
"Tudo do Starter +"
"@RECUPERAR"
"Radar de Créditos (XML, SPED)"
"@PLANEJAR"
"Planejamento com 61+ oportunidades"
"Calculadora NCM e NBS"
"Analisador de Documentos IA"
"Workflows Guiados"
"Relatórios PDF Clara AI"
```

**PROFESSIONAL:**
```
"Tudo do Navigator +"
"@PRECIFICAR"
"Margem Ativa por NCM"
"Split Payment 2026"
"PriceGuard"
"@COMANDAR"
"NEXUS (Centro de Comando)"
"OMC-AI (Fornecedores)"
"Valuation (3 metodologias)"
"Relatórios Executivos PDF"
"Conectar ERP"
```

### Renderizacao

Na secao de features, ao detectar `feature.startsWith("@")`:
- Renderizar como `<p>` com texto primary, bold, uppercase, font-xs, com margem superior extra
- Sem icone de check

Caso contrario, manter a renderizacao atual com check verde.

## Secao tecnica

### Arquivo editado: `src/components/landing/NewPricingSection.tsx`

1. Atualizar os arrays `features` dos 3 planos com os prefixos `@MODULO`
2. No bloco de renderizacao de features (linhas 195-201), adicionar condicional:

```tsx
{plan.features.map((feature) => {
  if (feature.startsWith("@")) {
    return (
      <p key={feature} className="text-xs font-bold text-primary uppercase tracking-wider mt-3 mb-1">
        {feature.slice(1)}
      </p>
    );
  }
  return (
    <div key={feature} className="flex items-start gap-2.5">
      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <span className="text-sm text-white/80">{feature}</span>
    </div>
  );
})}
```

Nenhuma mudanca de interface, tipo ou estrutura. Apenas dados e renderizacao condicional.
