
# Plano: Checkbox Newsletter + Correção Comunidade

## Resumo
Implementar duas alterações: (1) adicionar checkbox opcional no formulário de cadastro para inscrição automática na newsletter beehiiv, e (2) corrigir a lógica de acesso na página de Comunidade para que NAVIGATOR tenha apenas WhatsApp e somente PROFESSIONAL+ tenha acesso ao Circle.

---

## Parte 1: Checkbox Newsletter no Cadastro

### O que será feito
Adicionar um checkbox opcional no formulário de cadastro (`src/pages/Cadastro.tsx`) perguntando se o usuário deseja receber a TribuTalks News. Se marcado, após a criação da conta, o sistema chamará a edge function `subscribe-newsletter` para cadastrar o email automaticamente no beehiiv.

### Alterações no arquivo `src/pages/Cadastro.tsx`

1. **Novo campo no formData**
   - Adicionar `aceitaNewsletter: false` ao estado inicial

2. **Novo checkbox no formulário**
   - Posicionar logo abaixo do checkbox de termos
   - Texto: "Quero receber a TribuTalks News (novidades e dicas tributárias)"
   - Opcional (não afeta validação)

3. **Lógica no handleSubmit**
   - Após criação da conta bem-sucedida, verificar se `formData.aceitaNewsletter` está marcado
   - Se sim, chamar a edge function `subscribe-newsletter` com o email
   - Tratamento silencioso de erro (não bloqueia o fluxo se falhar)

---

## Parte 2: Correção Lógica de Comunidade

### Regra de negócio corrigida
- **NAVIGATOR**: Acesso ao WhatsApp + Webinars + Biblioteca de Conteúdos
- **PROFESSIONAL+**: Acesso ao Circle (exclusivo)

### Alterações no arquivo `src/pages/Comunidade.tsx`

1. **Importar `isProfessional`** do hook `usePlanAccess()`

2. **WhatsApp Card**
   - Visível para: `isNavigator && !isProfessional` (apenas NAVIGATOR)
   - Fica bloqueado para usuários abaixo de NAVIGATOR
   - Não aparece para PROFESSIONAL+ (pois eles têm Circle)

3. **Circle Card**
   - Mudar condição de `isNavigator` para `isProfessional`
   - Adicionar texto explicativo: "Acesso incluso no seu plano. Use o mesmo email da sua conta TribuTalks para criar sua conta no Circle."
   - Atualizar badge para mostrar `PROFESSIONAL+`

4. **LockedFeatureCard do Circle**
   - Atualizar `minPlan` de `'NAVIGATOR'` para `'PROFESSIONAL'`

5. **Webinars e Biblioteca**
   - Manter como `isNavigator` (disponível a partir de NAVIGATOR)

---

## Fluxo Visual Atualizado

```
STARTER/FREE:
├─ WhatsApp: BLOQUEADO (upgrade para NAVIGATOR)
├─ Circle: BLOQUEADO (upgrade para PROFESSIONAL)
├─ Webinars: BLOQUEADO
└─ Biblioteca: BLOQUEADO

NAVIGATOR:
├─ WhatsApp: LIBERADO
├─ Circle: BLOQUEADO (upgrade para PROFESSIONAL)
├─ Webinars: LIBERADO
└─ Biblioteca: LIBERADO

PROFESSIONAL+:
├─ WhatsApp: NÃO APARECE (tem Circle)
├─ Circle: LIBERADO (com instrução de primeiro acesso)
├─ Webinars: LIBERADO
└─ Biblioteca: LIBERADO
```

---

## Detalhes Técnicos

### Cadastro.tsx - Chamada da newsletter

```typescript
// Após signUp bem-sucedido e registro de indicação
if (formData.aceitaNewsletter) {
  try {
    await supabase.functions.invoke('subscribe-newsletter', {
      body: { email: formData.email }
    });
  } catch (e) {
    // Falha silenciosa - não impede fluxo de cadastro
    console.error('Newsletter subscription failed:', e);
  }
}
```

### Comunidade.tsx - Lógica de planos

```typescript
const { isNavigator, isProfessional } = usePlanAccess();

// WhatsApp: apenas NAVIGATOR (não PROFESSIONAL+)
{isNavigator && !isProfessional && (
  <Card>...</Card>
)}

// Circle: apenas PROFESSIONAL+
{isProfessional ? (
  <Card>...texto de primeiro acesso...</Card>
) : (
  <LockedFeatureCard minPlan="PROFESSIONAL" />
)}
```

---

## Arquivos a serem modificados
1. `src/pages/Cadastro.tsx` - Adicionar checkbox e lógica de newsletter
2. `src/pages/Comunidade.tsx` - Corrigir lógica de acesso WhatsApp/Circle

## Considerações
- A edge function `subscribe-newsletter` já existe e está configurada com as credenciais do beehiiv
- O checkbox é 100% opcional e não afeta a validação do formulário
- Falhas na inscrição da newsletter são tratadas silenciosamente para não atrapalhar o onboarding
- A correção de comunidade reflete a segmentação correta: WhatsApp (networking básico) para NAVIGATOR, Circle (exclusivo) para PROFESSIONAL+
