import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface XmlImportSession {
  batchId: string;
  importIds: string[];
  fileCount: number;
  firstCreatedAt: string;
  label: string;
}

function groupByBatch(imports: { id: string; batch_id: string | null; file_name: string; created_at: string }[]): XmlImportSession[] {
  const groups: Record<string, { ids: string[]; firstCreatedAt: string; fileCount: number }> = {};

  for (const imp of imports) {
    // Use batch_id if available, otherwise fallback to individual id
    const key = imp.batch_id || imp.id;
    if (!groups[key]) {
      groups[key] = { ids: [], firstCreatedAt: imp.created_at, fileCount: 0 };
    }
    groups[key].ids.push(imp.id);
    groups[key].fileCount++;
    // Keep earliest date
    if (imp.created_at < groups[key].firstCreatedAt) {
      groups[key].firstCreatedAt = imp.created_at;
    }
  }

  return Object.entries(groups)
    .map(([batchId, group]) => {
      const date = new Date(group.firstCreatedAt);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      return {
        batchId,
        importIds: group.ids,
        fileCount: group.fileCount,
        firstCreatedAt: group.firstCreatedAt,
        label: `${dateStr} - ${group.fileCount} arquivo${group.fileCount > 1 ? 's' : ''}`,
      };
    })
    .sort((a, b) => new Date(b.firstCreatedAt).getTime() - new Date(a.firstCreatedAt).getTime());
}

export function useXmlImportSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["xml-import-sessions", user?.id],
    queryFn: async (): Promise<XmlImportSession[]> => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("xml_imports")
        .select("id, file_name, created_at, batch_id")
        .eq("user_id", user.id)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return groupByBatch(data || []);
    },
    enabled: !!user,
  });
}
