import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlanejarFlow } from "@/components/planejar/PlanejarFlow";

export default function PlanejarPage() {
  return (
    <DashboardLayout title="Planejar">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Planejar</h1>
          <p className="text-muted-foreground">
            Planeje sua estratégia tributária com inteligência
          </p>
        </div>
        <PlanejarFlow />
      </div>
    </DashboardLayout>
  );
}
