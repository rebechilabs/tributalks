import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: streakData, isLoading } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("last_access_date, current_streak, longest_streak")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!user?.id) return null;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      const lastAccess = streakData?.last_access_date;
      let newStreak = 1;

      if (lastAccess === today) {
        // Already accessed today, don't update
        return streakData;
      } else if (lastAccess === yesterday) {
        // Continuing streak
        newStreak = (streakData?.current_streak || 0) + 1;
      }
      // else: streak resets to 1

      const longestStreak = Math.max(newStreak, streakData?.longest_streak || 0);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          last_access_date: today,
          current_streak: newStreak,
          longest_streak: longestStreak,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
    },
  });

  // Update streak on mount (when user accesses the app)
  useEffect(() => {
    if (user?.id && streakData !== undefined) {
      const today = new Date().toISOString().split("T")[0];
      if (streakData?.last_access_date !== today) {
        updateStreak.mutate();
      }
    }
  }, [user?.id, streakData?.last_access_date]);

  return {
    currentStreak: streakData?.current_streak || 0,
    longestStreak: streakData?.longest_streak || 0,
    lastAccessDate: streakData?.last_access_date,
    isLoading,
  };
}
