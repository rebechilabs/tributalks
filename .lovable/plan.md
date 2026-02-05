
# Plano: Mover "Indique e Ganhe" para antes de Configurações

## Situação Atual

O card "Indique e Ganhe" está posicionado **após o divider, antes da Newsletter**. A estrutura do último grupo do menu é:

```
─────────── (divider)
│ Newsletter
│ Comunidade  
│ Integrações (só Professional)
│ Configurações
```

## Nova Posição Desejada

O card deve aparecer **dentro do último grupo, imediatamente antes de "Configurações"**:

```
─────────── (divider)
│ Newsletter
│ Comunidade  
│ Integrações (só Professional)
│ ┌──────────────────────┐
│ │ 🎁 Indique e Ganhe   │  ← Card aqui
│ └──────────────────────┘
│ Configurações
```

## Alterações Técnicas

### 1. Sidebar.tsx
- Remover a lógica atual que insere o card após o divider
- Modificar a renderização do último grupo (sem título, que contém Newsletter/Configurações)
- Ao renderizar os itens desse grupo, verificar se o próximo item é "Configurações" (`href === '/configuracoes'`)
- Inserir o card imediatamente antes do item Configurações

### 2. MobileNav.tsx
- Aplicar a mesma lógica para manter consistência mobile

## Vantagem dessa Abordagem
- O card fica visualmente "ancorado" antes do último item do menu
- Independe de quais itens existem no grupo (funciona para todos os planos)
- Layout mais limpo com o card integrado ao grupo

