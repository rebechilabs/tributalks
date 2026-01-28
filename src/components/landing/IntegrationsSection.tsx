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
  { name: "Omie", available: false },
  { name: "Bling", available: false },
  { name: "Conta Azul", available: false },
  { name: "Tiny/Olist", available: false },
  { name: "Sankhya", available: false },
  { name: "TOTVS", available: false },
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
    <section id="integracoes" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Integrações Nativas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Conecte seu <span className="text-primary">ERP</span> em minutos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Importação automática de NF-e, produtos e financeiro.
            Seus dados sempre atualizados, sem digitação manual.
          </p>
        </div>

        {/* ERP Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto mb-16">
          {erpList.map((erp, index) => (
            <div
              key={erp.name}
              className={`group relative bg-card rounded-xl p-5 border transition-all duration-300 animate-fade-in-up text-center ${
                erp.available
                  ? "border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Status Badge */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
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
              <div className="pt-3">
                <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                  erp.available ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Building2 className={`w-6 h-6 ${erp.available ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`font-semibold text-sm ${erp.available ? "text-foreground" : "text-muted-foreground"}`}>
                  {erp.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Synced Data */}
        <div className="bg-card rounded-2xl border border-border p-8 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground text-center mb-6">
            Dados sincronizados automaticamente
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {syncedData.map((item, index) => (
              <div
                key={item.text}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
