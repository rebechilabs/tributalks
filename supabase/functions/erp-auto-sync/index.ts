import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SyncResult {
  connection_id: string;
  connection_name: string;
  erp_type: string;
  success: boolean;
  records_synced: number;
  records_failed: number;
  error?: string;
  duration_ms: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to access all connections (for cron job)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[erp-auto-sync] Starting automatic sync job...');

    // Fetch all active connections with auto_sync enabled
    const { data: connections, error: connectionsError } = await supabase
      .from('erp_connections')
      .select('*')
      .eq('status', 'active')
      .filter('sync_config->>auto_sync', 'eq', 'true');

    if (connectionsError) {
      console.error('[erp-auto-sync] Error fetching connections:', connectionsError);
      throw connectionsError;
    }

    console.log(`[erp-auto-sync] Found ${connections?.length || 0} connections to sync`);

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No connections to sync',
          processed: 0,
          results: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: SyncResult[] = [];

    // Process each connection sequentially to respect rate limits
    for (const connection of connections) {
      const startTime = Date.now();
      
      console.log(`[erp-auto-sync] Processing connection: ${connection.connection_name} (${connection.erp_type})`);

      // Create sync log entry
      const { data: logEntry } = await supabase
        .from('erp_sync_logs')
        .insert({
          user_id: connection.user_id,
          connection_id: connection.id,
          sync_type: 'full',
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      try {
        // Call the existing erp-sync function internally
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/erp-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            connection_id: connection.id,
            source: 'auto-sync',
          }),
        });

        const syncResult = await syncResponse.json();
        const duration = Date.now() - startTime;

        if (syncResponse.ok && syncResult.success) {
          // Update connection timestamps
          const nextSync = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
          
          await supabase
            .from('erp_connections')
            .update({
              last_sync_at: new Date().toISOString(),
              next_sync_at: nextSync.toISOString(),
              status: 'active',
              status_message: `Sincronização automática concluída: ${syncResult.total_synced} registros`,
            })
            .eq('id', connection.id);

          // Update log entry
          await supabase
            .from('erp_sync_logs')
            .update({
              status: 'success',
              completed_at: new Date().toISOString(),
              records_synced: syncResult.total_synced || 0,
              records_failed: syncResult.total_failed || 0,
              details: {
                modules: syncResult.results,
                duration_ms: duration,
              },
            })
            .eq('id', logEntry?.id);

          results.push({
            connection_id: connection.id,
            connection_name: connection.connection_name,
            erp_type: connection.erp_type,
            success: true,
            records_synced: syncResult.total_synced || 0,
            records_failed: syncResult.total_failed || 0,
            duration_ms: duration,
          });

          console.log(`[erp-auto-sync] ✓ ${connection.connection_name}: ${syncResult.total_synced} records synced`);
        } else {
          throw new Error(syncResult.error || 'Sync failed');
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error(`[erp-auto-sync] ✗ ${connection.connection_name}: ${errorMessage}`);

        // Update connection status to error
        await supabase
          .from('erp_connections')
          .update({
            status: 'error',
            status_message: `Erro na sincronização automática: ${errorMessage}`,
          })
          .eq('id', connection.id);

        // Update log entry
        await supabase
          .from('erp_sync_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
            details: { duration_ms: duration },
          })
          .eq('id', logEntry?.id);

        results.push({
          connection_id: connection.id,
          connection_name: connection.connection_name,
          erp_type: connection.erp_type,
          success: false,
          records_synced: 0,
          records_failed: 0,
          error: errorMessage,
          duration_ms: duration,
        });
      }

      // Small delay between connections to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalRecords = results.reduce((acc, r) => acc + r.records_synced, 0);

    console.log(`[erp-auto-sync] Completed: ${successCount} success, ${failCount} failed, ${totalRecords} total records`);

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        message: `Processed ${results.length} connections`,
        processed: results.length,
        success_count: successCount,
        fail_count: failCount,
        total_records: totalRecords,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[erp-auto-sync] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Ocorreu um erro ao processar sua solicitação.',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
