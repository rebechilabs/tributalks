

# Plano: Atualizar Footer com "Powered by Rebechi & Silva"

## Contexto Atual
O footer do Connect (linha 32-37) já mostra:
- "Uma iniciativa de Alexandre Silva"
- "Sócio-fundador da Rebechi & Silva"

## Alteração a Implementar

### Arquivo: `src/components/connect/ConnectFooter.tsx`

**Adicionar a linha "Powered by" na coluna central do footer**, seguindo o padrão visual da landing page principal:

| Antes | Depois |
|-------|--------|
| Logo Rebechi & Silva | Logo Rebechi & Silva |
| "Uma iniciativa de Alexandre Silva" | **"Powered by Rebechi & Silva Advogados Associados"** |
| "Sócio-fundador da Rebechi & Silva" | "Uma iniciativa de Alexandre Silva" |
| | "Sócio-fundador da Rebechi & Silva" |

**Detalhes visuais:**
- A nova linha "Powered by..." será adicionada como primeira linha de texto
- Usará um ícone de balança (`Scale`) na cor primary, similar ao usado na landing page principal
- Formato: badge/pill com background `bg-primary/10` e borda `border-primary/20`

## Resultado Esperado
A coluna central do footer terá a hierarquia:
1. Logo Rebechi & Silva
2. Badge "Powered by Rebechi & Silva Advogados Associados" (com ícone)
3. "Uma iniciativa de Alexandre Silva"
4. "Sócio-fundador da Rebechi & Silva"

