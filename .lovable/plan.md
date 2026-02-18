
# Atualizar Sequencia de "Proximos Passos" na Home

## Problema

O componente `src/components/home/HomeStateCards.tsx` exibe "Proximos passos apos o DRE" com uma sequencia desatualizada:
- 2. Score Tributario
- 3. Radar de Creditos
- 4. Oportunidades

Faltam o **Comparativo de Regimes Tributarios** e a **Margem Ativa**, que agora fazem parte da jornada conforme o sidebar.

## Nova sequencia (seguindo a ordem do sidebar)

Apos o DRE (passo 1), os proximos passos serao:
1. **2 - Score Tributario** (ENTENDER)
2. **3 - Comparativo de Regimes** (ENTENDER)
3. **4 - Margem Ativa** (PRECIFICAR)
4. **5 - Radar de Creditos** (RECUPERAR)
5. **6 - Oportunidades** (PLANEJAR)

## Alteracoes no arquivo `src/components/home/HomeStateCards.tsx`

### NoDRECard (linhas 127-149)

Atualizar a lista de "Proximos passos apos o DRE" para incluir 5 itens:
- Passo 2: Score Tributario (icone Trophy) - manter
- Passo 3: Comparativo de Regimes (icone Scale) - NOVO
- Passo 4: Margem Ativa (icone DollarSign ou similar) - NOVO
- Passo 5: Radar de Creditos (icone Coins) - renumerar
- Passo 6: Oportunidades (icone Gift) - renumerar

### NoScoreCard (linhas 199-215)

Atualizar "Proximos passos" para incluir os passos que ainda faltam apos o Score:
- Passo 3: Comparativo de Regimes - NOVO
- Passo 4: Margem Ativa - NOVO
- Passo 5: Radar de Creditos - renumerar
- Passo 6: Oportunidades - renumerar

### NoCreditsCard (linhas 220-299)

A sequencia aqui ja foca no Radar de Creditos como proximo passo. Verificar se ha lista de proximos passos para atualizar tambem.

### Imports

Adicionar import do icone `Scale` e `DollarSign` (ou `BadgeDollarSign`) do lucide-react para os novos cards.

## O que NAO muda

- Logica de estado (useHomeState)
- Card principal de DRE (botoes Conectar ERP / Preencher Manualmente)
- CompleteCard
- Nenhuma rota, Stripe ou trial
