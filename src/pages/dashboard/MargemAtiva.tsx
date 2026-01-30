import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MargemAtivaHeader } from "@/components/margem-ativa/MargemAtivaHeader";
import { OMCTab } from "@/components/margem-ativa/omc/OMCTab";
import { PriceGuardTab } from "@/components/margem-ativa/priceguard/PriceGuardTab";
import { MarginExecutiveTab } from "@/components/margem-ativa/executive/MarginExecutiveTab";
import { ShoppingCart, Tag, BarChart3 } from "lucide-react";

export default function MargemAtiva() {
  const [activeTab, setActiveTab] = useState("omc");

  return (
    <DashboardLayout title="Suíte Margem Ativa 2026">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com KPIs consolidados */}
        <MargemAtivaHeader />

        {/* Tabs da Suíte */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="omc" className="flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">OMC-AI</span>
              <span className="sm:hidden">Compras</span>
            </TabsTrigger>
            <TabsTrigger value="priceguard" className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">PriceGuard</span>
              <span className="sm:hidden">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="executive" className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Resumo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="omc" className="mt-6">
            <OMCTab />
          </TabsContent>

          <TabsContent value="priceguard" className="mt-6">
            <PriceGuardTab />
          </TabsContent>

          <TabsContent value="executive" className="mt-6">
            <MarginExecutiveTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
