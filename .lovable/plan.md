
# Segmentação da Comunidade por Plano

## Estratégia de Acesso

| Plano | WhatsApp | Circle | Webinars | Biblioteca |
|-------|----------|--------|----------|------------|
| FREE | Sim (básico) | - | - | - |
| NAVIGATOR | Sim | Sim (em breve) | Sim | Sim |
| PROFESSIONAL | Sim | Sim | Sim | Sim |
| ENTERPRISE | Sim | Sim | Sim | Sim |

## Experiência do Usuário

### Usuário FREE
- Acesso imediato ao grupo WhatsApp
- Cards de Webinars, Circle e Biblioteca com visual "bloqueado"
- CTA claro para upgrade para Navigator

### Usuário NAVIGATOR+
- Acesso completo a todas as features
- Circle marcado como "Em breve" com badge
- Biblioteca de conteúdos completa

---

## Alterações Técnicas

### 1. Arquivo: `src/pages/Comunidade.tsx`

**Mudanças:**
- Remover gate de acesso completo (linha 14-59)
- Usar `usePlanAccess()` para verificar nível do usuário
- Renderizar WhatsApp para TODOS
- Usar `FeatureGate` para bloquear Webinars, Circle e Biblioteca para FREE

**Nova estrutura:**
```
- FREE: vê WhatsApp + 3 cards bloqueados
- NAVIGATOR+: vê todos os cards desbloqueados
```

### 2. Adicionar Card do Circle

Novo card entre WhatsApp e Webinars:
- Ícone: `Users` do lucide-react
- Título: "Comunidade Circle"
- Descrição: "Networking exclusivo para CFOs e gestores"
- Badge: "Em breve" (para todos os planos por enquanto)
- Para FREE: visual bloqueado + CTA upgrade

### 3. Atualizar Messaging

- WhatsApp: "Grupo aberto para todos os usuários"
- Circle: "Exclusivo para assinantes Navigator+"
- Webinars: "Sessões ao vivo exclusivas"
- Biblioteca: "Materiais premium"

---

## Fluxo Visual

```text
┌─────────────────────────────────────────────────────────────┐
│                    COMUNIDADE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WhatsApp                                     ✅ ALL  │   │
│  │ Grupo aberto para networking básico                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Circle                          🔒 NAVIGATOR+ [soon] │   │
│  │ Networking exclusivo para CFOs                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Webinars Mensais                   🔒 NAVIGATOR+     │   │
│  │ Sessões ao vivo com especialistas                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Biblioteca de Conteúdos            🔒 NAVIGATOR+     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Legenda:
✅ ALL = Disponível para todos
🔒 NAVIGATOR+ = Bloqueado para FREE, liberado para Navigator+
[soon] = Badge "Em breve"
```

---

## Impacto

- **Zero breaking changes** - apenas lógica de visualização
- **Upsell natural** - FREE vê o que está perdendo
- **Preparação para Circle** - estrutura pronta, só trocar URL quando lançar
- **Consistência** - usa os mesmos componentes FeatureGate do resto da app
