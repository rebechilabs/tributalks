import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MargemAtivaHeader } from "@/components/margem-ativa/MargemAtivaHeader";
import { OMCTab } from "@/components/margem-ativa/omc/OMCTab";
import { PriceGuardTab } from "@/components/margem-ativa/priceguard/PriceGuardTab";
import { MarginExecutiveTab } from "@/components/margem-ativa/executive/MarginExecutiveTab";
import { ResetCalculationButton } from "@/components/common/ResetCalculationButton";
import { HelpButton } from "@/components/common/HelpButton";
import { ShoppingCart, Tag, BarChart3 } from "lucide-react";
import { MotivationalBanner } from "@/components/common/MotivationalBanner";

export default function MargemAtiva() {
  const [activeTab, setActiveTab] = useState("omc");
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <DashboardLayout title="Suíte Margem Ativa 2026">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <MargemAtivaHeader />
          <div className="flex items-center gap-2 shrink-0">
            <ResetCalculationButton 
              toolName="Margem Ativa"
              tables={['company_ncm_analysis']}
              onReset={handleReset}
            />
            <HelpButton toolSlug="margem-ativa" size="default" className="gap-2" />
          </div>
        </div>

        {/* Tabs da Suíte */}
        <Tabs value={activeTab} onValueChange={setActiveTab} key={resetKey}>
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
