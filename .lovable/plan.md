
## Plano: Restaurar Frase Original

### Frase Atual
```
97% das empresas enfrentam despreparo para a Reforma Tributária, sendo a emissão incorreta de NF-e o principal risco de perda financeira.

O TribuTalks transforma essa vulnerabilidade em conformidade blindada e vantagem competitiva.

Pesquisa GestãoClick, fev/2026, com 234 empresas
```

### Frase a Restaurar
```
A Reforma Tributária vai custar R$100 bilhões por ano em erros de compliance.

O TribuTalks transforma esse risco em oportunidade.
```

---

### Mudanças

**Arquivo:** `src/components/landing/ProblemSection.tsx`

| Alteração | Descrição |
|-----------|-----------|
| Atualizar headline | Trocar o texto atual pela frase original |
| Remover citação | Remover o parágrafo da pesquisa GestãoClick |
| Destacar valor | Aplicar `text-primary` em "R$100 bilhões por ano" |

---

### Código

```tsx
<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto">
  A Reforma Tributária vai custar <span className="text-primary">R$100 bilhões por ano</span> em erros de compliance.
  <br className="hidden md:block" /><br className="hidden md:block" />
  O TribuTalks transforma esse risco em oportunidade.
</h2>
```

---

### Resultado Esperado

- Frase original restaurada com destaque dourado em "R$100 bilhões por ano"
- Citação da pesquisa removida
- Layout visual mantido
