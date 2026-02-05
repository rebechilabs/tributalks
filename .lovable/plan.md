
## Plano: Redirecionar Todos os Usuários para a Home com Notícias do Dia

### Resumo
Modificar o fluxo de navegação para que todos os usuários logados sejam direcionados para a Home inteligente (`/dashboard/home`), que já contém a lógica de próximo passo. Adicionar uma seção de **5 notícias principais do dia** logo abaixo do card de próximo passo.

---

### 1. Alterar Redirecionamento no ProtectedRoute

**Arquivo:** `src/components/ProtectedRoute.tsx`

| Antes | Depois |
|-------|--------|
| Professional → `/dashboard/nexus` | Professional → `/dashboard/home` |
| Navigator → `/dashboard` | Navigator → `/dashboard/home` |
| Starter → `/dashboard/score-tributario` | Starter → `/dashboard/home` |
| Free → `/dashboard` | Free → `/dashboard/home` |

Simplificar a função `getDefaultRoute()` para retornar sempre `/dashboard/home`:

```typescript
const getDefaultRoute = (): string => {
  return '/dashboard/home';
};
```

---

### 2. Atualizar App.tsx para Redirect Padrão

**Arquivo:** `src/App.tsx`

Modificar a rota `/dashboard` para redirecionar automaticamente para `/dashboard/home`:

```tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Navigate to="/dashboard/home" replace />
    </ProtectedRoute>
  } 
/>
```

---

### 3. Criar Componente de Notícias do Dia

**Arquivo:** `src/components/home/LatestNewsSection.tsx` (novo)

Componente que busca e exibe as 5 notícias mais recentes:

**Características:**
- Busca as 5 últimas notícias publicadas da tabela `noticias_tributarias`
- Exibe título, resumo executivo (truncado) e data de publicação
- Badge de relevância (ALTA, MEDIA, BAIXA)
- Skeleton loading durante carregamento
- Link para a página completa de notícias (`/noticias`)
- Mostra "Última atualização: DD/MM às HH:mm"

**Layout:**
```
📰 Notícias do Dia
Última atualização: 05/02 às 11:00

┌─────────────────────────────────────────┐
│ 🔴 ALTA  Receita Federal publica...     │
│ Resumo executivo resumido aqui...       │
│ há 2 horas                              │
├─────────────────────────────────────────┤
│ 🟡 MÉDIA Liminar no RJ suspende...      │
│ Resumo executivo resumido aqui...       │
│ ontem                                   │
├─────────────────────────────────────────┤
│ ... (mais 3 notícias)                   │
└─────────────────────────────────────────┘

[Ver todas as notícias →]
```

---

### 4. Integrar Notícias na HomePage

**Arquivo:** `src/pages/dashboard/HomePage.tsx`

Adicionar a seção de notícias abaixo do `HomeStateCards`:

```tsx
import { LatestNewsSection } from "@/components/home/LatestNewsSection";

export default function HomePage() {
  return (
    <DashboardLayout title="Home">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Próximo passo baseado no estado */}
        <HomeStateCards stateData={homeState} userName={...} />
        
        {/* Separador visual */}
        <Separator className="my-8" />
        
        {/* Notícias do dia */}
        <LatestNewsSection />
      </div>
    </DashboardLayout>
  );
}
```

---

### 5. Criar Hook para Buscar Notícias

**Arquivo:** `src/hooks/useLatestNews.ts` (novo)

Hook que encapsula a lógica de busca de notícias:

```typescript
interface LatestNews {
  id: string;
  titulo_original: string;
  resumo_executivo: string | null;
  relevancia: string;
  data_publicacao: string;
  fonte: string;
}

export function useLatestNews(limit: number = 5) {
  return useQuery({
    queryKey: ['latest-news', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('noticias_tributarias')
        .select('id, titulo_original, resumo_executivo, relevancia, data_publicacao, fonte')
        .eq('publicado', true)
        .order('data_publicacao', { ascending: false })
        .limit(limit);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

---

### Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `src/components/ProtectedRoute.tsx` | Modificar `getDefaultRoute()` para retornar `/dashboard/home` |
| `src/App.tsx` | Redirecionar `/dashboard` para `/dashboard/home` |
| `src/hooks/useLatestNews.ts` | Criar hook para buscar notícias |
| `src/components/home/LatestNewsSection.tsx` | Criar componente de notícias |
| `src/components/home/index.ts` | Exportar novo componente |
| `src/pages/dashboard/HomePage.tsx` | Integrar seção de notícias |

---

### Fluxo Final do Usuário

```text
Login 
  ↓
/dashboard (redireciona) 
  ↓
/dashboard/home
  ↓
┌──────────────────────────────────────────┐
│  HomeStateCards (próximo passo)          │
│  - NO_DRE → "Preencha seu DRE"           │
│  - NO_SCORE → "Calcule seu Score"        │
│  - NO_CREDITS → "Importe seus XMLs"      │
│  - COMPLETE → Resumo com KPIs            │
├──────────────────────────────────────────┤
│  LatestNewsSection                       │
│  - 5 notícias mais recentes              │
│  - Link para todas as notícias           │
└──────────────────────────────────────────┘
```

---

### Seção Técnica

**Consulta ao banco de dados:**
```sql
SELECT id, titulo_original, resumo_executivo, relevancia, data_publicacao, fonte 
FROM noticias_tributarias 
WHERE publicado = true 
ORDER BY data_publicacao DESC 
LIMIT 5;
```

**Dados atuais no banco:** Existem notícias publicadas recentes (05/02/2026), então a seção já terá conteúdo para exibir.

**Considerações de UX:**
- A seção de notícias será visível para todos os planos, mas o link "Ver todas" levará para `/noticias` que requer plano Navigator+
- Usuários FREE verão as 5 notícias resumidas, incentivando upgrade
- Notícias com relevância "ALTA" terão destaque visual (badge vermelho)
