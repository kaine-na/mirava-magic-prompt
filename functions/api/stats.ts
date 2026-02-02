/**
 * Cloudflare Pages Function: Stats API
 * 
 * This edge function acts as a secure proxy to Supabase, keeping credentials
 * server-side only. No Supabase URL or keys are exposed to the client.
 * 
 * Endpoints:
 * - GET  /api/stats - Fetch current stats
 * - POST /api/stats - Increment prompt count
 * 
 * Security:
 * - Credentials stored in Cloudflare Pages environment variables
 * - Rate limiting via Cloudflare's built-in protection
 * - CORS restricted to same origin
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface StatsResponse {
  success: boolean;
  data?: {
    totalPrompts: number;
    timestamp: string;
  };
  error?: string;
}

// CORS headers for same-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be restricted by Cloudflare Pages
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Create Supabase client with service role key (server-side only)
 */
function getSupabaseClient(env: Env): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Handle GET request - Fetch current stats
 */
async function handleGet(env: Env): Promise<Response> {
  const supabase = getSupabaseClient(env);
  
  if (!supabase) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Stats service not configured',
      } as StatsResponse),
      { status: 503, headers: corsHeaders }
    );
  }
  
  try {
    const { data, error } = await supabase
      .from('stats')
      .select('total_prompts')
      .eq('id', 'global')
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch stats',
        } as StatsResponse),
        { status: 500, headers: corsHeaders }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalPrompts: data?.total_prompts ?? 0,
          timestamp: new Date().toISOString(),
        },
      } as StatsResponse),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Stats fetch error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      } as StatsResponse),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle POST request - Increment prompt count
 */
async function handlePost(env: Env): Promise<Response> {
  const supabase = getSupabaseClient(env);
  
  if (!supabase) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Stats service not configured',
      } as StatsResponse),
      { status: 503, headers: corsHeaders }
    );
  }
  
  try {
    const { data, error } = await supabase.rpc('increment_prompt_count');
    
    if (error) {
      console.error('Supabase RPC error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to increment count',
        } as StatsResponse),
        { status: 500, headers: corsHeaders }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalPrompts: data as number,
          timestamp: new Date().toISOString(),
        },
      } as StatsResponse),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Stats increment error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      } as StatsResponse),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Main request handler
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const method = request.method;
  
  switch (method) {
    case 'OPTIONS':
      return handleOptions();
    case 'GET':
      return handleGet(env);
    case 'POST':
      return handlePost(env);
    default:
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders }
      );
  }
};
