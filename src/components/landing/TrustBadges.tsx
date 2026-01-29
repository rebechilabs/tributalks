import { Shield, Lock, Cloud, Scale } from "lucide-react";
import stripeLogo from "@/assets/stripe-logo.png";

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description: string;
  isImage?: boolean;
}

const badges: TrustBadge[] = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Criptografia de Ponta",
    description: "SSL/TLS 256-bit",
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "100% Conforme LGPD",
    description: "Lei 13.709/2018",
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    title: "Nuvem Segura",
    description: "Infraestrutura AWS",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Dados Protegidos",
    description: "Backup diário",
  },
  {
    icon: <img src={stripeLogo} alt="Stripe" className="h-5 w-auto" />,
    title: "Pagamento Seguro",
    description: "Powered by Stripe",
    isImage: true,
  },
];

interface TrustBadgesProps {
  variant?: "compact" | "full";
  className?: string;
}

export function TrustBadges({ variant = "compact", className = "" }: TrustBadgesProps) {
  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {badges.map((badge) => (
          <div
            key={badge.title}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border"
          >
            <span className="text-primary">{badge.icon}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {badge.title}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="flex flex-col items-center text-center p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-primary">{badge.icon}</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {badge.title}
          </h4>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
