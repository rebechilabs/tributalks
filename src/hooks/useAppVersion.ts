import { useState, useEffect, useRef } from "react";

interface VersionData {
  buildTime: number;
  version: string;
}

export function useAppVersion() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialVersion = useRef<string | null>(null);
  const hasNotified = useRef(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Add cache-busting timestamp to prevent cached responses
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        
        if (!res.ok) return;
        
        const data: VersionData = await res.json();
        
        if (!initialVersion.current) {
          // First load - store the current version
          initialVersion.current = data.version;
        } else if (data.version !== initialVersion.current && !hasNotified.current) {
          // Version changed - notify for update
          hasNotified.current = true;
          setUpdateAvailable(true);
        }
      } catch (error) {
        // Silently fail - version check is not critical
        console.debug("[AppVersion] Check failed:", error);
      }
    };

    // Check immediately on mount
    checkVersion();
    
    // Then check every 30 seconds
    const interval = setInterval(checkVersion, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { updateAvailable };
}
