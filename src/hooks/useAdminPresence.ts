import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  user_id: string;
  status: "online" | "away" | "offline";
  last_active_at: string;
  page_path?: string;
  email?: string;
  nome?: string;
  plano?: string;
  country_code?: string;
  country_name?: string;
}

interface PresenceStats {
  online: number;
  away: number;
  total: number;
  byCountry: Record<string, number>;
  byPlan: Record<string, number>;
}

export function useAdminPresence() {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [stats, setStats] = useState<PresenceStats>({
    online: 0,
    away: 0,
    total: 0,
    byCountry: {},
    byPlan: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchPresence = async () => {
    try {
      // Buscar presença com dados do perfil
      const { data: presenceData, error: presenceError } = await supabase
        .from("user_presence")
        .select("*")
        .in("status", ["online", "away"])
        .order("last_active_at", { ascending: false });

      if (presenceError) throw presenceError;

      // Buscar perfis para enriquecer dados
      const userIds = presenceData?.map(p => p.user_id) || [];
      
      if (userIds.length === 0) {
        setUsers([]);
        setStats({ online: 0, away: 0, total: 0, byCountry: {}, byPlan: {} });
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, nome, plano, country_code, country_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Merge presence with profiles
      const enrichedUsers: PresenceUser[] = presenceData.map(presence => {
        const profile = profiles?.find(p => p.user_id === presence.user_id);
        return {
          user_id: presence.user_id,
          status: presence.status as "online" | "away" | "offline",
          last_active_at: presence.last_active_at,
          page_path: presence.page_path,
          email: profile?.email,
          nome: profile?.nome,
          plano: profile?.plano,
          country_code: profile?.country_code,
          country_name: profile?.country_name,
        };
      });

      setUsers(enrichedUsers);

      // Calculate stats
      const byCountry: Record<string, number> = {};
      const byPlan: Record<string, number> = {};
      let online = 0;
      let away = 0;

      enrichedUsers.forEach(user => {
        if (user.status === "online") online++;
        if (user.status === "away") away++;
        
        const country = user.country_name || "Desconhecido";
        byCountry[country] = (byCountry[country] || 0) + 1;
        
        const plan = user.plano || "FREE";
        byPlan[plan] = (byPlan[plan] || 0) + 1;
      });

      setStats({
        online,
        away,
        total: online + away,
        byCountry,
        byPlan,
      });

    } catch (error) {
      console.error("Error fetching presence:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresence();

    // Subscribe to realtime changes
    let channel: RealtimeChannel | null = null;
    
    const setupRealtime = async () => {
      channel = supabase
        .channel("admin-presence")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_presence",
          },
          () => {
            fetchPresence();
          }
        )
        .subscribe();
    };

    setupRealtime();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPresence, 30000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { users, stats, loading, refresh: fetchPresence };
}
