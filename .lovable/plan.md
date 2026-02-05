
# Plano: Adicionar Newsletter TribuTalksNews à Conexão & Comunicação

## Objetivo
Incluir o formulário de inscrição na newsletter diretamente na página `/dashboard/conexao`, abaixo dos 3 cards existentes.

## Componente Existente
Já existe o `NewsletterForm` em `src/components/common/NewsletterForm.tsx` que:
- Valida o e-mail com Zod
- Chama a Edge Function `subscribe-newsletter`
- Integra diretamente com Beehiiv
- Tem variante "default" (formulário maior, ideal para a página)

## Alteração

### Arquivo: `src/pages/dashboard/ConexaoPage.tsx`

| Mudança |
|---------|
| Importar `NewsletterForm` |
| Adicionar seção abaixo do grid de cards com o formulário de newsletter |

### Código Proposto

```tsx
import { NewsletterForm } from "@/components/common/NewsletterForm";

// ... dentro do return, após o grid de cards:

<div className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-4xl w-full">
  {/* cards existentes */}
</div>

{/* Nova seção: Newsletter */}
<div className="mt-12 w-full max-w-md">
  <div className="bg-card border rounded-lg p-6 text-center">
    <h3 className="text-lg font-semibold mb-2">📬 TribuTalks News</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Receba nossa newsletter toda terça-feira às 07h07 com as principais atualizações tributárias.
    </p>
    <NewsletterForm />
  </div>
</div>
```

## Resultado Visual

A página terá:
1. **Título e descrição** (centralizado)
2. **3 cards**: Notícias, Comunidade, Indique e Ganhe
3. **Seção Newsletter**: Card com título, descrição e campo de e-mail para inscrição direta no Beehiiv

## Fluxo do Usuário
1. Usuário digita e-mail
2. Clica em "Inscrever-se"
3. Edge Function `subscribe-newsletter` envia para Beehiiv
4. Usuário recebe confirmação de sucesso
5. Newsletter enviada toda terça às 07h07

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/dashboard/ConexaoPage.tsx` | Adicionar import e seção de newsletter |
