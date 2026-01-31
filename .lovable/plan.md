

# Atualizar Nome da Plataforma

## Objetivo

Substituir todas as referências a **"PIT"** e **"PIT - Plataforma de Inteligência Tributária"** por **"TribuTalks Inteligência Tributária"** em todo o código, documentação e textos legais.

---

## Arquivos a Modificar

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/components/landing/FeaturesSection.tsx` | Badge "Ferramentas da PIT" → "TribuTalks Inteligência Tributária" |
| `src/components/common/FloatingAssistant.tsx` | Textos da Clara que mencionam "PIT" |
| `src/components/cases/CaseStudyPdf.tsx` | Rodapé do PDF |
| `src/components/checklist/ChecklistReportPdf.tsx` | Rodapé do PDF |
| `src/pages/Dashboard.tsx` | Comentários e seção da plataforma |
| `supabase/functions/mercadopago-webhook/index.ts` | E-mail de boas-vindas |
| `src/pages/Termos.tsx` | Termos de Uso (seção 5.1) |
| `src/pages/Privacidade.tsx` | Política de Privacidade |
| `src/components/landing/FAQSection.tsx` | Perguntas frequentes |
| `docs/TRIBUTALKS_DOCUMENTATION.md` | Documentação técnica |

---

## Detalhes por Arquivo

### 1. FeaturesSection.tsx (Landing Page)

**Linha 114**
```text
De: "Ferramentas da PIT"
Para: "TribuTalks Inteligência Tributária"
```

---

### 2. FloatingAssistant.tsx (Clara AI)

**Linha 80** — Mensagem para NAVIGATOR:
```text
De: "...acesso completo à PIT - Plataforma de Inteligência Tributária..."
Para: "...acesso completo ao TribuTalks Inteligência Tributária..."
```

**Linha 416** — Saudação inicial:
```text
De: "...qualquer ferramenta da PIT..."
Para: "...qualquer ferramenta do TribuTalks..."
```

---

### 3. CaseStudyPdf.tsx (PDF de Estudos de Caso)

**Linha 168**
```text
De: "TribuTalks - PIT - Plataforma de Inteligência Tributária"
Para: "TribuTalks Inteligência Tributária"
```

---

### 4. ChecklistReportPdf.tsx (PDF do Checklist)

**Linha 243**
```text
De: "| PIT - Plataforma de Inteligência Tributária"
Para: "| TribuTalks Inteligência Tributária"
```

---

### 5. Dashboard.tsx (Comentários internos)

**Linha 57** e **438** — Comentários de código:
```text
De: "// PIT - Plataforma de Inteligência Tributária"
Para: "// TribuTalks Inteligência Tributária"
```

---

### 6. mercadopago-webhook/index.ts (E-mail de boas-vindas)

**Linha 429**
```text
De: "O TribuTalks é a PIT - Plataforma de Inteligência Tributária — uma plataforma completa..."
Para: "O TribuTalks é a plataforma de Inteligência Tributária — uma solução completa..."
```

**Linha 492**
```text
De: "TribuTalks - PIT - Plataforma de Inteligência Tributária"
Para: "TribuTalks Inteligência Tributária"
```

---

### 7. Termos.tsx (Termos de Uso)

**Linha 69** (Seção 5.1)
```text
De: "A TribuTalks é uma plataforma de inteligência tributária..."
Para: "O TribuTalks Inteligência Tributária é uma plataforma..."
```

Garantir que todo o documento use linguagem consistente.

---

### 8. Privacidade.tsx (Política de Privacidade)

Verificar menções à plataforma e manter consistência com o novo nome.

---

### 9. FAQSection.tsx (Perguntas Frequentes)

O FAQ já usa "TribuTalks" corretamente, mas vou verificar se há alguma menção a "PIT" que precise ser ajustada.

---

### 10. TRIBUTALKS_DOCUMENTATION.md

**Linha 15**
```text
De: "GPS com timeline, calculadoras e alertas"
Para: "Plataforma com timeline, calculadoras e alertas"
```

---

## Memória do Sistema

Após a implementação, atualizar a memória do projeto para refletir:

```text
A ferramenta anteriormente conhecida como "GPS da Reforma Tributária" 
e depois "PIT - Plataforma de Inteligência Tributária" foi renomeada 
para "TribuTalks Inteligência Tributária".
```

---

## Resumo das Substituições

| Texto Antigo | Texto Novo |
|--------------|------------|
| PIT - Plataforma de Inteligência Tributária | TribuTalks Inteligência Tributária |
| Ferramentas da PIT | TribuTalks Inteligência Tributária |
| à PIT / da PIT / na PIT | ao TribuTalks / do TribuTalks / no TribuTalks |
| GPS da Reforma Tributária | *(já foi removido anteriormente)* |

---

## Arquivos que NÃO serão alterados

Referências a "Split Payment" e outros termos que contêm "PIT" como parte de outra palavra (ex: `capital`, `hospital`, `capitalize`) não serão tocados.

