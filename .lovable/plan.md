

# Quadro Motivacional no Topo de Cada Ferramenta

## Resumo

Criar um componente reutilizavel `MotivationalBanner` e inseri-lo em 6 paginas do dashboard, entre o titulo e o conteudo principal.

## Componente novo: `src/components/common/MotivationalBanner.tsx`

Card com:
- Fundo `bg-muted/30` com borda `border-primary/20` (sutil, dourada)
- Layout: icone (emoji) a esquerda, texto a direita
- Botao "X" discreto no canto superior direito
- Fecha e salva preferencia em `localStorage` com chave `motivational_banner_dismissed_{id}`
- Props: `id` (string unica), `icon` (emoji string), `text` (string)
- Fonte menor (`text-sm`), cor `text-muted-foreground`

## Insercoes nas paginas

| Pagina | Arquivo | Onde inserir | ID | Icone | Texto |
|---|---|---|---|---|---|
| DRE Inteligente | `src/pages/DRE.tsx` | Antes do `<DREWizard />` | `dre` | clipboard | "Ao preencher sua DRE, voce recebera: diagnostico completo com Receita Liquida, Margem Bruta, EBITDA, Lucro Liquido e comparacao automatica com empresas do seu setor." |
| Score Tributario | `src/pages/ScoreTributario.tsx` | Apos o header (linha 261), antes do ClaraContextualCard | `score` | trophy | "Responda 11 perguntas e descubra sua nota fiscal de 0 a 1000. Compare com empresas do seu setor e receba recomendacoes personalizadas da Clara AI para melhorar seu score." |
| Comparativo de Regimes | `src/pages/dashboard/SimprontoPage.tsx` | Apos o header (linha 101), antes do wizard/results | `comparativo` | scales | "Informe seus dados e veja lado a lado qual regime tributario gera mais economia: Simples Nacional, Lucro Presumido, Lucro Real e as novas opcoes IBS/CBS 2027." |
| Margem Ativa | `src/pages/dashboard/MargemAtiva.tsx` | Apos o header (linha 34), antes das Tabs | `margem` | moneybag | "Descubra o impacto tributario real na sua margem de lucro e receba sugestoes de precificacao otimizada considerando a Reforma Tributaria 2027." |
| Radar de Creditos | `src/pages/AnaliseNotasFiscais.tsx` | No inicio do conteudo, apos header da pagina | `radar` | mag | "Faca upload dos seus documentos fiscais e nossa IA identificara automaticamente creditos tributarios nao aproveitados, pagamentos em duplicidade e aliquotas incorretas." |
| Oportunidades Tributarias | `src/pages/Oportunidades.tsx` | No inicio do conteudo principal (antes do header card, linha 322) | `oportunidades` | bulb | "Com base no perfil da sua empresa, nossa IA cruzou mais de 200 cenarios e encontrou oportunidades de economia tributaria especificas para o seu negocio." |

## O que NAO sera alterado

- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Logica interna dos modulos
- Rotas existentes

