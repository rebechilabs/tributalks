import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

/**
 * Provider component that enables global keyboard shortcuts throughout the app.
 * Must be placed inside BrowserRouter since it uses useNavigate.
 */
export function GlobalShortcutsProvider({ children }: { children: React.ReactNode }) {
  useGlobalShortcuts();
  return <>{children}</>;
}
