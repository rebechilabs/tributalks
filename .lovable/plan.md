
# Plano: Reduzir Velocidade da Demo Interativa

## Objetivo
Aumentar o tempo de exibição de cada fase da demo para que o usuário consiga absorver as informações antes do avanço automático.

## Alterações Propostas

### 1. Aumentar Durações dos Passos (InteractiveDemo.tsx)

| Passo | Atual | Novo | Motivo |
|-------|-------|------|--------|
| Upload XMLs | 3000ms | 5000ms | Usuário precisa ver a animação de progresso até 100% |
| Score Tributário | 4000ms | 7000ms | Aguardar animação do gauge + ler o resultado |
| Radar de Créditos | 4000ms | 7000ms | Esperar os 3 créditos aparecerem + total |
| Clara AI | 4000ms | 8000ms | Resposta longa precisa de tempo para digitação |
| Dashboard NEXUS | 0ms | 0ms | Mantém (botão manual) |

**Novo tempo total**: ~27 segundos (antes: ~15 segundos)

### 2. Ajustar Animações Internas

**DemoStepScore.tsx:**
- Intervalo do contador: 40ms → 60ms (animação mais suave)

**DemoStepRadar.tsx:**
- Intervalo entre créditos: 800ms → 1200ms (mais tempo entre cada)
- Contador total: 50ms → 80ms

**DemoStepClara.tsx:**
- Delay antes de mostrar resposta: 1000ms → 1500ms
- Velocidade de digitação: 30ms → 45ms por caractere

### 3. Adicionar Indicador de Progresso Visual

Adicionar uma barra de progresso sutil que mostra quanto tempo resta no passo atual, ajudando o usuário a entender que avança automaticamente.

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/InteractiveDemo.tsx` | Aumentar `duration` de cada passo + adicionar barra de progresso |
| `src/components/landing/demo/DemoStepScore.tsx` | Aumentar intervalo da animação |
| `src/components/landing/demo/DemoStepRadar.tsx` | Aumentar intervalos |
| `src/components/landing/demo/DemoStepClara.tsx` | Aumentar delays |
| `src/components/landing/demo/DemoStepUpload.tsx` | Ajustar velocidade do progresso |

## Resultado Esperado

- Demo mais calma e compreensível
- Usuário tem tempo de ler e entender cada fase
- Animações completam antes do avanço automático
- Experiência menos apressada, mais impactante
