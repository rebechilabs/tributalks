

# Plano: Melhorar Layout da Página Conexão & Comunicação

## Objetivo
Ajustar o layout da `ConexaoPage` para que os 3 quadrados (Notícias, Comunidade, Indique e Ganhe) apareçam centralizados na tela com melhor destaque visual.

## Alterações

### Arquivo: `src/pages/dashboard/ConexaoPage.tsx`

| Aspecto | Atual | Proposto |
|---------|-------|----------|
| Alinhamento | Grid alinhado à esquerda | Grid centralizado na tela |
| Espaçamento | `py-6` (padding pequeno) | `py-12` (mais espaço vertical) |
| Centralização | Container normal | Flex center para centralizar vertical e horizontalmente |
| Título | Alinhado à esquerda | Centralizado |
| Cards | Tamanho padrão do grid | Grid com `max-w-4xl` para limitar largura e centralizar |

## Código Proposto

```tsx
<DashboardLayout title="Conexão & Comunicação">
  <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
    <div className="text-center mb-10">
      <h1 className="text-2xl font-bold mb-2">Conexão & Comunicação</h1>
      <p className="text-muted-foreground">
        Mantenha-se informado e conectado com a comunidade tributária
      </p>
    </div>

    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-4xl w-full">
      {/* 3 cards centralizados */}
    </div>
  </div>
</DashboardLayout>
```

## Resultado Visual

- Os 3 quadrados ficam **centralizados horizontalmente e verticalmente** na área de conteúdo
- Título e descrição centralizados acima dos cards
- Layout responsivo: 1 coluna no mobile, 3 colunas no desktop
- Cards com espaçamento uniforme e alinhados

