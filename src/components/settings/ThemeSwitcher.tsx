import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const themes = [
  { value: "dark", label: "Escuro", icon: Moon, description: "Tema escuro (padrão)" },
  { value: "light", label: "Claro", icon: Sun, description: "Tema claro" },
  { value: "system", label: "Automático", icon: Monitor, description: "Segue o sistema" },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sun className="w-5 h-5 text-primary" />
          Aparência
        </CardTitle>
        <CardDescription>
          Escolha o tema visual da plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                "hover:border-primary/50 hover:bg-muted/50",
                theme === value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                theme === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <Label className="font-medium text-sm cursor-pointer">{label}</Label>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {description}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}