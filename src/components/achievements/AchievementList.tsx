import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gem, Medal, Award } from "lucide-react";
import { AchievementBadge } from "./AchievementBadge";
import { useAchievements } from "@/hooks/useAchievements";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface AchievementData {
  code: string;
  icon: LucideIcon;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  earnedAt?: string;
}

interface AchievementListProps {
  achievements?: AchievementData[];
  earnedCount?: number;
  totalCount?: number;
  progress?: number;
  isLoading?: boolean;
}

export function AchievementList({ 
  achievements: propAchievements,
  earnedCount: propEarnedCount,
  totalCount: propTotalCount,
  progress: propProgress,
  isLoading: propIsLoading,
}: AchievementListProps = {}) {
  // Only fetch if no props provided (fallback behavior)
  const hookData = useAchievements();
  
  const achievements = propAchievements ?? hookData.achievements;
  const earnedCount = propEarnedCount ?? hookData.earnedCount;
  const totalCount = propTotalCount ?? hookData.totalCount;
  const progress = propProgress ?? hookData.progress;
  const isLoading = propIsLoading ?? hookData.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="w-14 h-14 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by tier
  const tiers = {
    platinum: achievements.filter((a) => a.tier === "platinum"),
    gold: achievements.filter((a) => a.tier === "gold"),
    silver: achievements.filter((a) => a.tier === "silver"),
    bronze: achievements.filter((a) => a.tier === "bronze"),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Conquistas
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {earnedCount} de {totalCount}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(tiers).map(([tier, tierAchievements]) => (
          tierAchievements.length > 0 && (
            <div key={tier} className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground capitalize flex items-center gap-2">
                {tier === "platinum" && <><Gem className="w-4 h-4 text-cyan-400" /> Platina</>}
                {tier === "gold" && <><Medal className="w-4 h-4 text-yellow-500" /> Ouro</>}
                {tier === "silver" && <><Medal className="w-4 h-4 text-slate-400" /> Prata</>}
                {tier === "bronze" && <><Award className="w-4 h-4 text-amber-600" /> Bronze</>}
              </h4>
              <div className="flex flex-wrap gap-3">
                {tierAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.code}
                    icon={achievement.icon}
                    name={achievement.name}
                    description={achievement.description}
                    tier={achievement.tier}
                    earned={achievement.earned}
                    earnedAt={achievement.earnedAt}
                    size="md"
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}
