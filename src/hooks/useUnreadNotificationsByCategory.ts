import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UnreadCounts {
  geral: number;
  reforma: number;
  indicacao: number;
  sistema: number;
  total: number;
}

export function useUnreadNotificationsByCategory() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({
    geral: 0,
    reforma: 0,
    indicacao: 0,
    sistema: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCounts({ geral: 0, reforma: 0, indicacao: 0, sistema: 0, total: 0 });
      setLoading(false);
      return;
    }

    async function fetchCounts() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("category")
          .eq("user_id", user.id)
          .eq("read", false);

        if (error) throw error;

        const countsByCategory: UnreadCounts = {
          geral: 0,
          reforma: 0,
          indicacao: 0,
          sistema: 0,
          total: 0,
        };

        (data || []).forEach((notification) => {
          const cat = notification.category as keyof Omit<UnreadCounts, 'total'>;
          if (countsByCategory.hasOwnProperty(cat)) {
            countsByCategory[cat]++;
          }
          countsByCategory.total++;
        });

        setCounts(countsByCategory);
      } catch (error) {
        console.error("Error fetching notification counts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("notification-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { counts, loading };
}
