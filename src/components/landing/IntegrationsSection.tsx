import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Package, 
  Receipt, 
  BarChart3, 
  Building2,
  RefreshCw,
  CheckCircle2,
  Clock
} from "lucide-react";

interface ERPItem {
  name: string;
  available: boolean;
}

const erpList: ERPItem[] = [
  { name: "Omie", available: true },
  { name: "Bling", available: true },
  { name: "Conta Azul", available: true },
  { name: "Tiny/Olist", available: true },
  { name: "Sankhya", available: true },
  { name: "TOTVS", available: true },
];

const syncedData = [
  { icon: FileText, text: "Notas Fiscais (NF-e, NFS-e)" },
  { icon: Package, text: "Produtos com NCM" },
  { icon: Receipt, text: "Contas a Pagar/Receber" },
  { icon: BarChart3, text: "DRE Automático" },
  { icon: Building2, text: "Perfil da Empresa" },
  { icon: RefreshCw, text: "Sincronização diária" },
];

export function IntegrationsSection() {
  return (
    <section id="integracoes" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <Badge variant="outline" className="mb-3 md:mb-4 text-primary border-primary text-xs md:text-sm">
            Integrações Nativas
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Conecte seu <span className="text-primary">ERP</span> em minutos
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Importação automática de NF-e, produtos e financeiro.
            Seus dados sempre atualizados.
          </p>
        </div>

        {/* ERP Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 max-w-5xl mx-auto mb-10 md:mb-16">
          {erpList.map((erp, index) => (
            <div
              key={erp.name}
              className={`group relative bg-card rounded-xl p-3 md:p-5 border transition-all duration-300 animate-fade-in-up text-center ${
                erp.available
                  ? "border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Status Badge - Hidden on very small screens */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 hidden md:block">
                {erp.available ? (
                  <Badge className="bg-success text-success-foreground text-[10px] px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Disponível
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 flex items-center gap-1 bg-card">
                    <Clock className="w-3 h-3" />
                    Em breve
                  </Badge>
                )}
              </div>

              {/* ERP Icon/Name */}
              <div className="pt-1 md:pt-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-lg flex items-center justify-center mb-1.5 md:mb-2 ${
                  erp.available ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Building2 className={`w-5 h-5 md:w-6 md:h-6 ${erp.available ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`font-semibold text-xs md:text-sm ${erp.available ? "text-foreground" : "text-muted-foreground"}`}>
                  {erp.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Synced Data */}
        <div className="bg-card rounded-2xl border border-border p-4 md:p-8 max-w-4xl mx-auto">
          <h3 className="text-sm md:text-lg font-semibold text-foreground text-center mb-4 md:mb-6">
            Dados sincronizados automaticamente
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {syncedData.map((item, index) => (
              <div
                key={item.text}
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                </div>
                <span className="text-xs md:text-sm text-foreground font-medium leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
