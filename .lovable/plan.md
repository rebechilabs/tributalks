
# Plano: Adicionar Conexão & Comunicação ao Tour + Corrigir Relatório

## Parte 1: Adicionar "Conexão & Comunicação" ao Tour Guiado

### Alterações

**Arquivo: `src/components/dashboard/Sidebar.tsx`**
Adicionar atributo `data-tour="conexao-group"` no grupo "CONEXÃO & COMUNICAÇÃO" (no `<Link>` ou `<Collapsible>` correspondente).

**Arquivo: `src/components/onboarding/GuidedTour.tsx`**
Adicionar novo passo após "PIT" e antes de "Seu Perfil":

```tsx
{
  target: '[data-tour="conexao-group"]',
  content: (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-5 w-5 text-primary" />
        <span className="font-semibold">Conexão & Comunicação</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Fique por dentro das últimas notícias tributárias, conecte-se com a 
        comunidade e ganhe descontos indicando amigos.
      </p>
    </div>
  ),
  placement: "right",
},
```

---

## Parte 2: Corrigir Seção 3 do Relatório (Análise Detalhada)

### Diagnóstico
A tabela `identified_credits` está **vazia**. Isso significa que o processamento de créditos via Edge Function `process-xml-batch` ainda não foi executado para popular essa tabela.

### Causa Raiz
O fluxo atual requer que o usuário:
1. Faça upload de XMLs de NF-e
2. Clique em "Identificar Créditos" para disparar o `process-xml-batch`
3. Aguarde o processamento popular a tabela `identified_credits`

Sem dados em `identified_credits`, a seção 3 fica vazia porque `creditosPorTributo` é construído a partir desses registros.

### Solução

**Opção A (Recomendada): Fallback para XML Summary**
Modificar o `useCreditReport.ts` para usar dados de `xml_analysis` ou `uploaded_files` como fallback quando `identified_credits` estiver vazio. Assim o relatório mostra os créditos identificados diretamente dos XMLs processados.

**Opção B: Mensagem no Relatório**
Se não houver dados de créditos identificados, exibir uma mensagem explicativa na seção 3 do PDF:
> "Nenhum crédito identificado ainda. Execute a análise de créditos no módulo 'Radar de Créditos' para identificar oportunidades de recuperação."

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dashboard/Sidebar.tsx` | Adicionar `data-tour="conexao-group"` |
| `src/components/onboarding/GuidedTour.tsx` | Adicionar passo do tour para Conexão |
| `src/hooks/useCreditReport.ts` | Implementar fallback para quando `identified_credits` está vazio |
| `src/lib/pdf/ExecutiveReportV2Generator.ts` | Adicionar mensagem de fallback na seção 3 |

### Resultado Esperado

1. **Tour Guiado**: Exibe passo destacando "Conexão & Comunicação" no sidebar
2. **Relatório**: Seção 3 mostra dados dos XMLs importados OU mensagem orientando o usuário a executar a identificação de créditos

### Observação Importante
Para que a seção 3 tenha dados completos (período, base de cálculo, alíquota, crédito, fundamentação legal), é necessário que:
- O usuário faça upload de XMLs
- O sistema processe os XMLs e popule `identified_credits`

Posso implementar o fallback que usa os dados disponíveis nos XMLs já importados para garantir que o relatório sempre tenha algum conteúdo na seção 3.
