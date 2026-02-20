import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchRequest {
  query: string;
  userId?: string;
  searchTypes: ('knowledge' | 'memory' | 'pattern')[];
  similarityThreshold?: number;
  maxResults?: number;
}

interface SearchResult {
  type: 'knowledge' | 'memory' | 'pattern';
  id: string;
  content: string;
  title?: string;
  category?: string;
  similarity: number;
  metadata?: Record<string, unknown>;
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

    const { 
      query, 
      userId, 
      searchTypes = ['knowledge', 'memory'], 
      similarityThreshold = 0.6,
      maxResults = 10,
    }: SearchRequest = await req.json();

    if (!query || query.trim().length === 0) {
      throw new Error("Query is required");
    }

    console.log(`Semantic search: "${query.slice(0, 50)}..." for types: ${searchTypes.join(', ')}`);

    // Gera embedding da query
    const embeddingResponse = await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: query,
        contentType: 'query',
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      throw new Error(error.error || "Failed to generate query embedding");
    }

    const { embedding } = await embeddingResponse.json();
    
    const results: SearchResult[] = [];

    // Busca na knowledge_base
    if (searchTypes.includes('knowledge')) {
      const { data: knowledgeResults, error: kbError } = await supabase.rpc(
        'search_knowledge_base',
        {
          query_embedding: embedding,
          similarity_threshold: similarityThreshold,
          match_count: maxResults,
        }
      );

      if (kbError) {
        console.error("Knowledge search error:", kbError);
      } else if (knowledgeResults) {
        for (const kb of knowledgeResults) {
          results.push({
            type: 'knowledge',
            id: kb.id,
            title: kb.title,
            content: kb.summary || kb.full_content?.slice(0, 500) || '',
            category: kb.category,
            similarity: kb.similarity,
            metadata: { legal_basis: kb.legal_basis },
          });
        }
      }
    }

    // Busca nas memórias do usuário
    if (searchTypes.includes('memory') && userId) {
      const { data: memoryResults, error: memError } = await supabase.rpc(
        'search_user_memories',
        {
          p_user_id: userId,
          query_embedding: embedding,
          similarity_threshold: similarityThreshold - 0.1, // Memórias têm threshold menor
          match_count: maxResults,
        }
      );

      if (memError) {
        console.error("Memory search error:", memError);
      } else if (memoryResults) {
        for (const mem of memoryResults) {
          results.push({
            type: 'memory',
            id: mem.id,
            content: mem.content,
            category: mem.category,
            similarity: mem.similarity,
            metadata: { memory_type: mem.memory_type, importance: mem.importance },
          });
        }
      }
    }

    // Busca nos padrões do usuário
    if (searchTypes.includes('pattern') && userId) {
      const { data: patternResults, error: patError } = await supabase.rpc(
        'search_user_patterns',
        {
          p_user_id: userId,
          query_embedding: embedding,
          similarity_threshold: similarityThreshold - 0.2,
          match_count: Math.floor(maxResults / 2),
        }
      );

      if (patError) {
        console.error("Pattern search error:", patError);
      } else if (patternResults) {
        for (const pat of patternResults) {
          results.push({
            type: 'pattern',
            id: pat.id,
            content: pat.pattern_key,
            category: pat.pattern_type,
            similarity: pat.similarity,
            metadata: { 
              pattern_value: pat.pattern_value, 
              confidence: pat.confidence,
            },
          });
        }
      }
    }

    // Ordena por similaridade
    results.sort((a, b) => b.similarity - a.similarity);

    // Limita resultados totais
    const limitedResults = results.slice(0, maxResults);

    console.log(`Found ${limitedResults.length} results across ${searchTypes.length} types`);

    return new Response(
      JSON.stringify({
        results: limitedResults,
        query,
        totalFound: results.length,
        searchTypes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Semantic search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
