

# Plano: Demo Interativa Automatizada

## Resumo

Implementar uma experiência de demonstração guiada com 5 passos animados que simula a jornada do usuário no TribuTalks, substituindo o placeholder de vídeo atual.

---

## Arquivos a Criar

### Componentes de cada Step

| Arquivo | Descrição |
|---------|-----------|
| `src/components/landing/demo/DemoStepUpload.tsx` | Animação de upload de XMLs com progress bar |
| `src/components/landing/demo/DemoStepScore.tsx` | Gauge animado subindo de 0 a 72 |
| `src/components/landing/demo/DemoStepRadar.tsx` | Contador de créditos + lista animada |
| `src/components/landing/demo/DemoStepClara.tsx` | Chat simulado com efeito "digitando" |
| `src/components/landing/demo/DemoStepNexus.tsx` | Dashboard com 4 KPIs + CTA final |
| `src/components/landing/demo/index.ts` | Barrel export |

### Componente Principal

| Arquivo | Descrição |
|---------|-----------|
| `src/components/landing/InteractiveDemo.tsx` | Modal com navegação entre steps, auto-play, indicadores de progresso |

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/landing/VideoDemoSection.tsx` | Adicionar prop `onOpenDemo` e transformar em trigger clicável |
| `src/pages/Index.tsx` | Adicionar state `showDemo`, passar prop para VideoDemoSection, renderizar InteractiveDemo |

---

## Detalhes de Implementação

### Step 1: Upload (3s)
- Ícone de upload pulsando
- 3 arquivos "voando" para o ícone
- Progress bar de 0% a 100%
- Contador: "Processando X de 47 notas fiscais..."
- Checkmark verde ao final

### Step 2: Score (4s)
- Gauge semicircular (SVG)
- Ponteiro animando de 0 a 72
- Número grande ao centro
- Badge "Nota B" aparecendo
- Texto: "Sua empresa está na média do setor"

### Step 3: Radar (4s)
- Ícone de radar pulsando
- Contador subindo: R$ 0 → R$ 47k
- Lista de 3 créditos aparecendo sequencialmente:
  - ICMS-ST: R$ 23,5k
  - PIS/COFINS: R$ 15,8k
  - IPI: R$ 7,7k
- Texto: "Média de créditos recuperados: R$ 47k"

### Step 4: Clara AI (4s)
- Balão do usuário com pergunta
- Indicador "Clara está digitando..." (3 dots)
- Resposta sendo "digitada" letra por letra
- Cursor piscando no final
- Texto: "Clara AI responde 24/7"

### Step 5: NEXUS (permanece)
- Grid 2x2 com 4 KPIs aparecendo em sequência:
  - Score Tributário: 72/100
  - Créditos Identificados: R$ 47k
  - Impacto Reforma: +8,5%
  - Economia Potencial: R$ 180k/ano
- Mensagem: "Tudo pronto para você começar!"
- CTA: "Testar Grátis por 7 Dias"
- Ao clicar CTA: fecha modal e scrolla para pricing

---

## Navegação do Modal

```
┌─────────────────────────────────────────────────────────────┐
│ 🎬 TribuTalks Demo                                    [X]  │
│ Veja como funciona em menos de 1 minuto                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ●───●───●───○───○   (indicadores clicáveis)               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │           [Conteúdo do Step Atual]                   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Passo 2 de 5: Score Tributário                            │
│                                                             │
│  [Pular Demo]              [◀ Anterior]  [Próximo ▶]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Comportamentos

- **Auto-play**: Avança automaticamente após duração de cada step
- **Manual**: Botões Anterior/Próximo pausam auto-play
- **Skip**: "Pular Demo" vai direto ao step 5
- **Indicadores**: Clicáveis para ir a qualquer step
- **Reset**: Ao fechar, volta ao step 1

---

## Dependências

O projeto já tem `framer-motion` instalado (versão ^12.29.2), então não precisa instalar nada novo.

---

## Fluxo de Dados

```
Index.tsx
  └── showDemo state (boolean)
       ├── VideoDemoSection
       │     └── onClick → setShowDemo(true)
       │
       └── InteractiveDemo
             ├── currentStep state (0-4)
             ├── autoPlay state (boolean)
             └── onComplete → scroll to #pricing
```

---

## Ordem de Implementação

1. Criar diretório `demo/` e arquivos de cada step
2. Criar `InteractiveDemo.tsx` com lógica de navegação
3. Modificar `VideoDemoSection.tsx` para aceitar prop
4. Modificar `Index.tsx` para gerenciar state e renderizar modal

