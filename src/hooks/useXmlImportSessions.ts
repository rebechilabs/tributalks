import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface XmlImportSession {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export function useXmlImportSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["xml-import-sessions", user?.id],
    queryFn: async (): Promise<XmlImportSession[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("xml_imports")
        .select("id, file_name, status, created_at, processed_at")
        .eq("user_id", user.id)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
