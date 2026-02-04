import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HomeStateCards } from "@/components/home/HomeStateCards";
import { useHomeState } from "@/hooks/useHomeState";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { profile } = useAuth();
  const homeState = useHomeState();

  return (
    <DashboardLayout title="Home">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {homeState.isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        ) : (
          <HomeStateCards 
            stateData={homeState} 
            userName={profile?.nome?.split(' ')[0]} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
