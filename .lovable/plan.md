
# Atualizar Demo da Clara AI na Landing Page

## Resumo

Atualizar o passo 4 da demo interativa (`DemoStepClara.tsx`) e a seção `ClaraSection.tsx` para refletir a arquitetura multi-agente com 5 agentes especializados.

## Mudanças

### 1. DemoStepClara.tsx - Mostrar sistema multi-agente em ação

Reformular a interação para demonstrar o roteamento inteligente:

- Pergunta do usuário: "Clara, como a Reforma vai afetar minha empresa?"
- Clara mostra badge do agente que está respondendo: tag "Planejar" (dourada) acima da resposta
- Resposta com dados simulados e um botão de ação inline "[Simular cenário]"
- Após a resposta principal, mostrar uma segunda interação rápida com agente diferente ("Precificar") para demonstrar que Clara roteia para agentes especializados
- Texto inferior atualizado: "Clara orquestra 5 agentes especializados com seus dados reais"

Fluxo visual da demo:
1. Usuário pergunta
2. Tag "Planejar" aparece com animação
3. Clara responde sobre impacto da Reforma (typing effect)
4. Botão de ação "[Ver no Comparativo]" aparece na resposta
5. Chips de sugestão aparecem embaixo: "Quanto cobrar?" / "Encontrou créditos?"

### 2. ClaraSection.tsx - Atualizar módulos orbitantes para 5 agentes

Substituir os 4 módulos genéricos (Score, DRE, Radar, NEXUS) pelos 5 agentes com seus ícones e emojis:

| Agente | Ícone | Label |
|---|---|---|
| Entender | BarChart3 | Entender |
| Precificar | Calculator | Precificar |
| Recuperar | FileSearch | Recuperar |
| Planejar | Target | Planejar |
| Comandar | LayoutDashboard | Comandar |

Atualizar o texto descritivo para mencionar os 5 agentes especializados e o conceito de orquestradora.

### 3. DemoSection.tsx - Ajustar subtítulo

Alterar subtítulo de "Do preenchimento do DRE ao diagnóstico completo" para "Veja como 5 agentes especializados trabalham com seus dados" para alinhar com o posicionamento multi-agente.

## O que NÃO muda

- Estrutura do InteractiveDemo (5 passos, auto-advance, navegação)
- Outros passos da demo (Upload, Score, Radar, NEXUS)
- Botões da landing page e CTAs de checkout
- Configurações do Stripe e trial de 7 dias

## Seção técnica

### Arquivos editados
- `src/components/landing/demo/DemoStepClara.tsx` - Reformulação completa: badge de agente, botão de ação inline, chips de sugestão, segunda micro-interação
- `src/components/landing/ClaraSection.tsx` - 5 agentes orbitantes em vez de 4 módulos, texto atualizado
- `src/components/landing/DemoSection.tsx` - Subtítulo atualizado (linha 24)
