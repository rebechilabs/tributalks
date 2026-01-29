

## Plano: Posicionar Newsletter Próximo à Comunidade

### Objetivo
Mover o formulário de newsletter para ficar próximo ao item "Comunidade" no menu de navegação, tanto no desktop (Sidebar) quanto no mobile (MobileNav).

### Alterações Necessárias

#### 1. Sidebar.tsx (Desktop)
- **Remover** a seção atual da newsletter do final (linhas 233-236)
- **Adicionar** a newsletter logo abaixo do item "Comunidade", dentro do grupo "IA e Documentos"
- A newsletter aparecerá como um elemento destacado dentro da navegação

#### 2. MobileNav.tsx (Mobile)
- **Adicionar** a newsletter também dentro do grupo "IA e Suporte", logo após o item "Comunidade"
- Garantir consistência visual entre desktop e mobile

### Estrutura Visual Final

```text
┌─────────────────────────┐
│ ...                     │
│ IA e Documentos         │
│   ├─ Clara AI           │
│   ├─ Analisador Docs    │
│   ├─ Workflows          │
│   ├─ Comunidade         │
│   └─ ┌──────────────┐   │
│       │ Newsletter  │   │ ← Posição nova
│       └──────────────┘   │
│ Integrações             │
│ ...                     │
└─────────────────────────┘
```

### Detalhes Técnicos

| Arquivo | Ação | Linhas Afetadas |
|---------|------|-----------------|
| `Sidebar.tsx` | Mover newsletter de linhas 233-236 para após renderizar o grupo "IA e Documentos" | 200-204, 233-236 |
| `MobileNav.tsx` | Adicionar import do `NewsletterForm` e inserir após "Comunidade" | 1-13, 196-200 |

### Lógica de Implementação

1. Identificar quando o grupo "IA e Documentos" (Sidebar) ou "IA e Suporte" (MobileNav) termina de renderizar
2. Adicionar o `NewsletterForm variant="compact"` logo após os itens do grupo
3. Remover a seção duplicada do final do Sidebar

