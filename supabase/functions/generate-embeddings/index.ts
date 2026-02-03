import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmbeddingRequest {
  content: string;
  contentType: 'knowledge' | 'memory' | 'pattern' | 'query';
  recordId?: string;
  userId?: string;
}

interface EmbeddingResponse {
  embedding: number[];
  model: string;
  tokensUsed: number;
  cached: boolean;
}

// Hash simples para cache
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `emb_${Math.abs(hash).toString(36)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { content, contentType, recordId, userId }: EmbeddingRequest = await req.json();

    if (!content || content.trim().length === 0) {
      throw new Error("Content is required");
    }

    // Normaliza o conteúdo
    const normalizedContent = content.trim().toLowerCase().slice(0, 8000);
    const contentHash = hashContent(normalizedContent);

    // Verifica cache
    const { data: cached } = await supabase
      .from('clara_embeddings_cache')
      .select('embedding, model, tokens_used')
      .eq('content_hash', contentHash)
      .single();

    if (cached) {
      console.log(`Cache hit for ${contentHash}`);
      
      // Atualiza o registro se tiver ID
      if (recordId && contentType !== 'query') {
        await updateRecordEmbedding(supabase, contentType, recordId, cached.embedding, cached.model);
      }

      return new Response(
        JSON.stringify({
          embedding: cached.embedding,
          model: cached.model,
          tokensUsed: cached.tokens_used,
          cached: true,
        } as EmbeddingResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gera embedding via Lovable AI Gateway
    console.log(`Generating embedding for ${contentType}: ${contentHash}`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: normalizedContent,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Embedding API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const result = await response.json();
    const embedding = result.data[0].embedding;
    const tokensUsed = result.usage?.total_tokens || 0;
    const model = "text-embedding-3-small";

    // Salva no cache
    await supabase.from('clara_embeddings_cache').insert({
      content_hash: contentHash,
      content_preview: normalizedContent.slice(0, 200),
      embedding: embedding,
      model: model,
      tokens_used: tokensUsed,
    });

    // Atualiza o registro se tiver ID
    if (recordId && contentType !== 'query') {
      await updateRecordEmbedding(supabase, contentType, recordId, embedding, model);
    }

    return new Response(
      JSON.stringify({
        embedding,
        model,
        tokensUsed,
        cached: false,
      } as EmbeddingResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function updateRecordEmbedding(
  supabaseClient: any,
  contentType: string,
  recordId: string,
  embedding: number[],
  model: string
) {
  const updateData = {
    embedding: embedding,
    embedding_model: model,
    embedded_at: new Date().toISOString(),
  };

  let error = null;

  if (contentType === 'knowledge') {
    const result = await supabaseClient
      .from('clara_knowledge_base')
      .update(updateData)
      .eq('id', recordId);
    error = result.error;
  } else if (contentType === 'memory') {
    const result = await supabaseClient
      .from('clara_memory')
      .update(updateData)
      .eq('id', recordId);
    error = result.error;
  } else if (contentType === 'pattern') {
    const result = await supabaseClient
      .from('clara_learned_patterns')
      .update(updateData)
      .eq('id', recordId);
    error = result.error;
  }

  if (error) {
    console.error(`Error updating ${contentType} embedding:`, error);
  }
}
