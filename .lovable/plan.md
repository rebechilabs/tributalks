
# Plano: Padronizar Layout de Todas as Páginas

## Problema Identificado

Existe inconsistência no espaçamento interno das páginas que usam o `DashboardLayout`. A página **Split Payment** foi identificada como o padrão correto, mas várias outras páginas não seguem essa estrutura.

## Padrão Correto (Split Payment)

```typescript
<DashboardLayout title="Split Payment">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Conteúdo */}
  </div>
</DashboardLayout>
```

O padrão usa:
- `max-w-*` para controlar a largura máxima do conteúdo
- `mx-auto` para centralizar
- `px-4 sm:px-6 lg:px-8` para padding horizontal responsivo
- `py-8` para padding vertical

## Páginas a Corrigir

Após análise, as seguintes páginas precisam de ajuste no container wrapper:

| Página | Padrão Atual | Correção Necessária |
|--------|--------------|---------------------|
| CalculadoraRTC.tsx | `<div className="space-y-6">` | Adicionar wrapper com padding |
| CalculadoraNBS.tsx | `<div className="space-y-6">` | Adicionar wrapper com padding |
| AnaliseNotasFiscais.tsx | `<div className="space-y-6">` | Adicionar wrapper com padding |
| Oportunidades.tsx | `<div className="space-y-8">` | Adicionar wrapper com padding |
| ScoreTributario.tsx | `<div className="space-y-6">` | Adicionar wrapper com padding |
| Nexus.tsx | `<div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">` | Ajustar para padrão consistente |
| AdminMonitoring.tsx | `<div className="space-y-6 max-w-7xl mx-auto">` | Adicionar padding horizontal |

## Páginas que já seguem o padrão corretamente

- SplitPayment.tsx: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- ComparativoRegimes.tsx: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Dashboard.tsx: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Configuracoes.tsx: `max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Perfil.tsx: `max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- MargemAtiva.tsx: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- DREResultados.tsx: `container mx-auto px-4 py-6`
- DRE.tsx: `container mx-auto px-4 py-6`

## Implementação

Para cada página que precisa de correção, o conteúdo será envolvido assim:

```typescript
<DashboardLayout title="Título">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="space-y-6">
      {/* Conteúdo existente */}
    </div>
  </div>
</DashboardLayout>
```

### Larguras máximas por tipo de página

- **Calculadoras/Formulários**: `max-w-4xl` (foco no conteúdo)
- **Dashboards/Grids**: `max-w-6xl` ou `max-w-7xl` (mais espaço para cards)
- **Configurações/Perfil**: `max-w-2xl` (conteúdo estreito)

## Arquivos a Editar

1. `src/pages/calculadora/CalculadoraRTC.tsx`
2. `src/pages/calculadora/CalculadoraNBS.tsx`
3. `src/pages/AnaliseNotasFiscais.tsx`
4. `src/pages/Oportunidades.tsx`
5. `src/pages/ScoreTributario.tsx`
6. `src/pages/Nexus.tsx`
7. `src/pages/admin/AdminMonitoring.tsx`

## Resultado Esperado

Após a padronização, todas as páginas terão:
- Espaçamento consistente entre a borda do container e o conteúdo
- Comportamento responsivo uniforme em todos os breakpoints
- Visual profissional e alinhado em toda a plataforma
