
# Substituir TribuTech por TribuTalks em toda a plataforma

## Objetivo
Unificar a marca da plataforma sob o nome "TribuTalks", removendo todas as referências a "TribuTech" (e variações como "Tributech", "TributechAI") em textos, metadados e documentos.

## Escopo da Mudança

### Arquivos de Configuração e Metadados (4 arquivos)

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `index.html` | `<meta name="author" content="TribuTech" />` | `<meta name="author" content="TribuTalks" />` |
| `index.html` | `<meta name="apple-mobile-web-app-title" content="TribuTech" />` | `<meta name="apple-mobile-web-app-title" content="TribuTalks" />` |
| `vite.config.ts` | `name: "TribuTech - Inteligência Tributária"` | `name: "TribuTalks - Inteligência Tributária"` |
| `vite.config.ts` | `short_name: "TribuTech"` | `short_name: "TribuTalks"` |

### Landing Page e FAQ (5 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `src/components/landing/FAQSection.tsx` | "Para quem é o TribuTech?" → "Para quem é o TribuTalks?" + respostas |
| `src/components/landing/Footer.tsx` | alt="TribuTech" → alt="TribuTalks", "© 2026 TribuTech" → "© 2026 TribuTalks" |
| `src/components/landing/CredibilitySection.tsx` | "TribuTech é uma iniciativa da..." → "TribuTalks é uma iniciativa da..." |
| `src/components/landing/ValuationImpactSection.tsx` | "Exclusivo TribuTech" → "Exclusivo TribuTalks" |

### Dashboard e Navegação (4 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `src/components/dashboard/Sidebar.tsx` | alt="TribuTech" → alt="TribuTalks" |
| `src/components/dashboard/MobileNav.tsx` | alt="TribuTech" → alt="TribuTalks" |
| `src/components/dashboard/DashboardLayout.tsx` | alt="TribuTech" → alt="TribuTalks" (se existir) |
| `src/components/landing/Header.tsx` | import renaming (se necessário) |

### Páginas de Autenticação (4 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Login.tsx` | alt="TribuTech" → alt="TribuTalks" |
| `src/pages/Cadastro.tsx` | alt e textos → TribuTalks |
| `src/pages/RecuperarSenha.tsx` | alt="TribuTech" → alt="TribuTalks" |
| `src/pages/RedefinirSenha.tsx` | alt="TribuTech" → alt="TribuTalks" |

### Páginas Institucionais (3 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Termos.tsx` | alt e textos → TribuTalks |
| `src/pages/Privacidade.tsx` | alt e textos → TribuTalks |
| `src/pages/Contato.tsx` | alt e textos → TribuTalks |

### Documentos PDF (4 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `src/components/docs/TributechPitchPdf.tsx` | "TRIBUTECH" → "TRIBUTALKS" (capa), textos internos |
| `src/components/docs/OpportunitiesDocPdf.tsx` | "TribuTech" → "TribuTalks" em todas as ocorrências |
| `src/components/cases/CaseStudyPdf.tsx` | "TributechAI" → "TribuTalks" |
| `src/lib/pdfReportTemplate.ts` | "Tributech" → "TribuTalks" nos disclaimers |

### Edge Functions (2 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/send-daily-metrics/index.ts` | Logo, subject, textos → TribuTalks |
| `supabase/functions/send-news-alerts/index.ts` | Subject, textos → TribuTalks |

### Outros (4 arquivos)

| Arquivo | Mudança |
|---------|---------|
| `src/pages/EstudosCaso.tsx` | "TributechAI" → "TribuTalks" |
| `src/data/caseStudies.ts` | "TributechAI" → "TribuTalks" |
| `src/pages/DocumentoOportunidades.tsx` | Footer → TribuTalks |
| `src/components/executive/ExecutiveReportPreview.tsx` | alt → TribuTalks |

### Renomeação de Assets

O arquivo `src/assets/logo-tributech.png` será mantido (não é possível renomear automaticamente), mas todos os imports e alt texts serão atualizados para refletir "TribuTalks".

---

## Resumo

| Categoria | Arquivos Afetados |
|-----------|-------------------|
| Configuração/Metadados | 2 |
| Landing Page | 4 |
| Dashboard/Nav | 3 |
| Auth Pages | 4 |
| Páginas Institucionais | 3 |
| PDFs | 4 |
| Edge Functions | 2 |
| Outros | 4 |
| **Total** | **~26 arquivos** |

## Resultado

Após a implementação:
- "Para quem é o TribuTech?" → "Para quem é o TribuTalks?"
- Todos os alt texts de logo → "TribuTalks"
- Copyright → "© 2026 TribuTalks"
- PWA → "TribuTalks - Inteligência Tributária"
- Documentos PDF → marca TribuTalks
- Emails automáticos → remetente/assunto TribuTalks
