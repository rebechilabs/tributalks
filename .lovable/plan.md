

# Reordenacao dos Modulos no Sidebar

## O que precisa mudar

A ordem atual no `MENU_PROFESSIONAL_V2` (src/data/menuConfig.ts) e:
1. ENTENDER
2. RECUPERAR
3. PLANEJAR
4. PRECIFICAR
5. COMANDAR

A ordem solicitada e:
1. ENTENDER
2. PRECIFICAR (sobe da 4a para 2a posicao)
3. RECUPERAR (desce da 2a para 3a posicao)
4. PLANEJAR (desce da 3a para 4a posicao)
5. COMANDAR (mantido)

## Alteracao

**Arquivo unico:** `src/data/menuConfig.ts`

Mover o bloco do modulo PRECIFICAR (linhas 244-254) para logo apos o modulo ENTENDER (apos linha 224), antes do modulo RECUPERAR.

Nenhuma alteracao de nome, rota, icone ou conteudo -- apenas reposicionamento do bloco.

## O que NAO muda

- Nomes dos modulos (ja estao corretos da alteracao anterior)
- URLs/rotas
- Conteudo dos submenus
- MENU_STARTER e MENU_NAVIGATOR (nao possuem PRECIFICAR)
- Landing page, Stripe, trial

