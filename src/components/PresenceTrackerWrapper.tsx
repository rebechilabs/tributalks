import { usePresenceTracking } from "@/hooks/usePresenceTracking";
import { useAuth } from "@/hooks/useAuth";

export function PresenceTrackerWrapper() {
  const { user } = useAuth();
  
  // Only track if user is authenticated
  if (user) {
    return <PresenceTrackerInner />;
  }
  
  return null;
}

function PresenceTrackerInner() {
  usePresenceTracking();
  return null;
}
