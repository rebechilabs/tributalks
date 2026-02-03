import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ClaraInsight {
  id: string;
  user_id: string;
  insight_type: string;
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  action_cta: string | null;
  action_route: string | null;
  source_data: Record<string, unknown> | null;
  trigger_condition: string | null;
  expires_at: string | null;
  dismissed_at: string | null;
  acted_at: string | null;
  created_at: string;
}

export function useClaraInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<ClaraInsight[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!user?.id) {
      setInsights([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("clara_insights")
        .select("*")
        .eq("user_id", user.id)
        .is("dismissed_at", null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const typedData = (data || []) as ClaraInsight[];
      setInsights(typedData);
      // Unread = não teve ação ainda
      setUnreadCount(typedData.filter((i) => !i.acted_at).length);
    } catch (error) {
      console.error("Error fetching Clara insights:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const dismissInsight = useCallback(async (insightId: string) => {
    try {
      const { error } = await supabase
        .from("clara_insights")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", insightId);

      if (error) throw error;

      setInsights((prev) => prev.filter((i) => i.id !== insightId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error dismissing insight:", error);
    }
  }, []);

  const markAsActed = useCallback(async (insightId: string) => {
    try {
      const { error } = await supabase
        .from("clara_insights")
        .update({ acted_at: new Date().toISOString() })
        .eq("id", insightId);

      if (error) throw error;

      setInsights((prev) =>
        prev.map((i) =>
          i.id === insightId ? { ...i, acted_at: new Date().toISOString() } : i
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking insight as acted:", error);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    fetchInsights();

    const channel = supabase
      .channel("clara-insights-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "clara_insights",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newInsight = payload.new as ClaraInsight;
          setInsights((prev) => [newInsight, ...prev].slice(0, 20));
          if (!newInsight.acted_at) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clara_insights",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as ClaraInsight;
          // Se foi dismissado, remove da lista
          if (updated.dismissed_at) {
            setInsights((prev) => prev.filter((i) => i.id !== updated.id));
          } else {
            setInsights((prev) =>
              prev.map((i) => (i.id === updated.id ? updated : i))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchInsights]);

  return {
    insights,
    unreadCount,
    loading,
    dismissInsight,
    markAsActed,
    refresh: fetchInsights,
  };
}
