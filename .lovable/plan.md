

# Plano: Melhorar Clareza sobre Adição de CNPJs Futuros

## Problema Identificado

A mensagem atual é discreta e pode passar despercebida:
- Fonte pequena (`text-xs`)
- Só menciona "Perfil → Minhas Empresas"
- Não menciona o CompanySelector no header

## Melhorias Propostas

### 1. Destacar a Mensagem no Setup

Substituir o texto simples por um card informativo mais visível:

```text
┌─────────────────────────────────────────────────────────────┐
│  💡 Quer adicionar mais empresas depois?                    │
│                                                             │
│  Você pode fazer isso a qualquer momento:                   │
│  • Pelo seletor de empresa no topo da tela                 │
│  • Em Perfil → Minhas Empresas                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Setup.tsx` | Substituir `<p>` por `<Alert>` mais visível (linhas 228-232) |

### 3. Código Proposto

```tsx
{companies.length > 0 && (
  <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
    <Info className="h-4 w-4 text-blue-600" />
    <AlertDescription className="text-blue-800 dark:text-blue-200">
      <strong>Quer adicionar mais empresas depois?</strong>
      <br />
      Você pode fazer isso a qualquer momento pelo 
      <strong> seletor no topo da tela</strong> ou em 
      <strong> Perfil → Minhas Empresas</strong>.
    </AlertDescription>
  </Alert>
)}
```

### 4. Resultado Visual

A mensagem será mais visível, com:
- Fundo colorido (azul claro)
- Ícone de informação
- Texto em negrito nos pontos importantes
- Aparece para todos que já têm empresa (não só quem pode adicionar mais)

