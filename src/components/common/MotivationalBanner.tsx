import { useState } from "react";
import { X } from "lucide-react";
import { ICON_MAP, type IconKey } from "@/lib/iconMap";

interface MotivationalBannerProps {
  id: string;
  icon: IconKey;
  text: string;
}

export function MotivationalBanner({ id, icon, text }: MotivationalBannerProps) {
  const storageKey = `motivational_banner_dismissed_${id}`;
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === "true";
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  const IconComponent = ICON_MAP[icon];

  return (
    <div className="relative flex items-start gap-3 rounded-lg border border-primary/20 bg-muted/30 p-4 mb-6">
      <span className="shrink-0 mt-0.5" aria-hidden="true">
        {IconComponent ? <IconComponent className="h-5 w-5 text-primary" /> : null}
      </span>
      <p className="text-sm text-muted-foreground pr-6">{text}</p>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
