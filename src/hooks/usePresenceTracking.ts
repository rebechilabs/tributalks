import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HEARTBEAT_INTERVAL = 60000; // 1 minute
const AWAY_TIMEOUT = 180000; // 3 minutes of inactivity

export function usePresenceTracking() {
  const location = useLocation();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const awayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isAwayRef = useRef(false);

  const trackPresence = useCallback(async (status: "online" | "away" | "offline") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke("track-presence", {
        body: {
          status,
          page_path: location.pathname,
        },
      });
    } catch (error) {
      console.error("Presence tracking error:", error);
    }
  }, [location.pathname]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (isAwayRef.current) {
      isAwayRef.current = false;
      trackPresence("online");
    }

    // Reset away timeout
    if (awayTimeoutRef.current) {
      clearTimeout(awayTimeoutRef.current);
    }
    
    awayTimeoutRef.current = setTimeout(() => {
      isAwayRef.current = true;
      trackPresence("away");
    }, AWAY_TIMEOUT);
  }, [trackPresence]);

  useEffect(() => {
    // Initial presence
    trackPresence("online");

    // Setup heartbeat
    heartbeatRef.current = setInterval(() => {
      const status = isAwayRef.current ? "away" : "online";
      trackPresence(status);
    }, HEARTBEAT_INTERVAL);

    // Activity listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackPresence("away");
        isAwayRef.current = true;
      } else {
        trackPresence("online");
        isAwayRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Before unload - mark as offline
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline tracking
      const session = localStorage.getItem("sb-rhhzsmupixdhurricppk-auth-token");
      if (session) {
        const parsed = JSON.parse(session);
        const token = parsed?.access_token;
        if (token) {
          navigator.sendBeacon(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-presence`,
            JSON.stringify({ status: "offline", page_path: location.pathname })
          );
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (awayTimeoutRef.current) clearTimeout(awayTimeoutRef.current);
      
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Mark as offline on cleanup
      trackPresence("offline");
    };
  }, [trackPresence, handleActivity, location.pathname]);
}
