
# Plano: Renomear Newsletter para Notícias e Ajustar ConexaoPage

## Alterações Necessárias

### 1. Renomear "Newsletter" para "Notícias" no Menu
Arquivo: `src/data/menuConfig.ts`

| Localização | Alteração |
|-------------|-----------|
| Linha 109 | Mudar `'Notícias da Reforma'` → `'Notícias'` |
| Linha 181 | Mudar `label: 'Newsletter'` → `label: 'Notícias'` |
| Linha 264 | Mudar `label: 'Newsletter'` → `label: 'Notícias'` |

### 2. Atualizar ConexaoPage
Arquivo: `src/pages/dashboard/ConexaoPage.tsx`

| Alteração |
|-----------|
| Mudar título "Newsletter" → "Notícias" |
| Mudar descrição para refletir a mudança |
| Cards já estão exibidos em grid de 3 colunas (`lg:grid-cols-3`) |

## Resultado Visual

Quando o usuário clicar em "Conexão & Comunicação":
- Vai para `/dashboard/conexao`
- Exibe 3 quadrados centralizados:
  1. **Notícias** - Atualizações tributárias
  2. **Comunidade** - Conexões e networking
  3. **Indique e Ganhe** - Descontos por indicação

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/data/menuConfig.ts` | `'Newsletter'` → `'Notícias'` (3 ocorrências) |
| `src/pages/dashboard/ConexaoPage.tsx` | Título do card de Newsletter → Notícias |
