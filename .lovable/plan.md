
# Plano: Remover configuração "Lembretes de consultorias"

## Resumo
Remover a opção de configuração "Lembretes de consultorias" da página de Configurações, já que essa funcionalidade não existe no sistema.

---

## Alterações Necessárias

### Arquivo: `src/pages/Configuracoes.tsx`

**1. Remover propriedade do estado inicial (linhas 29-33)**
```tsx
// ANTES
const [notifications, setNotifications] = useState({
  novidades: profile?.notif_novidades ?? true,
  legislacao: profile?.notif_legislacao ?? true,
  consultorias: profile?.notif_consultorias ?? true,
});

// DEPOIS
const [notifications, setNotifications] = useState({
  novidades: profile?.notif_novidades ?? true,
  legislacao: profile?.notif_legislacao ?? true,
});
```

**2. Remover do useEffect de sincronização (linhas 57-61)**
```tsx
// ANTES
setNotifications({
  novidades: profile?.notif_novidades ?? true,
  legislacao: profile?.notif_legislacao ?? true,
  consultorias: profile?.notif_consultorias ?? true,
});

// DEPOIS
setNotifications({
  novidades: profile?.notif_novidades ?? true,
  legislacao: profile?.notif_legislacao ?? true,
});
```

**3. Remover bloco de UI do Switch (linhas 231-247)**
```tsx
// REMOVER completamente este bloco:
              
<div className="flex items-center justify-between">
  <div className="space-y-1">
    <Label htmlFor="notif-consultorias" className="font-medium">
      Lembretes de consultorias
    </Label>
    <p className="text-sm text-muted-foreground">
      Lembrar de usar consultorias disponíveis (Premium)
    </p>
  </div>
  <Switch 
    id="notif-consultorias" 
    checked={notifications.consultorias}
    onCheckedChange={(v) => handleNotificationChange('consultorias', v)}
    disabled={profile?.plano !== 'PREMIUM'}
  />
</div>
```

---

## Resumo das Alterações

| Local | Ação |
|-------|------|
| Estado inicial `notifications` | Remover `consultorias` |
| useEffect de sincronização | Remover `consultorias` |
| Bloco de UI (Switch) | Remover completamente |
| **Total** | 3 modificações em 1 arquivo |

---

## Nota
A coluna `notif_consultorias` na tabela `profiles` no banco de dados pode ser mantida sem problema — ela simplesmente não será mais usada pela interface.
