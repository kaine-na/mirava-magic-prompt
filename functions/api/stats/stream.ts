/**
 * Cloudflare Pages Function: Stats Stream (SSE)
 * 
 * Server-Sent Events endpoint for real-time stats updates.
 * Polls Supabase every 3 seconds and pushes updates to connected clients.
 * 
 * Endpoint: GET /api/stats/stream
 * 
 * Security:
 * - Credentials stay server-side
 * - Clients receive only stats data, no connection info
 * - Automatic cleanup on disconnect
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

/**
 * Create Supabase client
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
 * SSE endpoint for real-time stats
 * 
 * Note: Cloudflare Workers have a 30-second CPU time limit per request.
 * For long-running SSE, clients should reconnect periodically.
 * We'll send updates for up to 25 seconds, then close so client can reconnect.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // Only accept GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  const supabase = getSupabaseClient(env);
  
  if (!supabase) {
    return new Response(
      'data: {"error": "Stats service not configured"}\n\n',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
  
  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  
  // Track if client is still connected
  let isConnected = true;
  
  // Start sending updates
  const sendUpdates = async () => {
    const startTime = Date.now();
    const maxDuration = 25000; // 25 seconds max, then close for reconnect
    
    try {
      // Send initial heartbeat
      await writer.write(encoder.encode(': heartbeat\n\n'));
      
      while (isConnected && (Date.now() - startTime) < maxDuration) {
        try {
          // Fetch current stats
          const { data, error } = await supabase
            .from('stats')
            .select('total_prompts')
            .eq('id', 'global')
            .single();
          
          if (!error && data) {
            const eventData = JSON.stringify({
              totalPrompts: data.total_prompts,
              timestamp: new Date().toISOString(),
            });
            
            await writer.write(encoder.encode(`data: ${eventData}\n\n`));
          }
        } catch (fetchError) {
          console.error('SSE fetch error:', fetchError);
        }
        
        // Wait 3 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Send close event so client knows to reconnect
      await writer.write(encoder.encode('event: close\ndata: reconnect\n\n'));
    } catch (error) {
      console.error('SSE stream error:', error);
    } finally {
      isConnected = false;
      await writer.close();
    }
  };
  
  // Start sending updates in background
  context.waitUntil(sendUpdates());
  
  // Return SSE response
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
