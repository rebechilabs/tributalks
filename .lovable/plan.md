
# Plano: Auto-Refresh em Tempo Real para Todos os Usuários

## Objetivo
Quando você publicar uma atualização no Lovable, todos os usuários conectados terão suas páginas atualizadas automaticamente em tempo real.

## Como Funciona

```text
┌──────────────────────────────────────────────────────────────┐
│                    VOCÊ PUBLICA NO LOVABLE                   │
│                            ↓                                 │
│     ┌────────────────────────────────────────────────────┐   │
│     │  Nova versão do app é deployada                   │   │
│     │  Novo BUILD_ID é gerado automaticamente           │   │
│     └────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│     ┌────────────────────────────────────────────────────┐   │
│     │  Cada usuário verifica versão a cada 30 segundos  │   │
│     │  (ou via canal realtime do Supabase)              │   │
│     └────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│     ┌────────────────────────────────────────────────────┐   │
│     │  Versão diferente detectada?                      │   │
│     │  → Toast: "Nova versão disponível"                │   │
│     │  → Reload automático após 3 segundos              │   │
│     └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Abordagem Técnica

Usaremos **duas estratégias combinadas** para máxima confiabilidade:

### 1. Verificação de Versão via Fetch (Polling)
- A cada 30 segundos, busca `/version.json`
- Compara com versão carregada na inicialização
- Se diferente → notifica e recarrega

### 2. Canal Realtime do Supabase (Opcional - mais instantâneo)
- Tabela `app_versions` no banco
- Quando você publica, insere novo registro
- Todos os clientes recebem evento e recarregam

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `public/version.json` | CRIAR | Arquivo com versão atual (atualizado no build) |
| `src/hooks/useAppVersion.ts` | CRIAR | Hook que verifica versão periodicamente |
| `src/components/AppVersionChecker.tsx` | CRIAR | Componente que exibe toast e recarrega |
| `src/App.tsx` | MODIFICAR | Adicionar o checker na raiz |
| `vite.config.ts` | MODIFICAR | Gerar version.json no build |

## Detalhes de Implementação

### 1. Gerar Versão no Build (vite.config.ts)

```typescript
// Plugin para gerar version.json com timestamp do build
{
  name: 'generate-version',
  writeBundle() {
    const version = { 
      buildTime: Date.now(),
      version: new Date().toISOString()
    };
    fs.writeFileSync('dist/version.json', JSON.stringify(version));
  }
}
```

### 2. Hook de Verificação (useAppVersion.ts)

```typescript
export function useAppVersion() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      const res = await fetch('/version.json?t=' + Date.now());
      const data = await res.json();
      
      if (!initialVersion.current) {
        initialVersion.current = data.version;
      } else if (data.version !== initialVersion.current) {
        setUpdateAvailable(true);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 30000); // 30s
    
    return () => clearInterval(interval);
  }, []);

  return { updateAvailable };
}
```

### 3. Componente de Notificação (AppVersionChecker.tsx)

```typescript
export function AppVersionChecker() {
  const { updateAvailable } = useAppVersion();

  useEffect(() => {
    if (updateAvailable) {
      toast.info("Nova versão disponível! Atualizando...", {
        duration: 3000,
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }, [updateAvailable]);

  return null;
}
```

## Experiência do Usuário

1. **Usuário está usando o app normalmente**
2. **Você publica uma atualização no Lovable**
3. **Após alguns segundos**, aparece um toast:
   > "🔄 Nova versão disponível! Atualizando..."
4. **3 segundos depois**, a página recarrega automaticamente
5. **Usuário vê a versão atualizada** sem precisar fazer nada

## Considerações

| Aspecto | Decisão |
|---------|---------|
| Intervalo de verificação | 30 segundos (balanceado) |
| Delay antes do reload | 3 segundos (permite ler o toast) |
| Reload forçado | Sim, para garantir cache limpo |
| PWA cache | Service worker já tem `autoUpdate` |

## Resultado Final

Ao publicar no Lovable:
- ✅ **Todos os usuários** recebem a atualização automaticamente
- ✅ **Sem ação manual** do usuário
- ✅ **Notificação visual** antes do reload
- ✅ **Tempo real** (máximo 30 segundos de delay)
