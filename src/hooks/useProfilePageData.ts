import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ACHIEVEMENT_DEFINITIONS } from "./useAchievements";

interface AchievementMetadata {
  name: string;
  description: string;
}

interface RawAchievement {
  id: string;
  achievement_code: string;
  achieved_at: string;
  metadata: AchievementMetadata;
}

interface StreakData {
  current_streak: number | null;
  longest_streak: number | null;
  last_access_date: string | null;
}

export function useProfilePageData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile-page-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [achievementsResult, streakResult] = await Promise.all([
        supabase
          .from("user_achievements")
          .select("id, achievement_code, achieved_at, metadata")
          .eq("user_id", user.id)
          .order("achieved_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("current_streak, longest_streak, last_access_date")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const rawAchievements = (achievementsResult.data || []).map((item) => ({
        ...item,
        metadata: (item.metadata || { name: "", description: "" }) as unknown as AchievementMetadata,
      })) as RawAchievement[];

      // Process achievements similar to useAchievements
      const earnedCodes = new Set(rawAchievements.map((a) => a.achievement_code));
      
      const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([code, def]) => ({
        code,
        ...def,
        earned: earnedCodes.has(code),
        earnedAt: rawAchievements.find((a) => a.achievement_code === code)?.achieved_at,
      }));

      const streakData: StreakData = streakResult.data || {
        current_streak: 0,
        longest_streak: 0,
        last_access_date: null,
      };

      return {
        achievements: allAchievements,
        earnedCount: rawAchievements.length,
        totalCount: Object.keys(ACHIEVEMENT_DEFINITIONS).length,
        progress: Object.keys(ACHIEVEMENT_DEFINITIONS).length > 0 
          ? (rawAchievements.length / Object.keys(ACHIEVEMENT_DEFINITIONS).length) * 100 
          : 0,
        streakData,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute cache
  });
}
