/**
 * Rate Limiter para Edge Functions do TribuTalks
 * 
 * Implementa sliding window rate limiting usando KV em memória
 * Para produção em escala, migrar para Redis/Upstash
 * 
 * Uso:
 * ```ts
 * import { checkRateLimit, RateLimitConfig } from "../_shared/rate-limiter.ts";
 * 
 * const config: RateLimitConfig = { requests: 100, windowMs: 60000 }; // 100 req/min
 * const result = checkRateLimit(userId, config);
 * if (!result.allowed) {
 *   return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
 *     status: 429, 
 *     headers: { ...corsHeaders, 'Retry-After': String(result.retryAfter) }
 *   });
 * }
 * ```
 */

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  requests: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Optional: Different limits for different user tiers */
  tierMultipliers?: Record<string, number>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number; // seconds
}

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

// In-memory store for rate limiting
// Note: This resets on cold starts. For persistent rate limiting, use Redis/Upstash
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupStore(windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(ts => ts > cutoff);
    
    // Remove entries with no timestamps
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
  
  lastGlobalCleanup = now;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (userId, IP, or API key)
 * @param config - Rate limit configuration
 * @param tier - Optional user tier for tier-based limits
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  tier?: string
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Run global cleanup periodically
  if (now - lastGlobalCleanup > CLEANUP_INTERVAL) {
    cleanupStore(config.windowMs);
  }
  
  // Calculate effective limit based on tier
  let effectiveLimit = config.requests;
  if (tier && config.tierMultipliers?.[tier]) {
    effectiveLimit = Math.floor(config.requests * config.tierMultipliers[tier]);
  }
  
  // Get or create entry
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(identifier, entry);
  }
  
  // Clean up old timestamps for this entry
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
  
  // Check if under limit
  const currentCount = entry.timestamps.length;
  const allowed = currentCount < effectiveLimit;
  
  if (allowed) {
    // Record this request
    entry.timestamps.push(now);
  }
  
  // Calculate reset time (when the oldest request in window expires)
  const oldestTimestamp = entry.timestamps[0] || now;
  const resetAt = oldestTimestamp + config.windowMs;
  const retryAfter = Math.ceil((resetAt - now) / 1000);
  
  return {
    allowed,
    remaining: Math.max(0, effectiveLimit - currentCount - (allowed ? 1 : 0)),
    resetAt,
    retryAfter: allowed ? 0 : Math.max(1, retryAfter),
  };
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
    ...(result.retryAfter > 0 ? { 'Retry-After': String(result.retryAfter) } : {}),
  };
}

/**
 * Predefined rate limit configurations for different function types
 */
export const RATE_LIMITS = {
  // AI/LLM endpoints - more expensive, lower limits
  ai: {
    requests: 30,
    windowMs: 60 * 1000, // 30 req/min
    tierMultipliers: {
      STARTER: 1,      // 30 req/min
      NAVIGATOR: 1.5,  // 45 req/min
      PROFESSIONAL: 2, // 60 req/min
      ENTERPRISE: 5,   // 150 req/min
    },
  },
  
  // Standard API endpoints
  standard: {
    requests: 100,
    windowMs: 60 * 1000, // 100 req/min
    tierMultipliers: {
      STARTER: 1,      // 100 req/min
      NAVIGATOR: 1.5,  // 150 req/min
      PROFESSIONAL: 2, // 200 req/min
      ENTERPRISE: 5,   // 500 req/min
    },
  },
  
  // Batch processing endpoints
  batch: {
    requests: 10,
    windowMs: 60 * 1000, // 10 req/min
    tierMultipliers: {
      STARTER: 1,      // 10 req/min
      NAVIGATOR: 2,    // 20 req/min
      PROFESSIONAL: 3, // 30 req/min
      ENTERPRISE: 10,  // 100 req/min
    },
  },
  
  // Public endpoints (newsletter, contact form)
  public: {
    requests: 5,
    windowMs: 60 * 1000, // 5 req/min per IP
  },
  
  // Webhook endpoints (from external services)
  webhook: {
    requests: 100,
    windowMs: 60 * 1000, // 100 req/min
  },
} as const;

/**
 * Helper to create a rate-limited response
 */
export function rateLimitedResponse(
  result: RateLimitResult,
  limit: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        ...createRateLimitHeaders(result, limit),
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Get client IP from request headers
 * Works with Supabase Edge Functions and common proxies
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  );
}
